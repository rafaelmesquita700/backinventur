const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const userRepository = require('../repositories/userRepository');
const adminRepository = require('../repositories/adminRepository');
const schema = require('./validate');

class AdminController {
  // Lista todos os usuários administradores
  async usersAdmin(request, response) {
    const usersAdmin = await adminRepository.findAll();

    response.json(usersAdmin);
  }

  // Lista todos os usuários pesquisadores
  async usersPesquisador(request, response) {
    const usersPesquisador = await userRepository.findAll();

    response.json(usersPesquisador);
  }

  /* async show(request, response) {
    const { cpf } = request.params;

    const user = await adminRepository.findByCPF(cpf);

    if (!user) {
      return response.status(404).json({ error: 'Usuário não encontrado ' });
    }

    response.json(user);
  } */

  // Lista um usuário administrador ou pesquisador por CPF
  async show(request, response) {
    const { cpf, name, email } = request.params;

    const userAdminCPF = await adminRepository.findByCPF(cpf);
    const userPesquisadorCPF = await userRepository.findByCPF(cpf);
    const userNameAdmin = await adminRepository.findByName(name);
    const userNamePesquisador = await userRepository.findByName(name);
    const userAdminEmail = await adminRepository.findByEmail(email);
    const userPesquisadorEmail = await userRepository.findByEmail(email);

    const user = userAdminCPF || userPesquisadorCPF || userNameAdmin || userNamePesquisador || userAdminEmail || userPesquisadorEmail;

    if (!user) {
      return response.status(404).json({ error: 'Usuário não encontrado.' });
    }

    response.json(user);
  }

  // Cria um usuário administrador
  async create(request, response) {
    let sum = 0;
    let remainder;

    const {
      name, email, cpf, password, confirmPassword,
    } = request.body;

    try {
      for (let i = 0; i <= 9; i++) {
        sum += Number(cpf.substring(i - 1, i)) * (11 - i);
      }
      remainder = (sum * 10) % 11;

      if ((remainder === 10) || (remainder === 11)) {
        remainder = 0;
      }

      if (remainder !== Number(cpf.substring(9, 10))) {
        return response.status(400).json({ error: 'CPF inválido!' });
      }
      sum = 0;

      for (let i = 0; i <= 10; i++) {
        sum += Number(cpf.substring(i - 1, i)) * (12 - i);
      }
      remainder = (sum * 10) % 11;

      if ((remainder === 10) || (remainder === 11)) {
        remainder = 0;
      }

      if (remainder !== Number(cpf.substring(10, 11))) {
        return response.status(400).json({ error: 'CPF inválido!' });
      }

      if (cpf.length !== 11 || !Array.from(cpf).filter((e) => e !== cpf[0]).length) {
        return response.status(400).json({ error: 'CPF inválido!' });
      }
    } catch (error) {
      return response.status(400).json({ error: 'Ocorreu algum erro para verificar a senha o CPF.' });
    }

    try {
      const regexPassword = /^(?=(?:.*?[A-Z]){1})(?=(?:.*?[a-z]){1})(?=(?:.*?[0-9]){1})(?=(?:.*?[!@#$%*()_+^&}{:;?.]){1})(?!.*\s)[0-9a-zA-Z!@#$%;*(){}_+^&]*$/;
      if (!regexPassword.test(password)) {
        return response.status(400).json({ error: 'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.' });
      }
    } catch (error) {
      return response.status(400).json({ error: 'Ocorreu algum erro para verificar a senha.' });
    }

    const { error } = schema.validate({
      name, email, cpf, password, confirmPassword,
    });

    if (error || !name || !email || !cpf || !password || !confirmPassword) {
      return response.status(400).json({ error: 'Preencha todos os campos' });
    }

    const emailPesquisador = await userRepository.findByEmail(email);
    const emailAdmin = await adminRepository.findByEmail(email);

    const emailExists = emailPesquisador || emailAdmin;

    if (emailExists) {
      return response.status(400).json({ error: 'E-mail já está cadastrado.' });
    }

    const cpfPesquisador = await userRepository.findByCPF(cpf);
    const cpfAdmin = await adminRepository.findByCPF(cpf);

    const cpfExists = cpfPesquisador || cpfAdmin;

    if (cpfExists) {
      return response.status(400).json({ error: 'CPF já está cadastrado.' });
    }

    if (password !== confirmPassword) {
      return response.status(400).json({ error: 'As senhas digitadas não correspondem.' });
    }

    // Envia um email com as informações cadastradas pelo administrador
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'email do administrador',
          pass: 'senha do administrador',
          clientId: '641051456724-9vl7kr1kpj8c65mo3ii4qrrb75hfgigi.apps.googleusercontent.com',
          clientSecret: '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',
          refreshToken: 'refreshToken do administrador',
          accessToken: 'accessToken do administrador',
        },
      });

      // O que será enviado para o email
      const mailOptions = {
        from: '< Nome do Administrador > < < email.do.admin > >',
        to: email,
        subject: 'Cadastro de Usuário Administrador',
        html: `<h3>Você é um usuário administrador.</h3><br>
        <h2>Seus dados de acesso são:</h2>
        <h3>CPF: <strong>${cpf}</strong></h3>
        <h3>Senha: <strong>${password}</strong></h3><br>

        <h3>Recomendado alterar a senha futuramente.</h3>`,
      };

      transporter.sendMail(mailOptions, () => response.status(200));
    } catch (err) {
      return response.status(400).json(err);
    }

    const user = await adminRepository.create({
      name, email, cpf, password: bcrypt.hashSync(request.body.password), confirmPassword: bcrypt.hashSync(request.body.confirmPassword),
    });

    response.json(user);
  }

  // Deletar usuário
  async delete(request, response) {
    const { cpf } = request.params;

    const userAdmin = await adminRepository.findByCPF(cpf);
    const userPesquisador = await userRepository.findByCPF(cpf);

    const user = userAdmin || userPesquisador;

    if (!user) {
      // 404: Sem conteúdo
      return response.status(404).json({ error: 'Usuário não encontrado.' });
    }

    await userRepository.delete(cpf);
    await adminRepository.delete(cpf);
    response.sendStatus(204);
  }

  async update(request, response) {
    const { cpf } = request.params;

    const {
      name, email, password, confirmPassword,
    } = request.body;

    const userExists = await adminRepository.findByCPF(cpf);
    if (!userExists) {
      return response.status(404).json({ error: 'Usuário não encontrado.' });
    }

    try {
      const regexPassword = /^(?=(?:.*?[A-Z]){1})(?=(?:.*?[a-z]){1})(?=(?:.*?[0-9]){1})(?=(?:.*?[!@#$%*()_+^&}{:;?.]){1})(?!.*\s)[0-9a-zA-Z!@#$%;*(){}_+^&]*$/;
      if (!regexPassword.test(password)) {
        return response.status(400).json({ error: 'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.' });
      }
    } catch (error) {
      return response.status(400).json({ error: 'Ocorreu algum erro para verificar a senha.' });
    }

    const { error } = schema.validate({
      name, email, cpf, password, confirmPassword,
    });

    if (error || !name || !email || !password || !confirmPassword) {
      return response.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const emailPesquisador = await userRepository.findByEmail(email);
    const emailAdmin = await adminRepository.findByEmail(email);

    const emailExists = emailPesquisador || emailAdmin;

    if (emailExists) {
      return response.status(400).json({ error: 'E-mail já está cadastrado.' });
    }

    if (password !== confirmPassword) {
      return response.status(400).json({ error: 'As senhas digitadas não correspondem.' });
    }

    const user = await adminRepository.update(cpf, {
      name, email, password: bcrypt.hashSync(request.body.password), confirmPassword: bcrypt.hashSync(request.body.confirmPassword),
    });

    response.json(user);
  }
}

module.exports = new AdminController();

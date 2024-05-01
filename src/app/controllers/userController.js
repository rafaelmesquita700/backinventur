const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const userRepository = require('../repositories/userRepository');
const adminRepository = require('../repositories/adminRepository');
const schema = require('./validate');

class UserController {
  // Irá criar um cadastro caso satisfaça todas as condições
  async create(request, response) {
    let sum = 0;
    let remainder;

    const {
      name, email, cpf, password, confirmPassword,
    } = request.body;

    try {
      // Verificar se o CPF é válido
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
      return response.status(400).json({ error: 'Ocorreu algum erro para verificar o CPF.' });
    }

    // Verifica se a senha tem letras, números e caracteres especiais
    // (?=(?:.*?[A-Z]){1}) - Mínimo 1 letra maiúscula
    // (?=(?:.*?[0-9]){1}) - Mínimo 1 número
    // (?=(?:.*?[!@#$%*()_+^&}{:;?.]){1})(?!.*\s)[0-9a-zA-Z!@#;$%*(){}_+^&] - Mínimo 1 caractere especial
    try {
      const regexPassword = /^(?=(?:.*?[A-Z]){1})(?=(?:.*?[a-z]){1})(?=(?:.*?[0-9]){1})(?=(?:.*?[!@#$%*()_+^&}{:;?.]){1})(?!.*\s)[0-9a-zA-Z!@#$%;*(){}_+^&]*$/;
      if (!regexPassword.test(password)) {
        return response.status(400).json({ error: 'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.' });
      }
    } catch (error) {
      return response.status(400).json({ error: 'Ocorreu algum erro para verificar a senha.' });
    }

    // Irá fazer validação dos dados digitados de acordo com o arquivo "validate.js"
    const { error } = schema.validate({
      name, email, cpf, password, confirmPassword,
    });

    if (error || !name || !email || !cpf || !password || !confirmPassword) {
      return response.status(400).json({ error: 'Preencha todos os campos.' });
    }

    // Verifica se email e cpf já estão cadastrados
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

    // Verifica se as senhas digitadas são iguais
    if (password !== confirmPassword) {
      return response.status(400).json({ error: 'As senhas digitadas não correspondem.' });
    }

    // Envia um email com um código
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
          clientId: process.env.OAUTH_CLIENTID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        },
      });

      // Gera um código de verificação aleatório
      const generateCode = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        return code;
      };

      const code = generateCode();

      // O que será enviado para o email
      const mailOptions = {
        from: 'InvenTur <inventur@tiangua.ifce.edu.br>',
        to: email,
        subject: 'Código de Verificação',
        html: `Seu código de verificação é: <br><h1><strong>${code}</strong></h1>`,
      };

      transporter.sendMail(mailOptions, () => response.status(200));
    } catch (err) {
      return response.status(400).json(err);
    }

    // Caso as validações estajam tudo corretas cria um novo usuário
    const user = await userRepository.create({
      name, email, cpf, password: bcrypt.hashSync(request.body.password), confirmPassword: bcrypt.hashSync(request.body.confirmPassword),
    });

    response.json(user);
  }

  // Deletar usuário
  async delete(request, response) {
    const { id } = request.params;

    const user = await userRepository.findById(id);

    if (!user) {
      // 404: Sem conteúdo
      return response.status(404).json({ error: 'Usuário não encontrado.' });
    }

    await userRepository.delete(id);
    response.sendStatus(204);
  }

  // Alterar dados cadastrados
  async update(request, response) {
    let sum = 0;
    let remainder;

    const { id } = request.params;

    const {
      name, email, cpf, password, confirmPassword,
    } = request.body;

    const userExists = await userRepository.findById(id);
    if (!userExists) {
      return response.status(404).json({ error: 'Usuário não encontrado.' });
    }

    try {
      // Verificar se o CPF é válido
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
      return response.status(400).json({ error: 'Ocorreu algum erro para verificar o CPF.' });
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

    if (password !== confirmPassword) {
      return response.status(400).json({ error: 'As senhas digitadas não correspondem.' });
    }

    if (error || !name || !email || !cpf || !password || !confirmPassword) {
      return response.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const emailPesquisador = await userRepository.findByEmail(email);
    const emailAdmin = await adminRepository.findByEmail(email);
    const cpfPesquisador = await userRepository.findByCPF(cpf);
    const cpfAdmin = await adminRepository.findByCPF(cpf);

    const emailExists = emailPesquisador || emailAdmin;
    const cpfExists = cpfPesquisador || cpfAdmin;

    if (emailExists && emailExists.id !== id) {
      return response.status(400).json({ error: 'E-mail já está cadastrado.' });
    }

    if (cpfExists && cpfExists.id !== id) {
      return response.status(400).json({ error: 'CPF já está cadastrado.' });
    }

    const user = await userRepository.update(id, {
      name, email, cpf, password: bcrypt.hashSync(request.body.password), confirmPassword: bcrypt.hashSync(request.body.confirmPassword),
    });

    response.json(user);
  }

  async login(request, response) {
    const {
      cpf, password,
    } = request.body;

    const selectUser = await userRepository.findByCPF(cpf);
    if (!selectUser) {
      return response.status(400).json('CPF inválido ou não cadastrado.');
    }

    const passwordAndCpf = bcrypt.compareSync(password, selectUser.password);
    if (!passwordAndCpf || passwordAndCpf.password === password) {
      return response.status(400).json('Senha incorreta.');
    }

    response.json('Usuário logado');
  }
}

module.exports = new UserController();

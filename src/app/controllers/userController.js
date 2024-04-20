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
      return response.status(400).json({ error: 'Ocorreu algum erro' });
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
      return response.status(400).json({ error: 'Ocorreu algum erro para verificar a senha' });
    }

    // Função que envia um email com um código
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: '< email do usuário >',
          pass: '< senha do usuário >',
          clientId: '< clientId conta google >',
          clientSecret: '< clienteSecret conta google >',
          refreshToken: '< refreshToken conta google >',
          accessToken: '< accessToken conta google >',
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
        from: '< Nome do Administrador > < < email.do.admin > >',
        to: email,
        subject: 'Código de Verificação',
        html: `Seu código de verificação é: <br><h1><strong>${code}</strong></h1>`,
      };

      transporter.sendMail(mailOptions, (err) => err);
    } catch (error) {
      return response.status(400).json({ error: 'Email não enviado' });
    }

    // Irá fazer validação dos dados digitados de acordo com o arquivo "validate.js"
    const { error } = schema.validate({
      name, email, cpf, password, confirmPassword,
    });

    if (error || !name || !email || !cpf || !password || !confirmPassword) {
      return response.status(400).json({ error: 'Preencha todos os campos' });
    }

    // Verifica se email e cpf já estão cadastrados
    const emailPesquisador = await userRepository.findByEmail(email);
    const emailAdmin = await adminRepository.findByEmail(email);

    const emailExists = emailPesquisador || emailAdmin;

    if (emailExists) {
      return response.status(400).json({ error: 'E-mail já está cadastrado' });
    }

    const cpfPesquisador = await userRepository.findByCPF(cpf);
    const cpfAdmin = await adminRepository.findByCPF(cpf);

    const cpfExists = cpfPesquisador || cpfAdmin;

    if (cpfExists) {
      return response.status(400).json({ error: 'CPF já está cadastrado' });
    }

    // Verifica se as senhas digitadas são iguais
    if (password !== confirmPassword) {
      return response.status(400).json({ error: 'As senhas digitadas não correspondem' });
    }

    // Caso as validações estajam tudo corretas cria um novo usuário
    const user = await userRepository.create({
      name, email, cpf, password: bcrypt.hashSync(request.body.password), confirmPassword: bcrypt.hashSync(request.body.confirmPassword),
    });

    response.json(user);
  }
}

module.exports = new UserController();

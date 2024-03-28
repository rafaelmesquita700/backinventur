const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const schema = require('./validate');

class AdminController {
  // Listar todos os usuários
  async user(request, response) {
    const users = await userRepository.findAll();

    response.json(users);
  }

  async show(request, response) {
    const { cpf } = request.params;

    const user = await userRepository.findByCPF(cpf);

    if (!user) {
      // 404: Não encontrado
      return response.status(404).json({ error: 'Usuário não encontrado ' });
    }

    response.json(user);
  }

  // Deletar usuário
  async delete(request, response) {
    const { cpf } = request.params;

    const user = await userRepository.findByCPF(cpf);

    if (!user) {
      // 404: Sem conteúdo
      return response.status(404).json({ error: 'Usuário não encontrado.' });
    }

    await userRepository.delete(cpf);
    response.sendStatus(204);
  }

  // Alterar dados cadastrados
  async update(request, response) {
    const { cpf } = request.params;

    const {
      name, email, password, confirmPassword,
    } = request.body;

    const userExists = await userRepository.findByCPF(cpf);
    if (!userExists) {
      return response.status(404).json({ error: 'Usuário não encontrado' });
    }

    function verifyPassword() {
      const regexPassword = /^(?=(?:.*?[A-Z]){1})(?=(?:.*?[a-z]){1})(?=(?:.*?[0-9]){1})(?=(?:.*?[!@#$%*()_+^&}{:;?.]){1})(?!.*\s)[0-9a-zA-Z!@#$%;*(){}_+^&]*$/;
      if (!regexPassword.test(password)) {
        return response.status(400).json({ error: 'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.' });
      }
    }

    const { error } = schema.validate({
      name, email, cpf, password, confirmPassword,
    });

    if (error || !name || !email || !password || !confirmPassword) {
      return response.status(400).json({ error: 'Preencha todos os campos' });
    }

    const userByEmail = await userRepository.findByEmail(email);
    if (userByEmail && userByEmail.id !== email) {
      return response.status(400).json({ error: 'Esse e-mail já está cadastrado' });
    }

    if (password !== confirmPassword) {
      return response.status(400).json({ error: 'As senhas digitadas não correspondem' });
    }

    const user = await userRepository.update(cpf, {
      name, email, password: bcrypt.hashSync(request.body.password), confirmPassword: bcrypt.hashSync(request.body.confirmPassword),
    });

    verifyPassword();

    response.json(user);
  }
}

module.exports = new AdminController();

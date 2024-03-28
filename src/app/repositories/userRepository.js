let users = [
  {
    name: 'João',
    email: 'joao@email.com',
    cpf: '12345678911',
    password: '12345678',
    confirmPassword: '12345678',
  },
];

class UserRepository {
  findAll() {
    return new Promise((resolve) => {
      resolve(users);
    });
  }

  findByName(name) {
    return new Promise((resolve) => {
      resolve(
        users.find((user) => user.name === name),
      );
    });
  }

  findByCPF(cpf) {
    return new Promise((resolve) => {
      resolve(
        users.find((user) => user.cpf === cpf),
      );
    });
  }

  findByEmail(email) {
    return new Promise((resolve) => {
      resolve(
        users.find((user) => user.email === email),
      );
    });
  }

  create({
    name, email, cpf, password, confirmPassword,
  }) {
    return new Promise((resolve) => {
      const newUser = {
        name,
        email,
        cpf,
        password,
        confirmPassword,
      };

      users.push(newUser);
      resolve(newUser);
    });
  }

  delete(cpf) {
    return new Promise((resolve) => {
      users = users.filter((user) => user.cpf !== cpf);
      resolve();
    });
  }

  update(cpf, {
    name, email, password, confirmPassword,
  }) {
    return new Promise((resolve) => {
      const updateUser = {
        name,
        email,
        cpf,
        password,
        confirmPassword,
      };

      users = users.map((user) => (
        user.cpf === cpf ? updateUser : user
      ));

      resolve(updateUser);
    });
  }
}

module.exports = new UserRepository();

const { v4 } = require('uuid');

let users = [];

class UserRepository {
  findAll() {
    return new Promise((resolve) => {
      resolve(users);
    });
  }

  findById(id) {
    return new Promise((resolve) => {
      resolve(
        users.find((user) => user.id === id),
      );
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
        id: v4(),
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

  delete(id) {
    return new Promise((resolve) => {
      users = users.filter((user) => user.id !== id);
      resolve();
    });
  }

  update(id, {
    name, email, cpf, password, confirmPassword,
  }) {
    return new Promise((resolve) => {
      const updateUser = {
        id,
        name,
        email,
        cpf,
        password,
        confirmPassword,
      };

      users = users.map((user) => (
        user.id === id ? updateUser : user
      ));

      resolve(updateUser);
    });
  }

  login({ cpf }) {
    return new Promise((resolve) => {
      resolve(users.find((user) => user.cpf === cpf));
    });
  }
}

module.exports = new UserRepository();

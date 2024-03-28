// JSON schema irá validar os campos de acordo com o minimo e máximo de caracteres que deve ser digitados
const Joi = require('@hapi/joi');

const userSchema = Joi.object({
  name: Joi.string().required().min(1).max(250),
  email: Joi.string().required().min(1).max(250),
  cpf: Joi.string().required().min(11).max(11),
  password: Joi.string().required().min(8),
  confirmPassword: Joi.string().required().min(8),
});

module.exports = userSchema;

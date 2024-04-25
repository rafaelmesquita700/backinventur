const { Router } = require('express');
const userController = require('../app/controllers/userController');

const router = Router();

router.post('/users', userController.create);
router.put('/users/update/:cpf', userController.update);
router.delete('/users/delete/:cpf', userController.delete);

module.exports = router;

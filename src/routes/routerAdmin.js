const { Router } = require('express');
const adminController = require('../app/controllers/adminController');

const router = Router();

router.get('/users/administrador', adminController.usersAdmin);
router.get('/users/pesquisador', adminController.usersPesquisador);
router.post('/create/admin', adminController.create);
router.get('/users/:id', adminController.show);
router.get('/users/cpf/:cpf', adminController.show);
router.get('/users/name/:name', adminController.show);
router.get('/users/email/:email', adminController.show);
router.delete('/users/:cpf', adminController.delete);
router.put('/users/:cpf', adminController.update);

module.exports = router;

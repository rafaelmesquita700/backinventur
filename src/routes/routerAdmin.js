const { Router } = require('express');
const adminController = require('../app/controllers/adminController');
const userController = require('../app/controllers/userController');

const router = Router();

router.get('/users/administrador', adminController.usersAdmin);
router.get('/users/pesquisador', adminController.usersPesquisador);
router.post('/create/admin', adminController.create);
router.get('/users/:id', adminController.show);
router.get('/users/search/cpf/:cpf', adminController.show);
router.get('/users/search/name/:name', adminController.show);
router.get('/users/search/email/:email', adminController.show);
router.delete('/users/delete/admin/:cpf', adminController.delete);
router.delete('/users/delete/pesquisador/:cpf', userController.delete);
router.put('/users/update/admin/:cpf', adminController.update);
router.put('/users/update/pesquisador/:cpf', userController.update);

module.exports = router;

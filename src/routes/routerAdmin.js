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
router.delete('/users/delete/admin/:id', adminController.delete);
router.delete('/users/delete/pesquisador/:id', userController.delete);
router.put('/users/update/admin/:id', adminController.update);
router.put('/users/update/pesquisador/:id', userController.update);
router.post('/login/admin', adminController.login);

module.exports = router;

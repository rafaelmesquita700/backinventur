const { Router } = require('express');
const userController = require('../app/controllers/userController');

const router = Router();

router.post('/users', userController.create);
router.put('/users/update/:id', userController.update);
router.delete('/users/delete/:id', userController.delete);

module.exports = router;

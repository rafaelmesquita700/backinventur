const { Router } = require('express');
const userController = require('../app/controllers/userController');

const router = Router();

router.post('/users', userController.create);

module.exports = router;

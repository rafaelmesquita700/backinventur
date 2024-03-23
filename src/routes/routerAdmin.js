const { Router } = require("express");
const adminController = require("../app/controllers/adminController");

const router = Router();

router.get("/users", adminController.user);
router.get("/users/:cpf", adminController.show);
router.delete("/users/:cpf", adminController.delete);

module.exports = router;

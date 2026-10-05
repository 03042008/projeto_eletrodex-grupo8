const express = require("express");
const router = express.Router();
const FuncionarioController = require("../controllers/FuncionarioController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

router.post("/login", FuncionarioController.login);
router.post("/cadastro", FuncionarioController.cadastrarConta);
router.get("/sessao", authenticate, FuncionarioController.sessaoAtual);
router.post("/logout", authenticate, FuncionarioController.logout);

router.get("/", authenticate, authorize("Administrador", "Gerente"), FuncionarioController.listar);
router.get("/:id", authenticate, authorize("Administrador", "Gerente"), FuncionarioController.buscarPorId);
router.post("/", authenticate, authorize("Administrador"), FuncionarioController.cadastrar);
router.put("/:id", authenticate, authorize("Administrador"), FuncionarioController.atualizar);
router.delete("/:id", authenticate, authorize("Administrador"), FuncionarioController.deletar);

module.exports = router;

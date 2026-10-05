const express = require("express");
const router = express.Router();
const FuncionarioController = require("../controllers/FuncionarioController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

router.post("/login", FuncionarioController.login);
router.post("/cadastro", FuncionarioController.cadastrarConta);
router.get("/sessao", authenticate, FuncionarioController.sessaoAtual);
router.post("/logout", authenticate, FuncionarioController.logout);

router.use(authenticate);
router.get("/", authorize("Administrador", "Gerente"), FuncionarioController.listar);
router.get("/:id", authorize("Administrador", "Gerente"), FuncionarioController.buscarPorId);
router.post("/", authorize("Administrador"), FuncionarioController.cadastrar);
router.put("/:id", authorize("Administrador"), FuncionarioController.atualizar);
router.delete("/:id", authorize("Administrador"), FuncionarioController.deletar);

module.exports = router;

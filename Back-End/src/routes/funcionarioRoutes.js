const express = require("express");
const router = express.Router();
const FuncionarioController = require("../controllers/FuncionarioController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

router.post("/login", FuncionarioController.login);
router.post("/cadastro", FuncionarioController.cadastrarConta);
router.get("/sessao", authenticate, FuncionarioController.sessaoAtual);
router.post("/logout", authenticate, FuncionarioController.logout);

router.use(authenticate, authorize("Administrador"));
router.get("/", FuncionarioController.listar);
router.get("/:id", FuncionarioController.buscarPorId);
router.post("/", FuncionarioController.cadastrar);
router.put("/:id", FuncionarioController.atualizar);
router.delete("/:id", FuncionarioController.deletar);

module.exports = router;

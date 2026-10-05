const express = require("express");
const router = express.Router();
const LoteController = require("../controllers/LoteController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

router.use(authenticate);
router.get("/", authorize("Administrador", "Gerente", "Estoquista"), LoteController.listar);
router.get("/:id", authorize("Administrador", "Gerente", "Estoquista"), LoteController.buscarPorId);
router.post("/", authorize("Administrador", "Gerente", "Estoquista"), LoteController.cadastrar);
router.put("/:id", authorize("Administrador", "Gerente", "Estoquista"), LoteController.atualizar);
router.delete("/:id", authorize("Administrador", "Gerente", "Estoquista"), LoteController.deletar);

module.exports = router;

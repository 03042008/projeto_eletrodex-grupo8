const express = require("express");
const router = express.Router();
const MovimentacaoLoteController = require("../controllers/movimentacaoLoteController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

router.use(authenticate);
router.post("/", authorize("Administrador", "Estoquista"), MovimentacaoLoteController.create);
router.get("/", authorize("Administrador", "Gerente", "Estoquista"), MovimentacaoLoteController.getAll);
router.get("/:id", authorize("Administrador", "Gerente", "Estoquista"), MovimentacaoLoteController.getById);
router.patch("/:id", authorize("Administrador", "Estoquista"), MovimentacaoLoteController.update);
router.delete("/:id", authorize("Administrador", "Estoquista"), MovimentacaoLoteController.delete);

module.exports = router;
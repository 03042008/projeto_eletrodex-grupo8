const express = require("express");
const router = express.Router();
const NivelController = require("../controllers/nivelController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

router.use(authenticate, authorize("Administrador"));
router.get("/", NivelController.listar);
router.get("/:id", NivelController.buscarPorId);
router.post("/", NivelController.cadastrar);
router.put("/:id", NivelController.atualizar);
router.delete("/:id", NivelController.deletar);

module.exports = router;
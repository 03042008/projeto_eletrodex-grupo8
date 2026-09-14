const express = require("express");
const router = express.Router();

const produtoRoutes = require("./produtoRoutes");
const funcionarioRoutes = require("./funcionarioRoutes");
const loteRoutes = require("./loteRoutes");
const nivelRoutes = require("./nivelRoutes");
const movimentacaoLoteRoutes = require("./movimentacaoloteRoutes");
const entradaRoutes = require("./entradaRoutes");
const saidaRoutes = require("./saidaRoutes");
const ajusteRoutes = require("./ajusteRoutes");

// Rota de checagem do status da API Eletrodex
router.get("/", (req, res) => {
  res.json({
    mensagem: "API ELETRODEX - Controle de Estoque",
    versao: "1.0.0",
  });
});

router.use("/produtos", produtoRoutes);
router.use("/funcionarios", funcionarioRoutes);
router.use("/lotes", loteRoutes);
router.use("/nivel", nivelRoutes);
router.use("/movimentacao-lote", movimentacaoLoteRoutes);
router.use("/entradas", entradaRoutes);
router.use("/saidas", saidaRoutes);
router.use("/ajustes", ajusteRoutes);

module.exports = router;
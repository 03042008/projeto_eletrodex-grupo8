const express = require('express');
const router = express.Router();
const DevolucaoController = require('../controllers/DevolucaoController');
const upload = require('../config/multer');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const equipeEstoque = ['Administrador', 'Gerente', 'Estoquista'];
const receberFoto = (req, res, next) => {
  upload.single('foto')(req, res, (error) => {
    if (!error) return next();
    const mensagem = error.code === 'LIMIT_FILE_SIZE'
      ? 'A foto deve ter no máximo 5 MB.'
      : error.message || 'Não foi possível enviar a foto.';
    return res.status(400).json({ erro: mensagem });
  });
};

router.use(authenticate);
router.get('/', authorize(...equipeEstoque), DevolucaoController.listar);
router.post('/', authorize(...equipeEstoque), receberFoto, DevolucaoController.registrar);
router.put('/:id/status', authorize(...equipeEstoque), DevolucaoController.atualizarStatus);

module.exports = router;
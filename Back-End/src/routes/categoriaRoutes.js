const { Router } = require('express');
const CategoriaController = require('../controllers/categoriaController');

const router = Router();

router.get('/', (req, res) => CategoriaController.listar(req, res));
router.get('/:id', (req, res) => CategoriaController.buscarPorId(req, res));
router.post('/', (req, res) => CategoriaController.cadastrar(req, res));
router.put('/:id', (req, res) => CategoriaController.atualizar(req, res));
router.delete('/:id', (req, res) => CategoriaController.deletar(req, res));

module.exports = router;
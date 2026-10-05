const { Router } = require('express');
const CategoriaController = require('../controllers/categoriaController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = Router();
router.use(authenticate);

router.get('/', authorize('Administrador', 'Gerente'), (req, res) => CategoriaController.listar(req, res));
router.get('/:id', authorize('Administrador', 'Gerente'), (req, res) => CategoriaController.buscarPorId(req, res));
router.post('/', authorize('Administrador'), (req, res) => CategoriaController.cadastrar(req, res));
router.put('/:id', authorize('Administrador'), (req, res) => CategoriaController.atualizar(req, res));
router.delete('/:id', authorize('Administrador'), (req, res) => CategoriaController.deletar(req, res));

module.exports = router;
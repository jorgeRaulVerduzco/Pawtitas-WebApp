const express = require('express');
const productoController = require('../controllers/productoController.js');
const validateJWT = require('../utils/validateJWT.js');

const router = express.Router();

router.get('/all', productoController.obtenerProductos);
router.get('/search', productoController.obtenerCategoriasProducto);
router.get('/filter', productoController.filtrarPorCategoria);
router.get('/cali/:id', productoController.calificarProducto);
router.get('/:id', productoController.obtenerProductoPorId);

// Operaciones protegidas
router.post('/', validateJWT, productoController.crearProducto);
router.put('/:id', validateJWT, productoController.actualizarProducto);
router.delete('/:id', validateJWT, productoController.eliminarProducto);

module.exports = router;


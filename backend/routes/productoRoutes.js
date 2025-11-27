// producto.routes.js (CORREGIDO)
const express = require('express');
const productoController = require('../controllers/productoController.js');
const validateJWT = require('../middlewares/validateJWT.js');

const router = express.Router();

// --- RUTAS GET ESPECÍFICAS (Debe ir primero) ---
router.get('/all', productoController.obtenerProductos);
router.get('/search', productoController.obtenerCategoriasProducto);
router.get('/filter', productoController.filtrarPorCategoria);
router.get('/buscar', productoController.buscarPorNombre); // ✅ AHORA VA AQUÍ (antes de /:id)

// --- RUTA POST CON ID (No colisiona con GET /:id) ---
router.post('/cali/:id', productoController.calificarProducto);

// --- RUTA GET GENÉRICA (Debe ir al final para capturar solo IDs) ---
router.get('/:id', productoController.obtenerProductoPorId); 
// 🛑 Cualquier GET que no sea 'all', 'search', 'filter', 'buscar', etc.,
// será capturado aquí como un :id.

// Operaciones protegidas
router.post('/', validateJWT, productoController.crearProducto);
router.put('/:id', validateJWT, productoController.actualizarProducto);
router.delete('/:id', validateJWT, productoController.eliminarProducto);

module.exports = router;
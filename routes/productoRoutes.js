import express from 'express';
import * as productoController from '../controllers/productoController.js';

const router = express.Router();

router.post('/', productoController.crearProducto);
router.get('/:id', productoController.obtenerProductoPorId);
router.get('/search', productoController.obtenerCategoriasProducto);
router.get('/filter', productoController.filtrarPorCategoria);
router.get('/cali/:id', productoController.calificarProducto);
router.get('/all', productoController.obtenerProductos);
router.put('/:id', productoController.actualizarProducto);
router.delete('/:id', productoController.eliminarProducto);


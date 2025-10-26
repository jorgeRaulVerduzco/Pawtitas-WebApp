import express from 'express';
import * as pagoController from '../controllers/pagoController.js';

const router = express.Router();

router.post('/', pagoController.crearPago);
router.get('/all', pagoController.obtenerPagos);
router.get('/:id', pagoController.obtenerPagoPorId);
router.get('/venta/:ventaId', pagoController.obtenerPagosPorVenta);
router.put('/:id', pagoController.actualizarEstado);
router.delete('/:id', pagoController.eliminarPago);

export { router };
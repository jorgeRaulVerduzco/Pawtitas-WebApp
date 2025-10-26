import express from 'express';
import * as ventaController from '../controllers/ventaController.js';

const router = express.Router();

router.post('/createSell', ventaController.crearVentaCompleta);
router.get('/:id', ventaController.obtenerVentaPorId);
router.get('/all', ventaController.obtenerVentas);
router.get('/client/:idUser', ventaController.obtenerVentasPorCliente);
router.post('/addSellItem', ventaController.agregarItemAVenta);
router.get('/partPayment/:idSell', ventaController.crearPagoSeparado);
router.put('/completeSell/:idSell', ventaController.pagarVenta);
router.put('/:id', ventaController.actualizarEstadoPago);
router.get('/HistoryUser/:idUser', ventaController.obtenerHistorialPorUsuario);


export { router };



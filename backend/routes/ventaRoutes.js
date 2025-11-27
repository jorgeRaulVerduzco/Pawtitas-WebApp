const express = require('express');
const ventaController = require('../controllers/ventaController.js');
const validateJWT = require('../middlewares/validateJWT.js');

const router = express.Router();

router.post('/createSale', validateJWT, ventaController.crearVentaCompleta);
router.get('/:id', ventaController.obtenerVentaPorId);
router.get('/all', ventaController.obtenerVentas);
router.get('/client/:idUser', validateJWT, ventaController.obtenerVentasPorCliente);
router.post('/addSellItem', validateJWT, ventaController.agregarItemAVenta);
router.get('/partPayment/:idSale', ventaController.crearPagoSeparado);
router.put('/completeSale/:idSale', validateJWT, ventaController.pagarVenta);
router.put('/:id', validateJWT, ventaController.actualizarEstadoPago);
router.get('/HistoryUser/:idUser', validateJWT, ventaController.obtenerHistorialPorUsuario);

module.exports = router;



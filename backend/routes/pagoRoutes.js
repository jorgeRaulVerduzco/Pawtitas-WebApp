const express = require('express');
const pagoController = require('../controllers/pagoController.js');
const validateJWT = require('../middlewares/validateJWT.js');

const router = express.Router();

router.post('/', validateJWT, pagoController.crearPago);
router.get('/all', validateJWT, pagoController.obtenerPagos);
router.get('/:id', validateJWT, pagoController.obtenerPagoPorId);
router.get('/venta/:ventaId', validateJWT, pagoController.obtenerPagosPorVenta);
router.put('/:id', validateJWT, pagoController.actualizarEstado);
router.delete('/:id', validateJWT, pagoController.eliminarPago);

module.exports = router;
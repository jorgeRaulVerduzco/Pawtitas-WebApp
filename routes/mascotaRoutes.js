const express = require('express');
const mascotaController = require('../controllers/mascotaController.js');
const validateJWT = require('../utils/validateJWT.js');

const router = express.Router();

router.post('/', validateJWT, mascotaController.crear);
router.get('/all', validateJWT, mascotaController.obtenerTodas);
router.get('/:id', validateJWT, mascotaController.obtenerPorId);
router.get('/centro/:centroId', validateJWT, mascotaController.obtenerPorCentro);
router.put('/estado/:id', validateJWT, mascotaController.actualizar);
router.delete('/:id', validateJWT, mascotaController.eliminar);

module.exports = router;

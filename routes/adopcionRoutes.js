const express = require('express');
const adopcionController = require('../controllers/adopcionController.js');
const validateJWT = require('../utils/validateJWT.js');

const router = express.Router();

router.post('/', validateJWT, adopcionController.crear);
router.get('/all', adopcionController.obtenerTodas);
router.get('/:id', adopcionController.obtenerPorId);

// CAMBIOS AQUÍ: de userId a idUsuario y de petId a idMascota
router.get('/user/:idUsuario', adopcionController.obtenerPorUsuario);
router.get('/pet/:idMascota', adopcionController.obtenerPorMascota);

// Rutas para aprobar y rechazar adopciones
router.put('/:id/approve', validateJWT, adopcionController.aprobar);
router.put('/:id/reject', validateJWT, adopcionController.rechazar);
router.put('/:id', validateJWT, adopcionController.actualizar);
router.delete('/:id', validateJWT, adopcionController.eliminar);

module.exports = router;
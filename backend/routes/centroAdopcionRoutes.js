const express = require('express');
const centroAdopcionController = require('../controllers/centroAdopcionController.js');
const validateJWT = require('../middlewares/validateJWT.js');

const router = express.Router();

router.post('/', validateJWT, centroAdopcionController.crearCentro);
router.get('/search', centroAdopcionController.buscarPorNombre);
router.get('/all', centroAdopcionController.obtenerTodos);
router.get('/:id', centroAdopcionController.obtenerPorId);

module.exports = router;

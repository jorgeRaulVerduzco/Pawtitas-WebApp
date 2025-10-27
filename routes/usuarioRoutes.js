const express = require('express');
const usuarioController = require('../controllers/usuarioController.js');
const validateJWT = require('../utils/validateJWT.js');

const router = express.Router();

router.post('/register', usuarioController.crearCuenta);
router.get('/verify', usuarioController.obtenerUsuarios);
router.post('/login', usuarioController.iniciarSesion);
router.get('/:id', usuarioController.obtenerUsuarioPorId);

// proteger actualización y eliminación con JWT
router.put('/:id', validateJWT, usuarioController.actualizarUsuario);
router.delete('/:id', validateJWT, usuarioController.desactivarUsuario);
router.put('/change-role/:id', validateJWT, usuarioController.cambiarRol);
router.put('/act-deact/:id', validateJWT, usuarioController.activarDesactivar);

module.exports = router;
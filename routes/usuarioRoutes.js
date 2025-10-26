import express from 'express';
import * as usuarioController from '../controllers/usuarioController.js';

const router = express.Router();

router.post('/register', usuarioController.crearCuenta);
router.get('/verify', usuarioController.obtenerUsuarios);
router.post('/login', usuarioController.iniciarSesion);
router.get('/:id', usuarioController.obtenerUsuarioPorId);
router.put('/:id', usuarioController.actualizarUsuario);
router.delete('/:id', usuarioController.desactivarUsuario);
router.put('/change-role/:id', usuarioController.cambiarRol);
router.put('/act-deact/:id', usuarioController.activarDesactivar);


export { router };
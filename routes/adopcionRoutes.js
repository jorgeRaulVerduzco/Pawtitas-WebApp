import express from 'express';
import * as adopcionController from '../controllers/adopcionController.js';

const router = express.Router();

router.post('/', adopcionController.crear);
router.get('/all', adopcionController.obtenerTodas);
router.get('/:id', adopcionController.obtenerPorId);
router.get('/user/:userId', adopcionController.obtenerPorUsuario);
router.get('/pet/:petId', adopcionController.obtenerPorMascota);
router.get('/status/:status', adopcionController.aprobar);
router.get('/status/:status', adopcionController.rechazar);
router.put('/:id', adopcionController.actualizar);
router.delete('/:id', adopcionController.eliminar);

export { router };

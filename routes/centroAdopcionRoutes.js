import express from 'express';
import * as centroAdopcionController from '../controllers/centroAdopcionController.js';

const router = express.Router();

router.post('/', centroAdopcionController.crearCentro);
router.get('/search', centroAdopcionController.buscarPorNombre);
router.get('/all', centroAdopcionController.obtenerTodos);
router.get('/:id', centroAdopcionController.obtenerPorId);


export { router };

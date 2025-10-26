import express from 'express';
import * as mascotaController from '../controllers/mascotaController.js';

const routes = express.Router();

routes.post('/', mascotaController.crear);
routes.get('/all', mascotaController.obtenerTodas);
routes.get('/:id', mascotaController.obtenerPorId);
routes.get('/centro/:centroId', mascotaController.obtenerPorCentro);
routes.update('/estado/:id', mascotaController.actualizar);
routes.delete('/:id', mascotaController.eliminar);

export { routes };

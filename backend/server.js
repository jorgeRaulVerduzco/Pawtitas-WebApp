const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno desde variables.env (archivo en el repo)
dotenv.config({ path: './variables.env' });

const usuarioRouter = require('./routes/usuarioRoutes.js');
const productoRouter = require('./routes/productoRoutes.js');
const ventaRouter = require('./routes/ventaRoutes.js');
const pagoRouter = require('./routes/pagoRoutes.js');
const mascotaRouter = require('./routes/mascotaRoutes.js');
const centroAdopcionRouter = require('./routes/centroAdopcionRoutes.js');
const adopcionRouter = require('./routes/adopcionRoutes.js');

const { globalErrorHandler } = require('./utils/appError.js');

const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Montar rutas
app.use('/api/usuarios', usuarioRouter);
app.use('/api/productos', productoRouter);
app.use('/api/ventas', ventaRouter);
app.use('/api/pagos', pagoRouter);
app.use('/api/mascotas', mascotaRouter);
app.use('/api/centros', centroAdopcionRouter);
app.use('/api/adopciones', adopcionRouter);

// Servir index.html para rutas SPA (debe ir después de las rutas de API pero antes del error handler)
app.use((req, res, next) => {
  // Si la ruta no es una API y no es un archivo estático, servir index.html para SPA
  if (!req.path.startsWith('/api') && !req.path.includes('.')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } else {
    next();
  }
});

// Manejador de errores global
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: './variables.env' });

// Importación de rutas
const usuarioRouter = require('./routes/usuarioRoutes.js');
const productoRouter = require('./routes/productoRoutes.js');
const ventaRouter = require('./routes/ventaRoutes.js');
const pagoRouter = require('./routes/pagoRoutes.js');
const mascotaRouter = require('./routes/mascotaRoutes.js');
const centroAdopcionRouter = require('./routes/centroAdopcionRoutes.js');
const adopcionRouter = require('./routes/adopcionRoutes.js');
const categoriaRouter = require('./routes/categoriaRoutes.js');

const { globalErrorHandler } = require('./utils/appError.js');

const app = express();

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// 1. ARCHIVOS ESTÁTICOS (Lo más importante para tu error)
// ---------------------------------------------------------
// Mapea /frontend a la carpeta física
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
// Mapea la raíz también por si acaso
app.use(express.static(path.join(__dirname, '../frontend')));

// ---------------------------------------------------------
// 2. RUTAS DE API
// ---------------------------------------------------------
app.use('/api/usuarios', usuarioRouter);
app.use('/api/productos', productoRouter);
app.use('/api/ventas', ventaRouter);
app.use('/api/pagos', pagoRouter);
app.use('/api/mascotas', mascotaRouter);
app.use('/api/centros', centroAdopcionRouter);
app.use('/api/adopciones', adopcionRouter);
app.use('/api/categorias', categoriaRouter);

// ---------------------------------------------------------
// 3. RUTA RAÍZ -> LOGIN
// ---------------------------------------------------------
app.get('/', (req, res) => {
  res.redirect('/frontend/src/pages/login-page.html');
});

// ---------------------------------------------------------
// 4. MANEJO DE RUTAS NO ENCONTRADAS (CORREGIDO)
// ---------------------------------------------------------
app.use((req, res, next) => {
  // Si la ruta tiene un punto (.) significa que buscan un archivo (ej: script.js)
  // Si no lo encontró arriba en los estáticos, devolvemos 404 real, NO REDIRECCIÓN
  if (req.path.includes('.')) {
     return res.status(404).send('Archivo no encontrado');
  }

  // Si no es un archivo y no es API, asumimos que es navegación y mandamos al login
  if (!req.path.startsWith('/api')) {
     return res.redirect('/frontend/src/pages/login-page.html');
  }
  
  next();
});

// Manejador de errores global
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Servidor listo en http://localhost:${PORT}`);
});

module.exports = app;
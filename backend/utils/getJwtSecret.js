const { AppError } = require('./appError.js');
const path = require('path');
const dotenv = require('dotenv');

function tryLoadEnv() {
  // Intentar cargar variables.env relativo a la carpeta backend
  try {
    dotenv.config({ path: path.join(__dirname, '..', 'variables.env') });
  } catch (err) {
    // no hacemos nada; si no puede cargarse, el chequeo siguiente fallará
  }
}

function getJwtSecret() {
  let secret = process.env.JWT_SECRET;
  if (!secret) {
    // Intentar cargar variables.env si no se había cargado antes
    tryLoadEnv();
    secret = process.env.JWT_SECRET;
  }

  if (!secret) {
    // Lanzar AppError para que el manejador global convierta esto en respuesta adecuada
    throw new AppError(
      "JWT_SECRET no está configurado. Defina la variable de entorno JWT_SECRET o añádala en variables.env",
      500
    );
  }
  return secret;
}

module.exports = getJwtSecret;

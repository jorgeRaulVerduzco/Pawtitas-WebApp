const { AppError } = require('./appError.js');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
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

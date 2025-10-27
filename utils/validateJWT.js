const jwt = require('jsonwebtoken');
const { AppError } = require('./appError.js');
const getJwtSecret = require('./getJwtSecret.js');

const validateJWT = (req, res, next) => {
  const authHeader = req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No hay token en la cabecera', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    // Si getJwtSecret lanzó AppError, propagarlo; si jwt.verify falló, retornar 401
    if (error instanceof AppError) return next(error);
    next(new AppError('El token no es válido o ha expirado', 401));
  }
};

module.exports = validateJWT;
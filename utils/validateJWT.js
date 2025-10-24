import jwt from "jsonwebtoken";
import { AppError } from "./appError.js";

const validateJWT = (req, res, next) => {
  const authHeader = req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("No hay token en la cabecera", 401));
  }

  const token = authHeader.split(" ")[1]; 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    next(new AppError("El token no es válido o ha expirado", 401));
  }
};

export default validateJWT;
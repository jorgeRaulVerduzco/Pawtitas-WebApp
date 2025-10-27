const UsuarioDAO = require("../daos/usuarioDAO.js");
const { AppError } = require("../utils/appError.js");
const jwt = require("jsonwebtoken");
const getJwtSecret = require('../utils/getJwtSecret.js');

class UsuarioController {
  static async crearCuenta(req, res, next) {
    try {
      const { nombres, apellidoPaterno, nombreUsuario, correo, contrasena } = req.body;

      if (!nombres || !apellidoPaterno || !nombreUsuario || !correo || !contrasena) {
        return next(new AppError("Todos los campos obligatorios deben completarse", 400));
      }

      const usuario = await UsuarioDAO.crear(req.body);
      res.status(201).json({ 
        status: "success",
        message: "Usuario creado exitosamente", 
        data: usuario 
      });
    } catch (error) {
      next(new AppError(`Error al crear el usuario: ${error.message}`, 500));
    }
  }

  static async iniciarSesion(req, res, next) {
    try {
      const { nombreUsuario, contrasena } = req.body;

      if (!nombreUsuario || !contrasena) {
        return next(new AppError("Usuario y contraseña son requeridos", 400));
      }

      const usuario = await UsuarioDAO.iniciarSesion(nombreUsuario, contrasena);
      if (!usuario) {
        return next(new AppError("Credenciales inválidas o usuario inactivo", 401));
      }

      // Obtener el secreto de forma segura; lanzará AppError si no está configurado
      const secret = getJwtSecret();

      const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol, nombreUsuario: usuario.nombreUsuario },
        secret,
        { expiresIn: "8h" }
      );

      res.status(200).json({ 
        status: "success",
        message: "Inicio de sesión exitoso", 
        data: { token } 
      });
    } catch (error) {
      next(new AppError(`Error al iniciar sesión: ${error.message}`, 500));
    }
  }

  static async obtenerUsuarios(req, res, next) {
    try {
      const usuarios = await UsuarioDAO.obtenerTodos();
      if (!usuarios.length) {
        return next(new AppError("No se encontraron usuarios", 404));
      }
      res.status(200).json({ 
        status: "success", 
        count: usuarios.length, 
        data: usuarios 
      });
    } catch (error) {
      next(new AppError("Error al obtener los usuarios", 500));
    }
  }

  static async obtenerUsuarioPorId(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioDAO.obtenerPorId(id);

      if (!usuario) {
        return next(new AppError("Usuario no encontrado", 404));
      }

      res.status(200).json({ status: "success", data: usuario });
    } catch (error) {
      next(new AppError("Error al obtener usuario por ID", 500));
    }
  }

  static async actualizarUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const cambios = req.body;

      const usuario = await UsuarioDAO.actualizar(id, cambios);
      if (!usuario) {
        return next(new AppError("Usuario no encontrado", 404));
      }

      res.status(200).json({ 
        status: "success",
        message: "Usuario actualizado correctamente", 
        data: usuario 
      });
    } catch (error) {
      next(new AppError("Error al actualizar el usuario", 500));
    }
  }

  static async desactivarUsuario(req, res, next) {
    try {
      const { id } = req.params;

      await UsuarioDAO.eliminar(id);
      res.status(200).json({ 
        status: "success",
        message: "Usuario desactivado correctamente" 
      });
    } catch (error) {
      next(new AppError("Error al desactivar el usuario", 500));
    }
  }

  static async cambiarRol(req, res, next) {
    try {
      const { id } = req.params;
      const { nuevoRol } = req.body;

      if (!["cliente", "empleado", "administrador"].includes(nuevoRol)) {
        return next(new AppError("Rol no válido", 400));
      }

      const usuario = await UsuarioDAO.cambiarRol(id, nuevoRol);
      res.status(200).json({ 
        status: "success",
        message: "Rol actualizado correctamente", 
        data: usuario 
      });
    } catch (error) {
      next(new AppError("Error al cambiar el rol del usuario", 500));
    }
  }

  static async activarDesactivar(req, res, next) {
    try {
      const { id } = req.params;
      const { activo } = req.body;

      if (typeof activo !== "boolean") {
        return next(new AppError("El campo 'activo' debe ser booleano", 400));
      }

      const usuario = await UsuarioDAO.activarDesactivar(id, activo);
      res.status(200).json({
        status: "success",
        message: `Usuario ${activo ? "activado" : "desactivado"} correctamente`,
        data: usuario,
      });
    } catch (error) {
      next(new AppError("Error al cambiar el estado del usuario", 500));
    }
  }
}
module.exports = UsuarioController;


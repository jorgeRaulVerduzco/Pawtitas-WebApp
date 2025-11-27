const express = require("express");
const categoriaController = require("../controllers/categoriaController.js");
const validateJWT = require("../middlewares/validateJWT.js");

const router = express.Router();

router.get("/", categoriaController.obtenerCategorias);
router.post("/", validateJWT, categoriaController.crearCategoria);
router.put("/:id", validateJWT, categoriaController.actualizarCategoria);
router.delete("/:id", validateJWT, categoriaController.eliminarCategoria);

module.exports = router;


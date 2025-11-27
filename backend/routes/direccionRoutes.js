const express = require("express");
const DireccionController = require("../controllers/direccionController.js");
const validateJWT = require("../middlewares/validateJWT.js");

const router = express.Router();

router.use(validateJWT);

router.get("/", DireccionController.listar);
router.get("/:id", DireccionController.obtenerPorId);
router.post("/", DireccionController.crear);
router.put("/:id", DireccionController.actualizar);
router.delete("/:id", DireccionController.eliminar);

module.exports = router;


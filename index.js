
const usuarioDAO = require("./daos/usuarioDAO.js");
const productoDAO = require("./daos/productoDAO.js");
const ventaDAO = require("./daos/ventaDAO.js");
const pagoDAO = require("./daos/pagoDAO.js");

(async function main() {
  try {
    console.log("=== INICIO DE PRUEBAS DE DAOs ===\n");

    // 1) Crear usuario
    console.log("1) Creando usuario...");
    const usuario = await usuarioDAO.crear({
      nombres: "hugo",
      apellidoPaterno: "a",
      apellidoMaterno: "verduzco",
      nombreUsuario: "hugo",
      correo: "hugo@example.com",
      contrasena: "123456",
      rol: "cliente",
      activo: true,
    });
    console.log("Usuario creado:", {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      correo: usuario.correo,
    });

    // 2) Crear productos
    const p1 = await productoDAO.crearProducto({
      nombre: "Comida para gato",
      descripcion: "Alimento balanceado para zorriño adultos",
      precio: 200.0,
      cantidadStock: 10,
      activo: true,
      categorias: ["comida", "zorrillo"],
    });
    const p2 = await productoDAO.crearProducto({
      nombre: "peluche zorro",
      descripcion: "Peluche resistente",
      precio: 120.0,
      cantidadStock: 5,
      activo: true,
    });
    console.log("Productos creados:", [
      { id: p1.id, nombre: p1.nombre, stock: p1.cantidadStock },
      { id: p2.id, nombre: p2.nombre, stock: p2.cantidadStock },
    ]);

    // 3) Crear venta completa
    console.log("\n3) Creando venta completa...");
    const itemsCompra = [
      { productoId: p1.id, cantidad: 2 },
      { productoId: p2.id, cantidad: 1 },
    ];
    const pagoData = {
      metodoPago: "tarjeta",
      referencia: "TRANS-XYZ",
      estado: "pendiente",
    };
    const { venta, pago } = await ventaDAO.crearVentaCompleta(usuario.id, itemsCompra, pagoData);
    console.log("Venta creada (pendiente):", {
      ventaId: venta.id,
      total: venta.total,
      estado: venta.estado,
    });
    console.log("Pago creado:", {
      pagoId: pago.id,
      monto: pago.monto,
      estado: pago.estado,
    });

    // Verificar stock luego de la venta
    const p1Actual = await productoDAO.obtenerProductoPorId(p1.id);
    const p2Actual = await productoDAO.obtenerProductoPorId(p2.id);
    console.log("Stock después de venta:", [
      { id: p1Actual.id, stock: p1Actual.cantidadStock },
      { id: p2Actual.id, stock: p2Actual.cantidadStock },
    ]);

    // 4) Agregar item a venta existente
    console.log("\n4) Agregar 1 unidad de p2 a la venta existente...");
    const addRes = await ventaDAO.agregarItemAVenta(venta.id, { productoId: p2.id, cantidad: 1 });
    console.log("Item agregado:", {
      itemId: addRes.item.id,
      productoId: addRes.item.productoId,
      cantidad: addRes.item.cantidad,
    });
    console.log("Venta actualizada (nuevo total):", {
      ventaId: addRes.venta.id,
      total: addRes.venta.total,
    });

    // 5) Pagar la venta (cambiar estado de pago a 'aprobado')
    console.log("\n5) Pagando la venta...");
    const pago2Data = {
      metodoPago: "tarjeta",
      referencia: "CONF-123",
      monto: addRes.venta.total,
      estado: "aprobado",
    };
    const { pago: pago2, venta: ventaActualizada } = await ventaDAO.pagarVenta(venta.id, pago2Data);
    console.log("Pago creado:", { id: pago2.id, estado: pago2.estado, monto: pago2.monto });
    console.log("Venta luego de pago:", { id: ventaActualizada.id, estado: ventaActualizada.estado });

    // 7) Historial por usuario
    console.log("\n7) Obtener historial de compras del usuario:");
    const historial = await ventaDAO.obtenerHistorialPorUsuario(usuario.id);
    console.log("Historial (resumen):");
    historial.forEach((v) => {
      console.log(
        ` - Venta ${v.id} | total ${v.total} | estado ${v.estado} | items: ${v.items.length} | pagos: ${v.pagos.length}`
      );
    });

    // 8) Pruebas CRUD Usuario
    console.log("\n8) Pruebas CRUD Usuario:");
    const usuarioFetched = await usuarioDAO.obtenerPorId(usuario.id);
    console.log("Obtener por id:", usuarioFetched.nombreUsuario, usuarioFetched.correo);

    console.log("Actualizar usuario (cambiar apellido paterno)...");
    const usuarioUpd = await usuarioDAO.actualizar(usuario.id, { apellidoPaterno: "Gómez" });
    console.log("Usuario actualizado:", usuarioUpd.apellidoPaterno);

    console.log("Desactivar usuario...");
    await usuarioDAO.eliminar(usuario.id);
    const usuarioDesac = await usuarioDAO.obtenerPorId(usuario.id);
    console.log("Activo:", usuarioDesac.activo);

    // 9) Pruebas CRUD Producto (resumen)
    console.log("\n9) Pruebas CRUD Producto:");
    const productosLista = await productoDAO.obtenerProductos({ limit: 10 });
    console.log("Productos totales (lista):", productosLista.length);

    console.log("\n=== FIN DE PRUEBAS ===");
    process.exit(0);
  } catch (err) {
    console.error("ERROR EN PRUEBAS:", err.message || err);
    console.error(err);
    process.exit(1);
  }
})();
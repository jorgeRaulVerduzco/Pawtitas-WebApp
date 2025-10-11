// src/tests/index.js
"use strict";

/**
 * Script de prueba para DAOs:
 * - simula crear usuario, productos
 * - crea una venta completa (verifica stock y crea items)
 * - agrega item a venta existente
 * - crear/actualizar pago y ver cambios de estado en la venta
 * - pruebas CRUD/consultas básicas para Usuario, Producto, Pago, Mascota, Adopcion
 *
 * Ajusta las rutas si tu estructura es distinta.
 */

const UsuarioDAO = require("./daos/usuarioDAO.js"); // puede exportar instancia o clase con static
const ProductoDAO = require("./daos/productoDAO.js");
const VentaDAO = require("./daos/ventaDAO.js");
const PagoDAO = require("./daos/pagoDAO.js");

// env: asegúrate de tener conexion con DB y models cargados (models/index.js)
(async function main() {
  try {
    console.log("=== INICIO DE PRUEBAS DE DAOs ===\n");

    // ---------- 1) Crear usuario ----------
    console.log("1) Creando usuario...");
    const usuario = await UsuarioDAO.crear({
      nombres: "raulo",
      apellidoPaterno: "a",
      apellidoMaterno: "verduzco",
      nombreUsuario: "rulo",
      correo: "rulo@example.com",
      contrasena: "123456",
      rol: "cliente",
      activo: true,
    });
    console.log("Usuario creado:", {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      correo: usuario.correo,
    });
    // Ejemplo esperado:
    // Usuario creado: { id: 10, nombreUsuario: 'juanp', correo: 'juanp@example.com' }

    // ---------- 2) Crear productos ----------
    const p1 = await ProductoDAO.crearProducto({
      nombre: "Comida para  gato",
      descripcion: "Alimento balanceado para zorriño adultos",
      precio: 200.0,
      cantidadStock: 10,
      activo: true,
      categorias: ["comida", "zorrillo"],
    });
    const p2 = await ProductoDAO.crearProducto({
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
    // Esperado:
    // Productos creados: [ { id: 11, nombre: 'Comida para perro 1kg', stock: 10 }, { id: 12, nombre: 'Juguete peluche', stock: 5 } ]

    // ---------- 3) Flujo: crear venta completa (compra) ----------
    console.log(
      "\n3) Creando venta completa (cliente compra 2 unidades de p1 y 1 de p2)..."
    );
    const itemsCompra = [
      { productoId: p1.id, cantidad: 2 },
      { productoId: p2.id, cantidad: 1 },
    ];
    const pagoData = {
      metodoPago: "tarjeta",
      referencia: "TRANS-XYZ",
      estado: "pendiente",
    };
    const { venta, pago } = await VentaDAO.crearVentaCompleta(
      usuario.id,
      itemsCompra,
      pagoData
    );
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
    // Ejemplo esperado:
    // Venta creada (pendiente): { ventaId: 20, total: '520.00', estado: 'pendiente' }
    // Pago creado: { pagoId: 30, monto: '520.00', estado: 'pendiente' }

    // Verificar stock luego de la venta (debería haberse descontado)
    const p1Actual = await ProductoDAO.obtenerProductoPorId(p1.id);
    const p2Actual = await ProductoDAO.obtenerProductoPorId(p2.id);
    console.log("Stock después de venta:", [
      { id: p1Actual.id, stock: p1Actual.cantidadStock },
      { id: p2Actual.id, stock: p2Actual.cantidadStock },
    ]);
    // Esperado: p1.stock = 8, p2.stock = 4

    // ---------- 4) Agregar item a venta existente ----------
    console.log("\n4) Agregar 1 unidad de p2 a la venta existente...");
    const addRes = await VentaDAO.agregarItemAVenta(venta.id, {
      productoId: p2.id,
      cantidad: 1,
    });
    console.log("Item agregado:", {
      itemId: addRes.item.id,
      productoId: addRes.item.productoId,
      cantidad: addRes.item.cantidad,
    });
    console.log("Venta actualizada (nuevo total):", {
      ventaId: addRes.venta.id,
      total: addRes.venta.total,
    });
    // Esperado: p2.stock bajó a 3, venta.total incrementó +120

    const p2Despues = await ProductoDAO.obtenerProductoPorId(p2.id);
    console.log("Stock p2 ahora:", p2Despues.cantidadStock);

    // ---------- 5) Pagar la venta (cambiar estado de pago a 'aprobado') ----------
    console.log(
      "\n5) Pagando la venta: crear pago con estado 'aprobado' (simula gateway)..."
    );
    const pago2Data = {
      metodoPago: "tarjeta",
      referencia: "CONF-123",
      monto: addRes.venta.total,
      estado: "aprobado",
    };
    const { pago: pago2, venta: ventaActualizada } = await VentaDAO.pagarVenta(
      venta.id,
      pago2Data
    );
    console.log("Pago creado:", {
      id: pago2.id,
      estado: pago2.estado,
      monto: pago2.monto,
    });
    console.log("Venta luego de pago:", {
      id: ventaActualizada.id,
      estado: ventaActualizada.estado,
    });
    // Esperado: venta.estado === 'completada'

    // ---------- 6) Actualizar estado de un pago existente (ejemplo actualizarEstadoPago) ----------
    console.log("\n6) Actualizar estado de pago previo (ejemplo)...");
    // suponiendo que hay un pago pendiente que se aprueba:
    // const resUpd = await VentaDAO.actualizarEstadoPago(algunPagoId, 'aprobado');
    // console.log(resUpd);

    // ---------- 7) Historial por usuario ----------
    console.log("\n7) Obtener historial de compras del usuario:");
    const historial = await VentaDAO.obtenerHistorialPorUsuario(usuario.id);
    console.log("Historial (resumen):");
    historial.forEach((v) => {
      console.log(
        ` - Venta ${v.id} | total ${v.total} | estado ${v.estado} | items: ${v.items.length} | pagos: ${v.pagos.length}`
      );
    });

    // ---------- 8) Pruebas CRUD: Usuario ----------
    console.log("\n8) Pruebas CRUD Usuario:");
    const usuarioFetched = await UsuarioDAO.obtenerPorId(usuario.id);
    console.log(
      "Obtener por id:",
      usuarioFetched.nombreUsuario,
      usuarioFetched.correo
    );

    console.log("Actualizar usuario (cambiar apellido paterno)...");
    const usuarioUpd = await UsuarioDAO.actualizar(usuario.id, {
      apellidoPaterno: "Gómez",
    });
    console.log("Usuario actualizado:", usuarioUpd.apellidoPaterno);

    console.log("Desactivar usuario...");
    await UsuarioDAO.eliminar(usuario.id);
    const usuarioDesac = await UsuarioDAO.obtenerPorId(usuario.id);
    console.log("Activo:", usuarioDesac.activo); // esperado: false

    // ---------- 9) Pruebas CRUD: Producto ----------
    console.log("\n9) Pruebas CRUD Producto:");
    const productosLista = await ProductoDAO.obtenerProductos({ limit: 10 });
    console.log("Productos totales (lista):", productosLista.length);
    console.log(
      "Buscar por nombre 'pastiche' (ejemplo):",
      await ProductoDAO.buscarPorNombre("p")
    ); // ejemplo
    console.log(
      "\n4) Editando producto p2 (agregar categorias 'perrunos' y 'saludableee')..."
    );

    const actualizado = await ProductoDAO.actualizarProducto(p2.id, {
      precio: 1500.0,
      categorias: ["perrunos", "saludableee"], // reasignar categorías
    });

    // Obtener el producto con las categorías ya incluidas
    const actualizadoConCategorias = await ProductoDAO.obtenerProductoPorId(
      p2.id,
      {
        includeCategorias: true,
      }
    );

    // Mostrar resultado
    console.log("Producto actualizado:", {
      id: actualizadoConCategorias.id,
      nombre: actualizadoConCategorias.nombre,
      precio: actualizadoConCategorias.precio,
      categorias: actualizadoConCategorias.categorias.map((c) => c.nombre),
    });

    // ---------- FIN ----------
    console.log("\n=== FIN DE PRUEBAS ===");
    process.exit(0);
  } catch (err) {
    console.error("ERROR EN PRUEBAS:", err.message || err);
    console.error(err);
    process.exit(1);
  }
})();

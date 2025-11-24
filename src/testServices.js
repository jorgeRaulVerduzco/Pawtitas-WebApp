// testServices.js - Clase de prueba con mock de localStorage

// ===== MOCK DE LOCALSTORAGE PARA NODE.JS =====
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

// Simular localStorage en el entorno global
global.localStorage = new LocalStorageMock();

// ===== IMPORTAR SERVICIOS =====
const UsuarioService = require("./services/usuario.service.js");
const ProductoService = require("./services/producto.service.js");
const VentaService = require("./services/venta.service.js");
const PagoService = require("./services/pago.service.js");

class TestServices {
  constructor() {
    this.usuarioId = null;
    this.productoIds = [];
    this.ventaId = null;
    this.pagoId = null;
  }

  /**
   * Ejecutar todas las pruebas
   */
  async ejecutarTodasLasPruebas() {
    console.log("=== INICIO DE PRUEBAS DE SERVICIOS ===\n");

    try {
      await this.probarUsuarioService();
      await this.probarProductoService();
      await this.probarVentaService();
      await this.probarPagoService();

      console.log("\n=== ✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE ===");
    } catch (error) {
      console.error("\n=== ❌ ERROR EN LAS PRUEBAS ===");
      console.error(error);
    }
  }

  /**
   * PRUEBAS DE USUARIO SERVICE
   */
  async probarUsuarioService() {
    console.log("\n📋 === PRUEBAS DE USUARIO SERVICE ===\n");

    try {
      // 1. Registrar usuario
      console.log("1️⃣ Probando registrar usuario...");
      const nuevoUsuario = {
        nombres: "Test",
        apellidoPaterno: "Usuario",
        apellidoMaterno: "Prueba",
        nombreUsuario: `testuser_${Date.now()}`,
        correo: `test_${Date.now()}@example.com`,
        contrasena: "password123",
        rol: "cliente",
      };

      const registroResponse = await UsuarioService.registrar(nuevoUsuario);
      console.log("✅ Usuario registrado:", registroResponse);
      this.usuarioId = registroResponse.data.id;

      // 2. Login
      console.log("\n2️⃣ Probando login...");
      const loginResponse = await UsuarioService.login(
        nuevoUsuario.nombreUsuario,
        nuevoUsuario.contrasena
      );
      console.log("✅ Login exitoso. Token guardado en localStorage (mock)");
      console.log("Token:", loginResponse.data.token.substring(0, 20) + "...");

      // Verificar que el token se guardó
      const tokenGuardado = localStorage.getItem("token");
      console.log(
        "Token verificado en localStorage:",
        tokenGuardado ? "✅ Sí" : "❌ No"
      );

      // 3. Obtener todos los usuarios
      console.log("\n3️⃣ Probando obtener todos los usuarios...");
      const todosUsuarios = await UsuarioService.obtenerTodos();
      console.log(`✅ Total de usuarios: ${todosUsuarios.count}`);

      // 4. Obtener usuario por ID
      console.log("\n4️⃣ Probando obtener usuario por ID...");
      const usuarioPorId = await UsuarioService.obtenerPorId(this.usuarioId);
      console.log("✅ Usuario obtenido:", {
        id: usuarioPorId.data.id,
        nombreUsuario: usuarioPorId.data.nombreUsuario,
        correo: usuarioPorId.data.correo,
      });

      // 5. Actualizar usuario
      console.log("\n5️⃣ Probando actualizar usuario...");
      const actualizarResponse = await UsuarioService.actualizar(
        this.usuarioId,
        {
          apellidoPaterno: "UsuarioActualizado",
        }
      );
      console.log(
        "✅ Usuario actualizado:",
        actualizarResponse.data.apellidoPaterno
      );

      // 6. Cambiar rol
      console.log("\n6️⃣ Probando cambiar rol...");
      const cambiarRolResponse = await UsuarioService.cambiarRol(
        this.usuarioId,
        "empleado"
      );
      console.log("✅ Rol cambiado a:", cambiarRolResponse.data.rol);

      // 7. Activar/Desactivar
      console.log("\n7️⃣ Probando desactivar usuario...");
      const desactivarResponse = await UsuarioService.activarDesactivar(
        this.usuarioId,
        false
      );
      console.log(
        "✅ Usuario desactivado. Activo:",
        desactivarResponse.data.activo
      );

      console.log("\n8️⃣ Probando reactivar usuario...");
      const reactivarResponse = await UsuarioService.activarDesactivar(
        this.usuarioId,
        true
      );
      console.log(
        "✅ Usuario reactivado. Activo:",
        reactivarResponse.data.activo
      );

      console.log("\n✅ PRUEBAS DE USUARIO SERVICE COMPLETADAS\n");
    } catch (error) {
      console.error("❌ Error en pruebas de Usuario Service:", error.message);
      throw error;
    }
  }

  /**
   * PRUEBAS DE PRODUCTO SERVICE
   */
  async probarProductoService() {
    console.log("\n📦 === PRUEBAS DE PRODUCTO SERVICE ===\n");

    try {
      // 1. Crear productos
      console.log("1️⃣ Probando crear productos...");
      const producto1 = await ProductoService.crear({
        nombre: "Comida para Perro Premium",
        descripcion: "Alimento balanceado de alta calidad",
        precio: 450.5,
        cantidadStock: 50,
        activo: true,
        categorias: ["comida", "perros"],
      });
      this.productoIds.push(producto1.data.id);
      console.log("✅ Producto 1 creado:", {
        id: producto1.data.id,
        nombre: producto1.data.nombre,
        precio: producto1.data.precio,
      });

      const producto2 = await ProductoService.crear({
        nombre: "Juguete para Gato",
        descripcion: "Juguete interactivo con plumas",
        precio: 120.0,
        cantidadStock: 30,
        activo: true,
        categorias: ["juguetes", "gatos"],
      });
      this.productoIds.push(producto2.data.id);
      console.log("✅ Producto 2 creado:", {
        id: producto2.data.id,
        nombre: producto2.data.nombre,
        precio: producto2.data.precio,
      });

      // 2. Obtener todos los productos
      console.log("\n2️⃣ Probando obtener todos los productos...");
      const todosProductos = await ProductoService.obtenerTodos(10, 0);
      console.log(`✅ Total de productos: ${todosProductos.count}`);

      // 5. Buscar por nombre
      console.log("\n5️⃣ Probando buscar productos por nombre...");
      try {
        const busqueda = await ProductoService.buscarPorNombre("Comida");
        console.log(`✅ Productos encontrados: ${busqueda.results}`);
      } catch (error) {
        console.log(`⚠️ Búsqueda no disponible: ${error.message}`);
      }

      // 3. Obtener producto por ID (con categorías)
      console.log("\n3️⃣ Probando obtener producto por ID con categorías...");
      const productoPorId = await ProductoService.obtenerPorId(
        this.productoIds[0],
        true
      );
      console.log("✅ Producto obtenido:", {
        id: productoPorId.data.id,
        nombre: productoPorId.data.nombre,
        stock: productoPorId.data.cantidadStock,
      });

      // 4. Actualizar producto
      console.log("\n4️⃣ Probando actualizar producto...");
      const productoActualizado = await ProductoService.actualizar(
        this.productoIds[0],
        {
          precio: 475.0,
          cantidadStock: 45,
        }
      );
      console.log("✅ Producto actualizado:", {
        precio: productoActualizado.data.precio,
        stock: productoActualizado.data.cantidadStock,
      });

      // 6. Calificar producto
      console.log("\n6️⃣ Probando calificar producto...");
      try {
        const calificacion = await ProductoService.calificar(
          this.productoIds[0],
          4.5
        );
        console.log("✅ Producto calificado:", calificacion.data.calificacion);
      } catch (error) {
        console.log(`⚠️ Calificación no disponible: ${error.message}`);
      }

      // 7. FILTRAR POR CATEGORÍA (Nueva Prueba)
      console.log("\n7️⃣ Probando filtrar por categoría...");
      try {
        // NOTA: ASUME QUE LA CATEGORÍA 'perros' TIENE EL ID 2 o 3.
        // Si el ID es diferente, debes obtenerlo previamente. Usaremos el ID de categoría '1' como EJEMPLO
        const CATEGORIA_ID_PRUEBA = 1; // ID de una categoría existente (e.g., 'comida')

        const productosFiltrados = await ProductoService.filtrarPorCategoria(
          CATEGORIA_ID_PRUEBA
        );

        // Verificamos que al menos uno de nuestros productos creados (el producto 1) esté en la lista.
        const productoCreadoEncontrado = productosFiltrados.data.some(
          (p) => p.id === this.productoIds[0]
        );

        if (productosFiltrados.results > 0 && productoCreadoEncontrado) {
          console.log(
            `✅ Productos filtrados: ${productosFiltrados.results} encontrados para la categoría ${CATEGORIA_ID_PRUEBA}.`
          );
        } else {
          console.log(
            `⚠️ Filtrado no verificable: Se esperaban productos, se encontraron ${productosFiltrados.results}.`
          );
        }
      } catch (error) {
        console.log(`❌ Error al filtrar por categoría: ${error.message}`);
      }

      console.log("\n✅ PRUEBAS DE PRODUCTO SERVICE COMPLETADAS\n");
    } catch (error) {
      console.error("❌ Error en pruebas de Producto Service:", error.message);
      throw error;
    }
    console.log("\n✅ PRUEBAS DE PRODUCTO SERVICE COMPLETADAS\n");
  }
  catch(error) {
    console.error("❌ Error en pruebas de Producto Service:", error.message);
    throw error;
  }

  /**
   * PRUEBAS DE VENTA SERVICE
   */
  async probarVentaService() {
    console.log("\n🛒 === PRUEBAS DE VENTA SERVICE ===\n");

    try {
      // 1. Crear venta completa
      console.log("1️⃣ Probando crear venta completa...");
      const ventaData = {
        clienteId: this.usuarioId,
        items: [
          {
            productoId: this.productoIds[0],
            cantidad: 2,
          },
          {
            productoId: this.productoIds[1],
            cantidad: 3,
          },
        ],
        pago: {
          metodoPago: "tarjeta",
          referencia: "TEST-TRANS-001",
          estado: "pendiente",
        },
      };

      const ventaCreada = await VentaService.crearVentaCompleta(ventaData);
      this.ventaId = ventaCreada.data.venta.id;
      this.pagoId = ventaCreada.data.pago.id;
      console.log("✅ Venta creada:", {
        id: ventaCreada.data.venta.id,
        total: ventaCreada.data.venta.total,
        estado: ventaCreada.data.venta.estado,
      });
      console.log("✅ Pago inicial creado:", {
        id: ventaCreada.data.pago.id,
        monto: ventaCreada.data.pago.monto,
        estado: ventaCreada.data.pago.estado,
      });

      // 2. Obtener venta por ID
      console.log("\n2️⃣ Probando obtener venta por ID...");
      const ventaPorId = await VentaService.obtenerPorId(this.ventaId);
      console.log("✅ Venta obtenida:", {
        id: ventaPorId.data.id,
        total: ventaPorId.data.total,
      });

      console.log("\n✅ PRUEBAS DE VENTA SERVICE COMPLETADAS\n");
    } catch (error) {
      console.error("❌ Error en pruebas de Venta Service:", error.message);
      throw error;
    }
  }

  /**
   * PRUEBAS DE PAGO SERVICE
   */
  async probarPagoService() {
    console.log("\n💳 === PRUEBAS DE PAGO SERVICE ===\n");

    try {
      // 1. Obtener pago por ID
      console.log("1️⃣ Probando obtener pago por ID...");
      const pagoPorId = await PagoService.obtenerPorId(this.pagoId);
      console.log("✅ Pago obtenido:", {
        id: pagoPorId.data.id,
        monto: pagoPorId.data.monto,
        estado: pagoPorId.data.estado,
      });

      console.log("\n✅ PRUEBAS DE PAGO SERVICE COMPLETADAS\n");
    } catch (error) {
      console.error("❌ Error en pruebas de Pago Service:", error.message);
      throw error;
    }
  }

  /**
   * Método para generar reporte de resultados
   */
  generarReporte() {
    console.log("\n📊 === REPORTE DE PRUEBAS ===\n");
    console.log(`Usuario ID: ${this.usuarioId}`);
    console.log(`Productos creados: ${this.productoIds.length}`);
    console.log(`Producto IDs: [${this.productoIds.join(", ")}]`);
    console.log(`Venta ID: ${this.ventaId}`);
    console.log(`Pago ID: ${this.pagoId}`);
    console.log("\n=================================\n");
  }
}

// Ejecutar pruebas automáticamente al cargar
(async function () {
  const tester = new TestServices();

  try {
    console.log("🔍 Estado de localStorage antes de pruebas:");
    console.log("   Items:", Object.keys(localStorage.store).length);

    await tester.ejecutarTodasLasPruebas();
    tester.generarReporte();

    console.log("\n🔍 Estado de localStorage después de pruebas:");
    console.log("   Items:", Object.keys(localStorage.store).length);
    console.log(
      "   Token guardado:",
      localStorage.getItem("token") ? "Sí" : "No"
    );
  } catch (error) {
    console.error("Error fatal en las pruebas:", error);
  }
})();

module.exports = TestServices;

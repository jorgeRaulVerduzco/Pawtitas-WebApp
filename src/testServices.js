// testAllServices.js - Prueba completa de TODOS los servicios incluyendo adopciones
const UsuarioService = require("./services/usuario.service.js");
const ProductoService = require("./services/producto.service.js");
const VentaService = require("./services/venta.service.js");
const PagoService = require("./services/pago.service.js");

// Nuevos servicios añadidos
const MascotaService = require("./services/mascota.service.js");
const CentroAdopcionService = require("./services/centroAdopcion.service.js");
const AdopcionService = require("./services/adopcion.service.js");

global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};
class TestAllServices {
  constructor() {
    // Datos de prueba para tienda
    this.usuarioId = null;
    this.productoIds = [];
    this.ventaId = null;
    this.pagoId = null;
    
    // Datos de prueba para adopciones
    this.centroId = null;
    this.mascotaIds = [];
    this.adopcionIds = [];
  }

  /**
   * Ejecutar todas las pruebas
   */
  async ejecutarTodasLasPruebas() {
    console.log('=== 🚀 INICIO DE PRUEBAS COMPLETAS DE TODOS LOS SERVICIOS ===\n');

    try {
      // Módulo de Tienda
      await this.probarUsuarioService();
      await this.probarProductoService();
      await this.probarVentaService();
      await this.probarPagoService();

      // Módulo de Adopciones
      await this.probarCentroAdopcionService();
      await this.probarMascotaService();
      await this.probarAdopcionService();

      console.log('\n=== ✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE ===');
      this.generarReporteCompleto();
    } catch (error) {
      console.error('\n=== ❌ ERROR EN LAS PRUEBAS ===');
      console.error(error);
    }
  }

  /**
   * PRUEBAS DE USUARIO SERVICE (ya implementado anteriormente)
   */
  async probarUsuarioService() {
    console.log('\n👤 === PRUEBAS DE USUARIO SERVICE ===\n');

    try {
      const nuevoUsuario = {
        nombres: 'Test',
        apellidoPaterno: 'Adopcion',
        apellidoMaterno: 'Usuario',
        nombreUsuario: `adopter_${Date.now()}`,
        correo: `adopter_${Date.now()}@example.com`,
        contrasena: 'password123',
        rol: 'cliente'
      };

      console.log('1️⃣ Registrando usuario...');
      const registroResponse = await UsuarioService.registrar(nuevoUsuario);
      this.usuarioId = registroResponse.data.id;
      console.log('✅ Usuario registrado:', registroResponse.data.nombreUsuario);

      console.log('\n2️⃣ Iniciando sesión...');
      const loginResponse = await UsuarioService.login(
        nuevoUsuario.nombreUsuario,
        nuevoUsuario.contrasena
      );
      console.log('✅ Login exitoso. Token guardado.');

      console.log('\n✅ PRUEBAS DE USUARIO COMPLETADAS\n');
    } catch (error) {
      console.error('❌ Error en Usuario Service:', error.message);
      throw error;
    }
  }

  /**
   * PRUEBAS DE PRODUCTO SERVICE (resumido)
   */
  async probarProductoService() {
    console.log('\n📦 === PRUEBAS DE PRODUCTO SERVICE ===\n');

    try {
      console.log('1️⃣ Creando productos...');
      const producto1 = await ProductoService.crear({
        nombre: 'Collar para Perro',
        descripcion: 'Collar resistente',
        precio: 150.00,
        cantidadStock: 20,
        categorias: ['accesorios']
      });
      this.productoIds.push(producto1.data.id);
      console.log('✅ Producto creado:', producto1.data.nombre);

      console.log('\n✅ PRUEBAS DE PRODUCTO COMPLETADAS\n');
    } catch (error) {
      console.error('❌ Error en Producto Service:', error.message);
      throw error;
    }
  }

  /**
   * PRUEBAS DE VENTA SERVICE (resumido)
   */
  async probarVentaService() {
    console.log('\n🛒 === PRUEBAS DE VENTA SERVICE ===\n');

    try {
      console.log('1️⃣ Creando venta...');
      const ventaData = {
        clienteId: this.usuarioId,
        items: [{ productoId: this.productoIds[0], cantidad: 1 }],
        pago: { metodoPago: 'tarjeta', estado: 'pendiente' }
      };

      const ventaCreada = await VentaService.crearVentaCompleta(ventaData);
      this.ventaId = ventaCreada.data.venta.id;
      this.pagoId = ventaCreada.data.pago.id;
      console.log('✅ Venta creada:', { id: this.ventaId, total: ventaCreada.data.venta.total });

      console.log('\n✅ PRUEBAS DE VENTA COMPLETADAS\n');
    } catch (error) {
      console.error('❌ Error en Venta Service:', error.message);
      throw error;
    }
  }

  /**
   * PRUEBAS DE PAGO SERVICE (resumido)
   */
  async probarPagoService() {
    console.log('\n💳 === PRUEBAS DE PAGO SERVICE ===\n');

    try {
      console.log('1️⃣ Aprobando pago...');
      await PagoService.actualizarEstado(this.pagoId, 'aprobado');
      console.log('✅ Pago aprobado');

      console.log('\n✅ PRUEBAS DE PAGO COMPLETADAS\n');
    } catch (error) {
      console.error('❌ Error en Pago Service:', error.message);
      throw error;
    }
  }

  /**
   * PRUEBAS DE CENTRO ADOPCION SERVICE
   */
  async probarCentroAdopcionService() {
    console.log('\n🏢 === PRUEBAS DE CENTRO ADOPCION SERVICE ===\n');

    try {
      // 1. Crear centro
      console.log('1️⃣ Creando centro de adopción...');
      const centroData = {
        nombre: 'Centro Patitas Felices',
        correo: `centro_${Date.now()}@patitasfelices.org`,
        telefono: '555-1234-5678'
      };

      const centroCreado = await CentroAdopcionService.crear(centroData);
      this.centroId = centroCreado.centro.id;
      console.log('✅ Centro creado:', {
        id: this.centroId,
        nombre: centroCreado.centro.nombre
      });

      // 2. Obtener todos los centros
      console.log('\n2️⃣ Obteniendo todos los centros...');
      const todosCentros = await CentroAdopcionService.obtenerTodos();
      console.log(`✅ Total de centros: ${todosCentros.total}`);

      // 3. Obtener centro por ID
      console.log('\n3️⃣ Obteniendo centro por ID...');
      const centroPorId = await CentroAdopcionService.obtenerPorId(this.centroId);
      console.log('✅ Centro obtenido:', centroPorId.centro.nombre);

      // 4. Buscar por nombre
      console.log('\n4️⃣ Buscando centros por nombre...');
      const busqueda = await CentroAdopcionService.buscarPorNombre('Patitas');
      console.log(`✅ Centros encontrados: ${busqueda.centros.length}`);

      console.log('\n✅ PRUEBAS DE CENTRO ADOPCION COMPLETADAS\n');
    } catch (error) {
      console.error('❌ Error en Centro Adopcion Service:', error.message);
      throw error;
    }
  }

  /**
   * PRUEBAS DE MASCOTA SERVICE
   */
  async probarMascotaService() {
    console.log('\n🐾 === PRUEBAS DE MASCOTA SERVICE ===\n');

    try {
      // 1. Crear mascotas
      console.log('1️⃣ Creando mascotas...');
      const mascotas = [
        {
          idCentroAdopcion: this.centroId,
          especie: 'Perro',
          nombre: 'Firulais',
          edad: '3 años',
          tamano: 'Mediano',
          sexo: 'macho',
          descripcion: 'Perro amigable y juguetón',
          estado: 'disponible'
        },
        {
          idCentroAdopcion: this.centroId,
          especie: 'Gato',
          nombre: 'Michi',
          edad: '1 año',
          tamano: 'Pequeño',
          sexo: 'hembra',
          descripcion: 'Gata cariñosa',
          estado: 'disponible'
        }
      ];

      for (const mascota of mascotas) {
        const resultado = await MascotaService.crear(mascota);
        this.mascotaIds.push(resultado.data.id);
        console.log(`✅ Mascota creada: ${resultado.data.nombre} (${resultado.data.especie})`);
      }

      // 2. Obtener todas las mascotas
      console.log('\n2️⃣ Obteniendo todas las mascotas...');
      const todasMascotas = await MascotaService.obtenerTodas({ includeCentro: true });
      console.log(`✅ Total de mascotas: ${todasMascotas.count}`);

      // 3. Obtener mascota por ID
      console.log('\n3️⃣ Obteniendo mascota por ID...');
      const mascotaPorId = await MascotaService.obtenerPorId(this.mascotaIds[0], true);
      console.log('✅ Mascota obtenida:', {
        nombre: mascotaPorId.data.nombre,
        centro: mascotaPorId.data.centro?.nombre
      });

      // 4. Obtener mascotas por centro
      console.log('\n4️⃣ Obteniendo mascotas por centro...');
      const mascotasCentro = await MascotaService.obtenerPorCentro(this.centroId);
      console.log(`✅ Mascotas del centro: ${mascotasCentro.count}`);

      // 5. Obtener mascotas disponibles
      console.log('\n5️⃣ Obteniendo mascotas disponibles...');
      const disponibles = await MascotaService.obtenerDisponibles({ includeCentro: true });
      console.log(`✅ Mascotas disponibles: ${disponibles.count}`);

      // 6. Actualizar estado de mascota
      console.log('\n6️⃣ Actualizando estado de mascota...');
      await MascotaService.actualizarEstado(this.mascotaIds[1], 'en_proceso');
      console.log('✅ Estado actualizado a: en_proceso');

      console.log('\n✅ PRUEBAS DE MASCOTA COMPLETADAS\n');
    } catch (error) {
      console.error('❌ Error en Mascota Service:', error.message);
      throw error;
    }
  }

  /**
   * PRUEBAS DE ADOPCION SERVICE
   */
  async probarAdopcionService() {
    console.log('\n💚 === PRUEBAS DE ADOPCION SERVICE ===\n');

    try {
      // 1. Crear solicitud de adopción
      console.log('1️⃣ Creando solicitud de adopción...');
      const adopcionData = {
        idUsuario: this.usuarioId,
        idMascota: this.mascotaIds[0],
        tipoVivienda: 'Casa',
        tienePatio: true,
        razonAdopcion: 'Quiero darle un hogar a una mascota',
        tieneExperiencia: true
      };

      const adopcionCreada = await AdopcionService.crear(adopcionData);
      this.adopcionIds.push(adopcionCreada.data.id);
      console.log('✅ Solicitud creada:', {
        id: adopcionCreada.data.id,
        estado: adopcionCreada.data.estadoSolicitud
      });

      // 2. Obtener todas las adopciones
      console.log('\n2️⃣ Obteniendo todas las adopciones...');
      const todasAdopciones = await AdopcionService.obtenerTodas({
        includeUsuario: true,
        includeMascota: true
      });
      console.log(`✅ Total de adopciones: ${todasAdopciones.count}`);

      // 3. Obtener adopción por ID
      console.log('\n3️⃣ Obteniendo adopción por ID...');
      const adopcionPorId = await AdopcionService.obtenerPorId(this.adopcionIds[0], {
        includeUsuario: true,
        includeMascota: true
      });
      console.log('✅ Adopción obtenida:', {
        id: adopcionPorId.data.id,
        usuario: adopcionPorId.data.usuario?.nombreUsuario,
        mascota: adopcionPorId.data.mascota?.nombre
      });

      // 4. Obtener adopciones por usuario
      console.log('\n4️⃣ Obteniendo adopciones por usuario...');
      const adopcionesUsuario = await AdopcionService.obtenerPorUsuario(this.usuarioId, true);
      console.log(`✅ Adopciones del usuario: ${adopcionesUsuario.count}`);

      // 5. Obtener adopciones por mascota
      console.log('\n5️⃣ Obteniendo adopciones por mascota...');
      const adopcionesMascota = await AdopcionService.obtenerPorMascota(this.mascotaIds[0], true);
      console.log(`✅ Adopciones de la mascota: ${adopcionesMascota.count}`);

      // 6. Obtener solicitudes pendientes
      console.log('\n6️⃣ Obteniendo solicitudes pendientes...');
      const pendientes = await AdopcionService.obtenerPendientes({ includeMascota: true });
      console.log(`✅ Solicitudes pendientes: ${pendientes.count}`);

      // 7. Aprobar solicitud
      console.log('\n7️⃣ Aprobando solicitud de adopción...');
      const aprobada = await AdopcionService.aprobar(this.adopcionIds[0]);
      console.log('✅ Solicitud aprobada:', {
        id: aprobada.data.id,
        estado: aprobada.data.estadoSolicitud
      });

      // 8. Verificar que la mascota cambió de estado
      console.log('\n8️⃣ Verificando estado de mascota adoptada...');
      const mascotaAdoptada = await MascotaService.obtenerPorId(this.mascotaIds[0]);
      console.log('✅ Estado de mascota:', mascotaAdoptada.data.estado);

      await MascotaService.actualizarEstado(this.mascotaIds[1], 'disponible');
    console.log('✅ Mascota 2 actualizada a disponible');
    
    const adopcion2 = await AdopcionService.crear({
      idUsuario: this.usuarioId,
      idMascota: this.mascotaIds[1],  // Ahora está disponible
      tipoVivienda: 'Departamento',
      tienePatio: false,
      razonAdopcion: 'Compañía',
      tieneExperiencia: false
    });
    this.adopcionIds.push(adopcion2.data.id);
    
    const rechazada = await AdopcionService.rechazar(adopcion2.data.id);
    console.log('✅ Solicitud rechazada:', {
      id: rechazada.data.id,
      estado: rechazada.data.estadoSolicitud
    });

    // 10. Obtener historial del usuario
    console.log('\n🔟 Obteniendo historial completo del usuario...');
    const historial = await AdopcionService.obtenerHistorialUsuario(this.usuarioId);
    console.log(`✅ Historial: ${historial.count} solicitudes`);
    historial.data.forEach((adopcion, index) => {
      console.log(`   ${index + 1}. ${adopcion.mascota?.nombre} - Estado: ${adopcion.estadoSolicitud}`);
    });

    console.log('\n✅ PRUEBAS DE ADOPCION COMPLETADAS\n');
  } catch (error) {
    console.error('❌ Error en Adopcion Service:', error.message);
    throw error;
  }
  }

  /**
   * Generar reporte completo
   */
  generarReporteCompleto() {
    console.log('\n📊 === REPORTE COMPLETO DE PRUEBAS ===\n');
    console.log('MÓDULO DE TIENDA:');
    console.log(`  Usuario ID: ${this.usuarioId}`);
    console.log(`  Productos creados: ${this.productoIds.length}`);
    console.log(`  Venta ID: ${this.ventaId}`);
    console.log(`  Pago ID: ${this.pagoId}`);
    console.log('\nMÓDULO DE ADOPCIONES:');
    console.log(`  Centro ID: ${this.centroId}`);
    console.log(`  Mascotas creadas: ${this.mascotaIds.length}`);
    console.log(`  Mascotas IDs: [${this.mascotaIds.join(', ')}]`);
    console.log(`  Adopciones creadas: ${this.adopcionIds.length}`);
    console.log(`  Adopciones IDs: [${this.adopcionIds.join(', ')}]`);
    console.log('\n==========================================\n');
  }

  /**
   * Limpiar datos de prueba
   */
  async limpiarDatosPrueba() {
    console.log('\n🧹 === LIMPIANDO DATOS DE PRUEBA ===\n');

    try {
      // Limpiar adopciones
      for (const adopcionId of this.adopcionIds) {
        await AdopcionService.eliminar(adopcionId);
        console.log(`✅ Adopción ${adopcionId} eliminada`);
      }

      // Limpiar mascotas
      for (const mascotaId of this.mascotaIds) {
        await MascotaService.eliminar(mascotaId);
        console.log(`✅ Mascota ${mascotaId} eliminada`);
      }

      // Desactivar usuario
      if (this.usuarioId) {
        await UsuarioService.desactivar(this.usuarioId);
        console.log('✅ Usuario desactivado');
      }

      // Eliminar productos
      for (const productoId of this.productoIds) {
        await ProductoService.eliminar(productoId);
        console.log(`✅ Producto ${productoId} eliminado`);
      }

      console.log('\n✅ LIMPIEZA COMPLETADA\n');
    } catch (error) {
      console.error('❌ Error al limpiar datos:', error.message);
    }
  }
}

// Ejecutar pruebas
(async function() {
  const tester = new TestAllServices();
  
  try {
    await tester.ejecutarTodasLasPruebas();
    
    // Descomentar para limpiar datos de prueba
    // await tester.limpiarDatosPrueba();
    
  } catch (error) {
    console.error('Error fatal en las pruebas:', error);
  }
})();

module.exports = TestAllServices;
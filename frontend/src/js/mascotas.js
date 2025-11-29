import MascotaService from '../services/mascota.service.js';
import CentroAdopcionService from '../services/centroAdopcion.service.js';

let allMascotas = [];

function createPetElement(m) {
	const el = document.createElement('pet-info');
	if (m.id) el.setAttribute('pet-id', m.id);
	if (m.nombre) el.setAttribute('name', m.nombre);
	if (m.imagen) {
		// Normalizar ruta de imagen: si no es URL absoluta ni data:, prefijar con /frontend/
		let img = m.imagen;
		if (!(img.startsWith('http') || img.startsWith('/') || img.startsWith('data:'))) {
			img = `/frontend/${img}`;
		}
		el.setAttribute('imagen', img);
	}
	if (m.edad) el.setAttribute('edad', m.edad);
	if (m.especie) el.setAttribute('especie', m.especie);
	if (m.tamano) el.setAttribute('tamano', m.tamano);
	if (m.sexo) el.setAttribute('sexo', m.sexo);
	if (m.estado) el.setAttribute('estado', m.estado);
	if (m.centro && m.centro.nombre) el.setAttribute('centro', m.centro.nombre);
	return el;
}

function renderMascotas(list) {
	const hostResultados = document.querySelector('.resultados-adopcion');
	if (!hostResultados) return;
	hostResultados.innerHTML = '';

	if (!list.length) {
		hostResultados.textContent = 'No hay mascotas que coincidan con los filtros.';
		return;
	}

	list.forEach(m => hostResultados.appendChild(createPetElement(m)));
}

function applyFilters() {
	const checked = Array.from(document.querySelectorAll('.filtro-checkbox input[type="checkbox"]:checked')).map(c => c.value.toLowerCase());
	const select = document.getElementById('centro-de-adopcion');
	const centroId = select ? select.value : '';

	const filtered = allMascotas.filter(m => {
		const especieOk = checked.length === 0 || (m.especie && checked.includes(String(m.especie).toLowerCase()));
		const centroOk = !centroId || String(m.idCentroAdopcion) === String(centroId);
		return especieOk && centroOk;
	});

	renderMascotas(filtered);
}

async function populateCentros() {
	try {
		const resp = await CentroAdopcionService.obtenerTodos();
		const centros = resp && resp.centros ? resp.centros : [];
		const select = document.getElementById('centro-de-adopcion');
		if (!select) return;

		// opción por defecto y opciones desde API
		select.innerHTML = '<option value="">Todos los centros</option>' + centros.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

		select.addEventListener('change', applyFilters);
	} catch (err) {
		console.error('Error cargando centros:', err);
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	try {
		await populateCentros();

		// Obtener mascotas disponibles e incluir datos del centro
		const resp = await MascotaService.obtenerDisponibles({ includeCentro: true });
		allMascotas = resp && resp.data ? resp.data : [];

		// Ayuda para debugging: inspeccionar los datos que vienen del backend
		console.log('mascotas cargadas desde API ->', allMascotas);

		// Vincular listeners de filtros
		const checkboxes = document.querySelectorAll('.filtro-checkbox input[type="checkbox"]');
		checkboxes.forEach(cb => cb.addEventListener('change', applyFilters));

		// Render inicial
		renderMascotas(allMascotas);
	} catch (err) {
		console.error('Error cargando mascotas en mascotas.js', err);
	}
});


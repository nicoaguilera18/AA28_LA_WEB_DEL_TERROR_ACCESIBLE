const contenido = document.getElementById('contenido');
const mensaje = document.getElementById('mensaje');
const formulario = document.getElementById('formDisfraz');
const campoId = document.getElementById('disfrazId');
const campoNombre = document.getElementById('nombre');
const campoDescripcion = document.getElementById('descripcion');
const campoFoto = document.getElementById('foto');
const tituloFormulario = document.getElementById('tituloFormulario');
const btnCancelar = document.getElementById('btnCancelar');
const tablaDisfraces = document.getElementById('tablaDisfraces');

function mostrarMensaje(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className = esError ? 'mensaje-error' : 'mensaje-exito';
}

async function verificarAdmin() {
    try {
        const respuesta = await fetch('api/sesion.php');
        if (respuesta.ok) {
            const sesion = await respuesta.json();
            if (sesion.es_admin === 1) {
                return true;
            }
        }
    } catch (error) {
        // se redirige abajo
    }
    window.location.href = 'index.html';
    return false;
}

function limpiarFormulario() {
    formulario.reset();
    campoId.value = '';
    tituloFormulario.textContent = 'Nuevo disfraz';
    btnCancelar.hidden = true;
}

function cargarEnFormulario(disfraz) {
    campoId.value = disfraz.id;
    campoNombre.value = disfraz.nombre;
    campoDescripcion.value = disfraz.descripcion;
    campoFoto.value = '';
    tituloFormulario.textContent = 'Editar disfraz';
    btnCancelar.hidden = false;
    campoNombre.focus();
}

function crearFila(disfraz) {
    const fila = document.createElement('tr');

    const celdaFoto = document.createElement('td');
    const imagen = document.createElement('img');
    imagen.src = 'img/' + disfraz.foto + '?v=' + Date.now();
    imagen.alt = disfraz.nombre;
    imagen.addEventListener('error', function () {
        imagen.replaceWith(document.createTextNode('🎃'));
    });
    celdaFoto.appendChild(imagen);

    const celdaNombre = document.createElement('td');
    celdaNombre.textContent = disfraz.nombre;

    const celdaDescripcion = document.createElement('td');
    celdaDescripcion.textContent = disfraz.descripcion;

    const celdaVotos = document.createElement('td');
    celdaVotos.textContent = disfraz.votos;

    const celdaAcciones = document.createElement('td');
    const acciones = document.createElement('div');
    acciones.className = 'acciones';

    const btnEditar = document.createElement('button');
    btnEditar.type = 'button';
    btnEditar.className = 'btn btn-secundario';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', function () {
        cargarEnFormulario(disfraz);
    });

    const btnEliminar = document.createElement('button');
    btnEliminar.type = 'button';
    btnEliminar.className = 'btn btn-peligro';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', function () {
        eliminarDisfraz(disfraz);
    });

    acciones.append(btnEditar, btnEliminar);
    celdaAcciones.appendChild(acciones);

    fila.append(celdaFoto, celdaNombre, celdaDescripcion, celdaVotos, celdaAcciones);
    return fila;
}

async function cargarTabla() {
    try {
        const respuesta = await fetch('api/disfraces.php');
        const disfraces = await respuesta.json();
        tablaDisfraces.replaceChildren(...disfraces.map(crearFila));
    } catch (error) {
        mostrarMensaje('No se pudieron cargar los disfraces', true);
    }
}

async function subirFoto(id, archivo) {
    const datosFormulario = new FormData();
    datosFormulario.append('id', id);
    datosFormulario.append('foto', archivo);

    const respuesta = await fetch('api/subir_foto.php', {
        method: 'POST',
        body: datosFormulario
    });
    return { ok: respuesta.ok, datos: await respuesta.json() };
}

async function eliminarDisfraz(disfraz) {
    if (!confirm('¿Eliminar "' + disfraz.nombre + '"?')) {
        return;
    }

    try {
        const respuesta = await fetch('api/admin_disfraces.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: disfraz.id })
        });
        const datos = await respuesta.json();

        if (respuesta.ok) {
            mostrarMensaje(datos.mensaje, false);
            if (campoId.value === String(disfraz.id)) {
                limpiarFormulario();
            }
            cargarTabla();
        } else {
            mostrarMensaje(datos.error, true);
        }
    } catch (error) {
        mostrarMensaje('Error de conexión con el servidor', true);
    }
}

formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const editando = campoId.value !== '';
    const cuerpo = {
        nombre: campoNombre.value.trim(),
        descripcion: campoDescripcion.value.trim()
    };
    if (editando) {
        cuerpo.id = Number(campoId.value);
    }

    try {
        const respuesta = await fetch('api/admin_disfraces.php', {
            method: editando ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cuerpo)
        });
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarMensaje(datos.error, true);
            return;
        }

        const idDisfraz = editando ? Number(campoId.value) : datos.id;
        let textoFinal = datos.mensaje;
        let hayError = false;

        if (campoFoto.files.length > 0) {
            const subida = await subirFoto(idDisfraz, campoFoto.files[0]);
            if (!subida.ok) {
                textoFinal = 'Se guardó el disfraz, pero la foto falló: ' + subida.datos.error;
                hayError = true;
            }
        }

        mostrarMensaje(textoFinal, hayError);
        limpiarFormulario();
        cargarTabla();
    } catch (error) {
        mostrarMensaje('Error de conexión con el servidor', true);
    }
});

btnCancelar.addEventListener('click', limpiarFormulario);

async function iniciar() {
    if (await verificarAdmin()) {
        contenido.hidden = false;
        cargarTabla();
    }
}

iniciar();
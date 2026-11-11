const listaDisfraces = document.getElementById('listaDisfraces');
const mensaje = document.getElementById('mensaje');
const itemLogin = document.getElementById('itemLogin');
const itemRegistro = document.getElementById('itemRegistro');
const itemAdmin = document.getElementById('itemAdmin');
const itemUsuario = document.getElementById('itemUsuario');
const nombreUsuario = document.getElementById('nombreUsuario');
const btnLogout = document.getElementById('btnLogout');

function mostrarMensaje(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className = esError ? 'mensaje-error' : 'mensaje-exito';
}

function actualizarNavegacion(sesion) {
    const logueado = sesion !== null;
    itemLogin.hidden = logueado;
    itemRegistro.hidden = logueado;
    itemUsuario.hidden = !logueado;
    itemAdmin.hidden = !(logueado && sesion.es_admin === 1);
    nombreUsuario.textContent = logueado ? 'Hola, ' + sesion.nombre : '';
}

async function verificarSesion() {
    try {
        const respuesta = await fetch('api/sesion.php');
        if (!respuesta.ok) {
            actualizarNavegacion(null);
            return;
        }
        actualizarNavegacion(await respuesta.json());
    } catch (error) {
        actualizarNavegacion(null);
    }
}

function crearTarjeta(disfraz) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta';

    const imagen = document.createElement('img');
    imagen.src = 'img/' + disfraz.foto;
    imagen.alt = disfraz.nombre;
    imagen.addEventListener('error', function () {
        const reemplazo = document.createElement('div');
        reemplazo.className = 'sin-foto';
        reemplazo.textContent = '🎃';
        imagen.replaceWith(reemplazo);
    });

    const titulo = document.createElement('h3');
    titulo.textContent = disfraz.nombre;

    const descripcion = document.createElement('p');
    descripcion.textContent = disfraz.descripcion;

    const votos = document.createElement('p');
    votos.className = 'votos';
    votos.textContent = disfraz.votos + (disfraz.votos === 1 ? ' voto' : ' votos');

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'btn';
    boton.textContent = 'Votar';
    boton.addEventListener('click', function () {
        votar(disfraz.id);
    });

    tarjeta.append(imagen, titulo, descripcion, votos, boton);
    return tarjeta;
}

async function cargarDisfraces() {
    try {
        const respuesta = await fetch('api/disfraces.php');
        const disfraces = await respuesta.json();
        listaDisfraces.replaceChildren(...disfraces.map(crearTarjeta));
    } catch (error) {
        mostrarMensaje('No se pudieron cargar los disfraces', true);
    }
}

async function votar(idDisfraz) {
    try {
        const respuesta = await fetch('api/votar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_disfraz: idDisfraz })
        });
        const datos = await respuesta.json();

        if (respuesta.ok) {
            mostrarMensaje(datos.mensaje, false);
            cargarDisfraces();
        } else {
            mostrarMensaje(datos.error, true);
        }
    } catch (error) {
        mostrarMensaje('Error de conexión con el servidor', true);
    }
}

btnLogout.addEventListener('click', async function () {
    await fetch('api/logout.php', { method: 'POST' });
    actualizarNavegacion(null);
    mostrarMensaje('Sesión cerrada', false);
});

verificarSesion();
cargarDisfraces();
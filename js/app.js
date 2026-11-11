const listaDisfraces = document.getElementById('listaDisfraces');
const itemLogin = document.getElementById('itemLogin');
const itemRegistro = document.getElementById('itemRegistro');
const itemAdmin = document.getElementById('itemAdmin');
const itemUsuario = document.getElementById('itemUsuario');
const nombreUsuario = document.getElementById('nombreUsuario');
const btnLogout = document.getElementById('btnLogout');

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
    tarjeta.className = 'perfil';

    const titulo = document.createElement('h3');
    titulo.textContent = disfraz.nombre;

    const imagen = document.createElement('img');
    imagen.src = 'img/' + disfraz.foto;
    imagen.alt = 'Foto del disfraz ' + disfraz.nombre;
    imagen.addEventListener('error', function () {
        const reemplazo = document.createElement('div');
        reemplazo.className = 'sin-foto';
        reemplazo.textContent = '☠';
        reemplazo.setAttribute('role', 'img');
        reemplazo.setAttribute('aria-label', 'Sin foto para ' + disfraz.nombre);
        imagen.replaceWith(reemplazo);
    });

    const descripcion = document.createElement('p');
    descripcion.textContent = disfraz.descripcion;

    const votos = document.createElement('p');
    votos.className = 'votos';
    votos.textContent = disfraz.votos + (disfraz.votos === 1 ? ' voto' : ' votos');

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'btn';
    boton.textContent = 'Votar';
    boton.setAttribute('aria-label', 'Votar por ' + disfraz.nombre);
    boton.dataset.id = disfraz.id;
    boton.addEventListener('click', function () {
        votar(disfraz.id);
    });

    tarjeta.append(titulo, imagen, descripcion, votos, boton);
    return tarjeta;
}

async function cargarDisfraces(idParaEnfocar) {
    try {
        const respuesta = await fetch('api/disfraces.php');
        const disfraces = await respuesta.json();
        listaDisfraces.replaceChildren(...disfraces.map(crearTarjeta));

        // Al redibujar la lista el botón enfocado se destruye;
        // se devuelve el foco al mismo botón para no perder al usuario de teclado.
        if (idParaEnfocar) {
            const boton = listaDisfraces.querySelector('button[data-id="' + idParaEnfocar + '"]');
            if (boton) {
                boton.focus();
            }
        }
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
            cargarDisfraces(idDisfraz);
        } else {
            mostrarMensaje(datos.error, true);
        }
    } catch (error) {
        mostrarMensaje('Error de conexión con el servidor', true);
    }
}

btnLogout.addEventListener('click', async function () {
    try {
        const respuesta = await fetch('api/logout.php', { method: 'POST' });
        if (!respuesta.ok) {
            mostrarMensaje('No se pudo cerrar la sesión', true);
            return;
        }
        actualizarNavegacion(null);
        mostrarMensaje('Sesión cerrada', false);
        document.querySelector('#itemLogin a').focus();
    } catch (error) {
        mostrarMensaje('Error de conexión con el servidor', true);
    }
});

verificarSesion();
cargarDisfraces();
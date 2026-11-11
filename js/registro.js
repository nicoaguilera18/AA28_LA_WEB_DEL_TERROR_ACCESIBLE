const formulario = document.getElementById('formRegistro');
const mensaje = document.getElementById('mensaje');

function mostrarMensaje(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className = esError ? 'mensaje-error' : 'mensaje-exito';
}

formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const clave = document.getElementById('clave').value;
    const repetir = document.getElementById('repetir').value;

    if (clave !== repetir) {
        mostrarMensaje('Las contraseñas no coinciden', true);
        return;
    }

    try {
        const respuesta = await fetch('api/registro.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre, clave: clave })
        });
        const datos = await respuesta.json();

        if (respuesta.ok) {
            mostrarMensaje(datos.mensaje + '. Redirigiendo al login...', false);
            setTimeout(function () {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            mostrarMensaje(datos.error, true);
        }
    } catch (error) {
        mostrarMensaje('Error de conexión con el servidor', true);
    }
});
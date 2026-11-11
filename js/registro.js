const formulario = document.getElementById('formRegistro');

formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const clave = document.getElementById('clave').value;
    const repetir = document.getElementById('repetir').value;

    if (clave !== repetir) {
        mostrarMensaje('Las contraseñas no coinciden', true);
        document.getElementById('repetir').focus();
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
            mostrarMensaje(datos.mensaje + '. Te llevamos al inicio de sesión...', false);
            setTimeout(function () {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            mostrarMensaje(datos.error, true);
        }
    } catch (error) {
        mostrarMensaje('Error de conexión con el servidor', true);
    }
});
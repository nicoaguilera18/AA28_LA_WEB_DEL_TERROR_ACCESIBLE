const formulario = document.getElementById('formLogin');

formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const clave = document.getElementById('clave').value;

    try {
        const respuesta = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre, clave: clave })
        });
        const datos = await respuesta.json();

        if (respuesta.ok) {
            window.location.href = 'index.html';
        } else {
            mostrarMensaje(datos.error, true);
        }
    } catch (error) {
        mostrarMensaje('Error de conexión con el servidor', true);
    }
});
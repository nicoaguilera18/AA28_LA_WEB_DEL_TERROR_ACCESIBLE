let temporizadorMensaje = null;

function mostrarMensaje(texto, esError) {
    const mensaje = document.getElementById('mensaje');

    clearTimeout(temporizadorMensaje);
    mensaje.textContent = '';
    mensaje.className = 'mensaje';

    // Se vacía y se vuelve a llenar para que el lector de pantalla
    // anuncie el mensaje aunque sea igual al anterior.
    temporizadorMensaje = setTimeout(function () {
        mensaje.textContent = (esError ? 'Error: ' : '') + texto;
        mensaje.className = 'mensaje ' + (esError ? 'mensaje-error' : 'mensaje-exito');
    }, 60);
}
<?php
require 'requiere_admin.php';
require 'conexion.php';

function responder($codigo, $cuerpo) {
    http_response_code($codigo);
    echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(405, ['error' => 'Método no permitido']);
}

$id = (int) ($_POST['id'] ?? 0);

if ($id <= 0 || !isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
    responder(400, ['error' => 'Falta el disfraz o la foto']);
}

$archivo = $_FILES['foto'];

if ($archivo['size'] > 2 * 1024 * 1024) {
    responder(400, ['error' => 'La foto no puede superar los 2 MB']);
}

$mime = (new finfo(FILEINFO_MIME_TYPE))->file($archivo['tmp_name']);
$permitidos = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

if (!isset($permitidos[$mime])) {
    responder(400, ['error' => 'Formato no permitido (solo JPG, PNG o WEBP)']);
}

$stmt = $pdo->prepare('SELECT id FROM disfraces WHERE id = :id AND eliminado = 0');
$stmt->execute([':id' => $id]);
if (!$stmt->fetch()) {
    responder(404, ['error' => 'El disfraz no existe']);
}

$nombreArchivo = 'disfraz' . $id . '.' . $permitidos[$mime];
$destino = __DIR__ . '/../img/' . $nombreArchivo;

if (!move_uploaded_file($archivo['tmp_name'], $destino)) {
    responder(500, ['error' => 'No se pudo guardar la foto']);
}

$stmt = $pdo->prepare('UPDATE disfraces SET foto = :foto WHERE id = :id');
$stmt->execute([':foto' => $nombreArchivo, ':id' => $id]);

responder(200, ['mensaje' => 'Foto actualizada', 'foto' => $nombreArchivo]);
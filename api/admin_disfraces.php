<?php
require 'requiere_admin.php';
require 'conexion.php';

function responder($codigo, $cuerpo) {
    http_response_code($codigo);
    echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE);
    exit;
}

function leerTextos($datos) {
    $nombre = trim($datos['nombre'] ?? '');
    $descripcion = trim($datos['descripcion'] ?? '');
    if ($nombre === '' || mb_strlen($nombre) > 50) {
        responder(400, ['error' => 'El nombre es obligatorio (máximo 50 caracteres)']);
    }
    if ($descripcion === '') {
        responder(400, ['error' => 'La descripción es obligatoria']);
    }
    return [$nombre, $descripcion];
}

function existeDisfraz($pdo, $id) {
    $stmt = $pdo->prepare('SELECT id FROM disfraces WHERE id = :id AND eliminado = 0');
    $stmt->execute([':id' => $id]);
    return (bool) $stmt->fetch();
}

$datos = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'POST':
            [$nombre, $descripcion] = leerTextos($datos);
            $stmt = $pdo->prepare('INSERT INTO disfraces (nombre, descripcion) VALUES (:nombre, :descripcion)');
            $stmt->execute([':nombre' => $nombre, ':descripcion' => $descripcion]);
            responder(201, ['mensaje' => 'Disfraz creado', 'id' => (int) $pdo->lastInsertId()]);

        case 'PUT':
            $id = (int) ($datos['id'] ?? 0);
            [$nombre, $descripcion] = leerTextos($datos);
            if ($id <= 0 || !existeDisfraz($pdo, $id)) {
                responder(404, ['error' => 'El disfraz no existe']);
            }
            $stmt = $pdo->prepare('UPDATE disfraces SET nombre = :nombre, descripcion = :descripcion WHERE id = :id');
            $stmt->execute([':nombre' => $nombre, ':descripcion' => $descripcion, ':id' => $id]);
            responder(200, ['mensaje' => 'Disfraz actualizado']);

        case 'DELETE':
            $id = (int) ($datos['id'] ?? 0);
            if ($id <= 0 || !existeDisfraz($pdo, $id)) {
                responder(404, ['error' => 'El disfraz no existe']);
            }
            $stmt = $pdo->prepare('UPDATE disfraces SET eliminado = 1 WHERE id = :id');
            $stmt->execute([':id' => $id]);
            responder(200, ['mensaje' => 'Disfraz eliminado']);

        default:
            responder(405, ['error' => 'Método no permitido']);
    }
} catch (PDOException $e) {
    responder(500, ['error' => 'Error en la base de datos']);
}
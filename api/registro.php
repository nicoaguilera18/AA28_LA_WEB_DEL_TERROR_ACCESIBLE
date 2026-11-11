<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);
$nombre = trim($datos['nombre'] ?? '');
$clave = $datos['clave'] ?? '';

if (strlen($nombre) < 3 || strlen($nombre) > 50) {
    http_response_code(400);
    echo json_encode(['error' => 'El usuario debe tener entre 3 y 50 caracteres']);
    exit;
}

if (strlen($clave) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'La contraseña debe tener al menos 6 caracteres']);
    exit;
}

$hash = password_hash($clave, PASSWORD_BCRYPT);

try {
    $stmt = $pdo->prepare('INSERT INTO usuarios (nombre, clave) VALUES (:nombre, :clave)');
    $stmt->execute([':nombre' => $nombre, ':clave' => $hash]);

    http_response_code(201);
    echo json_encode(['mensaje' => 'Usuario registrado correctamente']);
} catch (PDOException $e) {
    if ($e->errorInfo[1] == 1062) {
        http_response_code(409);
        echo json_encode(['error' => 'Ese nombre de usuario ya existe']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'No se pudo registrar el usuario']);
    }
}
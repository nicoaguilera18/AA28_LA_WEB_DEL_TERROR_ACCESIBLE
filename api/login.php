<?php
session_start();
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

$stmt = $pdo->prepare('SELECT id, nombre, clave, es_admin FROM usuarios WHERE nombre = :nombre');
$stmt->execute([':nombre' => $nombre]);
$usuario = $stmt->fetch();

if (!$usuario || !password_verify($clave, $usuario['clave'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario o contraseña incorrectos']);
    exit;
}

session_regenerate_id(true);
$_SESSION['usuario_id'] = (int) $usuario['id'];
$_SESSION['nombre'] = $usuario['nombre'];
$_SESSION['es_admin'] = (int) $usuario['es_admin'];

echo json_encode([
    'mensaje' => 'Sesión iniciada',
    'nombre' => $usuario['nombre'],
    'es_admin' => (int) $usuario['es_admin'],
]);
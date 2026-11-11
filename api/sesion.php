<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No hay sesión activa']);
    exit;
}

echo json_encode([
    'nombre' => $_SESSION['nombre'],
    'es_admin' => (int) $_SESSION['es_admin'],
]);
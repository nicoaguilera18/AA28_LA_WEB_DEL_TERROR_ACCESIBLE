<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

if (($_SESSION['es_admin'] ?? 0) !== 1) {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso restringido a administradores']);
    exit;
}
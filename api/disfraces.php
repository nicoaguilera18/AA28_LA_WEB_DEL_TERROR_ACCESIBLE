<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$consulta = $pdo->query(
    'SELECT id, nombre, descripcion, votos, foto
     FROM disfraces
     WHERE eliminado = 0
     ORDER BY votos DESC, nombre ASC'
);

echo json_encode($consulta->fetchAll(), JSON_UNESCAPED_UNICODE);
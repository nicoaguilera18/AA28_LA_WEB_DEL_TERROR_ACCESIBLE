<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Tenés que iniciar sesión para votar']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);
$idDisfraz = (int) ($datos['id_disfraz'] ?? 0);

if ($idDisfraz <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Disfraz inválido']);
    exit;
}

$stmt = $pdo->prepare('SELECT id FROM disfraces WHERE id = :id AND eliminado = 0');
$stmt->execute([':id' => $idDisfraz]);
if (!$stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['error' => 'El disfraz no existe']);
    exit;
}

try {
    $pdo->beginTransaction();

    $insertar = $pdo->prepare('INSERT INTO votos (id_usuario, id_disfraz) VALUES (:usuario, :disfraz)');
    $insertar->execute([':usuario' => $_SESSION['usuario_id'], ':disfraz' => $idDisfraz]);

    $sumar = $pdo->prepare('UPDATE disfraces SET votos = votos + 1 WHERE id = :disfraz');
    $sumar->execute([':disfraz' => $idDisfraz]);

    $pdo->commit();
    echo json_encode(['mensaje' => '¡Voto registrado!']);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    if ($e->errorInfo[1] == 1062) {
        http_response_code(409);
        echo json_encode(['error' => 'Ya votaste por este disfraz']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'No se pudo registrar el voto']);
    }
}
<?php
require '../includes/connection.php';

if (!isset($_GET['role_id']) || empty($_GET['role_id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing role_id"]);
    exit;
}

$roleId = intval($_GET['role_id']);

try {
    $stmt = $db->prepare("SELECT permission_id FROM role_permissions WHERE role_id = ?");
    $stmt->execute([$roleId]);
    $permissions = $stmt->fetchAll(PDO::FETCH_COLUMN); // Fetch only the permission_id column

    echo json_encode($permissions); // Return as JSON array
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>

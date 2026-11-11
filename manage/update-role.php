<?php
if(ob_get_level()) ob_end_clean();

header("Content-Type: application/json");
header("Cache-Control: no-cache, must-revalidate");

require '../includes/connection.php'; // Include database connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';

    if (!$id || $name === '') {
        echo json_encode(['success' => false, 'message' => 'Role ID and name are required.']);
        exit;
    }

    try {
        $stmt = $db->prepare("UPDATE roles SET name = :name WHERE id = :id");
        $stmt->execute([
            ':name' => $name,
            ':id' => $id
        ]);

        echo json_encode(['success' => true, 'message' => 'Role renamed successfully!']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'A role with this name may already exist.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
?>

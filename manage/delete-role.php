<?php
if(ob_get_level()) ob_end_clean();

header("Content-Type: application/json");
header("Cache-Control: no-cache, must-revalidate");

require '../includes/connection.php'; // Include database connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Role ID is required.']);
        exit;
    }

    try {
        $stmt = $db->prepare("DELETE FROM roles WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Role deleted successfully!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Role not found.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
?>

<?php
/**
 * complete_followup_task.php
 * Handles completing follow-up tasks.
 */
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/connection.php';
require_once __DIR__ . '/../includes/checklogin.php';
require_once __DIR__ . '/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$task_id = isset($_POST['task_id']) ? intval($_POST['task_id']) : 0;
$notes   = isset($_POST['notes']) ? trim($_POST['notes']) : '';

if (!$task_id) {
    echo json_encode(['success' => false, 'message' => 'Task ID is required']);
    exit;
}

try {
    // Check if task exists
    $stmt = $db->prepare("SELECT id, status FROM cell_followup_tasks WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $task_id]);
    $task = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$task) {
        echo json_encode(['success' => false, 'message' => 'Task not found']);
        exit;
    }

    // Update status to completed
    $update = $db->prepare("
        UPDATE cell_followup_tasks 
        SET status = 'completed',
            completed_at = NOW(),
            notes = :notes
        WHERE id = :id
    ");
    $update->execute([
        ':notes' => $notes,
        ':id'    => $task_id
    ]);

    // Log Audit Trail
    log_audit_trail($db, 'cell_followup_tasks', $task_id, 'update', ['status' => $task['status']], ['status' => 'completed', 'notes' => $notes], intval($user_id));

    echo json_encode(['success' => true, 'message' => 'Task marked as completed!']);
} catch (PDOException $e) {
    error_log("complete_followup_task error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>

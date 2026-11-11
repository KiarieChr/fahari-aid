<?php
require '../includes/connection.php'; // Include database connection
require_once 'functions.php';

// Check if request is AJAX
$is_ajax = isset($_POST['ajax']) || (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');

if (!$is_ajax) {
    include '../includes/sweetalert.html';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = intval($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $current_user_id = isset($_COOKIE['jen_idd']) ? intval($_COOKIE['jen_idd']) : 0;
    
    try {
        if (!$id) {
            throw new Exception('Invalid department ID.');
        }
        if (empty($name)) {
            throw new Exception('Department name cannot be empty.');
        }
        
        // Fetch old values for audit logging
        $old_stmt = $db->prepare("SELECT name, description FROM departments WHERE id = ?");
        $old_stmt->execute([$id]);
        $old_vals = $old_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$old_vals) {
            throw new Exception('Department not found.');
        }
        
        // Perform update
        $stmt = $db->prepare("UPDATE departments SET name = :name, description = :description WHERE id = :id");
        $stmt->execute([
            ':name' => $name,
            ':description' => $description,
            ':id' => $id
        ]);
        
        // Log audit trail
        log_audit_trail($db, 'departments', $id, 'update', 
            ['name' => $old_vals['name'], 'description' => $old_vals['description']], 
            ['name' => $name, 'description' => $description], 
            $current_user_id
        );
        
        if ($is_ajax) {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'Department updated successfully.']);
            exit;
        } else {
            echo "<script>
            document.addEventListener('DOMContentLoaded', function() {
                Swal.fire({
                    title: 'Department Updated',
                    text: 'Successful.. Redirecting...',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#57a94f'
                }); 
                setTimeout(function() {
                    window.location.href = '../departments.php';
                }, 2000);
            });
            </script>";
            exit;
        }
        
    } catch (Exception $e) {
        if ($is_ajax) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        } else {
            $msg = htmlspecialchars($e->getMessage());
            echo " <script>
                            document.addEventListener('DOMContentLoaded', function() {
                                Swal.fire({
                                    title: 'Error Occurred',
                                    text: '{$msg}',
                                    type: 'error',
                                    icon: 'error',
                                    confirmButtonText: 'OK',
                                    confirmButtonColor: '#57a94f'
                                }); 
                                setTimeout(function() {
                                    window.history.back();
                                }, 3000);
                            });
                        </script>";
            exit;
        }
    }
}
?>

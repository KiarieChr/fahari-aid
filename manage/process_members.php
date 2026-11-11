<?php
require '../includes/connection.php'; // Include database connection
require_once 'functions.php';

// Check if request is AJAX
$is_ajax = isset($_POST['ajax']) || (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');

if (!$is_ajax) {
    include '../includes/sweetalert.html';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $members = $_POST['members'] ?? [];
    $cell_id = $_POST['cell_id'] ?? null;
    
    if (empty($members) || empty($cell_id)) {
        if ($is_ajax) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Please select at least one member to assign.']);
            exit;
        } else {
            echo " <script>
                            document.addEventListener('DOMContentLoaded', function() {
                                Swal.fire({
                                    title: 'None Selected',
                                    text: 'Redirecting back for you to check',
                                    type: 'error',
                                    icon: 'error',
                                    confirmButtonText: 'OK',
                                    confirmButtonColor: '#57a94f'
                                }); 
                                setTimeout(function() {
                                    window.history.back();
                                }, 5000);
                            });
                        </script>";
            exit;
        }
    }

    try {
        // Fetch old cell_id values for all members being updated
        $placeholders = implode(',', array_fill(0, count($members), '?'));
        $old_stmt = $db->prepare("SELECT id, cell_id FROM member WHERE id IN ($placeholders)");
        $old_stmt->execute($members);
        $old_cells = $old_stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        $stmt = $db->prepare("UPDATE member SET cell_id = :cell_id WHERE id = :member_id");
        $current_user_id = isset($_COOKIE['jen_idd']) ? intval($_COOKIE['jen_idd']) : 0;

        foreach ($members as $member_id) {
            $stmt->execute([
                ':cell_id' => $cell_id,
                ':member_id' => $member_id
            ]);

            // Log Audit Trail
            $old_val = isset($old_cells[$member_id]) ? ($old_cells[$member_id] !== null ? intval($old_cells[$member_id]) : null) : null;
            log_audit_trail($db, 'member', intval($member_id), 'update', ['cell_id' => $old_val], ['cell_id' => intval($cell_id)], $current_user_id);
        }


        if ($is_ajax) {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'Members assigned successfully.']);
            exit;
        } else {
            echo "<script>
            document.addEventListener('DOMContentLoaded', function() {
                Swal.fire({
                    title: 'Members Added to Cell',
                    text: 'Successful.. Redirecting...',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#57a94f'
                }); 
                setTimeout(function() {
                    window.location.href = '../cells.php';
                }, 2000);
            });
            </script>";
            exit;
        }
    } catch (PDOException $e) {
        if ($is_ajax) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            exit;
        } else {
            echo " <script>
                            document.addEventListener('DOMContentLoaded', function() {
                                Swal.fire({
                                    title: 'Database Error',
                                    text: 'An error occurred while saving the records.',
                                    type: 'error',
                                    icon: 'error',
                                    confirmButtonText: 'OK',
                                    confirmButtonColor: '#57a94f'
                                }); 
                                setTimeout(function() {
                                    window.history.back();
                                }, 5000);
                            });
                        </script>";
            exit;
        }
    }
}
?>
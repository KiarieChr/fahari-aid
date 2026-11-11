<?php
require '../includes/connection.php'; // Include database connection
require_once 'functions.php';

// Check if request is AJAX
$is_ajax = isset($_POST['ajax']) || (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');

if (!$is_ajax) {
    include '../includes/sweetalert.html';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'assign';
    $current_user_id = isset($_COOKIE['jen_idd']) ? intval($_COOKIE['jen_idd']) : 0;
    
    try {
        if ($action === 'remove') {
            $member_id = intval($_POST['member_id'] ?? 0);
            if (!$member_id) {
                throw new Exception('Invalid member specified.');
            }
            
            // Fetch old values for audit logging
            $old_stmt = $db->prepare("SELECT department_id, sub_ministerial FROM member WHERE id = ?");
            $old_stmt->execute([$member_id]);
            $old_vals = $old_stmt->fetch(PDO::FETCH_ASSOC);
            
            // Perform removal
            $stmt = $db->prepare("UPDATE member SET department_id = NULL, sub_ministerial = NULL WHERE id = ?");
            $stmt->execute([$member_id]);
            
            // Log audit trail
            log_audit_trail($db, 'member', $member_id, 'update', 
                ['department_id' => $old_vals['department_id'] ? intval($old_vals['department_id']) : null, 'sub_ministerial' => $old_vals['sub_ministerial'] ? intval($old_vals['sub_ministerial']) : null], 
                ['department_id' => null, 'sub_ministerial' => null], 
                $current_user_id
            );
            
            if ($is_ajax) {
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'message' => 'Member removed from ministry successfully.']);
                exit;
            } else {
                echo "<script>
                document.addEventListener('DOMContentLoaded', function() {
                    Swal.fire({
                        title: 'Member Removed',
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
            
        } else {
            // Assign or reassign
            $members = isset($_POST['members']) ? (array)$_POST['members'] : [];
            if (empty($members) && isset($_POST['member_id'])) {
                $members = [$_POST['member_id']];
            }
            
            $department_id = isset($_POST['department_id']) ? intval($_POST['department_id']) : null;
            $sub_ministerial = isset($_POST['sub_ministerial']) && $_POST['sub_ministerial'] !== '' && $_POST['sub_ministerial'] != 0 ? intval($_POST['sub_ministerial']) : null;
            
            if (empty($members)) {
                throw new Exception('Please select at least one member.');
            }
            if (!$department_id) {
                throw new Exception('Please select a valid department/ministry.');
            }
            
            // Fetch old values for audit logging
            $placeholders = implode(',', array_fill(0, count($members), '?'));
            $old_stmt = $db->prepare("SELECT id, department_id, sub_ministerial FROM member WHERE id IN ($placeholders)");
            $old_stmt->execute($members);
            $old_members_vals = $old_stmt->fetchAll(PDO::FETCH_ASSOC);
            $old_lookup = [];
            foreach ($old_members_vals as $mv) {
                $old_lookup[$mv['id']] = [
                    'department_id' => $mv['department_id'] ? intval($mv['department_id']) : null,
                    'sub_ministerial' => $mv['sub_ministerial'] ? intval($mv['sub_ministerial']) : null
                ];
            }
            
            // Update members
            $stmt = $db->prepare("UPDATE member SET department_id = :dept_id, sub_ministerial = :sub_dept_id WHERE id = :member_id");
            foreach ($members as $member_id) {
                $stmt->execute([
                    ':dept_id' => $department_id,
                    ':sub_dept_id' => $sub_ministerial,
                    ':member_id' => $member_id
                ]);
                
                // Log audit trail
                $old_val = $old_lookup[$member_id] ?? ['department_id' => null, 'sub_ministerial' => null];
                log_audit_trail($db, 'member', intval($member_id), 'update', 
                    $old_val, 
                    ['department_id' => $department_id, 'sub_ministerial' => $sub_ministerial], 
                    $current_user_id
                );
            }
            
            if ($is_ajax) {
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'message' => 'Ministry assignment updated successfully.']);
                exit;
            } else {
                echo "<script>
                document.addEventListener('DOMContentLoaded', function() {
                    Swal.fire({
                        title: 'Ministry Assigned',
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

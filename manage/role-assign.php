<?php
require '../includes/connection.php'; // DB connection
include '../includes/sweetalert.html';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $_POST['user_id'] ?? null;
    $roles = $_POST['roles'] ?? [];

    if (!$userId) {
        echo "<script>
        document.addEventListener('DOMContentLoaded', function() {
            Swal.fire({
                title: 'Error! Passing your Data',
                text: 'Wait.. Redirecting...',
                type: 'success',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#57a94f'
            }); 
            setTimeout(function() {
                window.history.back();
            }, 2000);
        });
            </script>";
    }

    try {
        // Begin transaction
        $db->beginTransaction();

        // Step 1: Delete existing roles for the user
        // $deleteStmt = $db->prepare("DELETE FROM user_roles WHERE user_id = ?");
        // $deleteStmt->execute([$userId]);

        // Step 2: Insert new roles
        if (!empty($roles)) {
            $insertStmt = $db->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)");
            foreach ($roles as $roleId) {
                $insertStmt->execute([$userId, $roleId]);
            }
        }

        // Commit changes
        $db->commit();

        echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'Assigned Successfully',
                                text: 'Successful.. Redirecting...',
                                type: 'success',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.location.href = '../users.php';
                            }, 2000);
                        });
                    </script>";

    } catch (PDOException $e) {
        $db->rollBack();
        die("Database error: " . $e->getMessage());
    }
} else {
    // Invalid request method
    header("HTTP/1.1 405 Method Not Allowed");
    echo "Invalid request method.";
}

<?php
require '../includes/connection.php'; // Include database connection

// Check if request is AJAX
$is_ajax = isset($_POST['ajax']) || (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') || isset($_POST['name']);

if (!$is_ajax) {
    include '../includes/sweetalert.html';
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];

    try {
        $stmt = $db->prepare("INSERT INTO roles (name) VALUES (:name)");
        $stmt->execute([':name' => $name]);

        if ($is_ajax) {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'User Role Added Successfully']);
            exit;
        }

        echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'User Role Added Successfully',
                                text: 'Successful.. Redirecting...',
                                type: 'success',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.location.href = '../user_roles.php';
                            }, 2000);
                        });
                    </script>";
        exit;
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Unique constraint error
            if ($is_ajax) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'The role name may already exist.']);
                exit;
            }
            echo " <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'An Error Occured',
                                text: 'Redirecting back for you to check',
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

             else {
                echo " <script>
                document.addEventListener('DOMContentLoaded', function() 
                {
                    Swal.fire({
                        title: 'Database Error',
                        text: 'Couldn\'t Connect to the Database Redirecting back for you to check',
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
        }
    }
} else 
{
    echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'Invalid Request',
                                text: 'Could not authenticate your Request',
                                type: 'error',
                                icon: 'warning',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.history.back();
                            }, 3000);
                        });
                    </script>";
                }
?>

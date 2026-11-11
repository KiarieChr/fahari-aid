<?php
require '../includes/connection.php'; // Include database connection
include '../includes/sweetalert.html';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $department = $_POST['department'];
   

   

    try {
        $stmt = $db->prepare("INSERT INTO sub_departments (name,department) VALUES (:name,:department)");
      
        $stmt->execute([
            ':name' => $name,
            ':department' => $department
        ]);

        echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'Sub Ministerial Added Successfully',
                                text: 'Successful.. Redirecting...',
                                type: 'success',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.location.href = '../departments.php';
                            }, 2000);
                        });
                    </script>";
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Unique constraint error
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
                            }, 5000);
                        });
                    </script>";
                
                
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
                    }, 5000);
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
                            }, 5000);
                        });
                    </script>";
                }
?>

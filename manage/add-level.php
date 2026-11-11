<?php
require '../includes/connection.php'; // Include database connection
include '../includes/sweetalert.html';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
  
    $curriculum = $_POST['curriculum']; 

   

    try {
        $stmt = $db->prepare("INSERT INTO education_levels (name,curriculum_id) VALUES (:name, :curriculum)");
      
        $stmt->execute([
            ':name' => $name,
            ':curriculum' => $curriculum
        ]);

        echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            swal({
                                title: 'Education Level Added Successfully',
                                text: 'Successful.. Redirecting...',
                                type: 'success',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.location.href = '../level_of_study.php';
                            }, 5000);
                        });
                    </script>";
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Unique constraint error
            echo " <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            swal({
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
                    swal({
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
                            swal({
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

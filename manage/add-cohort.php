<?php
require '../includes/connection.php'; // Include database connection
include '../includes/sweetalert.html';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $grade_one = $_POST['grade_one'];
    $grade_six = $_POST['grade_six'];
    $grade_nine = $_POST['grade_nine'];
    $status = "Active"; // Default status

   

    try {
        
        $stmt = $db->prepare("INSERT INTO cohorts(name, grade1_year, grade6_year, grade9_year, status) VALUES (:name, :grade_one, :grade_six, :grade_nine, :status)");
        $stmt->execute([
            ':name' => $name,
            ':grade_one' => $grade_one,
            ':grade_six' => $grade_six,
            ':grade_nine' => $grade_nine,
            ':status' => $status
        ]);

        echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            swal({
                                title: 'Cohort Added Successfully',
                                text: 'Successful.. Redirecting...',
                                type: 'success',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.location.href = '../cohorts.php';
                            }, 5000);
                        });
                    </script>";
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Unique constraint error
            echo "<script>
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
                echo "<script>
                document.addEventListener('DOMContentLoaded', function() {
                    swal({
                        title: 'Database Error',
                        text: 'Couldn\'t Connect to the DatabaseRedirecting back for you to check',
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
} else {
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

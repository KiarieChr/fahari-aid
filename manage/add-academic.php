<?php
require '../includes/connection.php'; // Include database connection
include '../includes/sweetalert.html';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $year = $_POST['name'];
    $start_date = $_POST['start-date'];
    $end_date = $_POST['end-date'];
    $close_date = $_POST['close-date'];
    $status = "Active"; // Default status

   

    try {
        $stmt = $db->prepare("INSERT INTO academic_years (year, start_date, end_date, close_date, status) VALUES (:year, :start_date, :end_date, :close_date, :status)");
        $stmt->execute([
            ':year' => $year,
            ':start_date' => $start_date,
            ':end_date' => $end_date,
            ':close_date' => $close_date,
            ':status' => $status
        ]);

        echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            swal({
                                title: 'Academic Year Added Successfully',
                                text: 'Successful.. Redirecting...',
                                type: 'success',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.location.href = '../academic-years.php';
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
                        text: 'Couldn't Connect to the DatabaseRedirecting back for you to check',
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

<?php

require '../includes/connection.php'; // Include database connection
include '../includes/sweetalert.html';
include 'functions.php';
if(isset($_POST['event_add']))
    {
            $name = $_POST['name'];
            $description = $_POST['event_desc'];
            $stime = $_POST['start_time'];
            $etime = $_POST['end_date'];

            $venue = $_POST['venue'];
            $Stime = strtotime($stime);
            $Etime = strtotime($etime);
            //echo $Etime;
            $start_time = date("Y-m-d H:i:s", $Stime);
            $end_time = date("Y-m-d H:i:s", $Etime);
        
            $calendar_label="Jesus Enthroned Events";
        try {
            $stmt = $db->prepare("INSERT INTO event (ename,notes, start_date,end_date,branch) VALUES (:name,:description,:start_date,:end_date,:location)");
        
            $stmt->execute([
                ':name' => $name,
                ':description' => $description,
                ':start_date'=>$stime,
                ':end_date' =>$etime,
                ':location'=>$venue
            ]);
           
            $stmt2 = $db->prepare("INSERT INTO calendar(title,start_date, end_date, url,calendar_label)VALUES(:title,:start_date,:end_date,:url,:calendar_label)");
            $stmt2->execute([
                ':title'=>$name,
                ':start_date'=>$start_time,
                ':end_date'=>$end_time,
                ':url'=>$venue,
                ':calendar_label'=>$calendar_label
            ]);
            // push a general notification 
            $meet_date = date('l, jS F Y h:iA',strtotime($start_time));
            $title = "Event Scheduled on $meet_date";
            $message = "Event planned on $meet_date, Meeting name: $name";
            $type = "info";

            createGeneralNotification($db,$title,$message,$type);
            echo "<script>
                            document.addEventListener('DOMContentLoaded', function() {
                                Swal.fire({
                                    title: 'Event Added Successfully',
                                    text: 'Successful.. Redirecting...',
                                    icon: 'success',
                                    confirmButtonText: 'OK',
                                    confirmButtonColor: '#57a94f'
                                }); 
                                setTimeout(function() {
                                    window.location.href = '../events.php';
                                }, 2000);
                            });
                        </script>";
            } 
        catch (PDOException $e) 
        {
            if ($e->getCode() == 23000) 
            { // Unique constraint error
                echo " <script>
                            document.addEventListener('DOMContentLoaded', function() {
                                Swal.fire({
                                    title: 'An Error Occured',
                                    text: 'Redirecting back for you to check',
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
                else
                {
                    echo "<script>
                    document.addEventListener('DOMContentLoaded', function() {
                        Swal.fire({
                            title: 'Database Error',
                            text: 'Couldn\\'t Connect to the Database. Redirecting back for you to check.',
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
    }
else 
{
    echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'Invalid Request',
                                text: 'Could not authenticate your Request',,
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

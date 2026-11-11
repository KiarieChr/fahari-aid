<?php

require '../includes/connection.php'; // Include database connection
include '../includes/sweetalert.html';
include 'functions.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if(isset($_POST['meeting_type'])){

            $name = $_POST['name'];
            $facilitator = $_POST['facilitator'];
            $stime = $_POST['start_time'];
            $etime = $_POST['end_time'];
            $meeting_type = $_POST['meeting_type'];
            $meeting_link = $_POST['meeting_link'];
            $Stime = strtotime($stime);
            $Etime = strtotime($etime);

            //echo $Etime;
            $start_time = date("Y-m-d H:i:s", $Stime);
            $end_time = date("Y-m-d H:i:s", $Etime);
        if($meeting_type==1){
            $calendar_label="Word";
        }else{
            $calendar_label="Planning";
        }

        try {
            //push role based notifications
            // push notification to a admin,general admin
            //the roles id for admin and general Admin
            $grole = $db->prepare("SELECT id from roles WHERE name='Administrator' or name='General Admin'");
            $grole->execute();
            $roles=$grole->fetchAll(PDO::FETCH_ASSOC);
            
            if(!empty($roles)){
                foreach($roles as $index=>$row):
                    $id = $row['id'];
                    $meet_date = date('l, jS F Y h.iA',strtotime($start_time));
                    $title = "Meeting Scheduled on $meet_date";
                    $message = "Meeting planned on $meet_date, Meeting name: $name";
                    $type = "info";
                    createRoleNotification($db, $title,$message,$type,$id);
                endforeach;
            }

            $stmt = $db->prepare("INSERT INTO meeting (name,facilitator, start_time,end_time,meeting_link, meeting_type) VALUES (:name,:facilitator,:start_time,:end_time,:meeting_link,:meeting_type)");
        
            $stmt->execute([
                ':name' => $name,
                ':facilitator' => $facilitator,
                ':start_time'=>$start_time,
                ':end_time' =>$end_time,
                ':meeting_link'=>$meeting_link,
                ':meeting_type'=>$meeting_type
            ]);
            // insert into schedule
            $stmt2 = $db->prepare("INSERT INTO calendar(title,start_date, end_date, url,calendar_label)VALUES(:title,:start_date,:end_date,:url,:calendar_label)");
            $stmt2->execute([
                ':title'=>$name,
                ':start_date'=>$start_time,
                ':end_date'=>$end_time,
                ':url'=>$meeting_link,
                ':calendar_label'=>$calendar_label
            ]);
            
            echo "<script>
                            document.addEventListener('DOMContentLoaded', function() {
                                Swal.fire({
                                    title: 'Meeting Added Successfully',
                                    text: 'Successful.. Redirecting...',
                                    icon: 'success',
                                    confirmButtonText: 'OK',
                                    confirmButtonColor: '#57a94f'
                                }); 
                                setTimeout(function() {
                                    window.location.href = '../meetingMin.php';
                                }, 2000);
                            });
                        </script>";
        } 
        catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Unique constraint error
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
            else {
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
    
  

elseif(isset($_POST['facilitator'])){
    $name = $_POST['name'];
    $facilitator = $_POST['facilitator'];
    $stime = $_POST['start_time'];
    $etime = $_POST['end_time'];
    $meeting_link = $_POST['meeting_link'];
    $Stime = strtotime($stime);
    $Etime = strtotime($etime);
    //echo $Etime;
    $start_time = date("Y-m-d H:i:s", $Stime);
    $end_time = date("Y-m-d H:i:s", $Etime);
   
    $calendar_label="Word Session";
    try {
        $stmt = $db->prepare("INSERT INTO meeting (name,facilitator, start_time,end_time,meeting_link) VALUES (:name,:facilitator,:start_time,:end_time,:meeting_link)");
      
        $stmt->execute([
            ':name' => $name,
            ':facilitator' => $facilitator,
            ':start_time'=>$start_time,
            ':end_time' =>$end_time,
            ':meeting_link'=>$meeting_link
        ]);
        $stmt2 = $db->prepare("INSERT INTO calendar(title,start_date, end_date, url,calendar_label)VALUES(:title,:start_date,:end_date,:url,:calendar_label)");
        $stmt2->execute([
            ':title'=>$name,
            ':start_date'=>$start_time,
            ':end_date'=>$end_time,
            ':url'=>$meeting_link,
            ':calendar_label'=>$calendar_label
        ]);
        // push a general notification 
        $meet_date = date('l, jS F Y h.iA',strtotime($start_time));
        $title = "Word Session on $meet_date";
        $message = "Word Session planned on $meet_date, Meeting name: $name";
        $type = "info";

        createGeneralNotification($db,$title,$message,$type);
        echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'Meeting Added Successfully',
                                text: 'Successful.. Redirecting...',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.location.href = '../view_meetings.php';
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
}}
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

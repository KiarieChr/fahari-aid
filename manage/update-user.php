<?php

include('../includes/connection.php');
include('../includes/sweetalert.html');
include('functions.php');

if($_SERVER['REQUEST_METHOD'] == 'POST'){

    if(isset($_FILES['banner_image']))
    {
        $banner = $_FILES['banner_image'];
        $user_id =$_POST['user_id'];
        $targetDir = '../assets/user_img/';
        $file_name = $banner['tmp_name'];

        $filename = uniqid('banner_'.true).'.'.pathinfo($banner['name'], PATHINFO_EXTENSION);
        $savePath = $targetDir.$filename;

        if(move_uploaded_file($file_name,$savePath))
        {

        

            // update table user
            //get member id
            $member = $db->prepare("SELECT *from users where id = :user_id");

            $member->bindParam('user_id', $user_id, PDO::PARAM_INT);
            $member->execute();

            $member_res = $member->fetch(PDO::FETCH_OBJ);

            $member_id = $member_res->member_id;

            $update_banner = $db->prepare("UPDATE member set photo1 = :banner where id =:member_id");
            $update_banner->bindParam(':banner', $filename,PDO::PARAM_STR);
            $update_banner->bindParam(':member_id',$member_id,PDO::PARAM_INT);

            $update_banner->execute();

            $title = "Updated Banner Image";
            $detail = "Successfully Updated Banner Image ";
            $type = "success";
            
            // insert into timeline
            $insTimeline = $db->prepare('INSERT into user_timeline(title,detail,detail_img,user_id)value(?,?,?,?)');
            $insTimeline->execute([
                $title,$detail,$filename,$user_id
            ]);

            // push the notification
            createUserNotification($db, $title, $detail, $type, $user_id);


            echo "<script>
            Swal.fire({
            title : 'Updated Successfully.',
            text : 'Uploaded Banner Image',
            icon : 'success',
            showConfirmBtn :false
            
            });
            setTimeout(function(){
                window.location.href = '../user_profile.php';}, 2000);
            </script>                
            ";

        } 
       

        
        
    }

    if(isset($_FILES['profile_image']))
    {
        $file = $_FILES['profile_image'];
        $targetDir = '../assets/user_img/';
        $resizeWidth = 75;
        $resizeHeight = 108;

        $user_id = $_POST['user_id'];

        // check if an image

        $imageInfo = getimagesize($file['tmp_name']);
        if($imageInfo === false)
        {
            echo "<script>
                    Swal.fire({
                    title : 'Failed! File not an Image.',
                    text : 'Retry uploading',
                    icon : 'error'
                    
                    });
                    setTimeout(function(){
                        window.location.href = 'user_profile.php';}, 2000);
                    </script>                
                    ";
            
        }
        $mime = $imageInfo['mime'];

        switch($mime)
        {
            case 'image/jpeg':
                $sourceImage=imagecreatefromjpeg($file['tmp_name']);
                break;
            case 'image/png':
                $sourceImage=imagecreatefromjpeg($file['tmp_name']);
                break;
            case 'image/gif':
                $sourceImage=imagecreatefromjpeg($file['tmp_name']);
                break;
            default:
                echo "<script>
                Swal.fire({
                title : 'Failed! File not an Image.',
                text : 'Retry uploading',
                icon : 'error'
                
                });
                setTimeout(function(){
                    window.location.href = 'user_profile.php';}, 2000);
                </script>                
                ";
            
        }
        $resizedImage = imagecreatetruecolor($resizeWidth,$resizeHeight);
        imagecopyresampled($resizedImage,$sourceImage,0,0,0,0,$resizeWidth,$resizeHeight,imagesx($sourceImage),imagesy($sourceImage));
        $filename = uniqid('profile_', true).'.jpg';
        $targetFile = $targetDir.$filename;

        imagejpeg($resizedImage,$targetFile,90);

        // update table user
        //get member id
        $member = $db->prepare("SELECT *from users where id = :user_id");

        $member->bindParam('user_id', $user_id, PDO::PARAM_INT);
        $member->execute();

        $member_res = $member->fetch(PDO::FETCH_OBJ);
        
        $member_id = $member_res->member_id;

        $update_profile = $db->prepare("UPDATE member set photo = :profile where id =:member_id");
        $update_profile->bindParam(':profile', $filename,PDO::PARAM_STR);
        $update_profile->bindParam(':member_id',$member_id,PDO::PARAM_INT);

        $update_profile->execute();


        $title = "Updated Profile Image";
        $detail = "Successfully Updated Profile Image ";
        $type = "success";
        
        // insert into timeline
        $insTimeline = $db->prepare('INSERT into user_timeline(title,detail,detail_img,user_id)value(?,?,?,?)');
        $insTimeline->execute([
            $title,$detail,$filename,$user_id
        ]);

        // push the notification
        createUserNotification($db, $title, $detail, $type, $user_id);

        //clean
        imagedestroy($sourceImage);
        imagedestroy($resizedImage);

        echo "<script>
                    Swal.fire({
                    title : 'Updated Successfully.',
                    text : 'uuploading',
                    icon : 'success',
                    showConfirmBtn :false
                    
                    });
                    setTimeout(function(){
                        window.location.href = '../user_profile.php';}, 2000);
                    </script>                
            ";
        

    }
    if(isset($_POST['bio']))
    {
        $bio = $_POST['bio'];
        $user_id =$_POST['user_id'];
        $updated_on = date("Y-m-d H:i:s");
        
        // update table user
        

        $update_bio = $db->prepare("UPDATE users set bio = :bio, update_date = :updated_on where id =:user_id");
        $update_bio->bindParam(':bio', $bio,PDO::PARAM_STR);
        $update_bio->bindParam(':updated_on', $updated_on,PDO::PARAM_STR);
        $update_bio->bindParam(':user_id',$user_id,PDO::PARAM_INT);

        $update_bio->execute();

            $title = "Successfully Update your Bio.";
            $detail = "You have update your about on ".date("M d, Y H:i:s a", strtotime($updated_on));
            $type = "success";
            
            // insert into timeline
            $insTimeline = $db->prepare('INSERT into user_timeline(title,detail,detail_img,user_id)value(?,?,?,?)');
            $insTimeline->execute([
                $title,$detail,$filename,$user_id
            ]);

            // push the notification
            createUserNotification($db, $title, $detail, $type, $user_id);


            echo "<script>
            Swal.fire({
            title : 'Updated Successfully.',
            text : 'You have update your bio',
            icon : 'success',
            showConfirmBtn :false
            
            });
            setTimeout(function(){
                window.location.href = '../user_profile.php';}, 2000);
            </script>                
            ";

    }
    

    if(isset($_POST['dob']))
    {
        $bod = $_POST['dob'];
        $user_id =$_POST['user_id'];
        $updated_on = date("Y-m-d H:i:s");
        
        // update table user

        // update the birthdate to match iso format
        // Step 1: Validate and format the date
        $dob = trim($bod); // Clean up any extra spaces
        if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $dob)) {
            // Date is in MM/DD/YYYY format, now convert it to YYYY-MM-DD
            $date = DateTime::createFromFormat('m/d/Y', $dob);

            // Check if the date was valid
            if ($date) {
                // Successfully parsed the date
                $formattedDate = $date->format('Y-m-d'); // Convert to YYYY-MM-DD format
            }
        }
        
        //get member id
        $member = $db->prepare("SELECT *from users where id = :user_id");

        $member->bindParam('user_id', $user_id, PDO::PARAM_INT);
        $member->execute();

        $member_res = $member->fetch(PDO::FETCH_OBJ);

        $member_id = $member_res->member_id;

        $update_dob = $db->prepare("UPDATE member set bod = :dob where id =:user_id");
        $update_dob->bindParam(':dob', $formattedDate,PDO::PARAM_STR);
        //$update_dob->bindParam(':updated_on', $updated_on,PDO::PARAM_STR);
        $update_dob->bindParam(':user_id',$member_id,PDO::PARAM_INT);
        $update_in = $db->prepare("UPDATE users set update_date = :update_on where id =:user_id");
        $update_in->bindParam(':update_on', $updated_on,PDO::PARAM_STR);
        $update_in->bindParam(':user_id',$user_id,PDO::PARAM_INT);

        $update_dob->execute();
        $update_in->execute();

            $title = "Successfully Update your date of birth.";
            $detail = "You have update your about on ".date("M d, Y H:i:s a", strtotime($updated_on));
            $type = "success";
            
            // insert into timeline
            $insTimeline = $db->prepare('INSERT into user_timeline(title,detail,detail_img,user_id)value(?,?,?,?)');
            $insTimeline->execute([
                $title,$detail,$filename,$user_id
            ]);

            // push the notification
            createUserNotification($db, $title, $detail, $type, $user_id);


            echo "<script>
            Swal.fire({
            title : 'Updated Successfully.',
            text : 'You have update your date of birth',
            icon : 'success',
            showConfirmBtn :false
            
            });
            setTimeout(function(){
                window.location.href = '../user_profile.php';}, 2000);
            </script>                
            ";

    }
    
    
        
    if(isset($_POST['country']))
    {
        $country = $_POST['country'];
        $city = $_POST['city'];
        $user_id =$_POST['user_id'];
        $updated_on = date("Y-m-d H:i:s");
        
        // update table user

        
        //get member id
        $member = $db->prepare("SELECT *from users where id = :user_id");

        $member->bindParam('user_id', $user_id, PDO::PARAM_INT);
        $member->execute();

        $member_res = $member->fetch(PDO::FETCH_OBJ);

        $member_id = $member_res->member_id;

        $update_loc = $db->prepare("UPDATE member set location = :city,country_code=:country where id =:user_id");
        $update_loc->bindParam(':city', $city,PDO::PARAM_STR);
        $update_loc->bindParam(':country', $country,PDO::PARAM_STR);
        $update_loc->bindParam(':user_id',$member_id,PDO::PARAM_INT);
        // $update_in = $db->prepare("UPDATE users set update_date = :update_on where id =:user_id");
        // $update_in->bindParam(':update_on', $updated_on,PDO::PARAM_STR);
        // $update_in->bindParam(':user_id',$user_id,PDO::PARAM_INT);

        $update_loc->execute();
        // $update_in->execute();

            $title = "Successfully Update your Location.";
            $detail = "You have update your location on ".date("M d, Y H:i:s a", strtotime($updated_on));
            $type = "success";
            
            // insert into timeline
            $insTimeline = $db->prepare('INSERT into user_timeline(title,detail,detail_img,user_id)value(?,?,?,?)');
            $insTimeline->execute([
                $title,$detail,$filename,$user_id
            ]);

            // push the notification
            createUserNotification($db, $title, $detail, $type, $user_id);


            echo "<script>
            Swal.fire({
            title : 'Updated Successfully.',
            text : 'You have update Location',
            icon : 'success',
            showConfirmBtn :false
            
            });
            setTimeout(function(){
                window.location.href = '../user_profile.php';}, 2000);
            </script>                
            ";

    }
    
    
            
    }


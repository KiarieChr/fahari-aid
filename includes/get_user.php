<?php


$user = $db->prepare("SELECT u.id,m.phone_no,m.id as member_id, m.first_name,m.last_name,m.photo,m.photo1,m.location,u.date FROM users u join member m on u.member_id = m.id WHERE u.id = :id");
$user->bindParam(":id", $user_id, PDO::PARAM_INT);
$user->execute();

// Fetch the result
$result = $user->fetch(PDO::FETCH_ASSOC);

if ($result) {
    $user_id = $result['id'];
    $fname = $result['first_name'];
    $lname = $result['last_name'];
    $phone_no = $result['phone_no'];
    $member_id = $result['member_id'];
    $photo = $result['photo'];
    $photo1 = $result['photo1'];
    $location = $result['location'];
}


?>

<?php

 require "../includes/connection.php";

 if(isset($_POST['username'])){

 	$user = trim($_POST['username']);
 	$username = strtolower($user);
 	// query
 	$stmt = $db->prepare("SELECT id from users WHERE username = ?");

 	$stmt ->bind_param("s",$username);
 	$stmt -> execute();
 	$stmt -> store_result();


 	if($stmt -> num_rows>0){
 	echo "taken";

 	}
 	else{
 	echo "available";
 	}
 	$stmt -> close();
 }
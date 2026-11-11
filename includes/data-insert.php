<?php
include('connection.php');

// Members data
$members = [
    ["Faith", "Chebet", "0797444887", "chebetf034@gmail.com", "Nyeri"],
   
];

// Prepare the SQL statement
$sql = "INSERT INTO member (first_name, last_name, phone_no, email, location, delete_status)
        VALUES (:first_name, :last_name, :phone_no, :email, :location, 'Active')";
$stmt = $db->prepare($sql);

// Insert members
foreach ($members as $member) {
    [$first_name, $last_name, $phone_no, $email, $location] = $member;

    try {
        $stmt->execute([
            ':first_name' => $first_name,
            ':last_name'  => $last_name,
            ':phone_no'   => $phone_no,
            ':email'      => $email,
            ':location'   => $location
        ]);

        echo "Inserted: $first_name $last_name<br>";
    } catch (PDOException $e) {
        echo "Error inserting $first_name $last_name: " . $e->getMessage() . "<br>";
    }
}
?>

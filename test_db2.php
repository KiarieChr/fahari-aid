<?php
try {
    $db = new PDO(
        "mysql:host=localhost;dbname=jen;charset=utf8mb4", 
        "root", 
        "",
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
    echo "Connected successfully to jen database";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

<?php
require_once 'includes/connection.php';

try {
    $db->exec("ALTER TABLE product_variants ADD COLUMN stock INT NOT NULL DEFAULT 10");
    echo "Successfully added 'stock' column to product_variants!\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Column 'stock' already exists.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>

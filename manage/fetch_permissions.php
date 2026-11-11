<?php
require '../includes/connection.php'; // Database connection

// Fetch categories
$query = $db->query("SELECT id, name FROM permission_category");
$categories = [];

while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
    $categories[] = [
        "id" => "cat_" . $row['id'], // Prefix to avoid conflicts with permission IDs
        "parent" => "#", // Categories are root nodes
        "text" => $row['name'],
        "icon" => "bx bx-folder" // Optional: Folder icon for categories
    ];
}

// Fetch permissions
$query = $db->query("SELECT id, name, category FROM permissions");
$permissions = [];

while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
    $permissions[] = [
        "id" => $row['id'],
        "parent" => "cat_" . $row['category'], // Group under category
        "text" => $row['name'],
        "icon" => "bx bx-key" // Optional: Key icon for permissions
    ];
}

// Merge categories and permissions
echo json_encode(array_merge($categories, $permissions));
?>
 
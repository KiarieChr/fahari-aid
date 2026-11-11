<?php
require_once 'config.php';
require_once 'middleware.php';

try {
    global $db;
    
    $type = isset($_GET['type']) ? $_GET['type'] : '';
    $parent_id = isset($_GET['parent_id']) ? (int)$_GET['parent_id'] : 0;
    
    $data = [];
    
    switch ($type) {
        case 'regions':
            $stmt = $db->query("SELECT id, name FROM regions ORDER BY name ASC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            
        case 'countries':
            if ($parent_id > 0) {
                $stmt = $db->prepare("SELECT id, name FROM countries WHERE region_id = ? ORDER BY name ASC");
                $stmt->execute([$parent_id]);
            } else {
                $stmt = $db->query("SELECT id, name FROM countries ORDER BY name ASC");
            }
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            
        case 'states':
            if ($parent_id > 0) {
                $stmt = $db->prepare("SELECT id, name FROM states WHERE country_id = ? ORDER BY name ASC");
                $stmt->execute([$parent_id]);
            } else {
                $stmt = $db->query("SELECT id, name FROM states ORDER BY name ASC");
            }
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            
        case 'cities':
            if ($parent_id > 0) {
                $stmt = $db->prepare("SELECT id, name FROM cities WHERE state_id = ? ORDER BY name ASC");
                $stmt->execute([$parent_id]);
            } else {
                $stmt = $db->query("SELECT id, name FROM cities ORDER BY name ASC");
            }
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            
        default:
            echo json_encode(["success" => false, "message" => "Invalid location type"]);
            exit;
    }
    
    echo json_encode(["success" => true, "data" => $data]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Connection failed: " . $e->getMessage()]);
}
?>

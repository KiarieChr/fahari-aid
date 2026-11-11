<?php
include('../includes/connection.php');

header('Content-Type: application/json');

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    
    try {
        $sql = "SELECT cm.*, m.first_name, m.last_name 
                FROM committed_members cm 
                LEFT JOIN member m ON cm.member_id = m.id 
                WHERE cm.id = :id";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($data) {
            // Add linked member name if available
            if ($data['member_id'] && $data['first_name']) {
                $data['linked_member_name'] = $data['first_name'] . ' ' . $data['last_name'];
            }
            
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Committed member not found'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No ID provided'
    ]);
}
?>
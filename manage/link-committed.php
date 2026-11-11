<?php
include('../includes/connection.php');

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $committedId = $_POST['committed_id'] ?? 0;
    $memberName = $_POST['member_name'] ?? '';
    
    if (empty($committedId) || empty($memberName)) {
        echo json_encode(['success' => false, 'message' => 'Missing required data']);
        exit;
    }
    
    // Extract member ID from name (assuming format: "Name (ID: 123)")
    preg_match('/ID:\s*(\d+)/', $memberName, $matches);
    $memberId = $matches[1] ?? 0;
    
    if (!$memberId) {
        // Try to get member ID by name
        $nameParts = explode(' ', $memberName);
        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';
        
        try {
            $sql = "SELECT id FROM member WHERE first_name LIKE :first AND last_name LIKE :last LIMIT 1";
            $stmt = $db->prepare($sql);
            $stmt->execute([':first' => $firstName . '%', ':last' => $lastName . '%']);
            $member = $stmt->fetch(PDO::FETCH_ASSOC);
            $memberId = $member['id'] ?? 0;
        } catch (PDOException $e) {
            // Continue with manual linking
        }
    }
    
    if ($memberId) {
        try {
            $sql = "UPDATE committed_members SET member_id = :member_id WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute([':member_id' => $memberId, ':id' => $committedId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Successfully linked to member ID: ' . $memberId
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Could not determine member ID. Please link manually.'
        ]);
    }
}
?>
<?php
include('../includes/connection.php');

// Set content type
header('Content-Type: text/html; charset=utf-8');

if (isset($_GET['q'])) {
    $search = trim($_GET['q']);
    
    if (strlen($search) < 2) {
        echo '<div class="alert alert-info">Type at least 2 characters to search</div>';
        exit;
    }
    
    try {
        // Debug: Log the search
        error_log("Searching for: " . $search);
        
        $searchParam = '%' . $search . '%';
        
        // Use the exact working query from your Workbench
        $sql = "SELECT id, 
                       CONCAT(first_name, ' ', last_name) as name, 
                       phone_no, 
                       email 
                FROM member 
                WHERE phone_no LIKE :search1 
                   OR email LIKE :search2 
                   OR first_name LIKE :search3 
                   OR last_name LIKE :search4 
                ORDER BY first_name, last_name
                LIMIT 10";
        
        error_log("SQL Query: " . $sql);
        error_log("Search parameter: " . $searchParam);
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':search1' => $searchParam,
            ':search2' => $searchParam,
            ':search3' => $searchParam,
            ':search4' => $searchParam
        ]);
        
        $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("Found " . count($members) . " members");
        
        if (!empty($members)) {
            echo '<div class="list-group">';
            foreach ($members as $member) {
                $memberId = $member['id'] ?? 0;
                $memberName = htmlspecialchars($member['name'] ?? 'Unknown');
                $memberPhone = htmlspecialchars($member['phone_no'] ?? 'Not provided');
                $memberEmail = htmlspecialchars($member['email'] ?? 'Not provided');
                
                // Create a safe JavaScript call
                $jsCall = "selectMemberForLink(" . 
                          intval($memberId) . ", " .
                          "'" . addslashes($memberName) . "', " .
                          "'" . addslashes($memberPhone) . "', " .
                          "'" . addslashes($memberEmail) . "')";
                
                echo '<div class="list-group-item list-group-item-action" onclick="' . $jsCall . '" style="cursor: pointer;">';
                echo '<div class="d-flex w-100 justify-content-between">';
                echo '<h6 class="mb-1">' . $memberName . '</h6>';
                echo '<small class="text-muted">ID: ' . $memberId . '</small>';
                echo '</div>';
                echo '<p class="mb-1"><i class="bx bx-phone"></i> ' . $memberPhone . '</p>';
                if ($memberEmail && $memberEmail !== 'Not provided') {
                    echo '<small><i class="bx bx-envelope"></i> ' . $memberEmail . '</small>';
                }
                echo '</div>';
            }
            echo '</div>';
        } else {
            echo '<div class="alert alert-info">No members found matching "' . htmlspecialchars($search) . '"</div>';
        }
        
    } catch (PDOException $e) {
        error_log("Search error: " . $e->getMessage());
        error_log("Error trace: " . $e->getTraceAsString());
        
        // More detailed error for debugging
        echo '<div class="alert alert-danger">';
        echo '<h6>Database Error</h6>';
        echo '<p>Message: ' . htmlspecialchars($e->getMessage()) . '</p>';
        echo '<p>Code: ' . $e->getCode() . '</p>';
        
        // Show SQL state for more info
        if (method_exists($e, 'errorInfo')) {
            $errorInfo = $e->errorInfo();
            echo '<p>SQL State: ' . htmlspecialchars($errorInfo[0]) . '</p>';
            echo '<p>Driver Code: ' . htmlspecialchars($errorInfo[1]) . '</p>';
            echo '<p>Driver Message: ' . htmlspecialchars($errorInfo[2]) . '</p>';
        }
        echo '</div>';
    }
} else {
    echo '<div class="alert alert-info">Enter search term above</div>';
}
?>
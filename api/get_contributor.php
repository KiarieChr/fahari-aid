<?php

// this a api endpoint to fetch contributor details based on selected id via ajax request
ob_start();
header('Content-Type: application/json');
require_once '../includes/connection.php';

    if(isset($_GET['id']) && !empty(trim($_GET['id']))){
        $id = trim($_GET['id']);
        ob_end_clean();
        // fetch the contributor details especially the email 
        $stmt = $db->prepare("SELECT id, full_name, email, phone_no FROM pledges WHERE id = ?");
        $stmt->execute([$id]);
        $contributor = $stmt->fetch(PDO::FETCH_ASSOC);
        if($contributor){
            // if found return the sum of the contributions and payments too from tables pledges and pledges_redeem
            $sql = "SELECT p.full_name, p.email, p.phone_no,
                        sum(p.pledges_amount) as total_pledged,
                        sum(r.redeemed_amount) as total_redeemed
                    from pledges p 
                    left join pledges_redeem r on p.id = r.pledge_id
                    where p.email=?
                    group by p.id, p.full_name, p.email, p.phone_no";
            $stmt = $db->prepare($sql);
            $stmt->execute([$contributor['email']]);
            $contribution = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(array_merge($contributor, $contribution));
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Contributor not found']);
        }
        
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or missing contributor ID']);
    }
?>
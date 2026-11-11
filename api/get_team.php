<?php
/**
 * Get Team Members API
 * GET /api/get_team.php
 */

require_once __DIR__ . '/config.php';

try {
    // Select active team members ordered by sort_order
    $stmt = $db->prepare("
        SELECT 
            id, name, role, bio, image_url, 
            twitter_url, facebook_url, instagram_url, linkedin_url,
            sort_order, status
        FROM team_members
        WHERE status = 'active'
        ORDER BY sort_order ASC, id ASC
    ");
    $stmt->execute();
    $team = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Using the apiSuccess helper defined in config.php
    apiSuccess(['team' => $team], 'Team members retrieved successfully');

} catch (PDOException $e) {
    error_log("Get team error: " . $e->getMessage());
    apiError('Failed to retrieve team members', 500);
}

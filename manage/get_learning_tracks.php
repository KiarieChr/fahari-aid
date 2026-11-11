<?php
session_start();
require_once('../includes/connection.php');
include('../includes/checklogin.php');

$currentUserId = $user_id ?? 0;

header('Content-Type: application/json');

if (!$currentUserId) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

try {
    // 1. Get all active learning tracks
    $stmt = $db->query("SELECT id, title, description, badge_icon FROM trn_learning_tracks WHERE status = 1 ORDER BY id ASC");
    $tracks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Get current user's enrollments and calculate real progress
    $enrollStmt = $db->prepare("
        SELECT e.id, e.track_id, e.status, 
               (SELECT COUNT(*) FROM trn_learning_modules m WHERE m.track_id = e.track_id) as total_modules,
               (SELECT COUNT(*) FROM trn_module_progress p JOIN trn_learning_modules m ON p.module_id = m.id WHERE p.enrollment_id = e.id AND m.track_id = e.track_id AND p.status = 'completed') as completed_modules
        FROM trn_track_enrollments e 
        WHERE e.trainee_id = :uid
    ");
    $enrollStmt->execute([':uid' => $currentUserId]);
    $enrollmentsRaw = $enrollStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $enrollments = [];
    foreach($enrollmentsRaw as $e) {
        $total = intval($e['total_modules']);
        $completed = intval($e['completed_modules']);
        $pct = ($total > 0) ? round(($completed / $total) * 100) : 0;
        
        $e['progress_pct'] = $pct;
        
        // Optionally update the DB with the new calculated progress
        if ($pct > 0) {
            $upd = $db->prepare("UPDATE trn_track_enrollments SET progress_pct = :pct WHERE id = :eid");
            $upd->execute([':pct' => $pct, ':eid' => $e['id']]);
        }
        
        $enrollments[$e['track_id']] = $e;
    }

    // 3. Get modules for each track
    $modStmt = $db->query("SELECT id, track_id, title, sequence_no, content_type, requires_practical FROM trn_learning_modules ORDER BY track_id, sequence_no ASC");
    $modulesRaw = $modStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $modulesByTrack = [];
    foreach($modulesRaw as $m) {
        $modulesByTrack[$m['track_id']][] = $m;
    }

    // 4. Fetch the user's Discipleship Stage to enforce Gatekeeping
    $dcStmt = $db->prepare("
        SELECT cd.stage 
        FROM cell_disciples cd 
        JOIN users u ON u.member_id = cd.member_id 
        WHERE u.id = :uid AND cd.status = 'active'
    ");
    $dcStmt->execute([':uid' => $currentUserId]);
    $dcRecord = $dcStmt->fetch(PDO::FETCH_ASSOC);
    $dc_stage = $dcRecord ? $dcRecord['stage'] : 'Not Started';

    // Map everything together
    $result = [];
    foreach ($tracks as $t) {
        $t['modules'] = $modulesByTrack[$t['id']] ?? [];
        $t['enrollment'] = $enrollments[$t['id']] ?? null;
        $result[] = $t;
    }

    echo json_encode(['success' => true, 'tracks' => $result, 'dc_stage' => $dc_stage]);

} catch (PDOException $e) {
    error_log("Error fetching learning tracks: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error']);
}

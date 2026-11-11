<?php
/**
 * autosave_cell_report.php
 * Handles AJAX autosaving of cell reports as drafts.
 */
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/connection.php';
require_once __DIR__ . '/../includes/checklogin.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get the POST values
$report_id                 = isset($_POST['report_id']) ? intval($_POST['report_id']) : 0;
$meeting_id                = isset($_POST['meeting_id']) && $_POST['meeting_id'] !== '' ? intval($_POST['meeting_id']) : null;
$cell_id                   = isset($_POST['cell_id']) ? intval($_POST['cell_id']) : 0;
$meeting_date              = isset($_POST['meeting_date']) ? trim($_POST['meeting_date']) : '';
$meeting_type              = isset($_POST['meeting_type']) ? trim($_POST['meeting_type']) : 'Weekly Cell Meeting';
$topic                     = isset($_POST['topic']) ? trim($_POST['topic']) : '';
$new_converts              = isset($_POST['new_converts']) ? intval($_POST['new_converts']) : 0;
$holy_spirit_baptism       = isset($_POST['holy_spirit_baptism']) ? intval($_POST['holy_spirit_baptism']) : 0;
$salvations                = isset($_POST['salvations']) ? intval($_POST['salvations']) : 0;
$first_timer_followups_48h = isset($_POST['first_timer_followups_48h']) ? intval($_POST['first_timer_followups_48h']) : 0;
$absentee_followups        = isset($_POST['absentee_followups']) ? intval($_POST['absentee_followups']) : 0;
$testimonies               = isset($_POST['testimonies']) ? trim($_POST['testimonies']) : '';
$prayer_requests           = isset($_POST['prayer_requests']) ? trim($_POST['prayer_requests']) : '';
$challenges_support_needed = isset($_POST['challenges_support_needed']) ? trim($_POST['challenges_support_needed']) : '';

// Present member IDs (array)
$present_member_ids        = isset($_POST['present_member_ids']) ? $_POST['present_member_ids'] : [];
if (!is_array($present_member_ids)) {
    $present_member_ids = [];
}

// First timers (JSON array of objects)
$first_timers_json         = isset($_POST['first_timers_json']) ? trim($_POST['first_timers_json']) : '[]';
$first_timers              = json_decode($first_timers_json, true);
if (!is_array($first_timers)) {
    $first_timers = [];
}

// Pastoral care challenges (JSON array of objects)
$pastoral_care_json        = isset($_POST['pastoral_care_json']) ? trim($_POST['pastoral_care_json']) : '[]';
$pastoral_care             = json_decode($pastoral_care_json, true);
if (!is_array($pastoral_care)) {
    $pastoral_care = [];
}

if (!$cell_id || empty($meeting_date)) {
    echo json_encode(['success' => false, 'message' => 'Cell ID and Meeting Date are required']);
    exit;
}

try {
    $db->beginTransaction();

    // Calculate total attendance as counts of marked present members
    $total_attendance = count($present_member_ids);

    // If report_id not provided, check if a draft/report already exists for this cell + date + type
    if (!$report_id) {
        $stmt = $db->prepare("
            SELECT id FROM cell_reports 
            WHERE cell_id = :cell_id 
              AND meeting_date = :meeting_date 
              AND meeting_type = :meeting_type 
            LIMIT 1
        ");
        $stmt->execute([
            ':cell_id'      => $cell_id,
            ':meeting_date' => $meeting_date,
            ':meeting_type' => $meeting_type
        ]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($existing) {
            $report_id = intval($existing['id']);
        }
    }

    if ($report_id) {
        // Update existing report
        $stmt = $db->prepare("
            UPDATE cell_reports 
            SET topic = :topic,
                total_attendance = :total_attendance,
                new_converts = :new_converts,
                holy_spirit_baptism = :holy_spirit_baptism,
                salvations = :salvations,
                first_timer_followups_48h = :first_timer_followups_48h,
                absentee_followups = :absentee_followups,
                testimonies = :testimonies,
                prayer_requests = :prayer_requests,
                challenges_support_needed = :challenges_support_needed,
                meeting_id = :meeting_id
            WHERE id = :id AND status = 'draft'
        ");
        $stmt->execute([
            ':topic'                     => $topic,
            ':total_attendance'          => $total_attendance,
            ':new_converts'              => $new_converts,
            ':holy_spirit_baptism'       => $holy_spirit_baptism,
            ':salvations'                => $salvations,
            ':first_timer_followups_48h' => $first_timer_followups_48h,
            ':absentee_followups'        => $absentee_followups,
            ':testimonies'               => $testimonies,
            ':prayer_requests'           => $prayer_requests,
            ':challenges_support_needed' => $challenges_support_needed,
            ':meeting_id'                => $meeting_id,
            ':id'                        => $report_id
        ]);
    } else {
        // Insert new report draft
        $stmt = $db->prepare("
            INSERT INTO cell_reports (
                cell_id, meeting_id, meeting_date, meeting_type, topic, total_attendance,
                new_converts, holy_spirit_baptism, salvations, 
                first_timer_followups_48h, absentee_followups,
                testimonies, prayer_requests, challenges_support_needed,
                status, created_by
            ) VALUES (
                :cell_id, :meeting_id, :meeting_date, :meeting_type, :topic, :total_attendance,
                :new_converts, :holy_spirit_baptism, :salvations,
                :first_timer_followups_48h, :absentee_followups,
                :testimonies, :prayer_requests, :challenges_support_needed,
                'draft', :created_by
            )
        ");
        $stmt->execute([
            ':cell_id'                   => $cell_id,
            ':meeting_id'                => $meeting_id,
            ':meeting_date'              => $meeting_date,
            ':meeting_type'              => $meeting_type,
            ':topic'                     => $topic,
            ':total_attendance'          => $total_attendance,
            ':new_converts'              => $new_converts,
            ':holy_spirit_baptism'       => $holy_spirit_baptism,
            ':salvations'                => $salvations,
            ':first_timer_followups_48h' => $first_timer_followups_48h,
            ':absentee_followups'        => $absentee_followups,
            ':testimonies'               => $testimonies,
            ':prayer_requests'           => $prayer_requests,
            ':challenges_support_needed' => $challenges_support_needed,
            ':created_by'                => $user_id
        ]);
        $report_id = intval($db->lastInsertId());
    }

    // --- Autosave present members ---
    // Clear old list first
    $db->prepare("DELETE FROM cell_report_attendance WHERE report_id = :rid")->execute([':rid' => $report_id]);
    if (!empty($present_member_ids)) {
        $ins = $db->prepare("INSERT INTO cell_report_attendance (report_id, member_id, present) VALUES (:rid, :mid, 1)");
        foreach ($present_member_ids as $mid) {
            $ins->execute([':rid' => $report_id, ':mid' => intval($mid)]);
        }
    }

    // --- Autosave first timers ---
    // Clear old list first
    $db->prepare("DELETE FROM cell_report_first_timers WHERE report_id = :rid")->execute([':rid' => $report_id]);
    if (!empty($first_timers)) {
        $ins = $db->prepare("
            INSERT INTO cell_report_first_timers (
                report_id, first_name, last_name, phone_no, email, gender, address, invited_by, member_id
            ) VALUES (
                :rid, :fname, :lname, :phone, :email, :gender, :address, :invited_by, :member_id
            )
        ");
        foreach ($first_timers as $ft) {
            $ins->execute([
                ':rid'       => $report_id,
                ':fname'     => trim($ft['first_name'] ?? ''),
                ':lname'     => trim($ft['last_name'] ?? ''),
                ':phone'     => trim($ft['phone_no'] ?? ''),
                ':email'     => trim($ft['email'] ?? ''),
                ':gender'    => trim($ft['gender'] ?? ''),
                ':address'   => trim($ft['address'] ?? ''),
                ':invited_by'=> !empty($ft['invited_by']) ? intval($ft['invited_by']) : null,
                ':member_id' => !empty($ft['member_id']) ? intval($ft['member_id']) : null
            ]);
        }
    }

    // --- Autosave pastoral care challenges ---
    // Clear old list first
    $db->prepare("DELETE FROM cell_report_pastoral_care WHERE report_id = :rid")->execute([':rid' => $report_id]);
    if (!empty($pastoral_care)) {
        $ins = $db->prepare("
            INSERT INTO cell_report_pastoral_care (
                report_id, member_id, challenge_type, description, action_taken
            ) VALUES (
                :rid, :mid, :type, :desc, :action
            )
        ");
        foreach ($pastoral_care as $pc) {
            $ins->execute([
                ':rid'    => $report_id,
                ':mid'    => intval($pc['member_id'] ?? 0),
                ':type'   => trim($pc['challenge_type'] ?? ''),
                ':desc'   => trim($pc['description'] ?? ''),
                ':action' => trim($pc['action_taken'] ?? '')
            ]);
        }
    }

    $db->commit();
    echo json_encode(['success' => true, 'report_id' => $report_id, 'message' => 'Draft autosaved successfully']);

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("autosave_cell_report error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Autosave failed: ' . $e->getMessage()]);
}
?>

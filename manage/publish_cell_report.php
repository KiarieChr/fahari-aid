<?php
/**
 * publish_cell_report.php
 * Handles publishing cell reports: syncs attendance, creates contacts, generates followups.
 */
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/connection.php';
require_once __DIR__ . '/../includes/checklogin.php';
require_once __DIR__ . '/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$report_id = isset($_POST['report_id']) ? intval($_POST['report_id']) : 0;
$cell_id   = isset($_POST['cell_id']) ? intval($_POST['cell_id']) : 0;
$meeting_id_post = isset($_POST['meeting_id']) && $_POST['meeting_id'] !== '' ? intval($_POST['meeting_id']) : null;

if (!$cell_id) {
    echo json_encode(['success' => false, 'message' => 'Cell ID is required']);
    exit;
}

try {
    $db->beginTransaction();

    // 1. Get or create draft report first to have the latest values
    // We reuse autosave logic to update everything, then mark as published.
    // Call the same autosave updates:
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

    $present_member_ids        = isset($_POST['present_member_ids']) ? $_POST['present_member_ids'] : [];
    if (!is_array($present_member_ids)) { $present_member_ids = []; }

    $first_timers_json         = isset($_POST['first_timers_json']) ? trim($_POST['first_timers_json']) : '[]';
    $first_timers              = json_decode($first_timers_json, true);
    if (!is_array($first_timers)) { $first_timers = []; }

    $pastoral_care_json        = isset($_POST['pastoral_care_json']) ? trim($_POST['pastoral_care_json']) : '[]';
    $pastoral_care             = json_decode($pastoral_care_json, true);
    if (!is_array($pastoral_care)) { $pastoral_care = []; }

    $total_attendance = count($present_member_ids);

    // Get cell details
    $c_stmt = $db->prepare("SELECT code, name, cell_leader, meeting_time FROM cells WHERE id = :cid");
    $c_stmt->execute([':cid' => $cell_id]);
    $cell = $c_stmt->fetch(PDO::FETCH_ASSOC);
    if (!$cell) {
        throw new Exception("Cell group not found");
    }
    $cell_code = $cell['code'] ?: 'Cell_' . $cell_id;

    // Resolve meeting ID
    $meeting_id = null;
    $custom_meeting_start_time = null;

    if ($meeting_id_post) {
        $chk_m = $db->prepare("SELECT id, start_time FROM meeting WHERE id = :mid LIMIT 1");
        $chk_m->execute([':mid' => $meeting_id_post]);
        $chk_m_row = $chk_m->fetch(PDO::FETCH_ASSOC);
        if ($chk_m_row) {
            $meeting_id = intval($chk_m_row['id']);
            $custom_meeting_start_time = $chk_m_row['start_time'];
        } else {
            throw new Exception("Selected meeting was not found");
        }
    }

    if (!$meeting_id) {
        // Fall back to dynamic meeting
        $meeting_type_id = 0;
        $check_type = $db->prepare("SELECT id FROM meeting_types WHERE name = 'Cell Meeting' LIMIT 1");
        $check_type->execute();
        $type_row = $check_type->fetch();
        if ($type_row) {
            $meeting_type_id = intval($type_row['id']);
        } else {
            $ins_type = $db->prepare("INSERT INTO meeting_types (name) VALUES ('Cell Meeting')");
            $ins_type->execute();
            $meeting_type_id = intval($db->lastInsertId());
        }

        $meeting_name = "Cell Meeting - " . $cell_code . " - " . $meeting_date;
        $check_meeting = $db->prepare("SELECT id FROM meeting WHERE name = :name LIMIT 1");
        $check_meeting->execute([':name' => $meeting_name]);
        $m_row = $check_meeting->fetch();
        if ($m_row) {
            $meeting_id = intval($m_row['id']);
        } else {
            $start_time = $meeting_date . " " . ($cell['meeting_time'] ?? '18:00:00');
            $end_time = date('Y-m-d H:i:s', strtotime($start_time . ' + 1 hour 30 minutes'));
            $ins_meeting = $db->prepare("
                INSERT INTO meeting (name, start_time, end_time, facilitator, meeting_type, description)
                VALUES (:name, :start, :end, :fac, :mtype, :desc)
            ");
            $ins_meeting->execute([
                ':name'  => $meeting_name,
                ':start' => $start_time,
                ':end'   => $end_time,
                ':fac'   => $cell['cell_leader'] ?: $user_id,
                ':mtype' => $meeting_type_id,
                ':desc'  => "Cell group meeting for cell code " . $cell_code
            ]);
            $meeting_id = intval($db->lastInsertId());
        }
    }

    if ($report_id) {
        // Update first
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
                meeting_id = :meeting_id,
                status = 'published',
                published_at = NOW()
            WHERE id = :id
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
        // Insert directly
        $stmt = $db->prepare("
            INSERT INTO cell_reports (
                cell_id, meeting_id, meeting_date, meeting_type, topic, total_attendance,
                new_converts, holy_spirit_baptism, salvations, 
                first_timer_followups_48h, absentee_followups,
                testimonies, prayer_requests, challenges_support_needed,
                status, created_by, published_at
            ) VALUES (
                :cell_id, :meeting_id, :meeting_date, :meeting_type, :topic, :total_attendance,
                :new_converts, :holy_spirit_baptism, :salvations,
                :first_timer_followups_48h, :absentee_followups,
                :testimonies, :prayer_requests, :challenges_support_needed,
                'published', :created_by, NOW()
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

    // --- Save Present Attendance Checklist ---
    $db->prepare("DELETE FROM cell_report_attendance WHERE report_id = :rid")->execute([':rid' => $report_id]);
    if (!empty($present_member_ids)) {
        $ins = $db->prepare("INSERT INTO cell_report_attendance (report_id, member_id, present) VALUES (:rid, :mid, 1)");
        foreach ($present_member_ids as $mid) {
            $ins->execute([':rid' => $report_id, ':mid' => intval($mid)]);
        }
    }

    // --- Process First Timers: Prevents duplicates & creates contact profiles ---
    $db->prepare("DELETE FROM cell_report_first_timers WHERE report_id = :rid")->execute([':rid' => $report_id]);
    $created_member_ids = [];
    foreach ($first_timers as $ft) {
        $ft_member_id = !empty($ft['member_id']) ? intval($ft['member_id']) : null;

        // If no matching profile is selected, check by phone just in case or create a new contact
        if (!$ft_member_id && !empty($ft['phone_no'])) {
            $ch = $db->prepare("SELECT id FROM member WHERE phone_no = :phone LIMIT 1");
            $ch->execute([':phone' => trim($ft['phone_no'])]);
            $res = $ch->fetch(PDO::FETCH_ASSOC);
            if ($res) {
                $ft_member_id = intval($res['id']);
            }
        }

        // If still no profile, create new contact profile
        if (!$ft_member_id) {
            $ins_mem = $db->prepare("
                INSERT INTO member (first_name, last_name, phone_no, email, location, cell_id, joined_on, delete_status)
                VALUES (:fname, :lname, :phone, :email, :address, :cell_id, NOW(), 'Active')
            ");
            $ins_mem->execute([
                ':fname'   => trim($ft['first_name'] ?? 'First-timer'),
                ':lname'   => trim($ft['last_name'] ?? ''),
                ':phone'   => trim($ft['phone_no'] ?? ''),
                ':email'   => trim($ft['email'] ?? ''),
                ':address' => trim($ft['address'] ?? ''),
                ':cell_id' => $cell_id
            ]);
            $ft_member_id = intval($db->lastInsertId());
        }

        $created_member_ids[] = $ft_member_id;

        // Insert first-timer report record
        $ins_ft_rep = $db->prepare("
            INSERT INTO cell_report_first_timers (
                report_id, first_name, last_name, phone_no, email, gender, address, invited_by, member_id
            ) VALUES (
                :rid, :fname, :lname, :phone, :email, :gender, :address, :invited_by, :member_id
            )
        ");
        $ins_ft_rep->execute([
            ':rid'       => $report_id,
            ':fname'     => trim($ft['first_name'] ?? ''),
            ':lname'     => trim($ft['last_name'] ?? ''),
            ':phone'     => trim($ft['phone_no'] ?? ''),
            ':email'     => trim($ft['email'] ?? ''),
            ':gender'    => trim($ft['gender'] ?? ''),
            ':address'   => trim($ft['address'] ?? ''),
            ':invited_by'=> !empty($ft['invited_by']) ? intval($ft['invited_by']) : null,
            ':member_id' => $ft_member_id
        ]);

        // Generate follow-up task (48-hour calls)
        $due_date = date('Y-m-d', strtotime($meeting_date . ' + 2 days'));
        $ins_task = $db->prepare("
            INSERT INTO cell_followup_tasks (report_id, member_id, assigned_to, task_type, description, due_date, status)
            VALUES (:rid, :mid, :assigned_to, 'first_timer', :desc, :due, 'pending')
        ");
        $ins_task->execute([
            ':rid'         => $report_id,
            ':mid'         => $ft_member_id,
            ':assigned_to' => $user_id,
            ':desc'        => "Contact/Call first-timer: " . trim($ft['first_name'] . ' ' . ($ft['last_name'] ?? '')) . " within 48 hours.",
            ':due'         => $due_date
        ]);
    }

    // --- Sync Cell Attendance & Main Involvement record ---
    // Fetch all cell members to identify present and absent
    $mem_stmt = $db->prepare("SELECT id, first_name, last_name FROM member WHERE cell_id = :cid AND (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0')");
    $mem_stmt->execute([':cid' => $cell_id]);
    $cell_members = $mem_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Clear existing for this meeting date first in cell_attendance
    $db->prepare("DELETE FROM cell_attendance WHERE cell_id = :cid AND meeting_date = :mdate")->execute([':cid' => $cell_id, ':mdate' => $meeting_date]);

    // Clear main involvement attendance for this cell's members for this meeting to allow clean replacements
    if ($meeting_id_post) {
        // Custom meeting selected: clear only cell members + created first timers' attendance
        if (!empty($cell_members)) {
            $cell_member_ids = array_map(function($m) { return intval($m['id']); }, $cell_members);
            $all_possible_cell_member_ids = array_merge($cell_member_ids, $created_member_ids);
            if (!empty($all_possible_cell_member_ids)) {
                $placeholders = implode(',', array_fill(0, count($all_possible_cell_member_ids), '?'));
                $del_main_att = $db->prepare("DELETE FROM attendance WHERE meeting_id = ? AND member_id IN ($placeholders)");
                $del_params = array_merge([$meeting_id], $all_possible_cell_member_ids);
                $del_main_att->execute($del_params);
            }
        }
    } else {
        // Dynamic meeting: clear all attendance for this dynamic meeting
        $db->prepare("DELETE FROM attendance WHERE meeting_id = :mtid")->execute([':mtid' => $meeting_id]);
    }

    // Gather present members (assigned members marked present + newly created first timers)
    $all_present_ids = array_merge($present_member_ids, $created_member_ids);

    $ins_cell_att = $db->prepare("
        INSERT INTO cell_attendance (cell_id, member_id, meeting_date, present, recorded_by)
        VALUES (:cid, :mid, :mdate, 1, :uid)
    ");
    $ins_main_att = $db->prepare("
        INSERT IGNORE INTO attendance (member_id, meeting_id, login_time)
        VALUES (:mid, :mtid, :ltime)
    ");

    $ltime = $custom_meeting_start_time ?: ($meeting_date . ' ' . ($cell['meeting_time'] ?? '18:00:00'));

    foreach ($all_present_ids as $pid) {
        $ins_cell_att->execute([
            ':cid'   => $cell_id,
            ':mid'   => intval($pid),
            ':mdate' => $meeting_date,
            ':uid'   => $user_id
        ]);

        $ins_main_att->execute([
            ':mid'   => intval($pid),
            ':mtid'  => $meeting_id,
            ':ltime' => $ltime
        ]);
    }

    // For absent members: insert a `cell_attendance` record with `present = 0`
    $ins_cell_absent = $db->prepare("
        INSERT INTO cell_attendance (cell_id, member_id, meeting_date, present, recorded_by)
        VALUES (:cid, :mid, :mdate, 0, :uid)
    ");
    foreach ($cell_members as $m) {
        $mid = intval($m['id']);
        if (!in_array($mid, $all_present_ids)) {
            $ins_cell_absent->execute([
                ':cid'   => $cell_id,
                ':mid'   => $mid,
                ':mdate' => $meeting_date,
                ':uid'   => $user_id
            ]);

            // check if they missed the last meeting as well (2 consecutive weeks)
            // Get previous meeting date
            $prev_stmt = $db->prepare("
                SELECT meeting_date, present FROM cell_attendance
                WHERE cell_id = :cid AND member_id = :mid AND meeting_date < :mdate
                ORDER BY meeting_date DESC LIMIT 1
            ");
            $prev_stmt->execute([':cid' => $cell_id, ':mid' => $mid, ':mdate' => $meeting_date]);
            $prev = $prev_stmt->fetch(PDO::FETCH_ASSOC);

            if ($prev && intval($prev['present']) === 0) {
                // Generates absentee followup task
                $due_date = date('Y-m-d', strtotime($meeting_date . ' + 5 days'));
                $ins_task = $db->prepare("
                    INSERT INTO cell_followup_tasks (report_id, member_id, assigned_to, task_type, description, due_date, status)
                    VALUES (:rid, :mid, :assigned_to, 'absentee', :desc, :due, 'pending')
                ");
                $ins_task->execute([
                    ':rid'         => $report_id,
                    ':mid'         => $mid,
                    ':assigned_to' => $user_id,
                    ':desc'        => "Absentee followup: " . htmlspecialchars($m['first_name'] . ' ' . $m['last_name']) . " was absent for two consecutive weeks.",
                    ':due'         => $due_date
                ]);
            }
        }
    }

    // --- Process Pastoral Care Challenges ---
    $db->prepare("DELETE FROM cell_report_pastoral_care WHERE report_id = :rid")->execute([':rid' => $report_id]);
    foreach ($pastoral_care as $pc) {
        $pmid = intval($pc['member_id'] ?? 0);
        $ctype = trim($pc['challenge_type'] ?? '');
        $pdesc = trim($pc['description'] ?? '');
        $pact = trim($pc['action_taken'] ?? '');

        if ($pmid && !empty($ctype)) {
            $ins_pc = $db->prepare("
                INSERT INTO cell_report_pastoral_care (
                    report_id, member_id, challenge_type, description, action_taken
                ) VALUES (
                    :rid, :mid, :type, :desc, :action
                )
            ");
            $ins_pc->execute([
                ':rid'    => $report_id,
                ':mid'    => $pmid,
                ':type'   => $ctype,
                ':desc'   => $pdesc,
                ':action' => $pact
            ]);

            // Generate follow-up task
            $due_date = date('Y-m-d', strtotime($meeting_date . ' + 3 days'));
            $m_name_stmt = $db->prepare("SELECT first_name, last_name FROM member WHERE id = :mid");
            $m_name_stmt->execute([':mid' => $pmid]);
            $mn = $m_name_stmt->fetch();
            $mname = $mn ? $mn['first_name'] . ' ' . $mn['last_name'] : 'Member';

            $ins_task = $db->prepare("
                INSERT INTO cell_followup_tasks (report_id, member_id, assigned_to, task_type, description, due_date, status)
                VALUES (:rid, :mid, :assigned_to, 'pastoral_care', :desc, :due, 'pending')
            ");
            $ins_task->execute([
                ':rid'         => $report_id,
                ':mid'         => $pmid,
                ':assigned_to' => $user_id,
                ':desc'        => "Pastoral care follow-up: Support $mname who is facing $ctype ($pdesc).",
                ':due'         => $due_date
            ]);
        }
    }

    // Log Audit Trail
    log_audit_trail($db, 'cell_reports', $report_id, 'publish', null, [
        'cell_id' => $cell_id,
        'meeting_date' => $meeting_date,
        'meeting_type' => $meeting_type
    ], intval($user_id));

    $db->commit();
    echo json_encode(['success' => true, 'report_id' => $report_id, 'message' => 'Report published successfully! Attendance and follow-up tasks updated.']);

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("publish_cell_report error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Publish failed: ' . $e->getMessage()]);
}
?>

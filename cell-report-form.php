<?php
/**
 * cell-report-form.php
 * Cell meeting reporting form with autosave, duplicate prevention, and follow-ups.
 */
include('includes/checklogin.php');

$title = "Cell Management | New Report";
include("includes/get_user.php");
require_once 'manage/functions.php';

// 1. Fetch available cells for reporting
$my_cells = [];
if (userHasPermission($db, $user_id, 'edit_cell') || userHasPermission($db, $user_id, 'create_cell')) {
    $my_cells_stmt = $db->query("
        SELECT c.id, c.code, c.name, CONCAT(m.first_name,' ',m.last_name) AS leader_name 
        FROM cells c
        LEFT JOIN member m ON c.cell_leader = m.id
        WHERE c.status = 1 
        ORDER BY c.code ASC
    ");
    $my_cells = $my_cells_stmt->fetchAll(PDO::FETCH_ASSOC);
} else {
    $my_cells_stmt = $db->prepare("
        SELECT c.id, c.code, c.name, CONCAT(m.first_name,' ',m.last_name) AS leader_name 
        FROM cells c
        LEFT JOIN member m ON c.cell_leader = m.id
        WHERE c.cell_leader = :lid AND c.status = 1
    ");
    $my_cells_stmt->execute([':lid' => $member_id]);
    $my_cells = $my_cells_stmt->fetchAll(PDO::FETCH_ASSOC);
}

// 2. Select filter / pre-fill values
$sel_cell = isset($_GET['cell_id']) ? intval($_GET['cell_id']) : (count($my_cells) > 0 ? $my_cells[0]['id'] : 0);
$sel_date = isset($_GET['date']) ? trim($_GET['date']) : date('Y-m-d');
$meeting_type = isset($_GET['meeting_type']) ? trim($_GET['meeting_type']) : 'Weekly Cell Meeting';

// Fetch available meetings for linking
$meetings_stmt = $db->query("SELECT id, name, start_time FROM meeting ORDER BY start_time DESC LIMIT 150");
$available_meetings = $meetings_stmt->fetchAll(PDO::FETCH_ASSOC);

$report = null;
$present_ids = [];
$first_timers = [];
$pastoral_care = [];
$members = [];

// Get active cell info
$cell_info = null;
if ($sel_cell) {
    $ci_stmt = $db->prepare("
        SELECT c.id, c.code, c.name, CONCAT(m.first_name,' ',m.last_name) AS leader_name, c.location
        FROM cells c
        LEFT JOIN member m ON c.cell_leader = m.id
        WHERE c.id = :cid
    ");
    $ci_stmt->execute([':cid' => $sel_cell]);
    $cell_info = $ci_stmt->fetch(PDO::FETCH_ASSOC);

    // Fetch cell members
    $m_stmt = $db->prepare("
        SELECT id, first_name, last_name, phone_no, email, location
        FROM member
        WHERE cell_id = :cid
          AND (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0')
        ORDER BY first_name ASC
    ");
    $m_stmt->execute([':cid' => $sel_cell]);
    $members = $m_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch existing report (if any)
    $rep_stmt = $db->prepare("
        SELECT * FROM cell_reports 
        WHERE cell_id = :cid AND meeting_date = :mdate AND meeting_type = :mtype
        LIMIT 1
    ");
    $rep_stmt->execute([':cid' => $sel_cell, ':mdate' => $sel_date, ':mtype' => $meeting_type]);
    $report = $rep_stmt->fetch(PDO::FETCH_ASSOC);

    if ($report) {
        $report_id = intval($report['id']);
        
        // Fetch present member IDs
        $att_stmt = $db->prepare("SELECT member_id FROM cell_report_attendance WHERE report_id = :rid AND present = 1");
        $att_stmt->execute([':rid' => $report_id]);
        $present_ids = $att_stmt->fetchAll(PDO::FETCH_COLUMN);

        // Fetch first timers
        $ft_stmt = $db->prepare("SELECT * FROM cell_report_first_timers WHERE report_id = :rid");
        $ft_stmt->execute([':rid' => $report_id]);
        $first_timers = $ft_stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch pastoral care
        $pc_stmt = $db->prepare("SELECT * FROM cell_report_pastoral_care WHERE report_id = :rid");
        $pc_stmt->execute([':rid' => $report_id]);
        $pastoral_care = $pc_stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
<!doctype html>
<html lang="en" class="layout-navbar-fixed layout-menu-fixed layout-compact" data-assets-path="assets/" data-template="vertical-menu-template" data-bs-theme="light">
<?php @include('includes/header.php'); ?>
<head>
  <style>
    :root {
      --jen-primary: #1a0533;
      --jen-accent:  #6f42c1;
      --jen-cyan:    #0ec2e6;
      --jen-success: #28a745;
      --jen-warning: #ffc107;
      --jen-danger:  #dc3545;
      --gradient: linear-gradient(135deg, var(--jen-primary) 0%, #2d0a5e 60%, var(--jen-accent) 100%);
    }

    .page-hero {
      background: var(--gradient);
      padding: 28px 32px;
      border-radius: 16px;
      color: #fff;
      margin-bottom: 24px;
      box-shadow: 0 8px 30px rgba(26,5,51,0.3);
      position: relative;
      overflow: hidden;
    }
    .page-hero h4 { font-weight: 700; font-size: 1.5rem; margin-bottom: 4px; }
    .page-hero p  { opacity: 0.8; font-size: 0.9rem; margin: 0; }

    .card-custom {
      border: none;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      margin-bottom: 24px;
      overflow: hidden;
    }
    .card-custom .card-header {
      background: #faf7ff;
      border-bottom: 1px solid #ede0ff;
      padding: 16px 24px;
    }
    .card-custom .card-header h5 {
      font-weight: 700;
      color: var(--jen-primary);
      margin: 0;
    }

    .status-indicator {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-draft { background: rgba(255,193,7,0.15); color: #b38600; }
    .status-published { background: rgba(40,167,69,0.15); color: #1a7c3e; }
    .status-new { background: rgba(13,110,253,0.15); color: #0d6efd; }

    .autosave-status {
      font-size: 0.8rem;
      color: #8a7baa;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .search-suggestions {
      position: absolute;
      top: 100%; left: 0; right: 0;
      background: #fff;
      border: 1px solid #d0c4f0;
      border-radius: 8px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 4px 18px rgba(0,0,0,0.1);
    }
    .suggestion-item {
      padding: 10px 14px;
      cursor: pointer;
      border-bottom: 1px solid #f0eaf8;
      transition: background 0.2s;
    }
    .suggestion-item:hover { background: #f5f0ff; }
    .suggestion-item:last-child { border-bottom: none; }

    .first-timer-row, .pastoral-row {
      background: #faf8ff;
      border: 1px solid #ede5fc;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      position: relative;
    }
    .remove-btn {
      position: absolute;
      top: 10px; right: 10px;
      color: var(--jen-danger);
      background: none; border: none;
      font-size: 1.2rem; cursor: pointer;
    }
  </style>
</head>

<body>
<div class="layout-wrapper layout-content-navbar">
  <div class="layout-container">
    <?php @include('includes/sidebar.php'); ?>
    <div class="layout-page">
      <?php @include('includes/nav.php'); ?>

      <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">

          <!-- Page Hero -->
          <div class="page-hero">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h4><i class="bx bx-file-find me-2"></i>Cell Meeting Reporting</h4>
                <p>Record cell attendance, first timers, pastoral care requirements, testimonies, and prayer requests.</p>
              </div>
              <div class="d-flex align-items-center gap-3">
                <span class="status-indicator <?= $report ? ($report['status'] === 'published' ? 'status-published' : 'status-draft') : 'status-new' ?>">
                  <?= $report ? htmlspecialchars($report['status']) : 'New Report' ?>
                </span>
                <span class="autosave-status" id="saveStatus">
                  <i class="bx bx-check-circle text-success"></i> Form initialized
                </span>
              </div>
            </div>
          </div>

          <!-- Cell selection header -->
          <div class="card card-custom p-4 mb-4">
            <form method="GET" id="headerForm">
              <div class="row g-3 align-items-end">
                <div class="col-md-4">
                  <label class="form-label fw-bold text-secondary">Reporting Cell Group</label>
                  <select name="cell_id" id="cellSelect" class="form-select" onchange="this.form.submit()">
                    <?php foreach ($my_cells as $c): ?>
                    <option value="<?= $c['id'] ?>" <?= $sel_cell == $c['id'] ? 'selected' : '' ?>>
                      <?= htmlspecialchars($c['code'] . ' — ' . $c['leader_name']) ?>
                    </option>
                    <?php endforeach; ?>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-bold text-secondary">Meeting Date</label>
                  <input type="date" name="date" class="form-select" value="<?= htmlspecialchars($sel_date) ?>" onchange="this.form.submit()">
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-bold text-secondary">Meeting Category</label>
                  <select name="meeting_type" class="form-select" onchange="this.form.submit()">
                    <option value="Weekly Cell Meeting" <?= $meeting_type === 'Weekly Cell Meeting' ? 'selected' : '' ?>>Weekly Cell Meeting</option>
                    <option value="Prayer Meeting" <?= $meeting_type === 'Prayer Meeting' ? 'selected' : '' ?>>Prayer Meeting</option>
                    <option value="Cell Outreach" <?= $meeting_type === 'Cell Outreach' ? 'selected' : '' ?>>Cell Outreach</option>
                    <option value="Other Meeting" <?= $meeting_type === 'Other Meeting' ? 'selected' : '' ?>>Other Meeting</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <a href="cell-leader-dashboard.php" class="btn btn-outline-secondary w-100">
                    <i class="bx bx-chevron-left me-1"></i> Dashboard
                  </a>
                </div>
              </div>
            </form>
          </div>

          <?php if (!$sel_cell): ?>
          <div class="card card-custom p-5 text-center">
            <h6 class="text-muted">Please assign or select a cell group to begin reporting.</h6>
          </div>
          <?php else: ?>

          <!-- Main Form -->
          <form id="reportForm" onsubmit="submitReport(event)">
            <input type="hidden" name="report_id" id="report_id" value="<?= $report ? $report['id'] : 0 ?>">
            <input type="hidden" name="cell_id" value="<?= $sel_cell ?>">
            <input type="hidden" name="meeting_date" value="<?= htmlspecialchars($sel_date) ?>">
            <input type="hidden" name="meeting_type" value="<?= htmlspecialchars($meeting_type) ?>">

            <div class="row">
              <!-- Left Column: Details, Attendance, and Stats -->
              <div class="col-lg-7">
                
                <!-- Meeting Details Card -->
                <div class="card card-custom">
                  <div class="card-header">
                    <h5><i class="bx bx-detail me-2 text-primary"></i>Meeting Header Info</h5>
                  </div>
                  <div class="card-body pt-4">
                    <div class="row g-3">
                      <div class="col-md-12">
                        <label class="form-label fw-semibold">Discussion Topic / Scripture / Meeting Focus</label>
                        <input type="text" name="topic" id="topic" class="form-control" placeholder="e.g. Walking in Obedience (Colossians 3)" value="<?= $report ? htmlspecialchars($report['topic']) : '' ?>">
                      </div>
                      <div class="col-md-12">
                        <label class="form-label fw-semibold">Link to Existing Meeting (Optional)</label>
                        <select name="meeting_id" id="meeting_id" class="form-select" onchange="loadMeetingAttendance(this.value)">
                          <option value="">-- Auto-Generate Dynamic Cell Meeting --</option>
                          <?php foreach ($available_meetings as $m): ?>
                          <option value="<?= $m['id'] ?>" <?= ($report && intval($report['meeting_id']) === intval($m['id'])) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($m['name'] . ' (' . date('M d, Y', strtotime($m['start_time'])) . ')') ?>
                          </option>
                          <?php endforeach; ?>
                        </select>
                        <small class="text-muted">If selected, attendance marked below will sync to this specific meeting in the church attendance register.</small>
                      </div>
                      <div class="col-6">
                        <label class="form-label fw-semibold">Prefilled Cell Leader</label>
                        <input type="text" class="form-control" readonly value="<?= htmlspecialchars($cell_info['leader_name']) ?>">
                      </div>
                      <div class="col-6">
                        <label class="form-label fw-semibold">Prefilled Location</label>
                        <input type="text" class="form-control" readonly value="<?= htmlspecialchars($cell_info['location'] ?: 'Not Provided') ?>">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Attendance Checklist Card -->
                <div class="card card-custom">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5><i class="bx bx-group me-2 text-primary"></i>Member Attendance</h5>
                    <button type="button" class="btn btn-xs btn-outline-primary" onclick="toggleAllAttendance()">Toggle All</button>
                  </div>
                  <div class="card-body pt-3">
                    <?php if (empty($members)): ?>
                    <p class="text-muted text-center py-3">No members are currently assigned to this cell group.</p>
                    <?php else: ?>
                    <div class="table-responsive" style="max-height: 380px; overflow-y: auto;">
                      <table class="table table-hover align-middle">
                        <thead>
                          <tr>
                            <th width="40">Present</th>
                            <th>Member Name</th>
                            <th>Contact Phone</th>
                          </tr>
                        </thead>
                        <tbody>
                          <?php foreach ($members as $m): 
                            $is_present = in_array($m['id'], $present_ids);
                          ?>
                          <tr>
                            <td>
                              <input type="checkbox" name="present_member_ids[]" value="<?= $m['id'] ?>" class="form-check-input attendance-checkbox" <?= $is_present ? 'checked' : '' ?> style="transform: scale(1.2);">
                            </td>
                            <td class="fw-semibold text-primary"><?= htmlspecialchars($m['first_name'] . ' ' . $m['last_name']) ?></td>
                            <td class="small text-muted"><?= htmlspecialchars($m['phone_no'] ?: 'No Phone') ?></td>
                          </tr>
                          <?php endforeach; ?>
                        </tbody>
                      </table>
                    </div>
                    <?php endif; ?>
                  </div>
                </div>

                <!-- Spiritual Decisions & Follow-up Card -->
                <div class="card card-custom">
                  <div class="card-header">
                    <h5><i class="bx bx-heart me-2 text-primary"></i>Spiritual & Follow-up Statistics</h5>
                  </div>
                  <div class="card-body pt-4">
                    <div class="row g-3">
                      <!-- Salvations -->
                      <div class="col-md-4">
                        <label class="form-label fw-semibold text-success"><i class="bx bx-book-bookmark me-1"></i>Salvation Decisions</label>
                        <input type="number" name="salvations" id="salvations" class="form-control" min="0" value="<?= $report ? intval($report['salvations']) : 0 ?>">
                      </div>
                      <!-- Holy Spirit -->
                      <div class="col-md-4">
                        <label class="form-label fw-semibold text-info"><i class="bx bx-wind me-1"></i>Holy Spirit Baptisms</label>
                        <input type="number" name="holy_spirit_baptism" id="holy_spirit_baptism" class="form-control" min="0" value="<?= $report ? intval($report['holy_spirit_baptism']) : 0 ?>">
                      </div>
                      <!-- New Converts -->
                      <div class="col-md-4">
                        <label class="form-label fw-semibold text-primary"><i class="bx bx-user-plus me-1"></i>New Converts Count</label>
                        <input type="number" name="new_converts" id="new_converts" class="form-control" min="0" value="<?= $report ? intval($report['new_converts']) : 0 ?>">
                      </div>
                      <!-- 48 hour followups -->
                      <div class="col-md-6">
                        <label class="form-label fw-semibold text-secondary"><i class="bx bx-phone-call me-1"></i>First-Timer Calls (Within 48 Hours)</label>
                        <input type="number" name="first_timer_followups_48h" id="first_timer_followups_48h" class="form-control" min="0" value="<?= $report ? intval($report['first_timer_followups_48h']) : 0 ?>">
                        <small class="text-muted">Number of calls made to previous first timers.</small>
                      </div>
                      <!-- Absentee followups -->
                      <div class="col-md-6">
                        <label class="form-label fw-semibold text-secondary"><i class="bx bx-user-voice me-1"></i>Contacted Absentees (Absent >= 2 Weeks)</label>
                        <input type="number" name="absentee_followups" id="absentee_followups" class="form-control" min="0" value="<?= $report ? intval($report['absentee_followups']) : 0 ?>">
                        <small class="text-muted">Number of consecutive absentees contacted this week.</small>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Right Column: First Timers, Pastoral Care, and Free Text -->
              <div class="col-lg-5">

                <!-- First Timers entry Card -->
                <div class="card card-custom">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5><i class="bx bx-user-plus me-2 text-primary"></i>First-Time Visitors</h5>
                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="addFirstTimerRow()">+ Add</button>
                  </div>
                  <div class="card-body pt-3" id="firstTimersContainer">
                    <!-- Javascript populates first timer rows here -->
                  </div>
                </div>

                <!-- Pastoral Care Challenges Card -->
                <div class="card card-custom">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5><i class="bx bx-shield-quarter me-2 text-primary"></i>Pastoral Care & Challenges</h5>
                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="addPastoralRow()">+ Add Log</button>
                  </div>
                  <div class="card-body pt-3" id="pastoralContainer">
                    <!-- Javascript populates pastoral rows here -->
                  </div>
                </div>

                <!-- Testimonies & Prayer Requests Card -->
                <div class="card card-custom">
                  <div class="card-header">
                    <h5><i class="bx bx-message-square-detail me-2 text-primary"></i>Testimonies, Prayers, Support</h5>
                  </div>
                  <div class="card-body pt-4">
                    <div class="mb-3">
                      <label class="form-label fw-semibold">Testimonies (Praising God for...)</label>
                      <textarea name="testimonies" id="testimonies" class="form-control" rows="3" placeholder="Share testimonies and breakthroughs recorded this meeting..."><?= $report ? htmlspecialchars($report['testimonies']) : '' ?></textarea>
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-semibold">Prayer Requests</label>
                      <textarea name="prayer_requests" id="prayer_requests" class="form-control" rows="3" placeholder="List any prayer requests made by cell members..."><?= $report ? htmlspecialchars($report['prayer_requests']) : '' ?></textarea>
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-semibold">Cell Challenges / Oversight Support Needed</label>
                      <textarea name="challenges_support_needed" id="challenges_support_needed" class="form-control" rows="3" placeholder="Specify any challenges faced or support needed from discipleship directors..."><?= $report ? htmlspecialchars($report['challenges_support_needed']) : '' ?></textarea>
                    </div>
                  </div>
                </div>

                <!-- Final Actions -->
                <div class="card card-custom p-4 text-center">
                  <div class="d-flex gap-3 justify-content-center">
                    <button type="button" class="btn btn-secondary px-5" onclick="manualSaveDraft()">
                      <i class="bx bx-save me-1"></i> Save Draft
                    </button>
                    <button type="submit" class="btn btn-primary px-5" style="background: linear-gradient(135deg,#6f42c1,#a06efc); border:none;">
                      <i class="bx bx-paper-plane me-1"></i> Publish Report
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </form>

          <?php endif; ?>

        </div>
        <?php include("includes/footer.php"); ?>
      </div>
    </div>
  </div>
</div>

<?php include('includes/scripts.html'); ?>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
  // Initial state variables from PHP
  let firstTimersList = <?= json_encode($first_timers) ?>;
  let pastoralCareList = <?= json_encode($pastoral_care) ?>;
  const cellMembers = <?= json_encode($members) ?>;

  // Predefined challenges dropdown values
  const challengeTypes = [
    'relationship breakup',
    'relationship challenges',
    'financial difficulties',
    'health issues',
    'family conflict',
    'academic/career pressure',
    'bereavement',
    'spiritual issues',
    'other'
  ];

  // Render initial visitor rows
  function renderFirstTimers() {
    const container = document.getElementById('firstTimersContainer');
    container.innerHTML = '';
    if (firstTimersList.length === 0) {
      container.innerHTML = `<p class="text-muted text-center py-2 fs-7 mb-0">No first-timers added yet.</p>`;
      return;
    }

    firstTimersList.forEach((ft, index) => {
      let invitedByOptions = '<option value="">-- Invited By --</option>';
      cellMembers.forEach(m => {
        invitedByOptions += `<option value="${m.id}" ${parseInt(ft.invited_by) === m.id ? 'selected' : ''}>${m.first_name} ${m.last_name}</option>`;
      });

      const rowHtml = `
        <div class="first-timer-row" id="ft-row-${index}">
          <button type="button" class="remove-btn" onclick="removeFirstTimer(${index})">&times;</button>
          <div class="row g-2">
            <div class="col-6">
              <input type="text" placeholder="First Name" class="form-control form-control-sm ft-fname" value="${ft.first_name || ''}" onchange="updateFirstTimer(${index}, 'first_name', this.value)" required>
            </div>
            <div class="col-6">
              <input type="text" placeholder="Last Name" class="form-control form-control-sm ft-lname" value="${ft.last_name || ''}" onchange="updateFirstTimer(${index}, 'last_name', this.value)" required>
            </div>
            <div class="col-12 position-relative">
              <input type="text" placeholder="Phone Number (Auto-searches duplicates)" class="form-control form-control-sm ft-phone" value="${ft.phone_no || ''}" onkeyup="searchMemberDuplicate(${index}, this.value)" onchange="updateFirstTimer(${index}, 'phone_no', this.value)">
              <div class="search-suggestions" id="ft-suggest-${index}" style="display:none;"></div>
              ${ft.member_id ? '<span class="badge bg-success-subtle text-success mt-1 d-inline-block fs-xs"><i class="bx bx-link"></i> Linked to existing member profile</span>' : ''}
            </div>
            <div class="col-6">
              <input type="email" placeholder="Email" class="form-control form-control-sm" value="${ft.email || ''}" onchange="updateFirstTimer(${index}, 'email', this.value)">
            </div>
            <div class="col-6">
              <select class="form-select form-select-sm" onchange="updateFirstTimer(${index}, 'gender', this.value)">
                <option value="">-- Gender --</option>
                <option value="Male" ${ft.gender === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Female" ${ft.gender === 'Female' ? 'selected' : ''}>Female</option>
              </select>
            </div>
            <div class="col-6">
              <input type="text" placeholder="Address/Location" class="form-control form-control-sm" value="${ft.address || ''}" onchange="updateFirstTimer(${index}, 'address', this.value)">
            </div>
            <div class="col-6">
              <select class="form-select form-select-sm" onchange="updateFirstTimer(${index}, 'invited_by', this.value)">
                ${invitedByOptions}
              </select>
            </div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', rowHtml);
    });
  }

  function addFirstTimerRow() {
    firstTimersList.push({
      first_name: '', last_name: '', phone_no: '', email: '', gender: '', address: '', invited_by: '', member_id: null
    });
    renderFirstTimers();
  }

  function removeFirstTimer(index) {
    firstTimersList.splice(index, 1);
    renderFirstTimers();
  }

  function updateFirstTimer(index, field, value) {
    firstTimersList[index][field] = value;
  }

  // Live duplicate checking
  function searchMemberDuplicate(index, val) {
    const sug = document.getElementById(`ft-suggest-${index}`);
    if (val.length < 3) {
      sug.style.display = 'none';
      return;
    }

    fetch(`manage/search_members_ajax.php?query=${encodeURIComponent(val)}`)
    .then(r => r.json())
    .then(data => {
      if (data && data.length > 0) {
        let html = '';
        data.forEach(item => {
          html += `
            <div class="suggestion-item fs-7" onclick="linkFirstTimer(${index}, ${item.id}, '${item.first_name}', '${item.last_name}', '${item.phone_no}', '${item.email}', '${item.location}')">
              <i class="bx bx-user me-1 text-primary"></i>
              <strong>${item.first_name} ${item.last_name}</strong> &middot; ${item.phone_no || 'No Phone'}
            </div>
          `;
        });
        sug.innerHTML = html;
        sug.style.display = 'block';
      } else {
        sug.style.display = 'none';
      }
    })
    .catch(() => {
      sug.style.display = 'none';
    });
  }

  function linkFirstTimer(index, memberId, fname, lname, phone, email, address) {
    firstTimersList[index]['member_id'] = memberId;
    firstTimersList[index]['first_name'] = fname;
    firstTimersList[index]['last_name'] = lname;
    firstTimersList[index]['phone_no'] = phone;
    firstTimersList[index]['email'] = email;
    firstTimersList[index]['address'] = address;
    
    // Rerender to show linked label
    renderFirstTimers();
  }

  // Render pastoral care logs
  function renderPastoralCare() {
    const container = document.getElementById('pastoralContainer');
    container.innerHTML = '';
    if (pastoralCareList.length === 0) {
      container.innerHTML = `<p class="text-muted text-center py-2 fs-7 mb-0">No pastoral care entries logged.</p>`;
      return;
    }

    pastoralCareList.forEach((pc, index) => {
      let memberOptions = '<option value="">-- Select Member --</option>';
      cellMembers.forEach(m => {
        memberOptions += `<option value="${m.id}" ${parseInt(pc.member_id) === m.id ? 'selected' : ''}>${m.first_name} ${m.last_name}</option>`;
      });

      let challengeOptions = '<option value="">-- Challenge Type --</option>';
      challengeTypes.forEach(t => {
        challengeOptions += `<option value="${t}" ${pc.challenge_type === t ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`;
      });

      const rowHtml = `
        <div class="pastoral-row" id="pc-row-${index}">
          <button type="button" class="remove-btn" onclick="removePastoralLog(${index})">&times;</button>
          <div class="row g-2">
            <div class="col-6">
              <select class="form-select form-select-sm" onchange="updatePastoralLog(${index}, 'member_id', this.value)" required>
                ${memberOptions}
              </select>
            </div>
            <div class="col-6">
              <select class="form-select form-select-sm" onchange="updatePastoralLog(${index}, 'challenge_type', this.value)" required>
                ${challengeOptions}
              </select>
            </div>
            <div class="col-12">
              <textarea placeholder="Challenge details / Notes" class="form-control form-control-sm mb-2" rows="2" onchange="updatePastoralLog(${index}, 'description', this.value)">${pc.description || ''}</textarea>
            </div>
            <div class="col-12">
              <textarea placeholder="Action taken / Support plan" class="form-control form-control-sm" rows="2" onchange="updatePastoralLog(${index}, 'action_taken', this.value)">${pc.action_taken || ''}</textarea>
            </div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', rowHtml);
    });
  }

  function addPastoralRow() {
    pastoralCareList.push({
      member_id: '', challenge_type: '', description: '', action_taken: ''
    });
    renderPastoralCare();
  }

  function removePastoralLog(index) {
    pastoralCareList.splice(index, 1);
    renderPastoralCare();
  }

  function updatePastoralLog(index, field, value) {
    pastoralCareList[index][field] = value;
  }

  // Toggle all checkboxes
  function toggleAllAttendance() {
    const boxes = document.querySelectorAll('.attendance-checkbox');
    if (boxes.length === 0) return;
    const allChecked = Array.from(boxes).every(b => b.checked);
    boxes.forEach(b => b.checked = !allChecked);
  }

  // Gather form values for AJAX save/publish
  function serializeReportData() {
    const form = document.getElementById('reportForm');
    const formData = new FormData(form);
    
    // Add first-timers and pastoral care arrays
    formData.append('first_timers_json', JSON.stringify(firstTimersList));
    formData.append('pastoral_care_json', JSON.stringify(pastoralCareList));

    return formData;
  }

  // Autosave Draft logic
  function saveDraftAjax(isManual = false) {
    const statusEl = document.getElementById('saveStatus');
    statusEl.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving draft...';

    const data = serializeReportData();

    fetch('manage/autosave_cell_report.php', {
      method: 'POST',
      body: data
    })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        document.getElementById('report_id').value = res.report_id;
        const time = new Date().toLocaleTimeString();
        statusEl.innerHTML = `<i class="bx bx-check-circle text-success"></i> Autosaved at ${time}`;
        
        if (isManual) {
          Swal.fire({
            icon: 'success',
            title: 'Draft Saved!',
            text: 'Your cell report draft has been saved successfully.',
            timer: 1800,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }
      } else {
        statusEl.innerHTML = '<i class="bx bx-x-circle text-danger"></i> Save failed';
        console.error(res.message);
      }
    })
    .catch(err => {
      statusEl.innerHTML = '<i class="bx bx-wifi-off text-danger"></i> Connection error';
      console.error(err);
    });
  }

  // Trigger manual save draft
  function manualSaveDraft() {
    saveDraftAjax(true);
  }

  // Trigger autosave every 20 seconds
  setInterval(() => {
    saveDraftAjax(false);
  }, 20000);

  // Publish report submission
  function submitReport(e) {
    e.preventDefault();

    Swal.fire({
      title: 'Publish Cell Report?',
      text: 'Publishing will lock the report, log cell member attendance, create first-timer contact profiles, and generate follow-up tasks.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Publish Report',
      confirmButtonColor: '#6f42c1'
    }).then(decision => {
      if (decision.isConfirmed) {
        Swal.fire({
          title: 'Publishing Report...',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });

        const data = serializeReportData();

        fetch('manage/publish_cell_report.php', {
          method: 'POST',
          body: data
        })
        .then(r => r.json())
        .then(res => {
          Swal.close();
          if (res.success) {
            Swal.fire({
              icon: 'success',
              title: 'Published!',
              text: res.message,
              confirmButtonColor: '#28a745'
            }).then(() => {
              window.location.href = 'cell-leader-dashboard.php';
            });
          } else {
            Swal.fire('Error', res.message, 'error');
          }
        })
        .catch(() => {
          Swal.close();
          Swal.fire('Error', 'A network error occurred while publishing.', 'error');
        });
      }
    });
  // Load and check members present in the selected meeting
  function loadMeetingAttendance(meetingId) {
    if (!meetingId) {
      return; // Do nothing if cleared
    }

    Swal.fire({
      title: 'Load Attendance?',
      text: 'Loading this meeting\'s attendance will override the current checkboxes with the attendance register from that meeting. Proceed?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Yes, Load',
      confirmButtonColor: '#6f42c1'
    }).then(decision => {
      if (decision.isConfirmed) {
        Swal.fire({
          title: 'Fetching attendance...',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });

        fetch(`manage/search_members_ajax.php?action=get_meeting_attendance&meeting_id=${meetingId}`)
        .then(r => r.json())
        .then(memberIds => {
          Swal.close();
          if (Array.isArray(memberIds)) {
            // Uncheck all first
            const boxes = document.querySelectorAll('.attendance-checkbox');
            boxes.forEach(b => b.checked = false);

            // Check matching members
            let count = 0;
            memberIds.forEach(id => {
              const box = document.querySelector(`.attendance-checkbox[value="${id}"]`);
              if (box) {
                box.checked = true;
                count++;
              }
            });

            Swal.fire({
              icon: 'success',
              title: 'Attendance Loaded!',
              text: `Successfully loaded and marked ${count} cell member(s) present.`,
              timer: 2000,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
          } else {
            Swal.fire('Error', 'Failed to fetch attendance data.', 'error');
          }
        })
        .catch(err => {
          Swal.close();
          console.error(err);
          Swal.fire('Error', 'Connection error occurred.', 'error');
        });
      }
    });
  }

  // Render on load
  document.addEventListener('DOMContentLoaded', () => {
    renderFirstTimers();
    renderPastoralCare();
  });
</script>
</body>
</html>

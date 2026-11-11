<?php
include('includes/checklogin.php');

$title = "Cell Management | Cell Attendance";
include("includes/get_user.php");

// ---------- Fetch all cells for dropdown ----------
$cells_stmt = $db->query("
    SELECT c.id, c.code, c.name,
           CONCAT(m.first_name,' ',m.last_name) AS leader_name
    FROM cells c
    LEFT JOIN member m ON m.id = c.cell_leader
    WHERE c.status = 1
    ORDER BY c.code ASC
");
$all_cells = $cells_stmt->fetchAll(PDO::FETCH_ASSOC);

// ---------- Fetch all meetings for dropdown ----------
$meetings_stmt = $db->query("
    SELECT m.id, m.name, m.start_time, m.end_time,
           mt.name AS meeting_type_name
    FROM meeting m
    LEFT JOIN meeting_types mt ON mt.id = m.meeting_type
    ORDER BY m.start_time DESC
");
$all_meetings = $meetings_stmt->fetchAll(PDO::FETCH_ASSOC);

// ---------- Selected filters ----------
$sel_cell    = isset($_GET['cell_id'])    ? intval($_GET['cell_id'])    : 0;
$sel_meeting = isset($_GET['meeting_id']) ? intval($_GET['meeting_id']) : 0;

$present_members = [];
$absent_members  = [];
$history         = [];
$cell_info       = null;
$meeting_info    = null;
$total_members   = 0;

if ($sel_cell && $sel_meeting) {

    // Cell info
    $ci = $db->prepare("
        SELECT c.id, c.code, c.name,
               CONCAT(m.first_name,' ',m.last_name) AS leader_name
        FROM cells c
        LEFT JOIN member m ON m.id = c.cell_leader
        WHERE c.id = :cid
    ");
    $ci->execute([':cid' => $sel_cell]);
    $cell_info = $ci->fetch(PDO::FETCH_ASSOC);

    // Meeting info — join meeting_types to get the type name safely
    $mi = $db->prepare("
        SELECT m.id, m.name, m.start_time, m.end_time,
               mt.name AS meeting_type_name
        FROM meeting m
        LEFT JOIN meeting_types mt ON mt.id = m.meeting_type
        WHERE m.id = :mid
    ");
    $mi->execute([':mid' => $sel_meeting]);
    $meeting_info = $mi->fetch(PDO::FETCH_ASSOC);

    // Present members
    $pstmt = $db->prepare("
        SELECT m.id, m.first_name, m.last_name, m.phone_no, m.email,
               a.login_time
        FROM member m
        INNER JOIN attendance a ON a.member_id = m.id AND a.meeting_id = :meeting_id
        WHERE m.cell_id = :cell_id
          AND (m.delete_status IS NULL OR m.delete_status = 'Active' OR m.delete_status = '0')
        ORDER BY m.first_name ASC
    ");
    $pstmt->execute([':meeting_id' => $sel_meeting, ':cell_id' => $sel_cell]);
    $present_members = $pstmt->fetchAll(PDO::FETCH_ASSOC);

    // Absent members
    $astmt = $db->prepare("
        SELECT m.id, m.first_name, m.last_name, m.phone_no, m.email
        FROM member m
        LEFT JOIN attendance a ON a.member_id = m.id AND a.meeting_id = :meeting_id
        WHERE m.cell_id = :cell_id
          AND a.id IS NULL
          AND (m.delete_status IS NULL OR m.delete_status = 'Active' OR m.delete_status = '0')
        ORDER BY m.first_name ASC
    ");
    $astmt->execute([':meeting_id' => $sel_meeting, ':cell_id' => $sel_cell]);
    $absent_members = $astmt->fetchAll(PDO::FETCH_ASSOC);

    $total_members = count($present_members) + count($absent_members);

    // Meeting history for this cell (last 10 meetings that have any attendance from this cell)
    $hstmt = $db->prepare("
        SELECT mt.id, mt.name, mt.start_time,
               COUNT(DISTINCT a.member_id) AS attended_count,
               (SELECT COUNT(*) FROM member WHERE cell_id = :cid2
                AND (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0')) AS cell_total
        FROM meeting mt
        INNER JOIN attendance a ON a.meeting_id = mt.id
        INNER JOIN member mem ON mem.id = a.member_id AND mem.cell_id = :cid3
        WHERE (mem.delete_status IS NULL OR mem.delete_status = 'Active' OR mem.delete_status = '0')
        GROUP BY mt.id, mt.name, mt.start_time
        ORDER BY mt.start_time DESC
        LIMIT 10
    ");
    $hstmt->execute([':cid2' => $sel_cell, ':cid3' => $sel_cell]);
    $history = $hstmt->fetchAll(PDO::FETCH_ASSOC);

} elseif ($sel_cell) {
    // Cell selected but no meeting — load history only
    $ci = $db->prepare("
        SELECT c.id, c.code, c.name,
               CONCAT(m.first_name,' ',m.last_name) AS leader_name
        FROM cells c
        LEFT JOIN member m ON m.id = c.cell_leader
        WHERE c.id = :cid
    ");
    $ci->execute([':cid' => $sel_cell]);
    $cell_info = $ci->fetch(PDO::FETCH_ASSOC);

    $hstmt = $db->prepare("
        SELECT mt.id, mt.name, mt.start_time,
               COUNT(DISTINCT a.member_id) AS attended_count,
               (SELECT COUNT(*) FROM member WHERE cell_id = :cid2
                AND (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0')) AS cell_total
        FROM meeting mt
        INNER JOIN attendance a ON a.meeting_id = mt.id
        INNER JOIN member mem ON mem.id = a.member_id AND mem.cell_id = :cid3
        WHERE (mem.delete_status IS NULL OR mem.delete_status = 'Active' OR mem.delete_status = '0')
        GROUP BY mt.id, mt.name, mt.start_time
        ORDER BY mt.start_time DESC
        LIMIT 10
    ");
    $hstmt->execute([':cid2' => $sel_cell, ':cid3' => $sel_cell]);
    $history = $hstmt->fetchAll(PDO::FETCH_ASSOC);
}

$attendance_pct = ($total_members > 0)
    ? round((count($present_members) / $total_members) * 100, 1)
    : 0;
?>
<!doctype html>
<html lang="en"
  class="layout-navbar-fixed layout-menu-fixed layout-compact"
  dir="ltr"
  data-skin="default"
  data-assets-path="assets/"
  data-template="vertical-menu-template"
  data-bs-theme="light">
<?php @include('includes/header.php'); ?>

<head>
  <style>
    :root {
      --jen-primary: #1a0533;
      --jen-accent:  #6f42c1;
      --jen-cyan:    #0ec2e6;
      --jen-success: #28a745;
      --jen-danger:  #dc3545;
    }

    .page-hero {
      background: linear-gradient(135deg, var(--jen-primary) 0%, #2d0a5e 60%, var(--jen-accent) 100%);
      padding: 28px 32px;
      border-radius: 16px;
      color: #fff;
      margin-bottom: 24px;
      box-shadow: 0 8px 30px rgba(26,5,51,0.35);
      position: relative;
      overflow: hidden;
    }
    .page-hero::before {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
    }
    .page-hero h4 { font-weight: 700; font-size: 1.5rem; margin-bottom: 4px; }
    .page-hero p  { opacity: 0.8; font-size: 0.9rem; margin: 0; }

    .filter-card {
      background: #fff;
      border-radius: 14px;
      padding: 22px 24px;
      box-shadow: 0 3px 16px rgba(0,0,0,0.07);
      margin-bottom: 24px;
    }

    .stat-card {
      border-radius: 14px;
      padding: 20px;
      text-align: center;
      border: none;
      box-shadow: 0 3px 14px rgba(0,0,0,0.07);
      transition: transform .25s;
    }
    .stat-card:hover { transform: translateY(-4px); }
    .stat-card .stat-num {
      font-size: 2.2rem;
      font-weight: 800;
      line-height: 1;
      display: block;
    }
    .stat-card .stat-lbl {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: .05em;
      color: #6c757d;
      margin-top: 4px;
    }
    .stat-card.primary  { background: linear-gradient(135deg,#6f42c1,#a06efc); color: #fff; }
    .stat-card.success  { background: linear-gradient(135deg,#28a745,#4fd97a); color: #fff; }
    .stat-card.danger   { background: linear-gradient(135deg,#dc3545,#f07584); color: #fff; }
    .stat-card.info     { background: linear-gradient(135deg,#0ec2e6,#43d9f5); color: #fff; }
    .stat-card .stat-lbl { color: rgba(255,255,255,0.85); }

    .member-avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem; color: #fff;
      flex-shrink: 0;
    }

    .history-list { list-style: none; padding: 0; margin: 0; }
    .history-list li {
      padding: 10px 14px;
      border-radius: 10px;
      cursor: pointer;
      transition: background .2s;
      border: 2px solid transparent;
      margin-bottom: 6px;
    }
    .history-list li:hover { background: #f0e8ff; }
    .history-list li.active { background: #ede0ff; border-color: var(--jen-accent); }
    .history-list .meet-name { font-weight: 600; font-size: 0.9rem; color: var(--jen-primary); }
    .history-list .meet-date { font-size: 0.78rem; color: #6c757d; }
    .history-list .meet-badge { font-size: 0.72rem; }

    .absent-row { background: rgba(220,53,69,0.04); }
    .present-row { background: rgba(40,167,69,0.04); }

    .btn-mark {
      font-size: 0.78rem;
      padding: 4px 12px;
      border-radius: 20px;
      transition: all .2s;
    }

    .attendance-progress {
      height: 10px;
      border-radius: 10px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 20px;
    }
    .empty-state i { font-size: 3rem; color: #d0c4f0; margin-bottom: 12px; display: block; }
    .empty-state h6 { color: #6c757d; }

    /* Tab nav pills style */
    .nav-pills-custom .nav-link {
      border-radius: 10px;
      color: var(--jen-primary);
      font-weight: 500;
    }
    .nav-pills-custom .nav-link.active {
      background: var(--jen-accent);
      color: #fff;
    }

    @keyframes fadeSlide {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fadeSlide .4s ease; }

    .spinner-overlay {
      position: absolute; inset: 0;
      background: rgba(255,255,255,.7);
      display: flex; align-items: center; justify-content: center;
      border-radius: 14px;
      z-index: 10;
    }
  </style>
</head>

<body>
<div class="layout-wrapper layout-content-navbar">
  <div class="layout-container">

    <?php @include('includes/sidebar.php'); ?>

    <div class="menu-mobile-toggler d-xl-none rounded-1">
      <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large text-bg-secondary p-2 rounded-1">
        <i class="bx bx-menu icon-base"></i>
        <i class="bx bx-chevron-right icon-base"></i>
      </a>
    </div>

    <div class="layout-page">
      <?php @include('includes/nav.php'); ?>

      <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">

          <!-- Page Hero -->
          <div class="page-hero fade-in">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h4><i class="bx bx-user-check me-2"></i>Cell Member Attendance</h4>
                <p>Track which cell members attended each meeting. Manually mark attendance for members who missed check-in.</p>
              </div>
              <?php if ($sel_cell && $sel_meeting && $cell_info && $meeting_info): ?>
              <div class="text-end">
                <span class="badge" style="background:rgba(255,255,255,0.15); font-size:.85rem; padding: 8px 14px;">
                  <?= htmlspecialchars($cell_info['code'] ?: 'Cell ' . $cell_info['id']) ?>
                  &nbsp;·&nbsp;
                  <?= htmlspecialchars($meeting_info['name']) ?>
                </span>
              </div>
              <?php endif; ?>
            </div>
          </div>

          <!-- Filter Card -->
          <div class="filter-card fade-in">
            <form method="GET" id="filterForm">
              <div class="row g-3 align-items-end">
                <div class="col-md-4">
                  <label class="form-label fw-semibold"><i class="bx bx-group me-1 text-primary"></i>Select Cell</label>
                  <select name="cell_id" id="cellSelect" class="form-select" onchange="this.form.submit()">
                    <option value="">-- Choose a Cell --</option>
                    <?php foreach ($all_cells as $c): ?>
                    <option value="<?= $c['id'] ?>" <?= $sel_cell == $c['id'] ? 'selected' : '' ?>>
                      <?= htmlspecialchars(($c['code'] ?: 'Cell '.$c['id']) . ' — ' . $c['leader_name']) ?>
                    </option>
                    <?php endforeach; ?>
                  </select>
                </div>
                <div class="col-md-5">
                  <label class="form-label fw-semibold"><i class="bx bx-calendar-event me-1 text-primary"></i>Select Meeting</label>
                  <select name="meeting_id" id="meetingSelect" class="form-select">
                    <option value="">-- Choose a Meeting --</option>
                    <?php foreach ($all_meetings as $m): ?>
                    <option value="<?= $m['id'] ?>" <?= $sel_meeting == $m['id'] ? 'selected' : '' ?>>
                      <?= htmlspecialchars($m['name'] . ' (' . date('M d, Y', strtotime($m['start_time'])) . ')') ?>
                    </option>
                    <?php endforeach; ?>
                  </select>
                </div>
                <div class="col-md-3">
                  <button type="submit" class="btn btn-primary w-100" style="background: linear-gradient(135deg,#6f42c1,#a06efc); border:none; border-radius:10px; padding: 10px;">
                    <i class="bx bx-search me-1"></i> View Attendance
                  </button>
                </div>
              </div>
            </form>
          </div>

          <?php if (!$sel_cell): ?>
          <!-- Empty state: no cell selected -->
          <div class="card border-0 shadow-sm" style="border-radius:14px;">
            <div class="card-body empty-state">
              <i class="bx bx-spreadsheet"></i>
              <h6>Select a cell and meeting above to view attendance</h6>
              <p class="text-muted small">You can also see which members need follow-up based on their attendance history.</p>
            </div>
          </div>

          <?php elseif ($sel_cell && !$sel_meeting): ?>
          <!-- Cell selected, no meeting — show history only -->
          <div class="row g-4">
            <div class="col-md-5">
              <div class="card border-0 shadow-sm" style="border-radius:14px;">
                <div class="card-header border-0 pt-4 pb-0 px-4">
                  <h6 class="fw-bold mb-0">
                    <i class="bx bx-history me-2 text-primary"></i>
                    <?= htmlspecialchars(($cell_info['code'] ?: 'Cell') . ' — Meeting History') ?>
                  </h6>
                  <small class="text-muted">Last 10 meetings with attendance data</small>
                </div>
                <div class="card-body px-4">
                  <?php if (empty($history)): ?>
                  <div class="empty-state">
                    <i class="bx bx-calendar-x" style="font-size:2rem; color:#d0c4f0;"></i>
                    <p class="text-muted small mt-2">No attendance data recorded yet for this cell.</p>
                  </div>
                  <?php else: ?>
                  <ul class="history-list">
                    <?php foreach ($history as $h):
                      $pct = $h['cell_total'] > 0 ? round(($h['attended_count'] / $h['cell_total']) * 100) : 0;
                      $cl  = $pct >= 75 ? 'success' : ($pct >= 50 ? 'warning' : 'danger');
                    ?>
                    <li onclick="goToMeeting(<?= $h['id'] ?>)">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <div class="meet-name"><?= htmlspecialchars($h['name']) ?></div>
                          <div class="meet-date"><?= date('D, M d Y', strtotime($h['start_time'])) ?></div>
                        </div>
                        <span class="badge bg-<?= $cl ?> meet-badge"><?= $h['attended_count'] ?>/<?= $h['cell_total'] ?></span>
                      </div>
                    </li>
                    <?php endforeach; ?>
                  </ul>
                  <?php endif; ?>
                </div>
              </div>
            </div>
            <div class="col-md-7">
              <div class="card border-0 shadow-sm" style="border-radius:14px;">
                <div class="card-body empty-state">
                  <i class="bx bx-calendar-check"></i>
                  <h6>Now select a meeting to view attendance details</h6>
                </div>
              </div>
            </div>
          </div>

          <?php else: ?>
          <!-- Both cell and meeting selected — full view -->

          <!-- Stats Row -->
          <div class="row g-3 mb-4 fade-in">
            <div class="col-6 col-md-3">
              <div class="stat-card primary">
                <span class="stat-num"><?= $total_members ?></span>
                <div class="stat-lbl">Cell Members</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat-card success">
                <span class="stat-num"><?= count($present_members) ?></span>
                <div class="stat-lbl">Present</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat-card danger">
                <span class="stat-num"><?= count($absent_members) ?></span>
                <div class="stat-lbl">Absent</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat-card info">
                <span class="stat-num"><?= $attendance_pct ?>%</span>
                <div class="stat-lbl">Attendance Rate</div>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <?php if ($total_members > 0): ?>
          <div class="mb-4 fade-in">
            <div class="d-flex justify-content-between mb-1 small text-muted">
              <span>Attendance Progress</span>
              <span><?= count($present_members) ?> of <?= $total_members ?> members</span>
            </div>
            <div class="progress attendance-progress">
              <div class="progress-bar"
                   style="width:<?= $attendance_pct ?>%;
                          background: linear-gradient(90deg, #6f42c1, #0ec2e6);"
                   role="progressbar">
              </div>
            </div>
          </div>
          <?php endif; ?>

          <div class="row g-4 fade-in">
            <!-- Main attendance panel -->
            <div class="col-lg-8">
              <div class="card border-0 shadow-sm" style="border-radius:14px;">
                <div class="card-header border-0 pt-4 pb-0 px-4">
                  <!-- Tabs -->
                  <ul class="nav nav-pills nav-pills-custom gap-2" id="attendanceTabs">
                    <li class="nav-item">
                      <a class="nav-link active px-4" data-bs-toggle="pill" href="#presentTab">
                        <i class="bx bx-check-circle me-1"></i>Present
                        <span class="badge rounded-pill ms-1" style="background:rgba(40,167,69,0.2);color:#28a745;">
                          <?= count($present_members) ?>
                        </span>
                      </a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link px-4" data-bs-toggle="pill" href="#absentTab">
                        <i class="bx bx-x-circle me-1"></i>Absent
                        <span class="badge rounded-pill ms-1" style="background:rgba(220,53,69,0.2);color:#dc3545;">
                          <?= count($absent_members) ?>
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>

                <div class="card-body px-4 pt-3">
                  <div class="tab-content">

                    <!-- PRESENT TAB -->
                    <div class="tab-pane fade show active" id="presentTab">
                      <?php if (empty($present_members)): ?>
                      <div class="empty-state">
                        <i class="bx bx-user-x"></i>
                        <h6>No cell members attended this meeting</h6>
                        <p class="text-muted small">Members check in via the <strong>attend-meet</strong> page using their phone number.</p>
                      </div>
                      <?php else: ?>
                      <div class="table-responsive">
                        <table class="table table-hover align-middle" id="presentTable">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Member</th>
                              <th>Contact</th>
                              <th>Check-in Time</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            <?php foreach ($present_members as $i => $row):
                              $color = '#' . substr(md5($row['id']), 0, 6);
                              $initial = strtoupper(substr($row['first_name'], 0, 1));
                            ?>
                            <tr class="present-row" id="row-<?= $row['id'] ?>">
                              <td><?= $i + 1 ?></td>
                              <td>
                                <div class="d-flex align-items-center gap-2">
                                  <div class="member-avatar" style="background:<?= $color ?>;"><?= $initial ?></div>
                                  <div>
                                    <div class="fw-semibold"><?= htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) ?></div>
                                    <small class="text-muted"><?= htmlspecialchars($row['email'] ?? '') ?></small>
                                  </div>
                                </div>
                              </td>
                              <td><?= htmlspecialchars($row['phone_no']) ?></td>
                              <td>
                                <span class="badge bg-success-subtle text-success">
                                  <i class="bx bx-time-five me-1"></i>
                                  <?= date('M d, Y h:i A', strtotime($row['login_time'])) ?>
                                </span>
                              </td>
                              <td>
                                <button class="btn btn-outline-danger btn-mark"
                                        onclick="markAttendance(<?= $row['id'] ?>, <?= $sel_meeting ?>, 'unmark', this)">
                                  <i class="bx bx-user-minus me-1"></i>Mark Absent
                                </button>
                              </td>
                            </tr>
                            <?php endforeach; ?>
                          </tbody>
                        </table>
                      </div>
                      <?php endif; ?>
                    </div>

                    <!-- ABSENT TAB -->
                    <div class="tab-pane fade" id="absentTab">
                      <?php if (empty($absent_members)): ?>
                      <div class="empty-state">
                        <i class="bx bx-party"></i>
                        <h6 class="text-success">All cell members attended this meeting!</h6>
                        <p class="text-muted small">Excellent attendance for this session.</p>
                      </div>
                      <?php else: ?>
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <small class="text-muted"><?= count($absent_members) ?> member(s) absent — click "Mark Present" to manually add their attendance.</small>
                        <button class="btn btn-sm btn-outline-success" onclick="markAllPresent()">
                          <i class="bx bx-check-double me-1"></i>Mark All Present
                        </button>
                      </div>
                      <div class="table-responsive">
                        <table class="table table-hover align-middle" id="absentTable">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Member</th>
                              <th>Contact</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody id="absentTbody">
                            <?php foreach ($absent_members as $i => $row):
                              $color = '#' . substr(md5($row['id']), 0, 6);
                              $initial = strtoupper(substr($row['first_name'], 0, 1));
                            ?>
                            <tr class="absent-row" id="absent-row-<?= $row['id'] ?>">
                              <td><?= $i + 1 ?></td>
                              <td>
                                <div class="d-flex align-items-center gap-2">
                                  <div class="member-avatar" style="background:<?= $color ?>;"><?= $initial ?></div>
                                  <div>
                                    <div class="fw-semibold"><?= htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) ?></div>
                                    <small class="text-muted"><?= htmlspecialchars($row['email'] ?? '') ?></small>
                                  </div>
                                </div>
                              </td>
                              <td><?= htmlspecialchars($row['phone_no']) ?></td>
                              <td>
                                <button class="btn btn-outline-success btn-mark absent-mark-btn"
                                        data-member-id="<?= $row['id'] ?>"
                                        onclick="markAttendance(<?= $row['id'] ?>, <?= $sel_meeting ?>, 'mark', this)">
                                  <i class="bx bx-user-plus me-1"></i>Mark Present
                                </button>
                              </td>
                            </tr>
                            <?php endforeach; ?>
                          </tbody>
                        </table>
                      </div>
                      <?php endif; ?>
                    </div>

                  </div><!-- /tab-content -->
                </div>
              </div>
            </div>

            <!-- History sidebar -->
            <div class="col-lg-4">
              <div class="card border-0 shadow-sm" style="border-radius:14px;">
                <div class="card-header border-0 pt-4 pb-0 px-4">
                  <h6 class="fw-bold mb-0">
                    <i class="bx bx-history me-2 text-primary"></i>Meeting History
                  </h6>
                  <small class="text-muted">This cell's last 10 meetings</small>
                </div>
                <div class="card-body px-3 py-3">
                  <?php if (empty($history)): ?>
                  <div class="empty-state py-4">
                    <i class="bx bx-calendar-x" style="font-size:1.8rem;color:#d0c4f0;"></i>
                    <p class="text-muted small mt-2">No history yet</p>
                  </div>
                  <?php else: ?>
                  <ul class="history-list">
                    <?php foreach ($history as $h):
                      $pct = $h['cell_total'] > 0 ? round(($h['attended_count'] / $h['cell_total']) * 100) : 0;
                      $cl  = $pct >= 75 ? 'success' : ($pct >= 50 ? 'warning' : 'danger');
                      $isActive = ($h['id'] == $sel_meeting) ? 'active' : '';
                    ?>
                    <li class="<?= $isActive ?>" onclick="goToMeeting(<?= $h['id'] ?>)">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <div class="meet-name"><?= htmlspecialchars($h['name']) ?></div>
                          <div class="meet-date"><?= date('D, M d Y', strtotime($h['start_time'])) ?></div>
                          <div class="progress mt-1" style="height:4px;width:100px;">
                            <div class="progress-bar bg-<?= $cl ?>" style="width:<?= $pct ?>%;"></div>
                          </div>
                        </div>
                        <span class="badge bg-<?= $cl ?> meet-badge ms-2"><?= $pct ?>%</span>
                      </div>
                    </li>
                    <?php endforeach; ?>
                  </ul>
                  <?php endif; ?>
                </div>
              </div>

              <!-- Meeting info card -->
              <?php if ($meeting_info): ?>
              <div class="card border-0 shadow-sm mt-4" style="border-radius:14px; background: linear-gradient(135deg,#f4f0ff,#eaf6ff);">
                <div class="card-body p-4">
                  <h6 class="fw-bold text-primary mb-3"><i class="bx bx-info-circle me-1"></i>Meeting Info</h6>
                  <div class="mb-2">
                    <span class="text-muted small d-block">Meeting Name</span>
                    <strong><?= htmlspecialchars($meeting_info['name']) ?></strong>
                  </div>
                  <div class="mb-2">
                    <span class="text-muted small d-block">Start Time</span>
                    <strong><?= date('D, M d Y h:i A', strtotime($meeting_info['start_time'])) ?></strong>
                  </div>
                  <div class="mb-2">
                    <span class="text-muted small d-block">End Time</span>
                    <strong><?= date('D, M d Y h:i A', strtotime($meeting_info['end_time'])) ?></strong>
                  </div>
                  <?php if (!empty($meeting_info['meeting_type_name'])): ?>
                  <div>
                    <span class="text-muted small d-block">Type</span>
                    <span class="badge bg-primary-subtle text-primary"><?= htmlspecialchars($meeting_info['meeting_type_name']) ?></span>
                  </div>
                  <?php endif; ?>
                </div>
              </div>
              <?php endif; ?>
            </div>

          </div><!-- /row -->
          <?php endif; ?>

        </div><!-- /container -->

        <?php include("includes/footer.php"); ?>
        <div class="content-backdrop fade"></div>
      </div>
    </div>
  </div>
  <div class="drag-target"></div>
</div>

<?php include('includes/scripts.html'); ?>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
  const CELL_ID    = <?= (int)$sel_cell ?>;
  const MEETING_ID = <?= (int)$sel_meeting ?>;

  // Navigate to a different meeting (keeps the same cell)
  function goToMeeting(meetingId) {
    window.location.href = 'cell_attendance.php?cell_id=' + CELL_ID + '&meeting_id=' + meetingId;
  }

  // Mark / unmark a single member
  function markAttendance(memberId, meetingId, action, btn) {
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    fetch('manage/mark_cell_attendance.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `action=${action}&member_id=${memberId}&meeting_id=${meetingId}`
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: action === 'mark' ? 'Marked Present!' : 'Marked Absent!',
          text: data.message,
          timer: 1800,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        // Reload to refresh counts & tables
        setTimeout(() => window.location.reload(), 1200);
      } else {
        Swal.fire('Error', data.message, 'error');
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    })
    .catch(() => {
      Swal.fire('Error', 'Network error occurred', 'error');
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    });
  }

  // Mark ALL absent members as present
  function markAllPresent() {
    const buttons = document.querySelectorAll('.absent-mark-btn');
    if (buttons.length === 0) return;

    Swal.fire({
      title: 'Mark All Absent as Present?',
      text: `This will add attendance records for all ${buttons.length} absent member(s).`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, mark all present',
      confirmButtonColor: '#28a745'
    }).then(result => {
      if (result.isConfirmed) {
        buttons.forEach(btn => {
          const mid = btn.getAttribute('data-member-id');
          markAttendance(parseInt(mid), MEETING_ID, 'mark', btn);
        });
      }
    });
  }

  // Init DataTables
  $(document).ready(function() {
    if ($('#presentTable').length) {
      $('#presentTable').DataTable({
        paging: true, searching: true, ordering: true,
        info: true, lengthChange: false, pageLength: 15
      });
    }
    if ($('#absentTable').length) {
      $('#absentTable').DataTable({
        paging: false, searching: true, ordering: true,
        info: false, lengthChange: false
      });
    }
  });
</script>
</body>
</html>

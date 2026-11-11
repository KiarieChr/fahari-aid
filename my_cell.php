<?php
include('includes/checklogin.php');

$title = "Cell Management | My Cell";
include("includes/get_user.php");

// ── Fallback to logged-in user if id is not passed ────────────────────────────
$target_user_id = isset($_GET['id']) ? intval($_GET['id']) : $user_id;

$cell = null;
$cell_leader = null;
$members = [];
$is_assigned = false;

if ($target_user_id) {
    // 1. Get the cell_id for the user via member table
    $stmt = $db->prepare("
        SELECT m.cell_id 
        FROM member m 
        JOIN users u ON m.id = u.member_id 
        WHERE u.id = :user_id
    ");
    $stmt->execute([':user_id' => $target_user_id]);
    $user_member_info = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user_member_info && !empty($user_member_info['cell_id'])) {
        $cell_id = $user_member_info['cell_id'];

        // 2. Fetch cell details and leader details
        $stmt_cell = $db->prepare("
            SELECT c.id, c.code, c.name, c.status, c.meeting_day, c.meeting_time, c.location,
                   m.id AS leader_member_id, m.first_name AS leader_first, m.last_name AS leader_last,
                   m.phone_no AS leader_phone, m.email AS leader_email
            FROM cells c
            LEFT JOIN member m ON c.cell_leader = m.id
            WHERE c.id = :cell_id
        ");
        $stmt_cell->execute([':cell_id' => $cell_id]);
        $cell = $stmt_cell->fetch(PDO::FETCH_ASSOC);

        if ($cell) {
            $is_assigned = true;

            // 3. Fetch cell members and their discipleship stage
            $stmt_members = $db->prepare("
                SELECT m.id, m.first_name, m.last_name, m.phone_no, m.email, m.location,
                       cd.stage as dc_stage, cd.id as dc_id
                FROM member m
                LEFT JOIN cell_disciples cd ON m.id = cd.member_id AND cd.status = 'active'
                WHERE m.cell_id = :cell_id
                  AND (m.delete_status IS NULL OR m.delete_status = 'Active' OR m.delete_status = '0')
                ORDER BY m.first_name ASC
            ");
            $stmt_members->execute([':cell_id' => $cell_id]);
            $members = $stmt_members->fetchAll(PDO::FETCH_ASSOC);

            // 4. Fetch Stats
            // Souls won (sum of salvations from published reports)
            $souls_stmt = $db->prepare("SELECT SUM(salvations) as total FROM cell_reports WHERE cell_id = :cid AND status = 'published'");
            $souls_stmt->execute([':cid' => $cell_id]);
            $total_souls = intval($souls_stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

            // First timers
            $ft_count_stmt = $db->prepare("
                SELECT COUNT(ft.id) as total 
                FROM cell_report_first_timers ft
                JOIN cell_reports r ON ft.report_id = r.id
                WHERE r.cell_id = :cid AND r.status = 'published'
            ");
            $ft_count_stmt->execute([':cid' => $cell_id]);
            $total_first_timers = intval($ft_count_stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

            // Average attendance
            $avg_stmt = $db->prepare("SELECT AVG(total_attendance) as avg_att FROM cell_reports WHERE cell_id = :cid AND status = 'published'");
            $avg_stmt->execute([':cid' => $cell_id]);
            $avg_att = round(floatval($avg_stmt->fetch(PDO::FETCH_ASSOC)['avg_att'] ?? 0), 1);
            
            // Calculate next fellowship date
            $next_meeting_date = 'Not Scheduled';
            if (!empty($cell['meeting_day'])) {
                $meeting_day = trim($cell['meeting_day']);
                $next_ts = strtotime("next " . $meeting_day);
                if (date('l') === $meeting_day) {
                    $meeting_time = $cell['meeting_time'] ?? '00:00:00';
                    if (time() < strtotime(date('Y-m-d') . ' ' . $meeting_time)) {
                        $next_ts = strtotime('today');
                    }
                }
                $next_meeting_date = date('l, F j, Y', $next_ts);
            }
        }
    }
}

$member_count = count($members);
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
      --c-primary : #1a0533;
      --c-accent  : #6f42c1;
      --c-cyan    : #0ec2e6;
      --c-success : #28a745;
      --c-warning : #ffc107;
    }

    /* ── Hero Banner ───────────────── */
    .page-hero {
      background: linear-gradient(135deg, var(--c-primary) 0%, #2d0a5e 55%, var(--c-accent) 100%);
      padding: 30px 32px;
      border-radius: 16px;
      color: #fff;
      margin-bottom: 28px;
      box-shadow: 0 8px 32px rgba(26,5,51,.3);
      position: relative; overflow: hidden;
    }
    .page-hero::before {
      content:''; position:absolute; top:-50px; right:-50px;
      width:220px; height:220px; border-radius:50%;
      background:rgba(255,255,255,.05);
    }
    .page-hero h4 { font-weight:700; font-size:1.5rem; margin-bottom: 4px; }
    .page-hero p  { opacity:.8; font-size:.9rem; margin:0; }

    /* ── Mini stats ────────────────── */
    .mini-stat {
      border-radius: 14px; padding: 18px 20px;
      border: none; box-shadow: 0 4px 18px rgba(0,0,0,.06);
      display: flex; align-items: center; gap: 14px;
      background: #fff;
      transition: transform .22s;
    }
    .mini-stat:hover { transform: translateY(-3px); }
    .mini-stat .ms-icon {
      width: 46px; height: 46px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; flex-shrink: 0;
    }
    .mini-stat .ms-num  { font-size: 1.6rem; font-weight: 800; line-height: 1; color: var(--c-primary); }
    .mini-stat .ms-lbl  { font-size: .75rem; text-transform: uppercase;
                          letter-spacing:.05em; color: #8a7baa; margin-top:2px; }

    /* ── Details / Info Card ───────── */
    .info-card {
      border-radius: 16px; border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,.06);
      overflow: hidden;
    }
    .info-card .ic-header {
      background: linear-gradient(135deg, #f5f0ff, #eef7ff);
      padding: 22px 24px; border-bottom: 1px solid #ede0ff;
    }
    .leader-avatar-lg {
      width: 64px; height: 64px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; font-weight: 800; color: #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
    }

    /* ── Table Card ────────────────── */
    .table-card {
      border-radius: 16px; border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,.06);
      overflow: hidden;
    }
    .table-card .card-header {
      background: #fff; border-bottom: 1px solid #f0eaf8;
      padding: 20px 24px;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
    }
    .table-card .card-header h6 { font-weight: 700; color: var(--c-primary); margin: 0; }

    /* ── Member avatar ─────────────── */
    .m-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: .9rem; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    /* ── Empty state ───────────────── */
    .unassigned-box {
      background: linear-gradient(135deg, #fff9f5, #fff5f5);
      border-radius: 16px; padding: 60px 32px;
      text-align: center; border: 2px dashed #fcd2c2;
      box-shadow: 0 4px 20px rgba(0,0,0,.04);
    }
    .unassigned-box i { font-size: 4rem; color: #fda085; display: block; margin-bottom: 16px; }
    .unassigned-box h5 { color: #d35400; font-weight: 700; }
    .unassigned-box p { color: #7f8c8d; font-size: .95rem; margin-bottom: 0; }

    /* ── Details list ──────────────── */
    .detail-item {
      display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px;
    }
    .detail-item i { font-size: 1.15rem; color: var(--c-accent); margin-top: 2px; }
    .detail-item div label { font-size: .75rem; color: #8a7baa; display: block; margin-bottom: 1px; font-weight: 600; text-uppercase; }
    .detail-item div span { font-size: .9rem; color: var(--c-primary); font-weight: 550; }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(12px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .fade-up { animation: fadeUp .45s ease both; }
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
      <?php @include('modals/user-forms.php'); ?>

      <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">

          <!-- ── Page Hero ── -->
          <div class="card glass-card mb-4 border-0 shadow-xs p-4 fade-up" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
            <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div class="d-flex align-items-center gap-3">
                <div class="avatar avatar-md bg-gradient-warning rounded text-white d-flex align-items-center justify-content-center shadow-xs" style="width: 50px; height: 50px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                  <i class="bx bx-home-heart fs-3"></i>
                </div>
                <div>
                  <?php if ($is_assigned): ?>
                  <h4 class="mb-1 fw-bold text-heading" style="color: #1e1b4b; font-size: 1.5rem;">My Cell &mdash; <?= htmlspecialchars($cell['code']) ?></h4>
                  <p class="text-muted mb-0 small" style="font-size: 0.88rem;">Welcome to your cell group homepage. View fellow cell members and leader information.</p>
                  <?php else: ?>
                  <h4 class="mb-1 fw-bold text-heading" style="color: #1e1b4b; font-size: 1.5rem;">My Cell Fellowship Group</h4>
                  <p class="text-muted mb-0 small" style="font-size: 0.88rem;">Fellowship strengthens faith. Connect with your local cell members and cell leaders.</p>
                  <?php endif; ?>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <a href="cells.php" class="btn btn-sm btn-outline-primary px-3 py-2 rounded-pill fw-semibold">
                  <i class="bx bx-list-ul me-1"></i> Cell Directory
                </a>
              </div>
            </div>
          </div>

          <?php if (!$is_assigned): ?>
          <!-- ── Unassigned State ── -->
          <div class="unassigned-box fade-up">
            <i class="bx bx-user-voice"></i>
            <h5>Not Assigned to a Cell Group Yet</h5>
            <p>It seems you are not assigned to any cell group currently. Please reach out to your cell ministry director to get linked.</p>
          </div>

          <?php else: ?>

          <!-- ── Mini Stats row ── -->
          <div class="row g-3 mb-4 fade-up">
            <div class="col-6 col-md-3">
              <div class="card glass-card border-0 shadow-xs p-3 d-flex flex-row align-items-center justify-content-between" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 12px; transition: transform 0.2s;">
                <div>
                  <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">Cell Members</small>
                  <h4 class="mb-0 fw-bold mt-1" style="color: #1e1b4b; font-size: 1.4rem;"><?= $member_count ?></h4>
                </div>
                <div class="avatar avatar-sm rounded text-primary d-flex align-items-center justify-content-center" style="background: rgba(111, 66, 193, 0.12); width: 38px; height: 38px;">
                  <i class="bx bx-group fs-5"></i>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card glass-card border-0 shadow-xs p-3 d-flex flex-row align-items-center justify-content-between" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 12px; transition: transform 0.2s;">
                <div>
                  <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">Avg Attendance</small>
                  <h4 class="mb-0 fw-bold mt-1" style="color: #1e1b4b; font-size: 1.4rem;"><?= $avg_att ?></h4>
                </div>
                <div class="avatar avatar-sm rounded text-info d-flex align-items-center justify-content-center" style="background: rgba(3, 195, 236, 0.12); width: 38px; height: 38px;">
                  <i class="bx bx-line-chart fs-5"></i>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card glass-card border-0 shadow-xs p-3 d-flex flex-row align-items-center justify-content-between" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 12px; transition: transform 0.2s;">
                <div>
                  <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">First Timers</small>
                  <h4 class="mb-0 fw-bold mt-1" style="color: #1e1b4b; font-size: 1.4rem;"><?= $total_first_timers ?></h4>
                </div>
                <div class="avatar avatar-sm rounded text-success d-flex align-items-center justify-content-center" style="background: rgba(40, 167, 69, 0.12); width: 38px; height: 38px;">
                  <i class="bx bx-user-plus fs-5"></i>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card glass-card border-0 shadow-xs p-3 d-flex flex-row align-items-center justify-content-between" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 12px; transition: transform 0.2s;">
                <div>
                  <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">Souls Won</small>
                  <h4 class="mb-0 fw-bold mt-1" style="color: #1e1b4b; font-size: 1.4rem;"><?= $total_souls ?></h4>
                </div>
                <div class="avatar avatar-sm rounded text-warning d-flex align-items-center justify-content-center" style="background: rgba(255, 193, 7, 0.15); width: 38px; height: 38px;">
                  <i class="bx bx-star fs-5"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Two Column Content Grid -->
          <div class="row g-4 fade-up">
            <!-- Left Side Column -->
            <div class="col-lg-4">
              <!-- Cell Details Card -->
              <div class="card info-card mb-4 border-0 shadow-xs" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                <div class="ic-header border-bottom border-light-subtle p-4">
                  <h5 class="card-title mb-0 fw-bold text-heading" style="color: #1e1b4b;"><i class="bx bx-purchase-tag me-2 text-primary"></i>Cell Details</h5>
                </div>
                <div class="card-body p-4">
                  <div class="detail-item mb-3 d-flex align-items-start gap-2">
                    <i class="bx bx-home text-accent fs-4 mt-1"></i>
                    <div>
                      <small class="text-muted d-block text-uppercase fw-semibold" style="font-size: 0.7rem;">Cell Name</small>
                      <span class="fw-semibold" style="color: #1e1b4b;"><?= htmlspecialchars($cell['name'] ?: 'Unnamed Cell'); ?></span>
                    </div>
                  </div>
                  <div class="detail-item mb-3 d-flex align-items-start gap-2">
                    <i class="bx bx-map text-accent fs-4 mt-1"></i>
                    <div>
                      <small class="text-muted d-block text-uppercase fw-semibold" style="font-size: 0.7rem;">Meeting Center</small>
                      <span class="fw-semibold" style="color: #1e1b4b;"><?= htmlspecialchars($cell['location'] ?: 'Not Provided'); ?></span>
                    </div>
                  </div>
                  <div class="detail-item mb-3 d-flex align-items-start gap-2">
                    <i class="bx bx-calendar-event text-accent fs-4 mt-1"></i>
                    <div>
                      <small class="text-muted d-block text-uppercase fw-semibold" style="font-size: 0.7rem;">Meeting Schedule</small>
                      <span class="fw-semibold" style="color: #1e1b4b;">
                        <?= $cell['meeting_day'] ? htmlspecialchars($cell['meeting_day']) : 'Not Set' ?> at 
                        <?= $cell['meeting_time'] ? date('h:i A', strtotime($cell['meeting_time'])) : 'Not Set' ?>
                      </span>
                    </div>
                  </div>
                  
                  <!-- Dynamic Next Fellowship Meeting Widget -->
                  <div class="p-3 mt-4 rounded-3 border border-dashed border-primary" style="background: rgba(111, 66, 193, 0.04);">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <i class="bx bx-timer text-primary fs-4"></i>
                      <span class="fw-bold small text-primary text-uppercase" style="letter-spacing: 0.05em;">Next Fellowship Meeting</span>
                    </div>
                    <div class="fw-semibold text-heading mb-1" style="color: #1e1b4b; font-size: 0.95rem;">
                      <?= $next_meeting_date; ?>
                    </div>
                    <small class="text-muted">Join your cell group members at the designated meeting center.</small>
                  </div>
                </div>
              </div>

              <!-- Cell Leader Profile Card -->
              <?php if ($cell['leader_first']): 
                  $lcolor = '#' . substr(md5($cell['leader_member_id']), 0, 6);
                  $linitial = strtoupper(substr($cell['leader_first'], 0, 1));
              ?>
              <div class="card info-card border-0 shadow-xs" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                <div class="ic-header border-bottom border-light-subtle p-4">
                  <h5 class="card-title mb-0 fw-bold text-heading" style="color: #1e1b4b;"><i class="bx bx-user me-2 text-primary"></i>Cell Leader</h5>
                </div>
                <div class="card-body p-4 text-center">
                  <div class="d-flex flex-column align-items-center mb-3">
                    <div class="leader-avatar-lg mb-2 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style="width: 70px; height: 70px; border-radius: 50%; font-size: 1.8rem; background: <?= $lcolor ?>;">
                      <?= $linitial ?>
                    </div>
                    <h6 class="fw-bold mb-1" style="color: #1e1b4b; font-size: 1.05rem;"><?= htmlspecialchars($cell['leader_first'] . ' ' . $cell['leader_last']) ?></h6>
                    <span class="badge bg-label-success px-3 py-1 rounded-pill fw-semibold" style="font-size: 0.75rem; background-color: rgba(40, 167, 69, 0.12); color: #28a745;">
                      <i class="bx bx-crown me-1"></i>Cell Leader
                    </span>
                  </div>
                  
                  <div class="text-start mt-4 pt-2 border-top border-light-subtle">
                    <?php if ($cell['leader_phone']): ?>
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <i class="bx bx-phone text-muted fs-5"></i>
                      <span class="small text-muted"><?= htmlspecialchars($cell['leader_phone']) ?></span>
                      <a href="tel:<?= htmlspecialchars($cell['leader_phone']) ?>" class="btn btn-xs btn-outline-primary ms-auto py-1 px-2 rounded-2">Call</a>
                    </div>
                    <?php endif; ?>
                    <?php if ($cell['leader_email']): ?>
                    <div class="d-flex align-items-center gap-2">
                      <i class="bx bx-envelope text-muted fs-5"></i>
                      <span class="small text-muted text-truncate" style="max-width: 160px;"><?= htmlspecialchars($cell['leader_email']) ?></span>
                      <a href="mailto:<?= htmlspecialchars($cell['leader_email']) ?>" class="btn btn-xs btn-outline-primary ms-auto py-1 px-2 rounded-2">Email</a>
                    </div>
                    <?php endif; ?>
                  </div>
                </div>
              </div>
              <?php endif; ?>
            </div>

            <!-- Right Side Column: Members List & Discipleship -->
            <div class="col-lg-8">
              <div class="nav-align-top mb-4">
                <ul class="nav nav-tabs nav-tabs-custom mb-3 border-bottom" role="tablist">
                  <li class="nav-item">
                    <button type="button" class="nav-link active" role="tab" data-bs-toggle="tab" data-bs-target="#navs-members" aria-controls="navs-members" aria-selected="true" style="border:none; border-bottom: 2px solid transparent; color: #696cff; font-weight: 600; background: transparent;">
                      <i class="bx bx-group me-1"></i> Cell Members
                    </button>
                  </li>
                  <li class="nav-item">
                    <button type="button" class="nav-link" role="tab" data-bs-toggle="tab" data-bs-target="#navs-discipleship" aria-controls="navs-discipleship" aria-selected="false" style="border:none; border-bottom: 2px solid transparent; color: #6b7280; font-weight: 600; background: transparent;">
                      <i class="bx bx-walk me-1"></i> Discipleship Tracking
                    </button>
                  </li>
                </ul>

                <div class="tab-content p-0 shadow-none border-0 bg-transparent">
                  <!-- Tab 1: Cell Members -->
                  <div class="tab-pane fade show active" id="navs-members" role="tabpanel">
                    <div class="card table-card border-0 shadow-xs" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                      <div class="card-header border-bottom border-light-subtle d-flex justify-content-between align-items-center p-4">
                        <h5 class="card-title mb-0 fw-bold text-heading" style="color: #1e1b4b;">Cell Members List</h5>
                        <span class="badge bg-label-primary px-3 py-2 rounded-pill fw-semibold" style="background-color: rgba(102, 126, 234, 0.15); color: #667eea;"><?= $member_count; ?> Members</span>
                      </div>
                      <div class="card-body p-4">
                        <div class="table-responsive custom-scrollbar" style="border-radius: 8px;">
                          <table class="table table-hover align-middle w-100" id="membersTable">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Member</th>
                                <th>Contact</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <?php if (!empty($members)): ?>
                              <?php foreach ($members as $index => $row): 
                                $mid = $row['id'];
                                $name = $row['first_name'] . " " . $row['last_name'];
                                $phone = $row['phone_no'];
                                $email = $row['email'];
                                $acolor = '#' . substr(md5($mid), 0, 6);
                                $initial = strtoupper(substr($row['first_name'], 0, 1));
                              ?>
                              <tr>
                                <td><?= $index + 1; ?></td>
                                <td>
                                  <div class="d-flex align-items-center">
                                    <div class="avatar avatar-sm me-3" style="width: 32px; height: 32px;">
                                      <span class="avatar-initial rounded-circle text-white d-flex align-items-center justify-content-center fw-semibold" style="font-size: 0.85rem; background-color: <?= $acolor ?>;">
                                        <?= $initial; ?>
                                      </span>
                                    </div>
                                    <div>
                                      <h6 class="mb-0 fw-semibold text-heading" style="font-size: 0.92rem; color: #1e1b4b;"><?= htmlspecialchars($name); ?></h6>
                                    </div>
                                  </div>
                                </td>
                                <td><span class="text-muted small"><?= $phone ? htmlspecialchars($phone) : '—'; ?></span></td>
                                <td><span class="text-muted small"><?= $email ? htmlspecialchars($email) : '—'; ?></span></td>
                                <td>
                                  <span class="badge bg-label-success px-2 py-1 rounded-pill fw-semibold" style="font-size: 0.75rem; background-color: rgba(40, 167, 69, 0.12) !important; color: #28a745 !important;">Active</span>
                                </td>
                                <td>
                                  <div class="dropdown">
                                    <button type="button" class="btn btn-sm btn-outline-secondary btn-icon-only border-0" data-bs-toggle="dropdown" style="width: 28px; height: 28px; padding: 0;">
                                      <i class="bx bx-dots-vertical-rounded"></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-end">
                                      <?php if (userHasPermission($db, $user_id, 'edit_member')): ?>
                                      <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#editMember-<?= $mid; ?>">
                                        <i class="bx bx-edit me-2"></i>Edit Member Info
                                      </a>
                                      <?php endif; ?>
                                      <a class="dropdown-item" href="assign_cell.php?cid=<?= $cell_id ?>">
                                        <i class="bx bx-transfer-alt me-2"></i>Reassign / Remove
                                      </a>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              <?php 
                                @include('modals/edit-user.php'); 
                              endforeach; ?>
                              <?php endif; ?>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Tab 2: Discipleship Tracking -->
                  <div class="tab-pane fade" id="navs-discipleship" role="tabpanel">
                    <div class="card table-card border-0 shadow-xs" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                      <div class="card-header border-bottom border-light-subtle d-flex justify-content-between align-items-center p-4">
                        <h5 class="card-title mb-0 fw-bold text-heading" style="color: #1e1b4b;">1-to-1 Discipleship Stages</h5>
                      </div>
                      <div class="card-body p-4">
                        <div class="table-responsive custom-scrollbar" style="border-radius: 8px;">
                          <table class="table table-hover align-middle w-100" id="dcTable">
                            <thead>
                              <tr>
                                <th>Member</th>
                                <th>DC Stage</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <?php if (!empty($members)): ?>
                              <?php foreach ($members as $row): 
                                $mid = $row['id'];
                                $name = $row['first_name'] . " " . $row['last_name'];
                                $dc_stage = $row['dc_stage'] ? $row['dc_stage'] : 'Not Started';
                                $dc_id = $row['dc_id'];
                                
                                $badge_class = 'bg-label-secondary';
                                if($dc_stage == 'New Birth') $badge_class = 'bg-label-info';
                                if($dc_stage == 'Foundation') $badge_class = 'bg-label-primary';
                                if($dc_stage == 'Character') $badge_class = 'bg-label-warning';
                                if($dc_stage == 'Ministry') $badge_class = 'bg-label-success';
                                if($dc_stage == 'Multiplication') $badge_class = 'bg-label-danger';
                              ?>
                              <tr>
                                <td><strong><?= htmlspecialchars($name); ?></strong></td>
                                <td>
                                  <span class="badge <?= $badge_class ?>"><?= $dc_stage ?></span>
                                </td>
                                <td>
                                  <?php if($dc_stage == 'Not Started'): ?>
                                    <button class="btn btn-sm btn-outline-primary" onclick="startDiscipleship(<?= $mid ?>, <?= $cell_leader ? $cell_leader : 0 ?>)"><i class="bx bx-play-circle me-1"></i> Start DC</button>
                                  <?php else: ?>
                                    <button class="btn btn-sm btn-primary" onclick="logSession(<?= $dc_id ?>, '<?= htmlspecialchars(addslashes($name)) ?>')"><i class="bx bx-edit-alt me-1"></i> Log Session</button>
                                    <button class="btn btn-sm btn-outline-secondary" onclick="updateStage(<?= $dc_id ?>, '<?= $dc_stage ?>', '<?= htmlspecialchars(addslashes($name)) ?>')"><i class="bx bx-up-arrow-circle me-1"></i> Advance Stage</button>
                                  <?php endif; ?>
                                </td>
                              </tr>
                              <?php endforeach; ?>
                              <?php endif; ?>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
          <?php endif; ?>

        </div><!-- /container -->

        <?php @include("includes/footer.php"); ?>
        <div class="content-backdrop fade"></div>
      </div>
    </div>
  </div>
  <div class="layout-overlay layout-menu-toggle"></div>
</div>

<?php include('includes/scripts.html'); ?>
<script>
  $(document).ready(function() {
    if ($('#membersTable').length) {
      $('#membersTable').DataTable({
        paging      : true,
        searching   : true,
        ordering    : true,
        info        : true,
        lengthChange: true,
        pageLength  : 15,
        columnDefs  : [{ orderable: false, targets: [5] }],
        language    : { searchPlaceholder: 'Search members…', search: '' }
      });
    }
    
    if ($('#dcTable').length) {
      $('#dcTable').DataTable({
        paging: true, searching: true, ordering: true, pageLength: 10
      });
    }
    
    // Tab styling toggle
    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
      $('button[data-bs-toggle="tab"]').css({
        'color': '#6b7280',
        'border-bottom': '2px solid transparent',
        'background': 'transparent'
      });
      $(e.target).css({
        'color': '#696cff',
        'border-bottom': '2px solid #696cff',
        'background': 'rgba(105, 108, 255, 0.05)'
      });
    });
  });

  function startDiscipleship(memberId, disciplerId) {
      Swal.fire({
          title: 'Start Discipleship?',
          text: "This will enroll the member into the New Birth stage.",
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, Start',
          showLoaderOnConfirm: true,
          preConfirm: () => {
              return fetch('manage/update_dc_stage.php', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ member_id: memberId, action: 'start' })
              })
              .then(response => response.json())
              .then(data => { if(!data.success) throw new Error(data.error); })
              .catch(error => Swal.showValidationMessage(`Request failed: ${error}`));
          }
      }).then((result) => {
          if(result.isConfirmed) {
              Swal.fire('Started!', 'Member enrolled in Discipleship.', 'success').then(() => location.reload());
          }
      });
  }

  function updateStage(dcId, currentStage, name) {
      const stages = ['New Birth', 'Foundation', 'Character', 'Ministry', 'Multiplication'];
      const nextIndex = stages.indexOf(currentStage) + 1;
      
      if(nextIndex >= stages.length) {
          Swal.fire('Maximum Stage', 'This member is already at the highest discipleship stage!', 'info');
          return;
      }
      
      const nextStage = stages[nextIndex];
      
      Swal.fire({
          title: 'Advance Stage?',
          html: `Advance <b>${name}</b> from <span class="badge bg-label-secondary">${currentStage}</span> to <span class="badge bg-label-primary">${nextStage}</span>?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Advance Stage',
          showLoaderOnConfirm: true,
          preConfirm: () => {
              return fetch('manage/update_dc_stage.php', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ dc_id: dcId, stage: nextStage, action: 'advance' })
              })
              .then(response => response.json())
              .then(data => { if(!data.success) throw new Error(data.error); })
              .catch(error => Swal.showValidationMessage(`Request failed: ${error}`));
          }
      }).then((result) => {
          if(result.isConfirmed) {
              Swal.fire('Advanced!', `Member is now in the ${nextStage} stage.`, 'success').then(() => location.reload());
          }
      });
  }

  function logSession(dcId, name) {
      Swal.fire({
          title: `Log Session for ${name}`,
          html: `
            <input type="date" id="swal-date" class="swal2-input" value="${new Date().toISOString().split('T')[0]}">
            <textarea id="swal-notes" class="swal2-textarea" placeholder="Session notes..."></textarea>
            <div class="mt-3 text-start px-4">
              <label class="form-label d-block">Quiet Time Consistency (1-5)</label>
              <input type="range" class="form-range" min="1" max="5" id="swal-qt" value="3">
              <label class="form-label d-block mt-2">Scripture Memory Checked?</label>
              <select id="swal-memory" class="form-select">
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Save Session',
          preConfirm: () => {
              const date = document.getElementById('swal-date').value;
              const notes = document.getElementById('swal-notes').value;
              const qt = document.getElementById('swal-qt').value;
              const memory = document.getElementById('swal-memory').value;
              
              if(!date) { Swal.showValidationMessage('Date is required'); return false; }
              
              return fetch('manage/log_dc_session.php', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ dc_id: dcId, date: date, notes: notes, qt: qt, memory: memory })
              })
              .then(response => response.json())
              .then(data => { if(!data.success) throw new Error(data.error); })
              .catch(error => Swal.showValidationMessage(`Request failed: ${error}`));
          }
      }).then((result) => {
          if(result.isConfirmed) {
              Swal.fire('Saved!', 'Discipleship session logged.', 'success');
          }
      });
  }
</script>
</body>
</html>

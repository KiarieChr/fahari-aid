<?php
/**
 * cell-oversight-dashboard.php
 * Ministry-wide oversight dashboard and analytics for senior leaders.
 */
include('includes/checklogin.php');

$title = "Cell Oversight | Analytics & Health Card";
include("includes/get_user.php");
require_once 'manage/functions.php';

// Restrict access to authorized roles
if (!userHasPermission($db, $user_id, 'edit_cell') && !userHasPermission($db, $user_id, 'create_cell')) {
    echo "<script>alert('Unauthorized access'); window.location.href='dashboard.php';</script>";
    exit;
}

// 1. Get Filters
$sel_cell_id  = isset($_GET['cell_id']) ? intval($_GET['cell_id']) : 0;
$sel_category = isset($_GET['category']) ? trim($_GET['category']) : '';
$start_date   = isset($_GET['start_date']) ? trim($_GET['start_date']) : date('Y-m-d', strtotime('-90 days'));
$end_date     = isset($_GET['end_date']) ? trim($_GET['end_date']) : date('Y-m-d');

// Fetch dropdown cells
$cells_dropdown = $db->query("SELECT id, name, code, category FROM cells WHERE status=1 ORDER BY code ASC")->fetchAll(PDO::FETCH_ASSOC);

// 2. Fetch Aggregated Metrics
$kpi_where = "WHERE r.status = 'published' AND r.meeting_date BETWEEN :start AND :end";
$kpi_params = [':start' => $start_date, ':end' => $end_date];

if ($sel_cell_id) {
    $kpi_where .= " AND r.cell_id = :cell_id";
    $kpi_params[':cell_id'] = $sel_cell_id;
}
if ($sel_category) {
    $kpi_where .= " AND c.category = :category";
    $kpi_params[':category'] = $sel_category;
}

$kpis_stmt = $db->prepare("
    SELECT 
        SUM(r.total_attendance) as total_attendance,
        SUM(r.salvations) as total_salvations,
        SUM(r.new_converts) as total_converts,
        COUNT(DISTINCT r.cell_id) as reporting_cells
    FROM cell_reports r
    JOIN cells c ON r.cell_id = c.id
    $kpi_where
");
$kpis_stmt->execute($kpi_params);
$kpis = $kpis_stmt->fetch(PDO::FETCH_ASSOC);

// Fetch total first timers
$ft_stmt = $db->prepare("
    SELECT COUNT(ft.id) as total_ft
    FROM cell_report_first_timers ft
    JOIN cell_reports r ON ft.report_id = r.id
    JOIN cells c ON r.cell_id = c.id
    $kpi_where
");
$ft_stmt->execute($kpi_params);
$total_ft = intval($ft_stmt->fetch(PDO::FETCH_ASSOC)['total_ft'] ?? 0);

// Total members in database
$total_members = intval($db->query("SELECT COUNT(*) FROM member")->fetchColumn());
// Assigned members
$assigned_members = intval($db->query("SELECT COUNT(*) FROM member WHERE cell_id IS NOT NULL AND cell_id > 0")->fetchColumn());
$assimilation_rate = $total_members > 0 ? round(($assigned_members / $total_members) * 100, 1) : 0;

// Total cells
$total_cells_count = intval($db->query("SELECT COUNT(*) FROM cells WHERE status=1")->fetchColumn());


// 3. Scorecard Engine & Health Evaluation
// Fetch cells list and calculate metrics for each cell
$scorecard = [];
$anomalies = [];

$all_cells_stmt = $db->query("
    SELECT c.id, c.code, c.name, c.category, c.leader_in_training_id,
           CONCAT(m.first_name,' ',m.last_name) as leader_name,
           (SELECT MAX(meeting_date) FROM cell_reports WHERE cell_id = c.id AND status='published') as last_report_date
    FROM cells c
    LEFT JOIN member m ON c.cell_leader = m.id
    WHERE c.status = 1
    ORDER BY c.code ASC
");
$cells_list = $all_cells_stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($cells_list as $c) {
    $cid = intval($c['id']);

    // Get last 4 reports average attendance
    $att_l4_stmt = $db->prepare("
        SELECT total_attendance, new_converts, meeting_date 
        FROM cell_reports 
        WHERE cell_id = :cid AND status='published' 
        ORDER BY meeting_date DESC LIMIT 4
    ");
    $att_l4_stmt->execute([':cid' => $cid]);
    $l4_reports = $att_l4_stmt->fetchAll(PDO::FETCH_ASSOC);
    $l4_count = count($l4_reports);
    $l4_avg = 0;
    $l4_converts = 0;
    if ($l4_count > 0) {
        $l4_avg = array_sum(array_column($l4_reports, 'total_attendance')) / $l4_count;
        $l4_converts = array_sum(array_column($l4_reports, 'new_converts'));
    }

    // Get previous 4 reports (reports 5-8) to calculate growth trend
    $att_p4_stmt = $db->prepare("
        SELECT total_attendance 
        FROM cell_reports 
        WHERE cell_id = :cid AND status='published' 
        ORDER BY meeting_date DESC LIMIT 4 OFFSET 4
    ");
    $att_p4_stmt->execute([':cid' => $cid]);
    $p4_reports = $att_p4_stmt->fetchAll(PDO::FETCH_COLUMN);
    $p4_count = count($p4_reports);
    $p4_avg = 0;
    if ($p4_count > 0) {
        $p4_avg = array_sum($p4_reports) / $p4_count;
    }

    // Growth trend percentage
    $attendance_growth = 0;
    if ($p4_avg > 0) {
        $attendance_growth = (($l4_avg - $p4_avg) / $p4_avg) * 100;
    }

    // Follow-up compliance
    // Count tasks for members of this cell
    $tasks_stmt = $db->prepare("
        SELECT 
            COUNT(t.id) as total_tasks,
            SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM cell_followup_tasks t
        JOIN member m ON t.member_id = m.id
        WHERE m.cell_id = :cid
    ");
    $tasks_stmt->execute([':cid' => $cid]);
    $t_stats = $tasks_stmt->fetch(PDO::FETCH_ASSOC);
    $total_t = intval($t_stats['total_tasks']);
    $comp_t  = intval($t_stats['completed_tasks']);
    $compliance = $total_t > 0 ? round(($comp_t / $total_t) * 100) : 100; // 100% compliance if no tasks generated

    // Determine Health Score status
    $health_status = 'Stable'; // default
    $health_class = 'bg-label-warning';
    
    // Check Multiplying Cell criteria
    $has_leader_in_training = !empty($c['leader_in_training_id']);
    if ($l4_avg > 0 && $has_leader_in_training && ($l4_converts > 0 || $attendance_growth > 5)) {
        $health_status = 'Multiplying';
        $health_class = 'bg-label-success';
    } 
    // Check Stagnant Cell criteria
    elseif ($l4_count > 0 && ($attendance_growth < -10 || $compliance < 50) && $l4_converts == 0) {
        $health_status = 'Stagnant';
        $health_class = 'bg-label-danger';
    }

    $scorecard[] = [
        'id'                 => $cid,
        'code'               => $c['code'],
        'name'               => $c['name'],
        'category'           => $c['category'],
        'leader_name'        => $c['leader_name'] ?: 'No Leader',
        'avg_attendance'     => round($l4_avg, 1),
        'compliance'         => $compliance,
        'has_tasks'          => $total_t > 0,
        'health_status'      => $health_status,
        'health_class'       => $health_class,
        'last_report_date'   => $c['last_report_date']
    ];

    // --- ANOMALY DETECTION ENGINE ---
    // 1. Delinquent Reporting: no report in 14 days
    if ($c['last_report_date']) {
        $days_since_report = round((time() - strtotime($c['last_report_date'])) / 86400);
        if ($days_since_report > 14) {
            $anomalies[] = [
                'cell_code' => $c['code'],
                'cell_name' => $c['name'],
                'anomaly_type' => 'Reporting Delinquency',
                'description' => "No reports submitted for $days_since_report days (last report was filed on " . date('M d, Y', strtotime($c['last_report_date'])) . ").",
                'severity' => 'danger'
            ];
        }
    } else {
        $anomalies[] = [
            'cell_code' => $c['code'],
            'cell_name' => $c['name'],
            'anomaly_type' => 'No Reports Filed',
            'description' => "This cell group has never submitted any reports since creation.",
            'severity' => 'warning'
        ];
    }

    // 2. Attendance Drop: last report's attendance drops by >30% compared to rolling average
    if ($l4_count >= 2) {
        $last_attendance = intval($l4_reports[0]['total_attendance']);
        // average of prior reports
        $prior_reports = array_slice($l4_reports, 1);
        $prior_avg = array_sum(array_column($prior_reports, 'total_attendance')) / count($prior_reports);
        if ($prior_avg > 0) {
            $drop_pct = (($prior_avg - $last_attendance) / $prior_avg) * 100;
            if ($drop_pct > 30) {
                $anomalies[] = [
                    'cell_code' => $c['code'],
                    'cell_name' => $c['name'],
                    'anomaly_type' => 'Attendance Drop Alert',
                    'description' => "Attendance dropped by " . round($drop_pct) . "% in the last meeting ($last_attendance present vs previous average of " . round($prior_avg, 1) . ").",
                    'severity' => 'danger'
                ];
            }
        }
    }

    // 3. Low Compliance Alert: follow-up compliance falls below 50%
    if ($total_t > 0 && $compliance < 50) {
        $anomalies[] = [
            'cell_code' => $c['code'],
            'cell_name' => $c['name'],
            'anomaly_type' => 'Low Followup Compliance',
            'description' => "Assimilation follow-up compliance rate is critical at $compliance% ($comp_t of $total_t tasks resolved).",
            'severity' => 'warning'
        ];
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
      padding: 30px 32px;
      border-radius: 16px;
      color: #fff;
      margin-bottom: 28px;
      box-shadow: 0 8px 30px rgba(26,5,51,0.3);
      position: relative;
      overflow: hidden;
    }
    .page-hero h4 { font-weight: 700; font-size: 1.5rem; margin-bottom: 4px; }
    .page-hero p  { opacity: 0.8; font-size: 0.9rem; margin: 0; }

    .stat-card {
      border-radius: 14px;
      padding: 20px;
      background: #fff;
      box-shadow: 0 4px 18px rgba(0,0,0,0.05);
      border: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-3px); }
    .stat-card .stat-num { font-size: 1.8rem; font-weight: 800; color: var(--jen-primary); }
    .stat-card .stat-lbl { font-size: 0.8rem; color: #8a7baa; text-transform: uppercase; font-weight: 600; }
    .stat-card .stat-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
    }

    .card-custom {
      border: none;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      margin-bottom: 24px;
      background: #fff;
    }
    .card-custom .card-header {
      background: transparent;
      border-bottom: 1px solid #f0eaf8;
      padding: 20px 24px;
    }
    .card-custom .card-header h5 {
      font-weight: 700;
      color: var(--jen-primary);
      margin: 0;
    }

    .anomaly-alert {
      padding: 14px 16px;
      border-radius: 10px;
      margin-bottom: 12px;
      border: none;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .anomaly-alert.danger { background: rgba(220,53,69,0.08); color: #721c24; border-left: 4px solid var(--jen-danger); }
    .anomaly-alert.warning { background: rgba(255,193,7,0.08); color: #856404; border-left: 4px solid var(--jen-warning); }
    .anomaly-alert h6 { font-weight: 700; margin: 0 0 4px 0; }
    .anomaly-alert p { font-size: 0.82rem; margin: 0; opacity: 0.85; }

    .health-badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 12px;
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
                <h4><i class="bx bx-bar-chart-alt-2 me-2"></i>Cell Oversight Analytics Dashboard</h4>
                <p>Aggregate KPIs, dynamic health scorecards, anomaly alerts, and follow-up compliance tracking.</p>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="card card-custom p-4 mb-4">
            <form method="GET">
              <div class="row g-3 align-items-end">
                <div class="col-md-3">
                  <label class="form-label fw-bold text-secondary">Filter by Cell</label>
                  <select name="cell_id" class="form-select">
                    <option value="">All Cell Groups</option>
                    <?php foreach ($cells_dropdown as $c): ?>
                    <option value="<?= $c['id'] ?>" <?= $sel_cell_id == $c['id'] ? 'selected' : '' ?>>
                      <?= htmlspecialchars($c['code'] . ' — ' . $c['name']) ?>
                    </option>
                    <?php endforeach; ?>
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label fw-bold text-secondary">Cell Category</label>
                  <select name="category" class="form-select">
                    <option value="">All Categories</option>
                    <option value="General" <?= $sel_category === 'General' ? 'selected' : '' ?>>General</option>
                    <option value="Youth" <?= $sel_category === 'Youth' ? 'selected' : '' ?>>Youth</option>
                    <option value="Campus" <?= $sel_category === 'Campus' ? 'selected' : '' ?>>Campus</option>
                    <option value="Men" <?= $sel_category === 'Men' ? 'selected' : '' ?>>Men</option>
                    <option value="Women" <?= $sel_category === 'Women' ? 'selected' : '' ?>>Women</option>
                  </select>
                </div>
                <div class="col-md-25 col-sm-6">
                  <label class="form-label fw-bold text-secondary">Start Date</label>
                  <input type="date" name="start_date" class="form-control" value="<?= htmlspecialchars($start_date) ?>">
                </div>
                <div class="col-md-25 col-sm-6">
                  <label class="form-label fw-bold text-secondary">End Date</label>
                  <input type="date" name="end_date" class="form-control" value="<?= htmlspecialchars($end_date) ?>">
                </div>
                <div class="col-md-2">
                  <button type="submit" class="btn btn-primary w-100" style="background: linear-gradient(135deg,#6f42c1,#a06efc); border:none;">
                    <i class="bx bx-filter-alt me-1"></i> Apply Filters
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- KPI Stats row -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-lg-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Aggregate Attendance</div>
                  <div class="stat-num mt-1"><?= intval($kpis['total_attendance'] ?? 0) ?></div>
                  <small class="text-muted"><?= intval($kpis['reporting_cells'] ?? 0) ?> Cell(s) Reporting</small>
                </div>
                <div class="stat-icon" style="background:#f0e8ff; color:var(--jen-accent);">
                  <i class="bx bx-group"></i>
                </div>
              </div>
            </div>
            <div class="col-6 col-lg-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Souls Won / Salvations</div>
                  <div class="stat-num mt-1"><?= intval($kpis['total_salvations'] ?? 0) ?></div>
                  <small class="text-muted">In selection period</small>
                </div>
                <div class="stat-icon" style="background:#e8fff0; color:var(--jen-success);">
                  <i class="bx bx-badge-check"></i>
                </div>
              </div>
            </div>
            <div class="col-6 col-lg-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">First Timers</div>
                  <div class="stat-num mt-1"><?= $total_ft ?></div>
                  <small class="text-muted">Assimilation track</small>
                </div>
                <div class="stat-icon" style="background:#e0f8fc; color:var(--jen-cyan);">
                  <i class="bx bx-user-plus"></i>
                </div>
              </div>
            </div>
            <div class="col-6 col-lg-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Cell Assimilation Rate</div>
                  <div class="stat-num mt-1"><?= $assimilation_rate ?>%</div>
                  <small class="text-muted"><?= $assigned_members ?> of <?= $total_members ?> Assigned</small>
                </div>
                <div class="stat-icon" style="background:#fff8e0; color:var(--jen-warning);">
                  <i class="bx bx-git-branch"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <!-- Left Side: Health Scorecard Table -->
            <div class="col-lg-8 col-12">
              <div class="card card-custom">
                <div class="card-header">
                  <h5 class="mb-0"><i class="bx bx-grid me-2 text-primary"></i>Cell Health Scorecard Directory</h5>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-hover align-middle" id="scorecardTable">
                      <thead>
                        <tr>
                          <th>Cell</th>
                          <th>Leader Name</th>
                          <th>Category</th>
                          <th>Avg Att (L4)</th>
                          <th>Compliance</th>
                          <th>Health Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <?php foreach ($scorecard as $s): ?>
                        <tr>
                          <td class="fw-bold text-primary"><?= htmlspecialchars($s['code']) ?></td>
                          <td><?= htmlspecialchars($s['leader_name']) ?></td>
                          <td><span class="badge bg-label-secondary"><?= htmlspecialchars($s['category'] ?: 'General') ?></span></td>
                          <td class="fw-bold"><?= $s['avg_attendance'] ?></td>
                          <td>
                            <div class="d-flex align-items-center gap-2">
                              <div class="progress w-px-50" style="height: 6px;">
                                <div class="progress-bar bg-<?= $s['compliance'] >= 75 ? 'success' : ($s['compliance'] >= 50 ? 'warning' : 'danger') ?>" role="progressbar" style="width: <?= $s['compliance'] ?>%"></div>
                              </div>
                              <small><?= $s['compliance'] ?>%</small>
                            </div>
                          </td>
                          <td>
                            <span class="health-badge <?= $s['health_class'] ?>">
                              <i class="bx bx-heart-square me-1"></i><?= $s['health_status'] ?>
                            </span>
                          </td>
                        </tr>
                        <?php endforeach; ?>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side: Anomaly Detection & Alerts Panel -->
            <div class="col-lg-4 col-12">
              <div class="card card-custom h-100">
                <div class="card-header border-bottom-0 pb-1">
                  <h5><i class="bx bx-error-alt me-2 text-danger"></i>Anomaly Alerts Panel</h5>
                </div>
                <div class="card-body">
                  <div style="max-height: 480px; overflow-y: auto; padding-right: 4px;">
                    <?php if (empty($anomalies)): ?>
                    <div class="text-center py-5 text-muted">
                      <i class="bx bx-check-shield text-success fs-1 mb-2 d-block"></i>
                      No anomalies detected. All cell groups are operating stably.
                    </div>
                    <?php else: 
                      foreach ($anomalies as $a):
                    ?>
                    <div class="anomaly-alert <?= $a['severity'] ?>">
                      <i class="bx bx-info-circle fs-4" style="margin-top:2px;"></i>
                      <div>
                        <h6>[<?= htmlspecialchars($a['cell_code']) ?>] &mdash; <?= htmlspecialchars($a['anomaly_type']) ?></h6>
                        <p><?= htmlspecialchars($a['description']) ?></p>
                      </div>
                    </div>
                    <?php endforeach; endif; ?>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        <?php include("includes/footer.php"); ?>
      </div>

    </div>
  </div>
</div>

<?php include('includes/scripts.html'); ?>
<script>
  $(document).ready(function() {
    if ($('#scorecardTable').length) {
      $('#scorecardTable').DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        lengthChange: false,
        pageLength: 15
      });
    }
  });
</script>
</body>
</html>

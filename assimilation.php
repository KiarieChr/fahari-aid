<?php
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');
$title = "Member Assimilation | Follow-Up Module";
include("includes/get_user.php");

// ── PHP Data Fetching (same pattern as dashboard.php) ─────────────────────────
try {
    // ── Auto-Sync Fallback ───────────────────────────────────────
    // Insert any members missing from the assimilation table, using their joined_on date
    $db->query("
        INSERT IGNORE INTO new_member_assimilation (member_id, decision_type, assimilation_status, created_at)
        SELECT id, 'other', 'uncontacted', joined_on
        FROM member
        WHERE id NOT IN (SELECT member_id FROM new_member_assimilation)
    ");

    // ── Date Range Filters ───────────────────────────────────────
    $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
    $endDate = $_GET['end_date'] ?? date('Y-m-d');
    
    // Sanitize dates for direct query inclusion
    $startD = date('Y-m-d 00:00:00', strtotime($startDate));
    $endD = date('Y-m-d 23:59:59', strtotime($endDate));
    
    // For comparing with previous period (same duration)
    $durationDays = (strtotime($endDate) - strtotime($startDate)) / 86400;
    if ($durationDays < 1) $durationDays = 1;
    $prevStartD = date('Y-m-d 00:00:00', strtotime($startDate . " - " . round($durationDays) . " days"));
    $prevEndD = date('Y-m-d 23:59:59', strtotime($startDate . " - 1 days"));

    $dateWhere = "created_at >= '$startD' AND created_at <= '$endD'";
    $dateWhereA = "a.created_at >= '$startD' AND a.created_at <= '$endD'";

    // ── KPI: Total new members in date range ──────────────────────
    $totalCurrent = (int)$db->query("
        SELECT COUNT(*) FROM new_member_assimilation
        WHERE $dateWhere
    ")->fetchColumn();

    $totalPrev = (int)$db->query("
        SELECT COUNT(*) FROM new_member_assimilation
        WHERE created_at >= '$prevStartD' AND created_at <= '$prevEndD'
    ")->fetchColumn();

    $pctChange = $totalPrev > 0 ? round((($totalCurrent - $totalPrev) / $totalPrev) * 100, 1)
                                : ($totalCurrent > 0 ? 100 : 0);

    // ── KPI: Follow-up completion rate ──────────────────────────
    $contacted = (int)$db->query("
        SELECT COUNT(DISTINCT a.id)
        FROM new_member_assimilation a
        INNER JOIN assimilation_followups f ON f.assimilation_id = a.id AND f.reached = 1
        WHERE $dateWhereA
    ")->fetchColumn();
    $completionRate = $totalCurrent > 0 ? round(($contacted / $totalCurrent) * 100) : 0;

    // ── KPI: Uncontacted ─────────────────────────────────────────
    $uncontacted = (int)$db->query("
        SELECT COUNT(*) FROM new_member_assimilation
        WHERE assimilation_status = 'uncontacted' AND $dateWhere
    ")->fetchColumn();

    // ── KPI: Stick rate (≥2 attendance records) ──────────────────
    $stickRateStmt = $db->query("
        SELECT COUNT(*) FROM (
            SELECT a.member_id
            FROM new_member_assimilation a
            INNER JOIN attendance att ON att.member_id = a.member_id
            WHERE $dateWhereA
            GROUP BY a.member_id
            HAVING COUNT(att.id) >= 2
        ) sub
    ");
    $stickRate = (int)$stickRateStmt->fetchColumn();

    // ── KPI: SLA Breached ────────────────────────────────────────
    $db->query("
        UPDATE new_member_assimilation
        SET sla_breached = 1
        WHERE assimilation_status = 'uncontacted'
          AND sla_breached = 0
          AND TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 48
    ");
    $slaBreached = (int)$db->query("
        SELECT COUNT(*) FROM new_member_assimilation
        WHERE sla_breached = 1 AND assimilation_status = 'uncontacted'
          AND $dateWhere
    ")->fetchColumn();

    // ── Trend: Daily new members (in date range) ──────────────────
    $trendStmt = $db->query("
        SELECT DATE(created_at) AS day, COUNT(*) AS count
        FROM new_member_assimilation
        WHERE $dateWhere
        GROUP BY DATE(created_at) ORDER BY day ASC
    ");
    $trendRaw = $trendStmt->fetchAll(PDO::FETCH_ASSOC);
    $trendMap = [];
    foreach ($trendRaw as $row) $trendMap[$row['day']] = (int)$row['count'];
    $trendLabels = $trendData = [];
    
    // Only show up to 30 days on the chart if range is huge, or exactly the duration if shorter
    $chartDays = min(30, round($durationDays));
    for ($i = $chartDays; $i >= 0; $i--) {
        $day = date('Y-m-d', strtotime($endDate . " -$i days"));
        $trendLabels[] = date('M j', strtotime($day));
        $trendData[]   = $trendMap[$day] ?? 0;
    }

    // ── Decision type breakdown ──────────────────────────────────
    $decisionStmt = $db->query("
        SELECT decision_type, COUNT(*) AS count
        FROM new_member_assimilation
        WHERE $dateWhere
        GROUP BY decision_type
    ");
    $decisionRows = $decisionStmt->fetchAll(PDO::FETCH_ASSOC);
    $decisionMap = ['raised_hand'=>'Raised Hand','connection_card'=>'Connection Card',
        'personal_invite'=>'Personal Invite','online_form'=>'Online Form',
        'salvation_decision'=>'Salvation Decision','other'=>'Other'];
    $decisionLabels = $decisionCounts = [];
    foreach ($decisionRows as $r) {
        $decisionLabels[] = $decisionMap[$r['decision_type']] ?? $r['decision_type'];
        $decisionCounts[] = (int)$r['count'];
    }

    // ── Status breakdown ─────────────────────────────────────────
    $statusStmt = $db->query("
        SELECT assimilation_status, COUNT(*) AS count
        FROM new_member_assimilation
        WHERE $dateWhere
        GROUP BY assimilation_status
    ");
    $statusMap = [];
    foreach ($statusStmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
        $statusMap[$r['assimilation_status']] = (int)$r['count'];
    }

    // ── New members list (paginated) ─────────────────────────────
    $filterStatus = isset($_GET['status']) && in_array($_GET['status'], ['uncontacted','attempted','contacted','cell_assigned']) ? $_GET['status'] : '';
    $search = trim($_GET['search'] ?? '');
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = 15;
    $offset = ($page - 1) * $limit;

    $where = "WHERE $dateWhereA";
    $params = [];

    if ($filterStatus) { $where .= " AND a.assimilation_status = :status"; $params[':status'] = $filterStatus; }
    if ($search !== '') { $where .= " AND (m.first_name LIKE :s OR m.last_name LIKE :s OR m.phone_no LIKE :s)"; $params[':s'] = "%$search%"; }

    $totalListStmt = $db->prepare("SELECT COUNT(*) FROM new_member_assimilation a JOIN member m ON m.id = a.member_id $where");
    $totalListStmt->execute($params);
    $totalList = (int)$totalListStmt->fetchColumn();
    $totalPages = ceil($totalList / $limit);

    $listStmt = $db->prepare("
        SELECT a.id AS assimilation_id, a.assimilation_status, a.decision_type, a.sla_breached,
               TIMESTAMPDIFF(HOUR, a.created_at, NOW()) AS hours_since_added,
               m.id AS member_id, m.first_name, m.last_name, m.phone_no, m.email, m.joined_on,
               COALESCE(u.email, 'Unassigned') AS assigned_to_name,
               (SELECT COUNT(*) FROM assimilation_followups f WHERE f.assimilation_id = a.id) AS followup_count
        FROM new_member_assimilation a
        JOIN member m ON m.id = a.member_id
        LEFT JOIN users u ON u.id = a.assigned_to
        $where
        ORDER BY a.created_at DESC
        LIMIT $limit OFFSET $offset
    ");
    $listStmt->execute($params);
    $membersList = $listStmt->fetchAll(PDO::FETCH_ASSOC);

    // ── Oversight: Staff Performance ─────────────────────────────
    $staffStmt = $db->query("
        SELECT u.id, u.email AS staff_name,
               COUNT(a.id) AS total_assigned,
               SUM(CASE WHEN a.assimilation_status IN ('contacted','cell_assigned') THEN 1 ELSE 0 END) AS contacted,
               SUM(CASE WHEN a.assimilation_status IN ('uncontacted','attempted') THEN 1 ELSE 0 END) AS uncontacted,
               ROUND(AVG(CASE WHEN a.first_contact_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, a.created_at, a.first_contact_at) END),1) AS avg_response_hours,
               SUM(CASE WHEN a.sla_breached = 1 THEN 1 ELSE 0 END) AS sla_breached
        FROM new_member_assimilation a
        JOIN users u ON u.id = a.assigned_to
        WHERE $dateWhereA
        GROUP BY u.id, u.email ORDER BY uncontacted DESC
    ");
    $staffPerformance = $staffStmt->fetchAll(PDO::FETCH_ASSOC);

    // ── Oversight: Aging Buckets ──────────────────────────────────
    $agingRow = $db->query("
        SELECT
            SUM(CASE WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) < 24 THEN 1 ELSE 0 END)  AS h0_24,
            SUM(CASE WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) BETWEEN 24 AND 47 THEN 1 ELSE 0 END) AS h24_48,
            SUM(CASE WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) BETWEEN 48 AND 71 THEN 1 ELSE 0 END) AS h48_72,
            SUM(CASE WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 72 THEN 1 ELSE 0 END) AS h72plus
        FROM new_member_assimilation
        WHERE assimilation_status IN ('uncontacted','attempted') AND $dateWhere
    ")->fetch(PDO::FETCH_ASSOC);

    // ── Oversight: Funnel ─────────────────────────────────────────
    $funnelTotal = $totalCurrent;
    $funnelFirst = (int)$db->query("SELECT COUNT(DISTINCT f.assimilation_id) FROM assimilation_followups f JOIN new_member_assimilation a ON f.assimilation_id = a.id WHERE f.reached=1 AND $dateWhereA")->fetchColumn();
    $funnelSecond = (int)$db->query("SELECT COUNT(*) FROM (SELECT f.assimilation_id FROM assimilation_followups f JOIN new_member_assimilation a ON f.assimilation_id = a.id WHERE f.reached=1 AND $dateWhereA GROUP BY f.assimilation_id HAVING COUNT(*) >= 2) sub")->fetchColumn();
    $funnelCell = (int)$db->query("SELECT COUNT(*) FROM new_member_assimilation a WHERE assimilation_status='cell_assigned' AND $dateWhereA")->fetchColumn();
    $funnel = [
        ['stage'=>'Total New Members',   'count'=>$funnelTotal,  'pct'=>100],
        ['stage'=>'First Contact Made',  'count'=>$funnelFirst,  'pct'=>$funnelTotal > 0 ? round($funnelFirst/$funnelTotal*100) : 0],
        ['stage'=>'Second Contact Made', 'count'=>$funnelSecond, 'pct'=>$funnelTotal > 0 ? round($funnelSecond/$funnelTotal*100) : 0],
        ['stage'=>'Assigned to Cell',    'count'=>$funnelCell,   'pct'=>$funnelTotal > 0 ? round($funnelCell/$funnelTotal*100) : 0],
    ];

    // ── Oversight: Audit Log ─────────────────────────────────────
    $auditLog = $db->query("
        SELECT f.contact_type, f.reached, f.logged_at,
               CONCAT(m.first_name,' ',m.last_name) AS member_name,
               u.email AS logged_by_name, a.assimilation_status AS resulting_status
        FROM assimilation_followups f
        JOIN new_member_assimilation a ON a.id = f.assimilation_id
        JOIN member m ON m.id = a.member_id
        JOIN users u ON u.id = f.logged_by
        WHERE $dateWhereA
        ORDER BY f.logged_at DESC LIMIT 50
    ")->fetchAll(PDO::FETCH_ASSOC);

    // ── Roles list (for assign modal) ────────────────────────────
    $rolesList = $db->query("SELECT id, name FROM roles ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);

    // ── Cells list (for next steps dropdown) ─────────────────────
    $cellsList = $db->query("SELECT id, name FROM cells ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);

    $dbError = false;
} catch (PDOException $e) {
    $dbError = true;
    error_log("Assimilation page error: " . $e->getMessage());
}

// Helper: decision label
function decisionLabel($val) {
    $map = ['raised_hand'=>'Raised Hand','connection_card'=>'Connection Card',
        'personal_invite'=>'Personal Invite','online_form'=>'Online Form',
        'salvation_decision'=>'Salvation Decision','other'=>'Other'];
    return $map[$val] ?? ucwords(str_replace('_',' ',$val));
}

// Helper: contact type label
function contactLabel($val) {
    $map = ['phone_call'=>'📞 Phone Call','sms_whatsapp'=>'💬 SMS/WhatsApp',
        'home_visit'=>'🏠 Home Visit','coffee_meetup'=>'☕ Coffee Meetup'];
    return $map[$val] ?? $val;
}
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      :root {
        --asim-primary: #667eea; --asim-purple: #764ba2;
        --asim-green: #11998e;   --asim-red: #eb3349;
        --asim-glass-bg: rgba(255,255,255,0.55);
        --asim-glass-border: rgba(255,255,255,0.7);
      }

      /* Page Header */

      /* Tab Nav (Using dashboard's nav-tabs-custom instead) */

      /* KPI Cards */
      .kpi-card { background:var(--asim-glass-bg); backdrop-filter:blur(12px); border:1px solid var(--asim-glass-border); border-radius:18px; padding:1.5rem; transition:transform .3s ease,box-shadow .3s ease; height:100%; position:relative; overflow:hidden; }
      .kpi-card:hover { transform:translateY(-4px); box-shadow:0 12px 30px rgba(0,0,0,.1); }
      .kpi-card-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin-bottom:1rem; }
      .kpi-value { font-size:2.2rem; font-weight:800; color:#1e1b4b; line-height:1; }
      .kpi-label { font-size:.8rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:#6b7280; margin-top:.25rem; }
      .kpi-change { font-size:.78rem; font-weight:600; margin-top:.5rem; }
      .kpi-change.positive { color:#10b981; } .kpi-change.negative { color:#ef4444; }

      /* Status Badges */
      .status-badge { display:inline-flex; align-items:center; gap:.4rem; padding:.35rem .85rem; border-radius:50px; font-size:.75rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; }
      .status-badge::before { content:''; width:7px; height:7px; border-radius:50%; display:inline-block; }
      .status-uncontacted { background:rgba(239,68,68,.12); color:#dc2626; }
      .status-uncontacted::before { background:#dc2626; animation:pulseDot 1.5s infinite; box-shadow:0 0 0 2px rgba(220,38,38,.3); }
      .status-attempted { background:rgba(245,158,11,.12); color:#d97706; }
      .status-attempted::before { background:#d97706; }
      .status-contacted { background:rgba(16,185,129,.12); color:#059669; }
      .status-contacted::before { background:#059669; }
      .status-cell_assigned { background:rgba(59,130,246,.12); color:#2563eb; }
      .status-cell_assigned::before { background:#2563eb; }
      @keyframes pulseDot { 0%{box-shadow:0 0 0 0 rgba(220,38,38,.5)} 70%{box-shadow:0 0 0 6px rgba(220,38,38,0)} 100%{box-shadow:0 0 0 0 rgba(220,38,38,0)} }

      /* Chart & Glass Cards */
      .chart-card { background:var(--asim-glass-bg); backdrop-filter:blur(12px); border:1px solid var(--asim-glass-border); border-radius:18px; padding:1.5rem; }
      .chart-card-title { font-size:1rem; font-weight:700; color:#1e1b4b; margin-bottom:1.25rem; display:flex; align-items:center; gap:.5rem; }

      /* Table */
      .asim-table th { font-size:.75rem; text-transform:uppercase; letter-spacing:.07em; color:#6b7280; font-weight:600; border-bottom:2px solid rgba(0,0,0,.06); }
      .asim-table td { vertical-align:middle; }

      /* Funnel & Aging */
      .funnel-bar { height:38px; border-radius:8px; display:flex; align-items:center; padding:0 1rem; font-weight:700; font-size:.85rem; color:#fff; margin-bottom:.75rem; }
      .aging-bar  { height:24px; border-radius:6px; display:flex; align-items:center; padding:0 .75rem; font-size:.78rem; font-weight:600; color:#fff; }

      /* Audit Log */
      .audit-item { display:flex; align-items:flex-start; gap:1rem; padding:.85rem 0; border-bottom:1px solid rgba(0,0,0,.04); }
      .audit-avatar { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }

      /* Modal */
      .modal-glass .modal-content { background:rgba(255,255,255,.92); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,.8); border-radius:20px; box-shadow:0 25px 50px rgba(0,0,0,.12); }
      .outcome-tag { display:inline-flex; align-items:center; gap:.3rem; padding:.4rem .8rem; border-radius:20px; border:1.5px solid rgba(102,126,234,.25); cursor:pointer; font-size:.8rem; font-weight:500; background:rgba(255,255,255,.7); color:#4b5563; transition:all .2s ease; user-select:none; }
      .outcome-tag.selected { background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; border-color:transparent; }

      .sla-alert { background:rgba(239,68,68,.08); border-left:3px solid #dc2626; border-radius:8px; padding:.4rem .6rem; font-size:.72rem; color:#dc2626; font-weight:600; margin-top:.3rem; }
    </style>
  </head>

  <body>
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">

        <?php include("includes/sidebar.php"); ?>
        <!-- / Menu -->

        <!-- Layout container -->
        <div class="layout-page">
          <!-- Navbar -->
          <?php include("includes/nav.php"); ?>

          <div class="content-wrapper">
            <div class="container-xxl flex-grow-1 container-p-y">

              <?php if (!empty($dbError)): ?>
              <div class="alert alert-danger border-0 rounded-3">
                <i class="bx bx-error me-2"></i>Database error. Please run the migration script first: <code>api/migrations/002_assimilation_tables.sql</code>
              </div>
              <?php else: ?>

              <!-- ════════════════════════════════════════════════ -->
              <!-- PAGE HEADER (DASHBOARD STYLE)                     -->
              <!-- ════════════════════════════════════════════════ -->
              <div class="card mb-4 overflow-hidden" style="border-radius: 15px; border: none; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                <div class="row g-0">
                  <div class="col-md-8 p-4">
                    <h4 class="fw-bold mb-1" style="color: #4338ca;">
                      <i class="bx bx-user-pin me-2"></i> Member Assimilation
                    </h4>
                    <p class="text-muted mb-3" style="font-size: 0.9rem;">Track, follow up, and retain every new visitor. No one falls through the cracks.</p>
                  </div>
                  <div class="col-md-4 d-flex align-items-center justify-content-center p-3" style="background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%); border-left: 1px solid rgba(0,0,0,.03);">
                    <div class="d-flex align-items-center gap-2 px-4 py-2 rounded-pill bg-white shadow-sm border">
                      <i class="bx bx-calendar text-primary"></i>
                      <span class="fw-bold text-dark" style="font-size: .85rem;">Last 30 Days Stats</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB NAV -->
              <ul class="nav nav-tabs flex-column flex-sm-row mb-4 gap-2 nav-tabs-custom" id="assimTabs" role="tablist">
                <li class="nav-item" role="presentation"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#pane-overview" type="button" role="tab"><i class="bx bx-grid-alt me-1"></i> Overview</button></li>
                <li class="nav-item" role="presentation"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#pane-list" type="button" role="tab"><i class="bx bx-list-ul me-1"></i> New Members List</button></li>
                <li class="nav-item" role="presentation"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#pane-oversight" type="button" role="tab"><i class="bx bx-shield-quarter me-1"></i> Oversight</button></li>
              </ul>

              <div class="tab-content" id="assimTabContent">

                <!-- ════════════════════════════════════════════════ -->
                <!-- TAB 1: OVERVIEW                                 -->
                <!-- ════════════════════════════════════════════════ -->
                <div class="tab-pane fade show active" id="pane-overview" role="tabpanel">

                  <!-- KPI Cards -->
                  <div class="row g-4 mb-4">
                    <?php
                    $kpiCards = [
                        ['label'=>'Total New Members','value'=>$totalCurrent,'icon'=>'bx-group','grad'=>'linear-gradient(135deg,#667eea,#764ba2)','change'=>$pctChange],
                        ['label'=>'Follow-Up Rate','value'=>$completionRate.'%','icon'=>'bx-check-shield','grad'=>'linear-gradient(135deg,#11998e,#38ef7d)','note'=>'Members reached'],
                        ['label'=>'Pending First Contact','value'=>$uncontacted,'icon'=>'bx-bell','grad'=>'linear-gradient(135deg,#eb3349,#f45c43)','urgent'=>$uncontacted>0],
                        ['label'=>'Stick Rate','value'=>$stickRate,'icon'=>'bx-heart','grad'=>'linear-gradient(135deg,#f7971e,#ffd200)','note'=>'Returned 2+ times'],
                        ['label'=>'SLA Breached (>48h)','value'=>$slaBreached,'icon'=>'bx-time-five','grad'=>'linear-gradient(135deg,#c0392b,#e74c3c)','urgent'=>$slaBreached>0],
                    ];
                    foreach ($kpiCards as $c): ?>
                    <div class="col-6 col-md-4 col-xl">
                      <div class="kpi-card <?= !empty($c['urgent']) ? 'border border-danger' : '' ?>">
                        <div class="kpi-card-icon" style="background:<?= substr($c['grad'],0,30) ?>20;">
                          <i class="bx <?= $c['icon'] ?>" style="background:<?= $c['grad'] ?>;-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:1.5rem;"></i>
                        </div>
                        <div class="kpi-value"><?= $c['value'] ?></div>
                        <div class="kpi-label"><?= $c['label'] ?></div>
                        <?php if (isset($c['change'])): ?>
                        <div class="kpi-change <?= $c['change'] >= 0 ? 'positive' : 'negative' ?>">
                          <?= $c['change'] >= 0 ? '▲' : '▼' ?> <?= abs($c['change']) ?>% vs prev 30d
                        </div>
                        <?php endif; ?>
                        <?php if (isset($c['note'])): ?><div class="kpi-change" style="color:#9ca3af;"><?= $c['note'] ?></div><?php endif; ?>
                      </div>
                    </div>
                    <?php endforeach; ?>
                  </div>

                  <!-- Charts Row -->
                  <div class="row g-4">
                    <div class="col-lg-8">
                      <div class="chart-card">
                        <div class="chart-card-title"><i class="bx bx-trending-up text-primary"></i> New Members — Daily Trend (Last 30 Days)</div>
                        <canvas id="trendChart" height="100"></canvas>
                      </div>
                    </div>
                    <div class="col-lg-4">
                      <div class="chart-card">
                        <div class="chart-card-title"><i class="bx bx-pie-chart-alt" style="color:#764ba2;"></i> By Decision Type</div>
                        <canvas id="decisionChart" height="220"></canvas>
                        <div class="mt-3">
                          <?php
                          $decColors = ['#667eea','#764ba2','#11998e','#f7971e','#eb3349','#4facfe'];
                          foreach ($decisionLabels as $i => $lbl): ?>
                          <div class="d-flex align-items-center gap-2 mb-1 small">
                            <span style="width:12px;height:12px;border-radius:3px;background:<?= $decColors[$i % count($decColors)] ?>;flex-shrink:0;display:inline-block;"></span>
                            <span class="fw-semibold"><?= htmlspecialchars((string)$lbl) ?></span>
                            <span class="ms-auto text-muted"><?= $decisionCounts[$i] ?></span>
                          </div>
                          <?php endforeach; ?>
                          <?php if (empty($decisionLabels)): ?><p class="text-muted small text-center mt-2">No data yet</p><?php endif; ?>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Status Bar -->
                  <div class="row g-4 mt-0">
                    <div class="col-12">
                      <div class="chart-card">
                        <div class="chart-card-title"><i class="bx bx-signal-5 text-info"></i> Status Distribution</div>
                        <canvas id="statusChart" height="60"></canvas>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ════════════════════════════════════════════════ -->
                <!-- TAB 2: NEW MEMBERS LIST                         -->
                <!-- ════════════════════════════════════════════════ -->
                <div class="tab-pane fade" id="pane-list" role="tabpanel">

                  <!-- Sub Header -->
                  <div class="card glass-card mb-4 border-0 p-4" style="background:rgba(255,255,255,.45);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.6)!important;border-radius:16px;">
                    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                      <div class="d-flex align-items-center gap-3">
                        <div style="width:48px;height:48px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;">
                          <i class="bx bx-user-plus"></i>
                        </div>
                        <div>
                          <h5 class="mb-0 fw-bold" style="color:#1e1b4b;">New Members Follow-Up Record</h5>
                          <p class="text-muted mb-0 small">All new members from the last 30 days.</p>
                        </div>
                      </div>
                      <!-- Filter Form -->
                      <form method="GET" class="d-flex gap-2 align-items-center flex-wrap" id="filterForm">
                        <input type="hidden" name="page" value="1">
                        <input type="hidden" id="activeTabInput" name="tab" value="list">
                        
                        <!-- Date Range Filters -->
                        <div class="input-group input-group-sm" style="min-width:260px;">
                          <span class="input-group-text rounded-start-pill border-end-0 bg-transparent"><i class="bx bx-calendar"></i></span>
                          <input type="date" name="start_date" class="form-control border-start-0 px-1" value="<?= htmlspecialchars((string)$startDate) ?>" onchange="this.form.submit()">
                          <span class="input-group-text bg-transparent border-start-0 border-end-0 text-muted px-2">to</span>
                          <input type="date" name="end_date" class="form-control rounded-end-pill border-start-0 px-1" value="<?= htmlspecialchars((string)$endDate) ?>" onchange="this.form.submit()">
                        </div>

                        <select name="status" class="form-select form-select-sm rounded-pill" style="min-width:160px;" onchange="this.form.submit()">
                          <option value="">All Statuses</option>
                          <option value="uncontacted" <?= $filterStatus=='uncontacted'?'selected':'' ?>>🔴 Uncontacted</option>
                          <option value="attempted"   <?= $filterStatus=='attempted'?'selected':'' ?>>🟡 Attempted</option>
                          <option value="contacted"   <?= $filterStatus=='contacted'?'selected':'' ?>>🟢 Contacted</option>
                          <option value="cell_assigned" <?= $filterStatus=='cell_assigned'?'selected':'' ?>>🔵 Cell Assigned</option>
                        </select>
                        <div class="input-group input-group-sm" style="min-width:200px;">
                          <input type="text" name="search" class="form-control rounded-pill rounded-end" placeholder="Search name / phone…" value="<?= htmlspecialchars((string)($search ?? '')) ?>">
                          <button class="btn btn-primary btn-sm rounded-pill rounded-start" type="submit"><i class="bx bx-search"></i></button>
                        </div>
                        <button type="submit" formaction="export_assimilation_csv.php" formtarget="_blank" class="btn btn-sm btn-outline-success rounded-pill px-3">
                          <i class="bx bx-spreadsheet me-1"></i> Export CSV
                        </button>
                        <button type="submit" formaction="export_assimilation_pdf.php" formtarget="_blank" class="btn btn-sm btn-outline-danger rounded-pill px-3">
                          <i class="bx bx-file me-1"></i> Export PDF
                        </button>
                      </form>
                    </div>
                  </div>

                  <!-- Table -->
                  <div class="card border-0 shadow-sm" style="border-radius:16px;overflow:hidden;">
                    <div class="card-body p-0">
                      <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0 asim-table">
                          <thead style="background:linear-gradient(135deg,rgba(102,126,234,.08),rgba(118,75,162,.05));">
                            <tr>
                              <th class="py-3 ps-4">Member</th>
                              <th>Date Added</th>
                              <th>Decision Type</th>
                              <th>Contact</th>
                              <th>Status</th>
                              <th>Assigned To</th>
                              <th>Follow-Ups</th>
                              <th class="pe-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <?php if (empty($membersList)): ?>
                            <tr><td colspan="8" class="text-center py-5 text-muted">
                              <i class="bx bx-user-x fs-1 d-block mb-2"></i>No members found
                            </td></tr>
                            <?php else: foreach ($membersList as $m):
                              $initials = strtoupper(substr($m['first_name'],0,1) . substr($m['last_name'],0,1));
                              $hoursAgo = $m['hours_since_added'] < 24 ? $m['hours_since_added'].'h ago' : floor($m['hours_since_added']/24).'d ago';
                              $statusBadge = '<span class="status-badge status-'.$m['assimilation_status'].'">'.str_replace('_',' ',$m['assimilation_status']).'</span>';
                            ?>
                            <tr>
                              <td class="ps-4">
                                <div class="d-flex align-items-center gap-2">
                                  <div style="width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.85rem;flex-shrink:0;"><?= $initials ?></div>
                                  <div>
                                    <div class="fw-semibold" style="color:#1e1b4b;"><?= htmlspecialchars((string)(($m['first_name']??'').' '.($m['last_name']??''))) ?></div>
                                    <div class="text-muted" style="font-size:.75rem;"><?= htmlspecialchars((string)($m['email'] ?? '-')) ?></div>
                                    <?php if ($m['sla_breached']): ?><div class="sla-alert"><i class="bx bx-error me-1"></i>SLA Breach (&gt;48h)</div><?php endif; ?>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style="font-size:.82rem;"><?= date('M j, Y', strtotime($m['joined_on'])) ?></div>
                                <div class="text-muted" style="font-size:.72rem;"><?= $hoursAgo ?></div>
                              </td>
                              <td><span class="badge bg-label-secondary rounded-pill px-2 py-1" style="font-size:.72rem;"><?= decisionLabel($m['decision_type']) ?></span></td>
                              <td><a href="tel:<?= htmlspecialchars($m['phone_no']) ?>" class="text-decoration-none fw-semibold" style="font-size:.85rem;color:#667eea;"><?= htmlspecialchars($m['phone_no'] ?? '—') ?></a></td>
                              <td><span class="status-badge status-<?= $m['assimilation_status'] ?>"><?= str_replace('_',' ',$m['assimilation_status']) ?></span></td>
                              <td><span class="text-muted small"><?= htmlspecialchars($m['assigned_to_name']) ?></span></td>
                              <td>
                                <span class="badge rounded-pill px-3 py-1 fw-bold" style="background:<?= $m['followup_count']>0?'rgba(102,126,234,.1)':'rgba(156,163,175,.1)' ?>;color:<?= $m['followup_count']>0?'#667eea':'#9ca3af' ?>;">
                                  <?= $m['followup_count'] ?> log<?= $m['followup_count']!=1?'s':'' ?>
                                </span>
                              </td>
                              <td class="pe-4">
                                <div class="d-flex gap-1">
                                  <button class="btn btn-sm btn-primary rounded-pill px-3"
                                    onclick="openFollowUpModal(<?= $m['assimilation_id'] ?>,'<?= htmlspecialchars(addslashes((string)(($m['first_name']??'').' '.($m['last_name']??'')))) ?>')"
                                    title="Log Follow-Up"><i class="bx bx-phone-call me-1"></i>Log</button>
                                  <button class="btn btn-sm btn-outline-secondary rounded-pill px-2"
                                    onclick="openAssignModal(<?= $m['assimilation_id'] ?>)"
                                    title="Assign"><i class="bx bx-user-pin"></i></button>
                                </div>
                              </td>
                            </tr>
                            <?php endforeach; endif; ?>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <!-- Pagination -->
                  <?php if ($totalPages > 1): ?>
                  <div class="d-flex justify-content-between align-items-center mt-3 px-1">
                    <span class="text-muted small">Showing page <?= $page ?> of <?= $totalPages ?> (<?= $totalList ?> total)</span>
                    <div class="d-flex gap-2">
                      <?php if ($page > 1): ?>
                      <a href="?page=<?= $page-1 ?>&start_date=<?= urlencode($startDate) ?>&end_date=<?= urlencode($endDate) ?>&status=<?= urlencode($filterStatus) ?>&search=<?= urlencode($search) ?>#pane-list" class="btn btn-sm btn-outline-primary rounded-pill px-3"><i class="bx bx-chevron-left"></i> Prev</a>
                      <?php endif; ?>
                      <?php if ($page < $totalPages): ?>
                      <a href="?page=<?= $page+1 ?>&start_date=<?= urlencode($startDate) ?>&end_date=<?= urlencode($endDate) ?>&status=<?= urlencode($filterStatus) ?>&search=<?= urlencode($search) ?>#pane-list" class="btn btn-sm btn-outline-primary rounded-pill px-3">Next <i class="bx bx-chevron-right"></i></a>
                      <?php endif; ?>
                    </div>
                  </div>
                  <?php endif; ?>
                </div>

                <!-- ════════════════════════════════════════════════ -->
                <!-- TAB 3: OVERSIGHT                                -->
                <!-- ════════════════════════════════════════════════ -->
                <div class="tab-pane fade" id="pane-oversight" role="tabpanel">

                  <div class="card glass-card mb-4 border-0 p-4" style="background:rgba(255,255,255,.45);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.6)!important;border-radius:16px;">
                    <div class="d-flex align-items-center gap-3">
                      <div style="width:48px;height:48px;background:linear-gradient(135deg,#eb3349,#f45c43);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;"><i class="bx bx-shield-quarter"></i></div>
                      <div>
                        <h5 class="mb-0 fw-bold" style="color:#1e1b4b;">Senior Management Oversight</h5>
                        <p class="text-muted mb-0 small">Monitor team performance, SLA compliance, assimilation funnel and full audit trail.</p>
                      </div>
                    </div>
                  </div>

                  <div class="row g-4">
                    <!-- Staff Performance -->
                    <div class="col-12">
                      <div class="chart-card">
                        <div class="chart-card-title"><i class="bx bx-group text-primary"></i> Team Performance</div>
                        <?php if (!empty($staffPerformance)): ?>
                        <div class="table-responsive">
                          <table class="table asim-table align-middle mb-0">
                            <thead><tr>
                              <th>Staff / Volunteer</th><th>Assigned</th><th>Contacted</th><th>Uncontacted</th><th>Avg Response</th><th>SLA Breached</th>
                            </tr></thead>
                            <tbody>
                              <?php foreach ($staffPerformance as $s): ?>
                              <tr>
                                <td class="fw-semibold" style="color:#1e1b4b;"><?= htmlspecialchars((string)($s['staff_name'] ?? '')) ?></td>
                                <td><span class="badge bg-label-primary rounded-pill px-3"><?= $s['total_assigned'] ?></span></td>
                                <td><span class="badge rounded-pill px-3" style="background:rgba(16,185,129,.12);color:#059669;"><?= $s['contacted'] ?></span></td>
                                <td><span class="badge rounded-pill px-3" style="background:rgba(239,68,68,.12);color:#dc2626;"><?= $s['uncontacted'] ?></span></td>
                                <td><?= $s['avg_response_hours'] ? $s['avg_response_hours'].'h' : '—' ?></td>
                                <td><?= $s['sla_breached'] > 0 ? '<span class="badge bg-danger rounded-pill px-3">'.$s['sla_breached'].'</span>' : '<span class="text-success fw-bold">✓ None</span>' ?></td>
                              </tr>
                              <?php endforeach; ?>
                            </tbody>
                          </table>
                        </div>
                        <?php else: ?>
                        <div class="text-center py-4 text-muted"><i class="bx bx-user-x fs-1 d-block mb-2"></i>No staff assignments yet</div>
                        <?php endif; ?>
                      </div>
                    </div>

                    <!-- Aging Buckets + Funnel -->
                    <div class="col-lg-5">
                      <div class="chart-card h-100">
                        <div class="chart-card-title"><i class="bx bx-time text-danger"></i> Aging Buckets — Uncontacted</div>
                        <?php
                        $agingBuckets = [
                          ['label'=>'0 – 24 Hours', 'val'=>(int)($agingRow['h0_24']??0),  'color'=>'#10b981'],
                          ['label'=>'24 – 48 Hours','val'=>(int)($agingRow['h24_48']??0), 'color'=>'#f59e0b'],
                          ['label'=>'48 – 72 Hours','val'=>(int)($agingRow['h48_72']??0), 'color'=>'#ef4444'],
                          ['label'=>'> 72 Hours ⚠', 'val'=>(int)($agingRow['h72plus']??0),'color'=>'#7c3aed'],
                        ];
                        $agingMaxValues = array_column($agingBuckets,'val');
                        $agingMax = max(1, max($agingMaxValues));
                        foreach ($agingBuckets as $b):
                          $pct = round($b['val']/$agingMax*100);
                        ?>
                        <div class="mb-2">
                          <div class="d-flex justify-content-between small fw-semibold mb-1"><span><?= $b['label'] ?></span><span><?= $b['val'] ?></span></div>
                          <div style="background:#f3f4f6;border-radius:6px;height:24px;overflow:hidden;">
                            <div class="aging-bar" style="width:<?= $pct ?>%;background:<?= $b['color'] ?>;min-width:<?= $b['val']>0?'30px':'0' ?>;"><?= $b['val']>0?$b['val']:'' ?></div>
                          </div>
                        </div>
                        <?php endforeach; ?>
                      </div>
                    </div>

                    <div class="col-lg-7">
                      <div class="chart-card h-100">
                        <div class="chart-card-title"><i class="bx bx-filter-alt" style="color:#764ba2;"></i> Assimilation Funnel</div>
                        <?php $funnelColors = ['#667eea','#11998e','#f7971e','#eb3349'];
                        foreach ($funnel as $i => $f): ?>
                        <div class="mb-3">
                          <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="fw-semibold small"><?= $f['stage'] ?></span>
                            <span class="fw-bold small" style="color:<?= $funnelColors[$i] ?>;"><?= $f['count'] ?> members (<?= $f['pct'] ?>%)</span>
                          </div>
                          <div style="background:#f3f4f6;border-radius:8px;height:38px;overflow:hidden;">
                            <div class="funnel-bar" style="width:<?= $f['pct'] ?>%;background:<?= $funnelColors[$i] ?>;min-width:<?= $f['count']>0?'50px':'0' ?>;"><?= $f['pct'] > 8 ? $f['pct'].'%' : '' ?></div>
                          </div>
                        </div>
                        <?php endforeach; ?>
                      </div>
                    </div>

                    <!-- Audit Log -->
                    <div class="col-12">
                      <div class="chart-card">
                        <div class="chart-card-title"><i class="bx bx-history text-info"></i> Audit Log — Recent Follow-Up Actions</div>
                        <?php if (!empty($auditLog)):
                        $contactIcons = ['phone_call'=>'📞','sms_whatsapp'=>'💬','home_visit'=>'🏠','coffee_meetup'=>'☕'];
                        foreach ($auditLog as $log): ?>
                        <div class="audit-item">
                          <div class="audit-avatar" style="background:rgba(102,126,234,.1);font-size:1.2rem;"><?= $contactIcons[$log['contact_type']] ?? '📋' ?></div>
                          <div class="flex-grow-1">
                            <div class="fw-semibold small" style="color:#1e1b4b;">
                              <?= htmlspecialchars((string)($log['logged_by_name']??'')) ?> logged a <strong><?= str_replace('_',' ',$log['contact_type']) ?></strong>
                              for <strong><?= htmlspecialchars((string)($log['member_name']??'')) ?></strong>
                              <?php if ($log['reached']): ?><span class="badge rounded-pill px-2 py-1" style="background:rgba(16,185,129,.12);color:#059669;font-size:.7rem;">✓ Reached</span>
                              <?php else: ?><span class="badge rounded-pill px-2 py-1" style="background:rgba(245,158,11,.12);color:#d97706;font-size:.7rem;">📵 Not Reached</span><?php endif; ?>
                            </div>
                            <div class="text-muted" style="font-size:.75rem;"><?= date('M j, Y g:i A', strtotime($log['logged_at'])) ?></div>
                          </div>
                          <div><span class="badge bg-label-secondary rounded-pill px-2 small"><?= str_replace('_',' ',$log['resulting_status']) ?></span></div>
                        </div>
                        <?php endforeach; else: ?>
                        <div class="text-center py-4 text-muted"><i class="bx bx-history fs-1 d-block mb-2"></i>No follow-up activity yet</div>
                        <?php endif; ?>
                      </div>
                    </div>
                  </div>

                </div><!-- /oversight pane -->
              </div><!-- /tab-content -->

              <?php endif; // end dbError check ?>

            </div><!-- /container -->
            <?php @include('includes/footer.php'); ?>
          </div><!-- /content-wrapper -->
        </div><!-- /layout-page -->
      </div><!-- /layout-container -->
      <!-- Overlay -->
      <div class="layout-overlay layout-menu-toggle"></div>
    </div><!-- /layout-wrapper -->

    <!-- ════════════════════════════════════════════════════════════ -->
    <!-- LOG FOLLOW-UP MODAL                                        -->
    <!-- ════════════════════════════════════════════════════════════ -->
    <div class="modal fade modal-glass" id="followUpModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <div>
              <h5 class="modal-title fw-bold" style="color:#1e1b4b;"><i class="bx bx-phone-call me-2 text-primary"></i>Log Follow-Up Contact</h5>
              <p class="text-muted small mb-0" id="modalMemberName">—</p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body pt-3">
            <input type="hidden" id="modalAssimId">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold small text-muted text-uppercase" style="letter-spacing:.06em;">Contact Type</label>
                <select class="form-select" id="contactType">
                  <option value="phone_call">📞 Phone Call</option>
                  <option value="sms_whatsapp">💬 SMS / WhatsApp</option>
                  <option value="home_visit">🏠 Home Visit</option>
                  <option value="coffee_meetup">☕ Coffee Meetup</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small text-muted text-uppercase" style="letter-spacing:.06em;">Did You Reach Them?</label>
                <div class="d-flex gap-3 mt-1">
                  <div class="form-check"><input class="form-check-input" type="radio" name="reached" id="reachedYes" value="1"><label class="form-check-label fw-semibold text-success" for="reachedYes">✅ Yes, reached</label></div>
                  <div class="form-check"><input class="form-check-input" type="radio" name="reached" id="reachedNo" value="0" checked><label class="form-check-label fw-semibold text-warning" for="reachedNo">📵 Not answered</label></div>
                </div>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold small text-muted text-uppercase" style="letter-spacing:.06em;">Outcome / What Happened?</label>
                <div class="d-flex flex-wrap gap-2" id="outcomeTags">
                  <?php foreach (['Prayed together','Answered questions about faith','Invited to cell group','Shared church vision','Needs follow-up from Pastor','Attended a service','Expressed interest in membership class','Requested prayer for personal matter'] as $tag): ?>
                  <span class="outcome-tag" data-value="<?= htmlspecialchars((string)$tag) ?>"><?= htmlspecialchars((string)$tag) ?></span>
                  <?php endforeach; ?>
                </div>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold small text-muted text-uppercase" style="letter-spacing:.06em;">Next Steps</label>
                <div class="row g-2">
                  <?php foreach (['Schedule another call','Connect to Cell Leader','Enroll in Foundations Class','Invite to upcoming event','Escalate to Senior Pastor','No further action needed'] as $i => $step): ?>
                  <div class="col-md-4 col-6">
                    <div class="form-check"><input class="form-check-input next-step-check" type="checkbox" value="<?= htmlspecialchars((string)$step) ?>" id="ns<?= $i ?>"><label class="form-check-label small" for="ns<?= $i ?>"><?= htmlspecialchars((string)$step) ?></label></div>
                  </div>
                  <?php endforeach; ?>
                </div>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold small text-muted text-uppercase" style="letter-spacing:.06em;">Additional Notes</label>
                <textarea class="form-control" id="followupNotes" rows="2" placeholder="Any extra context or pastoral notes…"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-sm rounded-pill px-4 text-white fw-bold" id="submitFollowUp" style="background:linear-gradient(135deg,#667eea,#764ba2);">
              <i class="bx bx-check me-1"></i> Submit Follow-Up
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ASSIGN MODAL -->
    <div class="modal fade modal-glass" id="assignModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold" style="color:#1e1b4b;"><i class="bx bx-user-pin me-2 text-primary"></i>Assign Follow-Up</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="assignAssimId">
            <div class="mb-3">
              <label class="form-label fw-semibold small text-uppercase text-muted">Select Role</label>
              <select class="form-select" id="assignRole">
                <option value="">— Select Role —</option>
                <?php foreach ($rolesList as $role): ?>
                <option value="<?= $role['id'] ?>"><?= htmlspecialchars((string)$role['name']) ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold small text-uppercase text-muted">Assign To (User)</label>
              <select class="form-select" id="assignUser">
                <option value="">Select a role first…</option>
              </select>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button class="btn btn-sm btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-sm rounded-pill px-4 text-white fw-bold" id="submitAssign" style="background:linear-gradient(135deg,#11998e,#38ef7d);">
              <i class="bx bx-check me-1"></i> Assign
            </button>
          </div>
        </div>
      </div>
    </div>

    <?php @include('includes/scripts.html'); ?>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
      try {
        // ── Chart.js: Trend Line ──────────────────────────────────────
        const trendEl = document.getElementById('trendChart');
        if (trendEl) {
          new Chart(trendEl.getContext('2d'), {
            type:'line',
            data:{
              labels: <?= json_encode($trendLabels) ?>,
              datasets:[{
                label:'New Members',
                data: <?= json_encode($trendData) ?>,
                borderColor:'#667eea', backgroundColor:'rgba(102,126,234,.08)',
                borderWidth:2.5, fill:true, tension:0.4, pointRadius:3, pointBackgroundColor:'#667eea'
              }]
            },
            options:{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{stepSize:1}}} }
          });
        }

        // ── Chart.js: Decision Donut ──────────────────────────────────
        const decEl = document.getElementById('decisionChart');
        if (decEl) {
          const decColors = ['#667eea','#764ba2','#11998e','#f7971e','#eb3349','#4facfe'];
          new Chart(decEl.getContext('2d'), {
            type:'doughnut',
            data:{
              labels: <?= json_encode($decisionLabels) ?>,
              datasets:[{ data: <?= json_encode($decisionCounts) ?>, backgroundColor:decColors, borderWidth:2, borderColor:'#fff' }]
            },
            options:{ responsive:true, cutout:'65%', plugins:{legend:{display:false}} }
          });
        }

        // ── Chart.js: Status Bar ──────────────────────────────────────
        const statusEl = document.getElementById('statusChart');
        if (statusEl) {
          const statusMap = <?= json_encode($statusMap) ?>;
          new Chart(statusEl.getContext('2d'), {
            type:'bar',
            data:{
              labels:['Uncontacted','Attempted','Contacted','Cell Assigned'],
              datasets:[{
                data:[statusMap.uncontacted||0, statusMap.attempted||0, statusMap.contacted||0, statusMap.cell_assigned||0],
                backgroundColor:['#dc2626','#d97706','#059669','#2563eb'], borderRadius:8, borderSkipped:false
              }]
            },
            options:{ responsive:true, indexAxis:'y', plugins:{legend:{display:false}}, scales:{x:{beginAtZero:true,ticks:{stepSize:1}}} }
          });
        }
      } catch (e) { console.error('Chart init error:', e); }

      // ── Outcome Tag Toggle ────────────────────────────────────────
      document.querySelectorAll('.outcome-tag').forEach(tag => tag.addEventListener('click', () => tag.classList.toggle('selected')));

      const submitFollowUp = document.getElementById('submitFollowUp');
      if (submitFollowUp) {
        submitFollowUp.addEventListener('click', async () => {
          const btn = document.getElementById('submitFollowUp');
          btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving…';

          const payload = {
            assimilation_id: parseInt(document.getElementById('modalAssimId').value),
            contact_type:    document.getElementById('contactType').value,
            reached:         parseInt(document.querySelector('input[name="reached"]:checked').value),
            outcome_tags:    [...document.querySelectorAll('.outcome-tag.selected')].map(t=>t.dataset.value),
            next_steps:      [...document.querySelectorAll('.next-step-check:checked')].map(c=>c.value),
            notes:           document.getElementById('followupNotes').value,
          };

          console.log('[API Call] POST manage/log_assimilation_followup.php');
          console.log('[API Payload]', payload);

          try {
            const res = await fetch('manage/log_assimilation_followup.php', {
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body:JSON.stringify(payload)
            });
            console.log('[API Response Status]', res.status, res.statusText);
            
            const data = await res.json();
            console.log('[API Response Data]', data);
            
            btn.disabled = false; btn.innerHTML = '<i class="bx bx-check me-1"></i> Submit Follow-Up';
            if (data.success) {
              if (typeof bootstrap !== 'undefined') {
                bootstrap.Modal.getInstance(document.getElementById('followUpModal')).hide();
              }
              showToast('Follow-up logged! Refreshing…', 'success');
              setTimeout(() => location.reload(), 1200);
            } else {
              showToast(data.error || 'Failed to log follow-up', 'error');
              console.error('[API Error] Log Follow-up Failed:', data.error);
            }
          } catch(e) { 
            btn.disabled=false; 
            showToast('Network error','error');
            console.error('[API Exception] log_assimilation_followup.php threw an error:', e);
          }
        });
      }

      const assignRole = document.getElementById('assignRole');
      if (assignRole) {
        assignRole.addEventListener('change', async function() {
          const roleId = this.value;
          const uSelect = document.getElementById('assignUser');
          if (!roleId) { uSelect.innerHTML = '<option value="">Select role first…</option>'; return; }
          uSelect.innerHTML = '<option value="">Loading…</option>';
          console.log(`[API Call] GET manage/get_users_by_role.php?role_id=${roleId}`);
          
          try {
            const res = await fetch(`manage/get_users_by_role.php?role_id=${roleId}`);
            console.log('[API Response Status]', res.status, res.statusText);
            
            const data = await res.json();
            console.log('[API Response Data]', data);
            
            const users = data.data?.users || [];
            uSelect.innerHTML = '<option value="">— Select Person —</option>' + users.map(u=>`<option value="${u.id}">${u.display_name}</option>`).join('');
            if (!users.length) uSelect.innerHTML = '<option value="">No users in this role</option>';
          } catch (e) {
            console.error('[API Exception] get_users_by_role.php threw an error:', e);
            uSelect.innerHTML = '<option value="">Error loading users</option>';
          }
        });
      }

      const submitAssign = document.getElementById('submitAssign');
      if (submitAssign) {
        submitAssign.addEventListener('click', async () => {
          const assimId = parseInt(document.getElementById('assignAssimId').value);
          const userId  = parseInt(document.getElementById('assignUser').value);
          const roleId  = parseInt(document.getElementById('assignRole').value);
          if (!userId) { showToast('Please select a user','warning'); return; }
          const payload = { assimilation_id:assimId, assigned_to:userId, assigned_role_id:roleId };
          
          console.log('[API Call] POST manage/assign_assimilation.php');
          console.log('[API Payload]', payload);
          
          try {
            const res = await fetch('manage/assign_assimilation.php', {
              method:'POST', headers:{'Content-Type':'application/json'},
              body:JSON.stringify(payload)
            });
            console.log('[API Response Status]', res.status, res.statusText);
            
            const data = await res.json();
            console.log('[API Response Data]', data);
            
            if (data.success) {
              showToast('Member assigned! Refreshing…','success');
              if (typeof bootstrap !== 'undefined') {
                bootstrap.Modal.getInstance(document.getElementById('assignModal')).hide();
              }
              setTimeout(() => location.reload(), 1200);
            } else { 
              showToast(data.error||'Assignment failed','error'); 
              console.error('[API Error] Assignment Failed:', data.error);
            }
          } catch(e) {
            showToast('Network error','error');
            console.error('[API Exception] assign_assimilation.php threw an error:', e);
          }
        });
      }

      // ── Tab persistence (restore last tab after page reload) ──────
      const savedTab = sessionStorage.getItem('assimTab');
      if (savedTab) { 
        const el = document.querySelector(`[data-bs-target="${savedTab}"]`); 
        if(el && typeof bootstrap !== 'undefined') {
          try { new bootstrap.Tab(el).show(); } catch (e) {}
        }
      }
      document.querySelectorAll('#assimTabs .nav-link').forEach(link => {
        link.addEventListener('shown.bs.tab', e => sessionStorage.setItem('assimTab', e.target.getAttribute('data-bs-target')));
      });
    });

    // Modal openers (need to be global)
    window.openFollowUpModal = function(assimId, memberName) {
      document.getElementById('modalAssimId').value = assimId;
      document.getElementById('modalMemberName').textContent = 'For: ' + memberName;
      document.querySelectorAll('.outcome-tag').forEach(t=>t.classList.remove('selected'));
      document.querySelectorAll('.next-step-check').forEach(c=>c.checked=false);
      document.getElementById('followupNotes').value = '';
      document.getElementById('reachedNo').checked = true;
      if (typeof bootstrap !== 'undefined') {
        new bootstrap.Modal(document.getElementById('followUpModal')).show();
      }
    };

    window.openAssignModal = function(assimId) {
      document.getElementById('assignAssimId').value = assimId;
      document.getElementById('assignUser').innerHTML = '<option value="">Select role first…</option>';
      if (typeof bootstrap !== 'undefined') {
        new bootstrap.Modal(document.getElementById('assignModal')).show();
      }
    };

    // ── Toast Helper ──────────────────────────────────────────────
    window.showToast = function(msg, type='success') {
      const colors = {success:'#10b981',error:'#ef4444',warning:'#f59e0b',info:'#3b82f6'};
      const icons  = {success:'bx-check-circle',error:'bx-x-circle',warning:'bx-error',info:'bx-info-circle'};
      const d = document.createElement('div');
      d.innerHTML = `<div style="position:fixed;top:20px;right:20px;z-index:9999;background:${colors[type]};color:#fff;padding:12px 20px;border-radius:12px;display:flex;align-items:center;gap:10px;box-shadow:0 10px 25px rgba(0,0,0,.15);font-weight:600;font-size:.9rem;animation:slideIn .3s ease;">
        <i class="bx ${icons[type]}" style="font-size:1.2rem;"></i>${msg}
      </div>`;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 3500);
    };
    </script>
  </body>
</html>

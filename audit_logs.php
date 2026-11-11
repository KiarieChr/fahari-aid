<?php
include('includes/checklogin.php');

$title = "System Settings | Audit Trail Logs";
include("includes/get_user.php");
require_once 'manage/functions.php';

// ── Self-healing Permission check/registration ──────────────────────────────
// Check if the permission exists; if not, create it and assign to Admin roles
$check_perm = $db->prepare("SELECT id FROM permissions WHERE name = 'view_audit_logs' LIMIT 1");
$check_perm->execute();
$perm_exists = $check_perm->fetch();
if (!$perm_exists) {
    try {
        // Find or create 'System' permission category
        $cat_stmt = $db->prepare("SELECT id FROM permission_category WHERE name = 'System' LIMIT 1");
        $cat_stmt->execute();
        $cat_id = $cat_stmt->fetchColumn();
        if (!$cat_id) {
            $db->query("INSERT INTO permission_category (name) VALUES ('System')");
            $cat_id = $db->lastInsertId();
        }
        
        // Insert view_audit_logs permission
        $db->prepare("INSERT INTO permissions (name, category) VALUES ('view_audit_logs', :cat)")
           ->execute([':cat' => $cat_id]);
        $new_perm_id = $db->lastInsertId();
        
        // Assign to Admin/General Admin roles
        $roles_stmt = $db->query("SELECT id FROM roles WHERE name IN ('Administrator', 'General Admin')");
        $role_ids = $roles_stmt->fetchAll(PDO::FETCH_COLUMN);
        foreach ($role_ids as $r_id) {
            $db->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (:role, :perm)")
               ->execute([':role' => $r_id, ':perm' => $new_perm_id]);
        }
    } catch (Exception $e) {
        // Fail-silent, standard check below will handle permission restriction
    }
}

// Enforce view_audit_logs permission check
if (!userHasPermission($db, $user_id, 'view_audit_logs')) {
    echo "<script>
        document.addEventListener('DOMContentLoaded', function() {
            Swal.fire({
                title: 'Access Denied',
                text: 'You do not have permission to view the System Audit Trail.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#dc3545'
            }).then(() => {
                window.location.href = 'dashboard.php';
            });
            setTimeout(function() {
                window.location.href = 'dashboard.php';
            }, 3000);
        });
    </script>";
    exit;
}

// ── Metrics Calculations ──────────────────────────────────────────────────────
$total_stmt = $db->query("SELECT COUNT(*) AS total FROM audit_log");
$total_logs = $total_stmt->fetchColumn();

$today_stmt = $db->query("SELECT COUNT(*) AS total_today FROM audit_log WHERE DATE(created_at) = CURDATE()");
$logs_today = $today_stmt->fetchColumn();

$actions_stmt = $db->query("
    SELECT 
        SUM(action = 'create') AS creates,
        SUM(action = 'update') AS updates,
        SUM(action = 'delete') AS deletes
    FROM audit_log
");
$actions = $actions_stmt->fetch(PDO::FETCH_ASSOC);

// ── Fetch Audit Logs ──────────────────────────────────────────────────────────
$logs_stmt = $db->prepare("
    SELECT 
        al.id,
        al.table_name,
        al.record_id,
        al.action,
        al.old_values,
        al.new_values,
        al.ip_address,
        al.created_at,
        m.first_name,
        m.last_name,
        m.email
    FROM audit_log al
    LEFT JOIN users u ON al.user_id = u.id
    LEFT JOIN member m ON u.member_id = m.id
    ORDER BY al.created_at DESC
    LIMIT 1500
");
$logs_stmt->execute();
$logs = $logs_stmt->fetchAll(PDO::FETCH_ASSOC);
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
    /* ── Design tokens ─────────────────────────────────────── */
    :root {
      --c-primary : #1a0533;
      --c-accent  : #6f42c1;
      --c-success : #28a745;
      --c-warning : #ffc107;
      --c-danger  : #dc3545;
      --c-info    : #17a2b8;
    }

    /* ── Page hero ─────────────────────────────────────────── */
    .page-hero {
      background: linear-gradient(135deg, var(--c-primary) 0%, #2d0a5e 55%, var(--c-accent) 100%);
      padding: 26px 32px;
      border-radius: 16px;
      color: #fff;
      margin-bottom: 28px;
      box-shadow: 0 8px 32px rgba(26,5,51,.32);
      position: relative;
      overflow: hidden;
    }
    .page-hero::before {
      content:'';
      position:absolute; top:-50px; right:-50px;
      width:220px; height:220px; border-radius:50%;
      background:rgba(255,255,255,.05);
    }
    .page-hero h4 { font-weight:700; font-size:1.45rem; margin:0 0 4px; }
    .page-hero p  { opacity:.8; font-size:.9rem; margin:0; }

    /* ── Stat cards ────────────────────────────────────────── */
    .stat-card {
      border-radius: 16px;
      padding: 22px 20px;
      color: #fff;
      border: none;
      box-shadow: 0 6px 22px rgba(0,0,0,.13);
      transition: transform .25s, box-shadow .25s;
      position: relative;
      overflow: hidden;
    }
    .stat-card:hover { transform:translateY(-5px); box-shadow:0 12px 32px rgba(0,0,0,.18); }
    .stat-card .s-icon {
      position:absolute; right:16px; top:16px;
      font-size:2.8rem; opacity:.18;
    }
    .stat-card .s-num {
      font-size:2.4rem; font-weight:800; line-height:1; display:block;
    }
    .stat-card .s-lbl {
      font-size:.78rem; text-transform:uppercase; letter-spacing:.06em;
      opacity:.85; margin-top:6px; display:block;
    }
    .sc-purple { background:linear-gradient(135deg,#6f42c1,#a06efc); }
    .sc-blue   { background:linear-gradient(135deg,#17a2b8,#3bd1e6); }
    .sc-green  { background:linear-gradient(135deg,#28a745,#55de7a); }
    .sc-orange { background:linear-gradient(135deg,#fd7e14,#ffc36b); }

    /* ── Table card ────────────────────────────────────────── */
    .table-card {
      border-radius:16px; border:none;
      box-shadow:0 4px 20px rgba(0,0,0,.07);
      overflow:hidden;
    }
    .table-card .card-header {
      background:#fff; border-bottom:1px solid #f0eaf8;
      padding:18px 24px;
      display:flex; align-items:center; justify-content:space-between;
      flex-wrap:wrap; gap:12px;
    }
    .table-card .card-header h5 {
      font-weight:700; color:var(--c-primary); margin:0; font-size:1.05rem;
    }

    /* ── Initials-based User Avatar ────────────────────────── */
    .user-avatar {
      width:32px; height:32px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:.8rem; font-weight:700; color:#fff; flex-shrink:0;
    }

    /* ── Action badges ─────────────────────────────────────── */
    .badge-create { background: rgba(40,167,69,.12); color: #28a745; }
    .badge-update { background: rgba(255,193,7,.15); color: #b38600; }
    .badge-delete { background: rgba(220,53,69,.12); color: #dc3545; }
    .badge-default { background: rgba(111,66,193,.12); color: #6f42c1; }

    /* ── Table name badges ─────────────────────────────────── */
    .badge-table {
      font-size: .8rem;
      font-weight: 600;
      text-transform: capitalize;
      border-radius: 8px;
      padding: 4px 10px;
    }

    /* ── Details comparison view CSS ───────────────────────── */
    .diff-table {
      border-collapse: separate;
      border-spacing: 0;
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #eae5f5;
    }
    .diff-table th {
      background: #faf8ff;
      padding: 12px 16px;
      font-size: .82rem;
      font-weight: 700;
      color: var(--c-primary);
      border-bottom: 1px solid #eae5f5;
    }
    .diff-table td {
      padding: 12px 16px;
      font-size: .85rem;
      border-bottom: 1px solid #eae5f5;
    }
    .diff-table tr:last-child td {
      border-bottom: none;
    }
    .table-danger-light { background-color: rgba(220,53,69,.04) !important; }
    .table-success-light { background-color: rgba(40,167,69,.04) !important; }
    .table-warning-light { background-color: rgba(255,193,7,.04) !important; }
    
    .text-decoration-line-through { text-decoration: line-through; }
    .italic { font-style: italic; }
    .font-semibold { font-weight: 600; }

    /* ── Action button ─────────────────────────────────────── */
    .btn-action {
      border-radius:10px; font-size:.82rem; font-weight:600;
      padding:6px 14px; border:none; transition:all .2s;
      display:inline-flex; align-items:center; gap:5px;
    }
    .btn-view  { background:#f0e8ff; color:var(--c-accent); }
    .btn-view:hover  { background:var(--c-accent); color:#fff; }

    /* ── Fade in ───────────────────────────────────────────── */
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .fade-up { animation:fadeUp .45s ease both; }
    .fade-up:nth-child(2) { animation-delay:.06s; }
    .fade-up:nth-child(3) { animation-delay:.12s; }
    .fade-up:nth-child(4) { animation-delay:.18s; }
    .fade-up:nth-child(5) { animation-delay:.24s; }
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

          <!-- ── Page Hero ──────────────────────────────────────── -->
          <div class="page-hero fade-up">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h4><i class="bx bx-history me-2"></i>Audit Trail Log</h4>
                <p>Track history, cell updates, attendance records, and administrator changes across the platform.</p>
              </div>
            </div>
          </div>

          <!-- ── Stats Row ──────────────────────────────────────── -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-purple h-100">
                <i class="bx bx-history s-icon"></i>
                <span class="s-num"><?= number_format($total_logs) ?></span>
                <span class="s-lbl">Total Audit Logs</span>
              </div>
            </div>
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-blue h-100">
                <i class="bx bx-calendar s-icon"></i>
                <span class="s-num"><?= number_format($logs_today) ?></span>
                <span class="s-lbl">Logs Volume Today</span>
              </div>
            </div>
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-green h-100">
                <i class="bx bx-plus-circle s-icon"></i>
                <span class="s-num"><?= number_format($actions['creates'] ?? 0) ?></span>
                <span class="s-lbl">Create Actions</span>
              </div>
            </div>
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-orange h-100">
                <i class="bx bx-edit s-icon"></i>
                <span class="s-num"><?= number_format($actions['updates'] ?? 0) ?></span>
                <span class="s-lbl">Update Actions</span>
              </div>
            </div>
          </div>

          <!-- ── Logs Table ─────────────────────────────────────── -->
          <div class="card table-card fade-up">
            <div class="card-header">
              <h5><i class="bx bx-list-ul me-2 text-primary"></i>Audit Trail Entries</h5>
              <div class="d-flex align-items-center gap-2">
                <span class="badge" style="background:#f0e8ff;color:var(--c-accent);font-size:.8rem;padding:6px 12px;">
                  Showing last <?= count($logs) ?> logs
                </span>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0" id="logsTable">
                <thead style="background:#faf7ff;">
                  <tr>
                    <th style="padding:14px 20px;">#</th>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Target Table</th>
                    <th>Record ID</th>
                    <th>Action</th>
                    <th>IP Address</th>
                    <th style="padding:14px 20px; text-align: center;">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <?php if (!empty($logs)): ?>
                  <?php foreach ($logs as $index => $row):
                    $logId     = $row['id'];
                    $tableName = $row['table_name'];
                    $recordId  = $row['record_id'];
                    $action    = strtolower($row['action']);
                    
                    // User Details
                    if ($row['first_name']) {
                        $userName = htmlspecialchars($row['first_name'] . ' ' . $row['last_name']);
                        $userInitial = strtoupper(substr($row['first_name'], 0, 1));
                    } else {
                        $userName = "System / Guest";
                        $userInitial = "S";
                    }
                    $avatarColor = '#' . substr(md5($row['email'] ?? 'system'), 0, 6);
                    
                    // Table badge color
                    $tableColor = '#6f42c1';
                    if ($tableName === 'member') $tableColor = '#28a745';
                    if ($tableName === 'attendance' || $tableName === 'cell_attendance') $tableColor = '#fd7e14';
                    if ($tableName === 'cells') $tableColor = '#17a2b8';
                    
                    // Action badge classes
                    $actionClass = 'badge-default';
                    if ($action === 'create') $actionClass = 'badge-create';
                    elseif ($action === 'update') $actionClass = 'badge-update';
                    elseif ($action === 'delete') $actionClass = 'badge-delete';
                    
                    // Dates
                    $timestamp = strtotime($row['created_at']);
                    $formattedDate = date("M d, Y h:i a", $timestamp);
                  ?>
                  <tr>
                    <td style="padding:14px 20px; color:#8a7baa; font-weight:600;"><?= $index + 1 ?></td>
                    <td class="fw-semibold" style="font-size: .88rem;"><?= $formattedDate ?></td>
                    
                    <!-- User -->
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="user-avatar" style="background:<?= $avatarColor ?>;"><?= $userInitial ?></div>
                        <span class="fw-semibold" style="font-size:.85rem;"><?= $userName ?></span>
                      </div>
                    </td>
                    
                    <!-- Target Table -->
                    <td>
                      <span class="badge text-white badge-table" style="background: <?= $tableColor ?>;">
                        <?= htmlspecialchars($tableName) ?>
                      </span>
                    </td>
                    
                    <!-- Record ID -->
                    <td class="fw-bold" style="font-size: .88rem; color: #555;">#<?= $recordId ?></td>
                    
                    <!-- Action -->
                    <td>
                      <span class="badge rounded-pill <?= $actionClass ?>" style="padding: 6px 14px; font-size: .8rem; font-weight: 600; text-transform: uppercase;">
                        <?= htmlspecialchars($action) ?>
                      </span>
                    </td>
                    
                    <!-- IP Address -->
                    <td class="text-muted" style="font-size: .85rem;"><?= htmlspecialchars($row['ip_address'] ?? 'N/A') ?></td>
                    
                    <!-- Actions -->
                    <td style="padding:14px 20px; text-align: center;">
                      <button type="button" 
                              class="btn-action btn-view"
                              onclick="showLogDetails(this)"
                              data-action="<?= htmlspecialchars($action) ?>"
                              data-table="<?= htmlspecialchars($tableName) ?>"
                              data-record-id="<?= $recordId ?>"
                              data-user="<?= htmlspecialchars($userName) ?>"
                              data-time="<?= $formattedDate ?>"
                              data-ip="<?= htmlspecialchars($row['ip_address'] ?? '') ?>"
                              data-old-values="<?= htmlspecialchars($row['old_values'] ?? '') ?>"
                              data-new-values="<?= htmlspecialchars($row['new_values'] ?? '') ?>">
                        <i class="bx bx-show"></i> View Details
                      </button>
                    </td>
                  </tr>
                  <?php endforeach; ?>
                  <?php else: ?>
                  <tr>
                    <td colspan="8" class="text-center py-5">
                      <i class="bx bx-history" style="font-size:3rem;color:#d0c4f0;display:block;margin-bottom:10px;"></i>
                      <h6 style="color:#6c757d;">No audit trail logs have been recorded yet</h6>
                    </td>
                  </tr>
                  <?php endif; ?>
                </tbody>
              </table>
            </div>
          </div>
          <!-- /Logs Table -->

        </div><!-- /container -->

        <?php @include("includes/footer.php"); ?>
        <div class="content-backdrop fade"></div>
      </div>
    </div>
  </div>
  <div class="layout-overlay layout-menu-toggle"></div>
</div>

<!-- Log Details Modal -->
<div class="modal fade" id="logDetailsModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content" style="border-radius: 16px; border: none; box-shadow: 0 10px 40px rgba(0,0,0,.15);">
      <div class="modal-header border-bottom-0 pb-0" style="padding: 24px 24px 0 24px;">
        <h5 class="modal-title fw-bold" style="color: var(--c-primary); font-size: 1.2rem;">
          <i class="bx bx-history me-1 text-primary"></i> Audit Log Payload Details
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      
      <div class="modal-body" style="padding: 24px;">
        <!-- Log Meta Details -->
        <div class="row g-3 mb-4 p-3" style="background: #faf8ff; border-radius: 12px; border: 1px dashed #eae5f5;">
          <div class="col-6 col-sm-4">
            <span class="text-muted d-block" style="font-size: .78rem; text-transform: uppercase;">Action</span>
            <span id="modalLogAction"></span>
          </div>
          <div class="col-6 col-sm-4">
            <span class="text-muted d-block" style="font-size: .78rem; text-transform: uppercase;">Target Table</span>
            <strong id="modalLogTable" class="text-primary text-capitalize"></strong>
          </div>
          <div class="col-6 col-sm-4">
            <span class="text-muted d-block" style="font-size: .78rem; text-transform: uppercase;">Record Reference</span>
            <strong id="modalLogRecordId" class="text-secondary"></strong>
          </div>
          <div class="col-6 col-sm-4 mt-2">
            <span class="text-muted d-block" style="font-size: .78rem; text-transform: uppercase;">Performed By</span>
            <span id="modalLogUser" class="fw-semibold"></span>
          </div>
          <div class="col-6 col-sm-4 mt-2">
            <span class="text-muted d-block" style="font-size: .78rem; text-transform: uppercase;">Timestamp</span>
            <span id="modalLogTime" class="text-muted"></span>
          </div>
          <div class="col-6 col-sm-4 mt-2">
            <span class="text-muted d-block" style="font-size: .78rem; text-transform: uppercase;">IP Address</span>
            <span id="modalLogIp" class="text-muted"></span>
          </div>
        </div>

        <!-- Field Differences Section -->
        <h6 class="fw-bold mb-3" style="color: var(--c-primary); font-size: .95rem;">
          <i class="bx bx-git-compare me-1 text-accent"></i> Field Differences Comparison
        </h6>
        
        <table class="diff-table" id="modalDetailsTable">
          <thead>
            <tr>
              <th width="30%">Field Name</th>
              <th width="35%">Old / Previous Value</th>
              <th width="35%">New / Updated Value</th>
            </tr>
          </thead>
          <tbody>
            <!-- Populated via Javascript -->
          </tbody>
        </table>
      </div>

      <div class="modal-footer border-top-0 pt-0" style="padding: 24px;">
        <button type="button" class="btn btn-primary w-100" style="border-radius: 10px; background: var(--c-accent); border: none;" data-bs-dismiss="modal">
          Close Details View
        </button>
      </div>
    </div>
  </div>
</div>

<?php include('includes/scripts.html'); ?>
<script>
  $(document).ready(function() {
    $('#logsTable').DataTable({
      paging      : true,
      searching   : true,
      ordering    : true,
      info        : true,
      lengthChange: true,
      pageLength  : 20,
      columnDefs  : [{ orderable: false, targets: [7] }],
      language: {
        searchPlaceholder: 'Search audit logs...',
        search: ''
      }
    });
  });

  function getActionBadgeClass(action) {
    switch (action.toLowerCase()) {
      case 'create': return 'badge-create';
      case 'update': return 'badge-update';
      case 'delete': return 'badge-delete';
      default: return 'badge-default';
    }
  }

  function formatFieldName(field) {
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  function formatValue(val) {
    if (val === null) return '<span class="badge bg-secondary">NULL</span>';
    if (val === undefined) return '';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  }

  function showLogDetails(btn) {
    const action = $(btn).attr('data-action') || '';
    const table = $(btn).attr('data-table') || '';
    const recordId = $(btn).attr('data-record-id') || '';
    const user = $(btn).attr('data-user') || '';
    const time = $(btn).attr('data-time') || '';
    const ip = $(btn).attr('data-ip') || 'N/A';
    
    // Retrieve attributes as plain text / JSON
    let oldVals = null;
    let newVals = null;
    
    const rawOld = $(btn).attr('data-old-values');
    const rawNew = $(btn).attr('data-new-values');
    
    if (rawOld && rawOld.trim() !== '') {
      try {
        oldVals = JSON.parse(rawOld);
      } catch (e) {
        console.error("Failed to parse raw old values", e);
      }
    }
    if (rawNew && rawNew.trim() !== '') {
      try {
        newVals = JSON.parse(rawNew);
      } catch (e) {
        console.error("Failed to parse raw new values", e);
      }
    }
    
    // Header details
    $('#modalLogAction').text(action.toUpperCase()).removeClass().addClass('badge ' + getActionBadgeClass(action));
    $('#modalLogTable').text(table);
    $('#modalLogRecordId').text('#' + recordId);
    $('#modalLogUser').text(user);
    $('#modalLogTime').text(time);
    $('#modalLogIp').text(ip);
    
    // Generate comparison table
    const tbody = $('#modalDetailsTable tbody');
    tbody.empty();
    
    // Collect all unique keys from both old and new values
    const allKeys = new Set();
    if (oldVals && typeof oldVals === 'object') {
      Object.keys(oldVals).forEach(k => allKeys.add(k));
    }
    if (newVals && typeof newVals === 'object') {
      Object.keys(newVals).forEach(k => allKeys.add(k));
    }
    
    let hasChanges = false;
    
    allKeys.forEach(key => {
      const oldVal = oldVals ? oldVals[key] : undefined;
      const newVal = newVals ? newVals[key] : undefined;
      
      // Compare values
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        hasChanges = true;
        
        let displayOld = formatValue(oldVal);
        let displayNew = formatValue(newVal);
        
        let rowClass = '';
        let oldClass = '';
        let newClass = '';
        
        if (oldVal !== undefined && newVal === undefined) {
          rowClass = 'table-danger-light';
          oldClass = 'text-danger font-semibold';
          displayNew = '<span class="text-muted italic">Deleted</span>';
        } else if (oldVal === undefined && newVal !== undefined) {
          rowClass = 'table-success-light';
          newClass = 'text-success font-semibold';
          displayOld = '<span class="text-muted italic">None</span>';
        } else {
          rowClass = 'table-warning-light';
          oldClass = 'text-danger text-decoration-line-through';
          newClass = 'text-success font-semibold';
        }
        
        tbody.append(`
          <tr class="${rowClass}">
            <td class="fw-bold text-secondary" style="font-size: .85rem;">${formatFieldName(key)}</td>
            <td class="${oldClass}" style="font-size: .85rem; max-width: 250px; word-break: break-all;">${displayOld}</td>
            <td class="${newClass}" style="font-size: .85rem; max-width: 250px; word-break: break-all;">${displayNew}</td>
          </tr>
        `);
      }
    });
    
    if (!hasChanges) {
      tbody.append(`
        <tr>
          <td colspan="3" class="text-center py-4 text-muted italic">
            <i class="bx bx-info-circle me-1"></i> No differences or changes detected in this action payload.
          </td>
        </tr>
      `);
    }
    
    $('#logDetailsModal').modal('show');
  }
</script>
</body>
</html>

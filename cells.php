<?php
include('includes/checklogin.php');

$title = "Cell Management | Cell Directory";
include("includes/get_user.php");

// ── Aggregate Stats — count directly from member table ───────────────────────
$assigned_row = $db->query("
    SELECT
        COUNT(*) AS total_assigned
    FROM member
    WHERE cell_id IS NOT NULL
      AND (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0')
")->fetch(PDO::FETCH_ASSOC);

$members_row = $db->query("
    SELECT COUNT(*) AS total_members
    FROM member
    WHERE (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0')
")->fetch(PDO::FETCH_ASSOC);

$cells_row = $db->query("
    SELECT
        COUNT(*)          AS total_cells,
        SUM(status = 1)   AS active_cells,
        SUM(status != 1)  AS closed_cells
    FROM cells
")->fetch(PDO::FETCH_ASSOC);

$stats = array_merge($cells_row, $assigned_row, $members_row);
$unassigned = max(0, $stats['total_members'] - $stats['total_assigned']);

// ── Cell rows — LEFT JOIN member table, GROUP BY for member count ─────────────
$sql = "
    SELECT
        c.id, c.code, c.name, c.status,
        ldr.first_name, ldr.last_name, ldr.phone_no,
        COUNT(mb.id) AS member_count
    FROM cells c
    JOIN   member ldr ON ldr.id = c.cell_leader
    LEFT JOIN member mb  ON mb.cell_id = c.id
                        AND (mb.delete_status IS NULL OR mb.delete_status = 'Active' OR mb.delete_status = '0')
    GROUP BY c.id, c.code, c.name, c.status,
             ldr.first_name, ldr.last_name, ldr.phone_no
    ORDER BY c.id DESC
";
$quer  = $db->prepare($sql);
$quer->execute();
$cells = $quer->fetchAll(PDO::FETCH_ASSOC);
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
      --c-cyan    : #0ec2e6;
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
    .page-hero::after {
      content:'';
      position:absolute; bottom:-60px; left:40%;
      width:160px; height:160px; border-radius:50%;
      background:rgba(255,255,255,.04);
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
    .stat-card .s-sub {
      font-size:.75rem; opacity:.7; margin-top:2px;
    }
    .sc-purple { background:linear-gradient(135deg,#6f42c1,#a06efc); }
    .sc-green  { background:linear-gradient(135deg,#28a745,#55de7a); }
    .sc-blue   { background:linear-gradient(135deg,#0ec2e6,#43d9f5); }
    .sc-orange { background:linear-gradient(135deg,#fd7e14,#ffc36b); }
    .sc-red    { background:linear-gradient(135deg,#dc3545,#f07584); }

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

    /* ── Cell avatar badge ─────────────────────────────────── */
    .cell-code-badge {
      display:inline-flex; align-items:center; gap:8px;
    }
    .cell-avatar {
      width:36px; height:36px; border-radius:10px;
      display:flex; align-items:center; justify-content:center;
      font-size:.8rem; font-weight:700; color:#fff; flex-shrink:0;
    }

    /* ── Leader avatar ─────────────────────────────────────── */
    .leader-avatar {
      width:34px; height:34px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:.85rem; font-weight:700; color:#fff; flex-shrink:0;
    }

    /* ── Member count pill ─────────────────────────────────── */
    .member-pill {
      display:inline-flex; align-items:center; gap:5px;
      background:#f0e8ff; color:var(--c-accent);
      border-radius:20px; padding:4px 12px; font-size:.8rem; font-weight:600;
    }

    /* ── Status badge ──────────────────────────────────────── */
    .status-dot {
      width:8px; height:8px; border-radius:50%; display:inline-block;
      margin-right:5px; flex-shrink:0;
    }

    /* ── Action button ─────────────────────────────────────── */
    .btn-action {
      border-radius:10px; font-size:.82rem; font-weight:600;
      padding:6px 14px; border:none; transition:all .2s;
      display:inline-flex; align-items:center; gap:5px;
    }
    .btn-view  { background:#f0e8ff; color:var(--c-accent); }
    .btn-view:hover  { background:var(--c-accent); color:#fff; }
    .btn-attend { background:#e8f5ff; color:var(--c-info); }
    .btn-attend:hover{ background:var(--c-info); color:#fff; }

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

    /* ── Toolbar buttons ───────────────────────────────────── */
    .toolbar-btn {
      border-radius:10px; font-weight:600; font-size:.85rem;
      padding:8px 18px; display:inline-flex; align-items:center; gap:6px;
      transition:all .2s;
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
      <?php @include('modals/cells.php'); ?>

      <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">

          <!-- ── Page Hero ──────────────────────────────────────── -->
          <div class="page-hero fade-up">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h4><i class="bx bx-layout me-2"></i>Cell Directory</h4>
                <p>Manage all cell groups, view members and track attendance per cell.</p>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="toolbar-btn btn btn-light"
                        data-bs-toggle="modal" data-bs-target="#newCell">
                  <i class="bx bx-plus"></i> New Cell
                </button>
                <?php if(userHasPermission($db, $user_id, 'cell_analytics')): ?>
                <a href="cell-analytics.php" class="toolbar-btn btn" style="background:rgba(255,255,255,.15);color:#fff;">
                  <i class="bx bx-bar-chart-alt-2"></i> Analytics
                </a>
                <?php endif; ?>
                <a href="cell_attendance.php" class="toolbar-btn btn" style="background:rgba(255,255,255,.15);color:#fff;">
                  <i class="bx bx-user-check"></i> Attendance
                </a>
              </div>
            </div>
          </div>

          <!-- ── Stats Row ──────────────────────────────────────── -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-purple h-100">
                <i class="bx bx-layout s-icon"></i>
                <span class="s-num"><?= $stats['total_cells'] ?></span>
                <span class="s-lbl">Total Cells</span>
                <div class="s-sub"><?= $stats['active_cells'] ?> active &middot; <?= $stats['closed_cells'] ?> closed</div>
              </div>
            </div>
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-green h-100">
                <i class="bx bx-check-circle s-icon"></i>
                <span class="s-num"><?= $stats['active_cells'] ?></span>
                <span class="s-lbl">Active Cells</span>
                <div class="s-sub">Currently running</div>
              </div>
            </div>
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-blue h-100">
                <i class="bx bx-group s-icon"></i>
                <span class="s-num"><?= $stats['total_assigned'] ?></span>
                <span class="s-lbl">Assigned Members</span>
                <div class="s-sub">Across all cells</div>
              </div>
            </div>
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-orange h-100">
                <i class="bx bx-user-x s-icon"></i>
                <span class="s-num"><?= $unassigned ?></span>
                <span class="s-lbl">Unassigned</span>
                <div class="s-sub">Need a cell group</div>
              </div>
            </div>
          </div>

          <!-- ── Cell Table ─────────────────────────────────────── -->
          <div class="card table-card fade-up">
            <div class="card-header">
              <h5><i class="bx bx-list-ul me-2 text-primary"></i>All Cell Groups</h5>
              <div class="d-flex align-items-center gap-2">
                <span class="badge" style="background:#f0e8ff;color:var(--c-accent);font-size:.8rem;padding:6px 12px;">
                  <?= count($cells) ?> cells
                </span>
                <a href="assign_cell.php" class="btn btn-sm btn-outline-primary" style="border-radius:8px;font-size:.82rem;">
                  <i class="bx bx-user-plus me-1"></i>Assign Members
                </a>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0" id="cellsTable">
                <thead style="background:#faf7ff;">
                  <tr>
                    <th style="padding:14px 20px;">#</th>
                    <th>Cell</th>
                    <th>Leader</th>
                    <th>Members</th>
                    <th>Status</th>
                    <th style="padding:14px 20px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <?php if (!empty($cells)): ?>
                  <?php foreach ($cells as $index => $row):
                    $cid      = $row['id'];
                    $cellName = $row['name'] ?: $row['code'];
                    $leader   = $row['first_name'] . ' ' . $row['last_name'];
                    $leaderInitial = strtoupper(substr($row['first_name'], 0, 1));
                    $avatarColor   = '#' . substr(md5($cid), 0, 6);
                    $cellColor     = '#' . substr(md5($row['code']), 2, 6);
                    $isActive      = $row['status'] == 1;
                    $count         = (int)$row['member_count'];
                  ?>
                  <tr>
                    <td style="padding:14px 20px; color:#8a7baa; font-weight:600;"><?= $index + 1 ?></td>

                    <!-- Cell code + name -->
                    <td>
                      <div class="cell-code-badge">
                        <div class="cell-avatar" style="background:<?= $cellColor ?>;">
                          <?= strtoupper(substr($row['code'], 0, 2)) ?>
                        </div>
                        <div>
                          <div class="fw-bold" style="color:var(--c-primary); font-size:.9rem;">
                            <?= htmlspecialchars($row['code']) ?>
                          </div>
                          <?php if ($row['name']): ?>
                          <small class="text-muted"><?= htmlspecialchars($row['name']) ?></small>
                          <?php endif; ?>
                        </div>
                      </div>
                    </td>

                    <!-- Leader -->
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="leader-avatar" style="background:<?= $avatarColor ?>;"><?= $leaderInitial ?></div>
                        <div>
                          <div class="fw-semibold" style="font-size:.88rem;"><?= htmlspecialchars($leader) ?></div>
                          <small class="text-muted"><?= htmlspecialchars($row['phone_no'] ?? '') ?></small>
                        </div>
                      </div>
                    </td>

                    <!-- Member count -->
                    <td>
                      <span class="member-pill">
                        <i class="bx bx-group" style="font-size:.9rem;"></i>
                        <?= $count ?> member<?= $count !== 1 ? 's' : '' ?>
                      </span>
                    </td>

                    <!-- Status -->
                    <td>
                      <span class="d-inline-flex align-items-center badge"
                        style="background:<?= $isActive ? 'rgba(40,167,69,.12)' : 'rgba(255,193,7,.15)' ?>;
                               color:<?= $isActive ? '#28a745' : '#b38600' ?>;
                               border-radius:20px; padding:6px 14px; font-size:.8rem; font-weight:600;">
                        <span class="status-dot" style="background:<?= $isActive ? '#28a745' : '#ffc107' ?>;"></span>
                        <?= $isActive ? 'Active' : 'Closed' ?>
                      </span>
                    </td>

                    <!-- Actions -->
                    <td style="padding:14px 20px;">
                      <div class="d-flex gap-2 flex-wrap">
                        <!-- Edit / View Members -->
                        <a href="assign_cell.php?cid=<?= $cid ?>"
                           class="btn-action btn-view"
                           title="View &amp; manage cell members">
                          <i class="bx bx-edit-alt"></i> Edit / Members
                        </a>
                        <!-- Attendance -->
                        <a href="cell_attendance.php?cell_id=<?= $cid ?>"
                           class="btn-action btn-attend"
                           title="View attendance for this cell">
                          <i class="bx bx-user-check"></i> Attendance
                        </a>
                      </div>
                    </td>
                  </tr>
                  <?php endforeach; ?>
                  <?php else: ?>
                  <tr>
                    <td colspan="6" class="text-center py-5">
                      <i class="bx bx-layout" style="font-size:3rem;color:#d0c4f0;display:block;margin-bottom:10px;"></i>
                      <h6 style="color:#6c757d;">No cells have been created yet</h6>
                      <button class="btn btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#newCell"
                              style="border-radius:10px;background:linear-gradient(135deg,#6f42c1,#a06efc);border:none;">
                        <i class="bx bx-plus me-1"></i> Create First Cell
                      </button>
                    </td>
                  </tr>
                  <?php endif; ?>
                </tbody>
              </table>
            </div>
          </div>
          <!-- /Cell Table -->

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
    $('#cellsTable').DataTable({
      paging      : true,
      searching   : true,
      ordering    : true,
      info        : true,
      lengthChange: true,
      pageLength  : 15,
      columnDefs  : [{ orderable: false, targets: [3,5] }],
      language: {
        searchPlaceholder: 'Search cells...',
        search: ''
      }
    });
  });
</script>
</body>
</html>

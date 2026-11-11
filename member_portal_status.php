<?php
include('includes/checklogin.php');

$title = "Cell Management | Portal Status";
include("includes/get_user.php");

// ── Fetch all members and join users to get portal credentials ──────────────
try {
    $stmt = $db->query("
        SELECT m.id AS member_id, m.first_name, m.last_name, m.phone_no, m.email, m.location,
               u.id AS user_id, u.last_login
        FROM member m
        LEFT JOIN users u ON m.id = u.member_id
        WHERE (m.delete_status IS NULL OR m.delete_status = 'Active' OR m.delete_status = '0')
        ORDER BY m.first_name ASC
    ");
    $all_members = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}

// ── Calculate Portal Statistics ──────────────────────────────────────────────
$total_members = count($all_members);
$registered_portals = 0;
$never_logged_in = 0;
$logged_in_count = 0;

foreach ($all_members as $m) {
    if ($m['user_id']) {
        $registered_portals++;
        if (empty($m['last_login'])) {
            $never_logged_in++;
        } else {
            $logged_in_count++;
        }
    }
}
$pending_portals = $total_members - $registered_portals;
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
      --c-success : #28a745;
      --c-warning : #ffc107;
      --c-danger  : #dc3545;
      --c-cyan    : #0ec2e6;
    }

    /* ── Hero Banner ───────────────── */
    .page-hero {
      background: linear-gradient(135deg, var(--c-primary) 0%, #2d0a5e 55%, var(--c-accent) 100%);
      padding: 28px 32px;
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

    /* ── Stats Cards ───────────────── */
    .stat-card {
      border-radius: 14px; padding: 22px 24px;
      border: none; box-shadow: 0 4px 20px rgba(0,0,0,.06);
      background: #fff;
      display: flex; align-items: center; justify-content: space-between;
      transition: transform .22s;
    }
    .stat-card:hover { transform: translateY(-3px); }
    .stat-num { font-size: 1.8rem; font-weight: 800; color: var(--c-primary); line-height: 1.1; }
    .stat-lbl { font-size: .8rem; color: #8a7baa; text-transform: uppercase; letter-spacing: .05em; font-weight: 600; }
    .stat-badge { font-size: .72rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-top: 4px; display: inline-block; }
    .stat-avatar {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; flex-shrink: 0;
    }

    /* ── Table Card ────────────────── */
    .table-card {
      border-radius: 16px; border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,.06);
      overflow: hidden; background: #fff;
    }
    .table-card .card-header {
      background: #fff; border-bottom: 1px solid #f0eaf8;
      padding: 20px 24px;
    }

    /* ── Member Avatar ─────────────── */
    .m-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: .88rem; font-weight: 700; color: #fff; flex-shrink: 0;
    }

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
      <?php 
        @include('includes/nav.php');
        @include('modals/user-forms.php');
      ?>

      <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">

          <!-- ── Page Hero ── -->
          <div class="page-hero fade-up">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h4><i class="bx bx-shield-quarter me-2"></i>Member Profile Portal Status</h4>
                <p>Track which members have active login accounts and view their platform access logs.</p>
              </div>
              <div>
                <a href="users.php" class="btn btn-sm btn-light" style="border-radius:10px; font-weight:600; padding:8px 16px;">
                  <i class="bx bx-user-check me-1"></i> User Accounts
                </a>
              </div>
            </div>
          </div>

          <!-- ── Stats Row ── -->
          <div class="row g-3 mb-4 fade-up">
            <!-- Stat 1: Total Members -->
            <div class="col-sm-6 col-xl-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Total Profiles</div>
                  <div class="stat-num mt-1"><?= $total_members ?></div>
                  <span class="stat-badge" style="background:#e8f0fe; color:#1a73e8;">Members List</span>
                </div>
                <div class="stat-avatar" style="background:#e8f0fe; color:#1a73e8;">
                  <i class="bx bx-group"></i>
                </div>
              </div>
            </div>
            <!-- Stat 2: Registered Accounts -->
            <div class="col-sm-6 col-xl-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Registered Portals</div>
                  <div class="stat-num mt-1"><?= $registered_portals ?></div>
                  <span class="stat-badge" style="background:#e6f4ea; color:#137333;">Accounts Created</span>
                </div>
                <div class="stat-avatar" style="background:#e6f4ea; color:#137333;">
                  <i class="bx bx-key"></i>
                </div>
              </div>
            </div>
            <!-- Stat 3: Logged In Ever -->
            <div class="col-sm-6 col-xl-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Logged In Ever</div>
                  <div class="stat-num mt-1"><?= $logged_in_count ?></div>
                  <span class="stat-badge" style="background:#e2fcf1; color:#0f9d58;">Access Logged</span>
                </div>
                <div class="stat-avatar" style="background:#e2fcf1; color:#0f9d58;">
                  <i class="bx bx-log-in-circle"></i>
                </div>
              </div>
            </div>
            <!-- Stat 4: Pending Portals -->
            <div class="col-sm-6 col-xl-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Pending Access</div>
                  <div class="stat-num mt-1"><?= $pending_portals ?></div>
                  <span class="stat-badge" style="background:#fff3e0; color:#e65100;">No Account Yet</span>
                </div>
                <div class="stat-avatar" style="background:#fff3e0; color:#e65100;">
                  <i class="bx bx-time-five"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Members Portal Status Table ── -->
          <div class="card table-card fade-up">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fw-bold text-primary">Member Accounts Status</h5>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0" id="portalStatusTable">
                <thead style="background:#faf7ff;">
                  <tr>
                    <th style="padding:12px 18px;">#</th>
                    <th>Member Details</th>
                    <th>User ID</th>
                    <th>Ever Logged In?</th>
                    <th>Last Access Time</th>
                    <th style="padding:12px 18px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <?php foreach ($all_members as $index => $row):
                    $name    = $row['first_name'] . ' ' . $row['last_name'];
                    $initial = strtoupper(substr($row['first_name'], 0, 1));
                    $acolor  = '#' . substr(md5($row['member_id']), 0, 6);
                    $has_user = !empty($row['user_id']);
                    $has_logged_in = !empty($row['last_login']);
                  ?>
                  <tr>
                    <td style="padding:12px 18px; color:#8a7baa; font-weight:600;"><?= $index + 1; ?></td>
                    
                    <!-- Member Details -->
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="m-avatar" style="background:<?= $acolor ?>;"><?= $initial ?></div>
                        <div>
                          <div class="fw-semibold text-primary" style="font-size:.9rem;"><?= htmlspecialchars($name); ?></div>
                          <small class="text-muted"><?= htmlspecialchars($row['phone_no']); ?> &bull; <?= htmlspecialchars($row['email'] ? $row['email'] : 'No Email'); ?></small>
                        </div>
                      </div>
                    </td>

                    <!-- User ID badge -->
                    <td>
                      <?php if ($has_user): ?>
                        <span class="badge bg-label-success" style="font-size:.78rem; font-weight:600; padding:6px 12px;">
                          User ID #<?= $row['user_id'] ?>
                        </span>
                      <?php else: ?>
                        <span class="badge bg-label-secondary text-muted" style="font-size:.78rem; padding:6px 12px;">
                          No Account
                        </span>
                      <?php endif; ?>
                    </td>

                    <!-- Ever Logged In? -->
                    <td>
                      <?php if (!$has_user): ?>
                        <span class="badge bg-label-light text-muted" style="font-size:.78rem; padding:6px 12px;">—</span>
                      <?php elseif ($has_logged_in): ?>
                        <span class="badge bg-success" style="font-size:.78rem; font-weight:600; padding:6px 12px;">
                          <i class="bx bx-check-double me-1"></i>Yes
                        </span>
                      <?php else: ?>
                        <span class="badge bg-warning text-dark" style="font-size:.78rem; font-weight:600; padding:6px 12px;">
                          <i class="bx bx-x me-1"></i>No (Never)
                        </span>
                      <?php endif; ?>
                    </td>

                    <!-- Last Access Time -->
                    <td>
                      <?php if ($has_logged_in): ?>
                        <span class="text-muted small fw-semibold">
                          <i class="bx bx-time me-1"></i><?= date('M d, Y h:i A', strtotime($row['last_login'])) ?>
                        </span>
                      <?php else: ?>
                        <span class="text-muted small">—</span>
                      <?php endif; ?>
                    </td>

                    <!-- Actions -->
                    <td style="padding:12px 18px;">
                      <div class="dropdown">
                        <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                          <i class="bx bx-dots-vertical-rounded" style="color:#8a7baa; font-size:1.15rem;"></i>
                        </button>
                        <div class="dropdown-menu">
                          <?php if ($has_user): ?>
                            <!-- Existing modals inclusion for options -->
                            <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#loginAsUserModal-<?= $row['user_id'] ?>">
                              <i class="bx bx-log-in me-1"></i> Login As User
                            </a>
                            <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#assign-role-<?= $row['user_id'] ?>">
                              <i class="bx bx-check me-1"></i> Assign Roles
                            </a>
                          <?php else: ?>
                            <a class="dropdown-item" href="user_register.php" target="_blank">
                              <i class="bx bx-user-plus me-1"></i> Create Portal Account
                            </a>
                          <?php endif; ?>
                          <a class="dropdown-item" href="view-members.php">
                            <i class="bx bx-show me-1"></i> View Directory Info
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <?php 
                    if ($has_user) {
                      $id = $row['user_id'];
                      $name = htmlspecialchars($row['first_name'] . ' ' . $row['last_name']);
                      @include('modals/edit-user.php');
                    }
                  ?>
                  <?php endforeach; ?>
                </tbody>
              </table>
            </div>
          </div><!-- /table-card -->

        </div><!-- /container -->

        <?php @include('includes/footer.php'); ?>
        <div class="content-backdrop fade"></div>
      </div>
    </div>
  </div>
</div>

<?php include('includes/scripts.html'); ?>
<script>
  $(document).ready(function() {
    $('#portalStatusTable').DataTable({
      paging      : true,
      searching   : true,
      ordering    : true,
      info        : true,
      lengthChange: true,
      pageLength  : 15,
      columnDefs  : [{ orderable: false, targets: [5] }],
      language    : { searchPlaceholder: 'Search members & portals…', search: '' }
    });
  });
</script>
</body>
</html>

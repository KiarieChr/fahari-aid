<?php
include('includes/checklogin.php');

$title = "Roles | Users Management";
include("includes/get_user.php");

// ── Metrics Calculations ──────────────────────────────────────────────────────
$total_roles_stmt = $db->query("SELECT COUNT(*) AS total FROM roles");
$total_roles = $total_roles_stmt->fetchColumn();

$total_perms_stmt = $db->query("SELECT COUNT(*) AS total FROM permissions");
$total_perms = $total_perms_stmt->fetchColumn();

$admin_stmt = $db->query("
    SELECT COUNT(DISTINCT ur.user_id) 
    FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE r.name IN ('Administrator', 'General Admin')
");
$admin_count = $admin_stmt->fetchColumn();

$cat_stmt = $db->query("SELECT COUNT(*) AS total FROM permission_category");
$cat_count = $cat_stmt->fetchColumn();

// ── Fetch Roles ───────────────────────────────────────────────────────────────
try {
    $stmt = $db->query("SELECT * FROM roles ORDER BY id DESC");
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
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

    /* ── Role Card ─────────────────────────────────────────── */
    .role-card {
      border-radius: 16px;
      border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,.08);
      transition: all .25s;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
    .role-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(111,66,193,.15);
    }
    .role-header {
      padding: 24px;
      border-bottom: 1px solid #f2ecfb;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .role-title {
      font-weight: 700;
      color: var(--c-primary);
      margin: 0;
      font-size: 1.15rem;
    }
    .role-body {
      padding: 24px;
      flex-grow: 1;
    }
    .role-footer {
      padding: 16px 24px;
      background: #faf8ff;
      border-top: 1px solid #f2ecfb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    /* ── Avatar stack ──────────────────────────────────────── */
    .avatar-stack {
      display: flex;
      align-items: center;
      margin-left: 8px;
    }
    .avatar-stack-item {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid #fff;
      margin-left: -8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: .75rem;
      color: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }
    .avatar-stack-item:first-child {
      margin-left: 0;
    }
    .avatar-plus {
      background: #e2d9f3 !important;
      color: var(--c-accent) !important;
      font-weight: 600;
    }

    /* ── Add New Role Card ─────────────────────────────────── */
    .add-role-card {
      border: 2px dashed #d0c4f0;
      background: transparent;
      border-radius: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 30px;
      transition: all .25s;
      cursor: pointer;
      min-height: 200px;
    }
    .add-role-card:hover {
      border-color: var(--c-accent);
      background: rgba(111,66,193,.03);
    }
    .add-role-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #f0e8ff;
      color: var(--c-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      margin-bottom: 12px;
      transition: transform .2s;
    }
    .add-role-card:hover .add-role-icon {
      transform: scale(1.1);
    }

    /* ── Buttons ───────────────────────────────────────────── */
    .btn-role-action {
      border-radius: 8px;
      font-size: .8rem;
      font-weight: 600;
      padding: 6px 12px;
      transition: all .2s;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      border: none;
    }
    .btn-role-primary {
      background: var(--c-accent);
      color: #fff;
    }
    .btn-role-primary:hover {
      background: #5d34a4;
      color: #fff;
    }
    .btn-role-outline {
      background: #f0e8ff;
      color: var(--c-accent);
    }
    .btn-role-outline:hover {
      background: var(--c-accent);
      color: #fff;
    }
    .btn-role-danger {
      background: rgba(220,53,69,.08);
      color: var(--c-danger);
    }
    .btn-role-danger:hover {
      background: var(--c-danger);
      color: #fff;
    }

    /* ── Fade in ───────────────────────────────────────────── */
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .fade-up { animation:fadeUp .45s ease both; }
    .fade-up:nth-child(2) { animation-delay:.06s; }
    .fade-up:nth-child(3) { animation-delay:.12s; }
    .fade-up:nth-child(4) { animation-delay:.18s; }
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
                <h4><i class="bx bx-check-shield me-2"></i>Access Role Management</h4>
                <p>Define security roles, assign administrative permissions, and map users dynamically.</p>
              </div>
              <div>
                <button type="button" class="btn btn-light fw-bold" style="border-radius: 10px;" data-bs-toggle="modal" data-bs-target="#addRoleModal">
                  <i class="bx bx-plus me-1"></i> New Role
                </button>
              </div>
            </div>
          </div>

          <!-- ── Stats Row ──────────────────────────────────────── -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-purple h-100">
                <i class="bx bx-check-shield s-icon"></i>
                <span class="s-num"><?= $total_roles ?></span>
                <span class="s-lbl">Security Roles</span>
              </div>
            </div>
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-blue h-100">
                <i class="bx bx-shield-quarter s-icon"></i>
                <span class="s-num"><?= $total_perms ?></span>
                <span class="s-lbl">Total Permissions</span>
              </div>
            </div>
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-green h-100">
                <i class="bx bx-user-check s-icon"></i>
                <span class="s-num"><?= $admin_count ?></span>
                <span class="s-lbl">Active Administrators</span>
              </div>
            </div>
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-orange h-100">
                <i class="bx bx-grid-alt s-icon"></i>
                <span class="s-num"><?= $cat_count ?></span>
                <span class="s-lbl">Categories</span>
              </div>
            </div>
          </div>

          <!-- ── Roles Grid ──────────────────────────────────────── -->
          <div class="row g-4">
            <?php if (!empty($roles)): ?>
            <?php foreach ($roles as $index => $row):
              $id = $row['id'];
              $name = $row['name'];

              // ── Count Users in Role ───────────────────────────────────
              $stmt_count = $db->prepare("SELECT COUNT(*) FROM user_roles WHERE role_id = :role_id");
              $stmt_count->execute([':role_id' => $id]);
              $user_count = intval($stmt_count->fetchColumn());

              // ── Get Role Users Avatars ────────────────────────────────
              $stmt_users = $db->prepare("
                  SELECT m.first_name, m.last_name, m.email 
                  FROM user_roles ur 
                  JOIN users u ON ur.user_id = u.id 
                  JOIN member m ON u.member_id = m.id 
                  WHERE ur.role_id = :role_id 
                  LIMIT 4
              ");
              $stmt_users->execute([':role_id' => $id]);
              $role_users = $stmt_users->fetchAll(PDO::FETCH_ASSOC);
            ?>
            <div class="col-xl-4 col-md-6 fade-up">
              <div class="card role-card">
                
                <div class="role-header">
                  <div>
                    <h5 class="role-title"><?= htmlspecialchars($name) ?></h5>
                    <small class="text-muted d-block mt-1">
                      <i class="bx bx-user me-1"></i><?= $user_count ?> User<?= $user_count !== 1 ? 's' : '' ?> Assigned
                    </small>
                  </div>
                  <div class="avatar-stack">
                    <?php foreach ($role_users as $ru): 
                      $initial = strtoupper(substr($ru['first_name'], 0, 1));
                      $avatarColor = '#' . substr(md5($ru['email']), 0, 6);
                    ?>
                    <div class="avatar-stack-item" style="background: <?= $avatarColor ?>;" 
                         data-bs-toggle="tooltip" data-bs-placement="top" 
                         title="<?= htmlspecialchars($ru['first_name'] . ' ' . $ru['last_name']) ?>">
                      <?= $initial ?>
                    </div>
                    <?php endforeach; ?>
                    <?php if ($user_count > 4): ?>
                    <div class="avatar-stack-item avatar-plus" data-bs-toggle="tooltip" data-bs-placement="top" title="<?= ($user_count - 4) ?> more user(s)">
                      +<?= ($user_count - 4) ?>
                    </div>
                    <?php endif; ?>
                  </div>
                </div>

                <div class="role-body">
                  <p class="text-muted mb-0" style="font-size: .88rem; line-height: 1.5;">
                    Provides access controls for sections corresponding to the permissions assigned to this role.
                  </p>
                </div>

                <div class="role-footer">
                  <div class="d-flex gap-1 w-100 justify-content-between">
                    <a href="assign_permissions.php?role_id=<?= $id ?>" class="btn-role-action btn-role-primary" title="Edit Permissions Tree">
                      <i class="bx bx-shield-quarter"></i> Permissions
                    </a>
                    <button type="button" class="btn-role-action btn-role-outline" onclick="openRenameModal(<?= $id ?>, '<?= htmlspecialchars($name, ENT_QUOTES) ?>')" title="Rename Role">
                      <i class="bx bx-edit-alt"></i> Rename
                    </button>
                    <?php if (!in_array($name, ['Administrator', 'General Admin'])): ?>
                    <button type="button" class="btn-role-action btn-role-danger" onclick="deleteRole(<?= $id ?>, '<?= htmlspecialchars($name, ENT_QUOTES) ?>')" title="Delete Role">
                      <i class="bx bx-trash"></i>
                    </button>
                    <?php endif; ?>
                  </div>
                </div>

              </div>
            </div>
            <?php endforeach; ?>
            <?php endif; ?>

            <!-- Add Role Trigger Card -->
            <div class="col-xl-4 col-md-6 fade-up">
              <div class="add-role-card" data-bs-toggle="modal" data-bs-target="#addRoleModal">
                <div class="add-role-icon">
                  <i class="bx bx-plus"></i>
                </div>
                <h6 class="fw-bold mb-1" style="color: var(--c-primary);">Create A New Role</h6>
                <p class="text-muted text-center mb-0" style="font-size: .82rem; max-width: 220px;">
                  Define custom access controls and security parameters.
                </p>
              </div>
            </div>

          </div><!-- /row -->

        </div><!-- /container -->

        <?php @include("includes/footer.php"); ?>
        <div class="content-backdrop fade"></div>
      </div>
    </div>
  </div>
  <div class="layout-overlay layout-menu-toggle"></div>
</div>

<!-- Add Role Modal -->
<div class="modal fade" id="addRoleModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 10px 30px rgba(0,0,0,.15);">
      <div class="modal-header border-bottom-0 pb-0">
        <h5 class="modal-title fw-bold" style="color: var(--c-primary);"><i class="bx bx-shield-quarter me-1 text-primary"></i> Create Role</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form id="addRoleForm">
        <div class="modal-body pb-0">
          <div class="mb-3">
            <label class="form-label fw-semibold text-secondary">Role Name</label>
            <input type="text" name="name" class="form-control" placeholder="e.g. Supervisor" required />
          </div>
        </div>
        <div class="modal-footer border-top-0 pt-0">
          <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">Close</button>
          <button type="submit" class="btn btn-primary" id="saveAddRoleBtn">Save Role</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Rename Role Modal -->
<div class="modal fade" id="renameRoleModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 10px 30px rgba(0,0,0,.15);">
      <div class="modal-header border-bottom-0 pb-0">
        <h5 class="modal-title fw-bold" style="color: var(--c-primary);"><i class="bx bx-edit-alt me-1 text-accent"></i> Rename Role</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form id="renameRoleForm">
        <input type="hidden" name="id" id="renameRoleId" />
        <div class="modal-body pb-0">
          <div class="mb-3">
            <label class="form-label fw-semibold text-secondary">Role Name</label>
            <input type="text" name="name" id="renameRoleName" class="form-control" required />
          </div>
        </div>
        <div class="modal-footer border-top-0 pt-0">
          <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">Close</button>
          <button type="submit" class="btn btn-primary" id="saveRenameBtn">Save Changes</button>
        </div>
      </form>
    </div>
  </div>
</div>

<?php include('includes/scripts.html'); ?>
<script>
  $(document).ready(function() {
    // ── Tooltip Initialization ───────────────────────────────────────
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // ── Create Role AJAX ──────────────────────────────────────────────
    $('#addRoleForm').on('submit', function(e) {
      e.preventDefault();
      const saveBtn = $('#saveAddRoleBtn');
      saveBtn.prop('disabled', true).text('Creating...');

      $.ajax({
        url: 'manage/add-role.php',
        method: 'POST',
        data: $(this).serialize(),
        success: function(response) {
          saveBtn.prop('disabled', false).text('Save Role');
          // Since manage/add-role.php outputs sweetalert HTML script, we check if it is JSON or HTML
          // Let's redirect page to apply changes
          showToast('Role created successfully!', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        error: function() {
          saveBtn.prop('disabled', false).text('Save Role');
          showToast('Could not save role. Please check the network.', 'error');
        }
      });
    });

    // ── Rename Role AJAX ──────────────────────────────────────────────
    $('#renameRoleForm').on('submit', function(e) {
      e.preventDefault();
      const saveBtn = $('#saveRenameBtn');
      saveBtn.prop('disabled', true).text('Updating...');

      $.ajax({
        url: 'manage/update-role.php',
        method: 'POST',
        data: $(this).serialize(),
        success: function(res) {
          saveBtn.prop('disabled', false).text('Save Changes');
          if (res.success) {
            showToast(res.message, 'success');
            $('#renameRoleModal').modal('hide');
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            showToast(res.message, 'error');
          }
        },
        error: function() {
          saveBtn.prop('disabled', false).text('Save Changes');
          showToast('Could not update role name.', 'error');
        }
      });
    });
  });

  function openRenameModal(id, name) {
    $('#renameRoleId').val(id);
    $('#renameRoleName').val(name);
    $('#renameRoleModal').modal('show');
  }

  function deleteRole(id, name) {
    Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the role "${name}" and remove all user permissions associated with it!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: 'manage/delete-role.php',
          method: 'POST',
          data: { id: id },
          success: function(res) {
            if (res.success) {
              showToast(res.message, 'success');
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            } else {
              showToast(res.message, 'error');
            }
          },
          error: function() {
            showToast('Error deleting role.', 'error');
          }
        });
      }
    });
  }
</script>
</body>
</html>

<?php 
include('includes/checklogin.php');

$title = "Role Permissions | Users Management";
include("includes/get_user.php");

if (!isset($_GET['role_id']) || empty($_GET['role_id'])) {
    die("Role ID is required.");
}

$role_id = intval($_GET['role_id']);

// Fetch role details
$stmt = $db->prepare("SELECT name FROM roles WHERE id = ?");
$stmt->execute([$role_id]);
$role = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$role) {
    die("Invalid Role ID.");
}
?>
<!DOCTYPE html>
<html lang="en"
  class="layout-navbar-fixed layout-menu-fixed layout-compact"
  dir="ltr"
  data-skin="default"
  data-assets-path="assets/"
  data-template="vertical-menu-template"
  data-bs-theme="light">
<?php @include('includes/header.php'); ?>
<link rel="stylesheet" href="assets/vendor/libs/jstree/jstree.css" />

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

    /* ── Panel Card ────────────────────────────────────────── */
    .panel-card {
      border-radius: 16px;
      border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,.07);
      background: #fff;
      overflow: hidden;
    }
    .panel-header {
      padding: 22px 28px;
      border-bottom: 1px solid #f2ecfb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .panel-title {
      font-weight: 700;
      color: var(--c-primary);
      margin: 0;
      font-size: 1.05rem;
    }
    .panel-body {
      padding: 28px;
    }

    /* ── jsTree customizations ───────────────────────────────── */
    .jstree-default .jstree-clicked {
      background: #f0e8ff !important;
      border-radius: 6px;
      box-shadow: none;
    }
    .jstree-default .jstree-hovered {
      background: #faf8ff !important;
      border-radius: 6px;
      box-shadow: none;
    }
    .jstree-anchor {
      font-weight: 600;
      color: #444 !important;
      font-size: .9rem !important;
      padding: 4px 8px !important;
    }

    /* ── Toolbar buttons ───────────────────────────────────── */
    .toolbar-btn {
      border-radius:10px; font-weight:600; font-size:.85rem;
      padding:8px 18px; display:inline-flex; align-items:center; gap:6px;
      transition:all .2s;
    }

    /* ── Fade in ───────────────────────────────────────────── */
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .fade-up { animation:fadeUp .45s ease both; }
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
                <h4><i class="bx bx-shield-quarter me-2"></i>Assign Role Permissions</h4>
                <p>Edit authorization grants for the security role: <strong><?= htmlspecialchars($role['name']) ?></strong></p>
              </div>
              <div>
                <a href="user_roles.php" class="toolbar-btn btn btn-light">
                  <i class="bx bx-arrow-back"></i> Back to Roles
                </a>
              </div>
            </div>
          </div>

          <!-- ── Permissions Panel ──────────────────────────────── -->
          <div class="card panel-card fade-up">
            <div class="panel-header">
              <h5 class="panel-title">
                <i class="bx bx-git-branch me-2 text-primary"></i>Permissions Directory Tree
              </h5>
              <span class="badge" style="background:#f0e8ff;color:var(--c-accent);font-size:.8rem;padding:6px 12px;">
                Check keys to grant permissions
              </span>
            </div>
            
            <div class="panel-body">
              <p class="text-muted mb-4" style="font-size: .88rem;">
                Select the individual permission capabilities to assign to this role. Child nodes represents specific functions, while parent nodes represent categories.
              </p>

              <!-- jsTree Container -->
              <div id="permissionsTree" class="mb-4 p-3" style="border: 1px solid #f2ecfb; border-radius: 12px; max-height: 500px; overflow-y: auto; background: #faf9fc;"></div>

              <div class="d-flex gap-2">
                <button type="button" id="savePermissionsBtn" class="btn btn-primary" style="border-radius: 10px; padding: 10px 24px; font-weight: 600;">
                  <i class="bx bx-check-circle me-1"></i> Save Role Permissions
                </button>
                <a href="user_roles.php" class="btn btn-label-secondary" style="border-radius: 10px; padding: 10px 24px;">
                  Cancel
                </a>
              </div>
            </div>
          </div>

        </div><!-- /container -->

        <?php @include("includes/footer.php"); ?>
        <div class="content-backdrop fade"></div>
      </div>
    </div>
  </div>
  <div class="layout-overlay layout-menu-toggle"></div>
</div>

<?php include('includes/scripts.html'); ?>
<script src="assets/vendor/libs/jstree/jstree.js"></script>
<script>
  const roleId = <?= $role_id ?>;

  $(document).ready(function () {
    // ── Load permissions with jsTree ──────────────────────────────────
    $('#permissionsTree').jstree({
      "core": {
        "data": function (obj, callback) {
          $.ajax({
            url: "manage/fetch_permissions.php",
            dataType: "json",
            success: function (data) {
              callback.call(this, data);
            }
          });
        }
      },
      "plugins": ["checkbox"],
      "checkbox": {
        "three_state": false,
        "cascade": "undetermined"
      }
    });

    // ── Preselect assigned permissions ────────────────────────────────
    $('#permissionsTree').on('loaded.jstree', function () {
      $.getJSON("manage/get_assigned_permissions.php?role_id=" + roleId, function (assigned) {
        for (let i = 0; i < assigned.length; i++) {
          $('#permissionsTree').jstree(true).select_node(assigned[i]);
        }
      });
    });

    // ── Save Permissions ──────────────────────────────────────────────
    $('#savePermissionsBtn').click(function () {
      const saveBtn = $(this);
      const selected = $('#permissionsTree').jstree("get_selected");
      
      saveBtn.prop('disabled', true).html('<i class="bx bx-loader-alt bx-spin me-1"></i> Saving...');

      $.post("manage/save_permissions.php", {
        role_id: roleId,
        permissions: selected
      }, function (response) {
        saveBtn.prop('disabled', false).html('<i class="bx bx-check-circle me-1"></i> Save Role Permissions');
        showToast('Permissions assigned and saved successfully!', 'success');
        setTimeout(function() {
          window.location.href = 'user_roles.php';
        }, 1500);
      }).fail(function() {
        saveBtn.prop('disabled', false).html('<i class="bx bx-check-circle me-1"></i> Save Role Permissions');
        showToast('An error occurred while saving permissions.', 'error');
      });
    });
  });
</script>
</body>
</html>

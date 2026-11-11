<?php
include('includes/checklogin.php');

$title = "Permission Settings | Users Management";
include("includes/get_user.php");

// ── Query Categories & Permissions ──────────────────────────────────────────
try {
    $categories = $db->query("SELECT * FROM permission_category ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);
    $permissions = $db->query("
        SELECT p.id, p.name AS permission, c.name AS category, c.id AS category_id, p.created_at 
        FROM permissions p 
        LEFT JOIN permission_category c ON p.category = c.id 
        ORDER BY p.id DESC
    ")->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}

// ── Metrics Calculations ──────────────────────────────────────────────────────
$total_perms = count($permissions);
$total_cats = count($categories);

$system_count = 0;
foreach ($permissions as $p) {
    if (strtolower($p['category'] ?? '') === 'system') {
        $system_count++;
    }
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

    /* ── Tables ────────────────────────────────────────────── */
    .table-card {
      border-radius:16px; border:none;
      box-shadow:0 4px 20px rgba(0,0,0,.07);
      overflow:hidden;
      background: #fff;
    }
    .table-card .card-header {
      background:#fff; border-bottom:1px solid #f0eaf8;
      padding:18px 24px;
      display:flex; align-items:center; justify-content:space-between;
      flex-wrap:wrap; gap:12px;
    }
    .table-card .card-header h5 {
      font-weight:700; color:var(--c-primary); margin:0; font-size:1.02rem;
    }

    /* ── Category badging ──────────────────────────────────── */
    .badge-cat {
      font-size: .8rem;
      font-weight: 600;
      border-radius: 8px;
      padding: 4px 10px;
      text-transform: capitalize;
    }

    /* ── Action buttons ─────────────────────────────────────── */
    .btn-action {
      border-radius:8px; font-size:.82rem; font-weight:600;
      padding:6px 12px; border:none; transition:all .2s;
      display:inline-flex; align-items:center; gap:5px;
    }
    .btn-trash { background:rgba(220,53,69,.08); color:var(--c-danger); }
    .btn-trash:hover { background:var(--c-danger); color:#fff; }

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
    .fade-up:nth-child(2) { animation-delay:.06s; }
    .fade-up:nth-child(3) { animation-delay:.12s; }
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
                <h4><i class="bx bx-key me-2"></i>Permissions Settings</h4>
                <p>Register detailed authorization keys and group them into logical functional categories.</p>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="toolbar-btn btn btn-light" data-bs-toggle="modal" data-bs-target="#newPCategory">
                  <i class="bx bx-plus-circle"></i> New Category
                </button>
                <button type="button" class="toolbar-btn btn" style="background:rgba(255,255,255,.15);color:#fff;" data-bs-toggle="modal" data-bs-target="#newPermission">
                  <i class="bx bx-key"></i> New Permission
                </button>
              </div>
            </div>
          </div>

          <!-- ── Stats Row ──────────────────────────────────────── -->
          <div class="row g-3 mb-4">
            <div class="col-4 fade-up">
              <div class="stat-card sc-purple h-100">
                <i class="bx bx-key s-icon"></i>
                <span class="s-num"><?= $total_perms ?></span>
                <span class="s-lbl">Authorization Keys</span>
              </div>
            </div>
            <div class="col-4 fade-up">
              <div class="stat-card sc-blue h-100">
                <i class="bx bx-grid-alt s-icon"></i>
                <span class="s-num"><?= $total_cats ?></span>
                <span class="s-lbl">Categories</span>
              </div>
            </div>
            <div class="col-4 fade-up">
              <div class="stat-card sc-green h-100">
                <i class="bx bx-cog s-icon"></i>
                <span class="s-num"><?= $system_count ?></span>
                <span class="s-lbl">System Permissions</span>
              </div>
            </div>
          </div>

          <!-- ── Main Grid ──────────────────────────────────────── -->
          <div class="row g-4">
            
            <!-- Left Col: Permissions List -->
            <div class="col-lg-8 fade-up">
              <div class="card table-card">
                <div class="card-header">
                  <h5><i class="bx bx-key me-2 text-primary"></i>All System Permissions</h5>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0" id="permissionsTable">
                    <thead style="background:#faf7ff;">
                      <tr>
                        <th style="padding:14px 20px;">Name</th>
                        <th>Category</th>
                        <th>Created Date</th>
                        <th style="padding:14px 20px; text-align: center;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <?php if (!empty($permissions)): ?>
                      <?php foreach ($permissions as $row):
                        $pid = $row['id'];
                        $permName = $row['permission'];
                        $catName = $row['category'] ?: 'Uncategorized';
                        $created_on = date("M d, Y h:i a", strtotime($row['created_at']));
                        
                        $catColor = '#6f42c1';
                        if (strtolower($catName) === 'system') $catColor = '#17a2b8';
                        elseif (strtolower($catName) === 'cell management') $catColor = '#28a745';
                        elseif (strtolower($catName) === 'members') $catColor = '#fd7e14';
                      ?>
                      <tr>
                        <td style="padding:14px 20px;" class="fw-semibold text-primary"><?= htmlspecialchars($permName) ?></td>
                        <td>
                          <span class="badge text-white badge-cat" style="background: <?= $catColor ?>;">
                            <?= htmlspecialchars($catName) ?>
                          </span>
                        </td>
                        <td class="text-muted" style="font-size: .85rem;"><?= htmlspecialchars($created_on) ?></td>
                        <td style="padding:14px 20px; text-align: center;">
                          <button type="button" class="btn-action btn-trash" onclick="deletePermission(<?= $pid ?>, '<?= htmlspecialchars($permName, ENT_QUOTES) ?>')" title="Delete Permission">
                            <i class="bx bx-trash"></i>
                          </button>
                        </td>
                      </tr>
                      <?php endforeach; ?>
                      <?php endif; ?>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Right Col: Permission Categories -->
            <div class="col-lg-4 fade-up">
              <div class="card table-card">
                <div class="card-header">
                  <h5><i class="bx bx-grid-alt me-2 text-info"></i>Categories</h5>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0" id="permissionsCategoryTable">
                    <thead style="background:#faf7ff;">
                      <tr>
                        <th style="padding:14px 20px;">Category</th>
                        <th style="padding:14px 20px; text-align: center;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <?php if (!empty($categories)): ?>
                      <?php foreach ($categories as $row):
                        $catId = $row['id'];
                        $catName = $row['name'];
                      ?>
                      <tr>
                        <td style="padding:14px 20px;" class="fw-bold text-secondary"><?= htmlspecialchars($catName) ?></td>
                        <td style="padding:14px 20px; text-align: center;">
                          <?php if (!in_array(strtolower($catName), ['system', 'general'])): ?>
                          <button type="button" class="btn-action btn-trash" onclick="deleteCategory(<?= $catId ?>, '<?= htmlspecialchars($catName, ENT_QUOTES) ?>')" title="Delete Category">
                            <i class="bx bx-trash"></i>
                          </button>
                          <?php else: ?>
                          <span class="text-muted" style="font-size: .78rem; font-style: italic;">Locked</span>
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

          </div><!-- /row -->

        </div><!-- /container -->

        <?php @include("includes/footer.php"); ?>
        <div class="content-backdrop fade"></div>
      </div>
    </div>
  </div>
  <div class="layout-overlay layout-menu-toggle"></div>
</div>

<!-- Modal: New Permission Category -->
<div class="modal fade" id="newPCategory" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 10px 30px rgba(0,0,0,.15);">
      <div class="modal-header border-bottom-0 pb-0">
        <h5 class="modal-title fw-bold" style="color: var(--c-primary);"><i class="bx bx-grid-alt me-1 text-primary"></i> Add Category</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form id="permissionCategoryForm" action="manage/add-pcategory.php" method="POST">
        <div class="modal-body pb-0">
          <div class="mb-3">
            <label class="form-label fw-semibold text-secondary">Category Name</label>
            <input type="text" name="name" class="form-control" placeholder="e.g. Cell Management" required />
          </div>
        </div>
        <div class="modal-footer border-top-0 pt-0">
          <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">Close</button>
          <button type="submit" class="btn btn-primary" id="saveCatBtn">Save Category</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Modal: New Permission -->
<div class="modal fade" id="newPermission" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 10px 30px rgba(0,0,0,.15);">
      <div class="modal-header border-bottom-0 pb-0">
        <h5 class="modal-title fw-bold" style="color: var(--c-primary);"><i class="bx bx-key me-1 text-accent"></i> Add Permission</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form id="permissionForm" action="manage/add-permission.php" method="POST">
        <div class="modal-body pb-0">
          <div class="mb-3 form-control-validation">
            <label class="form-label fw-semibold text-secondary">Permission Name</label>
            <input type="text" name="name" class="form-control" placeholder="e.g. edit_cell" required />
          </div>
          <div class="mb-3 form-control-validation">
            <label class="form-label fw-semibold text-secondary">Category Group</label>
            <select name="category" class="form-select select2" required>
              <option value="">Select Category</option>
              <?php foreach ($categories as $cat): ?>
              <option value="<?= $cat['id'] ?>"><?= htmlspecialchars($cat['name']) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
        </div>
        <div class="modal-footer border-top-0 pt-0">
          <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">Close</button>
          <button type="submit" class="btn btn-primary" id="savePermBtn">Save Permission</button>
        </div>
      </form>
    </div>
  </div>
</div>

<?php include('includes/scripts.html'); ?>
<script>
  $(document).ready(function() {
    // ── Table Initialization ──────────────────────────────────────────
    $('#permissionsTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      info: true,
      lengthChange: true,
      pageLength: 10,
      columnDefs: [{ orderable: false, targets: [3] }],
      language: { searchPlaceholder: 'Search permissions...', search: '' }
    });

    $('#permissionsCategoryTable').DataTable({
      paging: true,
      searching: false,
      ordering: true,
      info: true,
      lengthChange: false,
      pageLength: 10,
      columnDefs: [{ orderable: false, targets: [1] }]
    });

    // ── Category Submit AJAX ──────────────────────────────────────────
    $('#permissionCategoryForm').on('submit', function(e) {
      e.preventDefault();
      const saveBtn = $('#saveCatBtn');
      saveBtn.prop('disabled', true).text('Saving...');

      $.ajax({
        url: $(this).attr('action'),
        method: 'POST',
        data: $(this).serialize(),
        success: function(data) {
          saveBtn.prop('disabled', false).text('Save Category');
          if (data.success) {
            showToast(data.message, 'success');
            $('#newPCategory').modal('hide');
            setTimeout(() => { window.location.reload(); }, 1500);
          } else {
            showToast(data.message, 'error');
          }
        },
        error: function() {
          saveBtn.prop('disabled', false).text('Save Category');
          showToast('Could not contact the server.', 'error');
        }
      });
    });

    // ── Permission Submit AJAX ────────────────────────────────────────
    $('#permissionForm').on('submit', function(e) {
      e.preventDefault();
      const saveBtn = $('#savePermBtn');
      saveBtn.prop('disabled', true).text('Saving...');

      $.ajax({
        url: $(this).attr('action'),
        method: 'POST',
        data: $(this).serialize(),
        success: function(data) {
          saveBtn.prop('disabled', false).text('Save Permission');
          if (data.success) {
            showToast(data.message, 'success');
            $('#newPermission').modal('hide');
            setTimeout(() => { window.location.reload(); }, 1500);
          } else {
            showToast(data.message, 'error');
          }
        },
        error: function() {
          saveBtn.prop('disabled', false).text('Save Permission');
          showToast('Could not contact the server.', 'error');
        }
      });
    });
  });

  // ── Delete Permission ───────────────────────────────────────────────
  function deletePermission(id, name) {
    Swal.fire({
      title: 'Delete Permission?',
      text: `Are you sure you want to permanently delete the authorization key "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: 'manage/delete-permission.php',
          method: 'POST',
          data: { id: id },
          success: function(res) {
            if (res.success) {
              showToast(res.message, 'success');
              setTimeout(() => { window.location.reload(); }, 1500);
            } else {
              showToast(res.message, 'error');
            }
          },
          error: function() {
            showToast('Error deleting permission.', 'error');
          }
        });
      }
    });
  }

  // ── Delete Category ─────────────────────────────────────────────────
  function deleteCategory(id, name) {
    Swal.fire({
      title: 'Delete Category?',
      text: `Deleting the category "${name}" will automatically delete ALL permissions grouped under it!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: 'manage/delete-pcategory.php',
          method: 'POST',
          data: { id: id },
          success: function(res) {
            if (res.success) {
              showToast(res.message, 'success');
              setTimeout(() => { window.location.reload(); }, 1500);
            } else {
              showToast(res.message, 'error');
            }
          },
          error: function() {
            showToast('Error deleting category.', 'error');
          }
        });
      }
    });
  }
</script>
</body>
</html>

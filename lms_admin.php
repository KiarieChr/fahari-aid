<?php 
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');

$title = "LMS Administration Hub";
include("includes/get_user.php");
require_once('manage/functions.php');

// Restrict access
$stmtAdmin = $db->prepare("SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = :uid AND r.name IN ('Administrator', 'General Admin') LIMIT 1");
$stmtAdmin->execute([':uid' => $user_id]);
$isSuperAdmin = $stmtAdmin->fetchColumn() ? true : false;

$isAllowed = $isSuperAdmin || userHasPermission($db, $user_id, 'senior_leadership') || userHasPermission($db, $user_id, 'dc_coordinator');

if (!$isAllowed) {
    header("Location: dashboard.php");
    exit;
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
  
  <?php @include('includes/header.php');?>
  <head>
    <style>
      .nav-tabs-custom .nav-link {
        border: none;
        border-bottom: 2px solid transparent;
        color: #6b7280;
        font-weight: 600;
        padding: 1rem 1.5rem;
        background: transparent;
        border-radius: 0;
      }
      .nav-tabs-custom .nav-link.active {
        color: #696cff;
        border-bottom: 2px solid #696cff;
        background: rgba(105, 108, 255, 0.05);
      }
      .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 15px;
      }
      .table-action-btn { cursor: pointer; transition: color 0.2s; }
      .table-action-btn:hover { color: #696cff; }
    </style>
  </head>
  <body>
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        
        <?php @include('includes/sidebar.php');?>

        <div class="layout-page">
          <?php @include('includes/nav.php');?>

          <div class="content-wrapper">
            <div class="container-xxl flex-grow-1 container-p-y">
              
              <!-- Hero Header -->
              <div class="card mb-4 glass-card">
                <div class="card-body p-4 d-flex align-items-center">
                    <div class="avatar avatar-md me-3 bg-label-primary rounded p-2">
                        <i class="bx bx-cog fs-3"></i>
                    </div>
                    <div>
                        <h4 class="fw-bold mb-1 text-primary">LMS Administration Hub</h4>
                        <p class="text-muted mb-0" style="font-size: 0.9rem;">Manage Tracks, build Course Materials, and assign Instructors.</p>
                    </div>
                </div>
              </div>

              <!-- Navigation Tabs -->
              <div class="nav-align-top mb-4">
                <ul class="nav nav-tabs nav-tabs-custom mb-3 border-bottom" role="tablist">
                  <li class="nav-item">
                    <button type="button" class="nav-link active" role="tab" data-bs-toggle="tab" data-bs-target="#navs-tracks" aria-controls="navs-tracks" aria-selected="true">
                      <i class="bx bx-book-bookmark me-1"></i> Courses / Tracks
                    </button>
                  </li>
                  <li class="nav-item">
                    <button type="button" class="nav-link" role="tab" data-bs-toggle="tab" data-bs-target="#navs-modules" aria-controls="navs-modules" aria-selected="false">
                      <i class="bx bx-list-ol me-1"></i> Lessons / Content
                    </button>
                  </li>
                  <li class="nav-item">
                    <button type="button" class="nav-link" role="tab" data-bs-toggle="tab" data-bs-target="#navs-instructors" aria-controls="navs-instructors" aria-selected="false">
                      <i class="bx bx-group me-1"></i> Instructors
                    </button>
                  </li>
                </ul>
                
                <div class="tab-content p-0 bg-transparent shadow-none border-0">
                  
                  <!-- TRACKS TAB -->
                  <div class="tab-pane fade show active" id="navs-tracks" role="tabpanel">
                    <div class="card shadow-sm border-0 mb-4" style="border-radius: 15px;">
                      <div class="card-header border-bottom d-flex justify-content-between align-items-center bg-white" style="border-radius: 15px 15px 0 0;">
                          <h5 class="mb-0 fw-bold">Active Tracks</h5>
                          <button class="btn btn-primary btn-sm" onclick="openTrackModal()"><i class="bx bx-plus me-1"></i> Create Track</button>
                      </div>
                      <div class="table-responsive text-nowrap">
                        <table class="table table-hover">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Track Title</th>
                              <th>Icon</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody class="table-border-bottom-0" id="tracksTableBody">
                            <tr><td colspan="5" class="text-center py-4">Loading...</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <!-- MODULES TAB -->
                  <div class="tab-pane fade" id="navs-modules" role="tabpanel">
                    <div class="card shadow-sm border-0 mb-4" style="border-radius: 15px;">
                      <div class="card-header border-bottom bg-white d-flex justify-content-between align-items-center" style="border-radius: 15px 15px 0 0;">
                          <div class="d-flex align-items-center gap-3 w-50">
                              <h5 class="mb-0 fw-bold text-nowrap">Lessons for:</h5>
                              <select id="moduleTrackSelect" class="form-select form-select-sm" onchange="loadModules()">
                                  <option value="">Select a Track...</option>
                              </select>
                          </div>
                          <button class="btn btn-primary btn-sm" onclick="openModuleModal()"><i class="bx bx-plus me-1"></i> Add Lesson</button>
                      </div>
                      <div class="table-responsive text-nowrap">
                        <table class="table table-hover">
                          <thead>
                            <tr>
                              <th>Seq #</th>
                              <th>Lesson Title</th>
                              <th>Type</th>
                              <th>Practical Required?</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody class="table-border-bottom-0" id="modulesTableBody">
                            <tr><td colspan="5" class="text-center text-muted py-4">Please select a track first.</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <!-- INSTRUCTORS TAB -->
                  <div class="tab-pane fade" id="navs-instructors" role="tabpanel">
                    <div class="card shadow-sm border-0" style="border-radius: 15px;">
                      <div class="card-body text-center py-5">
                          <div class="avatar avatar-xl bg-label-primary rounded-circle mb-4 mx-auto d-flex align-items-center justify-content-center" style="width:80px; height:80px;">
                              <i class="bx bx-chalkboard fs-1"></i>
                          </div>
                          <h4 class="fw-bold text-dark mb-2">Manage Mentors & Coaches</h4>
                          <p class="text-muted mb-4 mx-auto" style="max-width: 500px;">Assign specific users to mentor individual trainees, or assign coaches to oversee entire tracks and grade assignments.</p>
                          <a href="manage_mentors_coaches.php" class="btn btn-primary btn-lg"><i class="bx bx-link-external me-2"></i> Go to Instructors Portal</a>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
            <?php @include('includes/footer.php');?>
            <div class="content-backdrop fade"></div>
          </div>
        </div>
      </div>
      <div class="layout-overlay layout-menu-toggle"></div>
    </div>

    <!-- Modals -->
    <!-- Track Modal -->
    <div class="modal fade" id="trackModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="trackModalTitle">Create Track</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="trackForm">
              <input type="hidden" id="trackId">
              <div class="mb-3">
                <label class="form-label">Title</label>
                <input type="text" id="trackTitle" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea id="trackDesc" class="form-control" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Badge Icon (Boxicons class)</label>
                <input type="text" id="trackIcon" class="form-control" value="bx bx-book" placeholder="bx bx-book">
              </div>
              <div class="mb-3">
                <label class="form-label">Status</label>
                <select id="trackStatus" class="form-select">
                    <option value="1">Active</option>
                    <option value="0">Draft</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="saveTrack()">Save Track</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Module Modal -->
    <div class="modal fade" id="moduleModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="moduleModalTitle">Add Lesson</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="moduleForm">
              <input type="hidden" id="moduleId">
              <div class="mb-3">
                <label class="form-label">Lesson Title</label>
                <input type="text" id="moduleTitle" class="form-control" required>
              </div>
              <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Sequence #</label>
                    <input type="number" id="moduleSeq" class="form-control" value="1" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Content Type</label>
                    <select id="moduleType" class="form-select">
                        <option value="video">Video</option>
                        <option value="text">Text / Document</option>
                    </select>
                  </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Media URL (YouTube or File URL)</label>
                <input type="text" id="moduleUrl" class="form-control" placeholder="https://youtube.com/watch?v=...">
              </div>
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="modulePractical">
                <label class="form-check-label" for="modulePractical">Requires Practical Assignment Submission?</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="saveModule()">Save Lesson</button>
          </div>
        </div>
      </div>
    </div>

    <?php @include('includes/scripts.html');?>
    <script>
      let currentTracks = [];
      let currentModules = [];

      document.addEventListener('DOMContentLoaded', function() {
          loadTracks();
      });

      function loadTracks() {
          fetch('api/admin_lms.php?action=get_tracks')
          .then(r => r.json())
          .then(data => {
              if (data.success) {
                  currentTracks = data.tracks;
                  const tbody = document.getElementById('tracksTableBody');
                  const select = document.getElementById('moduleTrackSelect');
                  
                  tbody.innerHTML = '';
                  select.innerHTML = '<option value="">Select a Track...</option>';
                  
                  if (currentTracks.length === 0) {
                      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No tracks found. Create one!</td></tr>';
                  } else {
                      currentTracks.forEach(t => {
                          const statusHtml = t.status == 1 ? '<span class="badge bg-label-success">Active</span>' : '<span class="badge bg-label-secondary">Draft</span>';
                          tbody.innerHTML += `
                              <tr>
                                <td>#${t.id}</td>
                                <td><strong>${t.title}</strong></td>
                                <td><i class="${t.badge_icon} fs-4 text-primary"></i></td>
                                <td>${statusHtml}</td>
                                <td>
                                  <i class="bx bx-edit fs-4 table-action-btn me-2" onclick="editTrack(${t.id})"></i>
                                </td>
                              </tr>
                          `;
                          
                          select.innerHTML += `<option value="${t.id}">${t.title}</option>`;
                      });
                  }
              }
          });
      }

      function openTrackModal() {
          document.getElementById('trackId').value = '';
          document.getElementById('trackTitle').value = '';
          document.getElementById('trackDesc').value = '';
          document.getElementById('trackIcon').value = 'bx bx-book';
          document.getElementById('trackStatus').value = '1';
          document.getElementById('trackModalTitle').innerText = 'Create Track';
          new bootstrap.Modal(document.getElementById('trackModal')).show();
      }

      function editTrack(id) {
          const track = currentTracks.find(t => t.id == id);
          if (track) {
              document.getElementById('trackId').value = track.id;
              document.getElementById('trackTitle').value = track.title;
              document.getElementById('trackDesc').value = track.description;
              document.getElementById('trackIcon').value = track.badge_icon;
              document.getElementById('trackStatus').value = track.status;
              document.getElementById('trackModalTitle').innerText = 'Edit Track';
              new bootstrap.Modal(document.getElementById('trackModal')).show();
          }
      }

      function saveTrack() {
          const data = {
              id: document.getElementById('trackId').value,
              title: document.getElementById('trackTitle').value,
              description: document.getElementById('trackDesc').value,
              badge_icon: document.getElementById('trackIcon').value,
              status: document.getElementById('trackStatus').value
          };
          
          fetch('api/admin_lms.php?action=save_track', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(data)
          }).then(r => r.json()).then(res => {
              if (res.success) {
                  bootstrap.Modal.getInstance(document.getElementById('trackModal')).hide();
                  Swal.fire('Saved!', 'Track has been saved.', 'success');
                  loadTracks();
              } else {
                  Swal.fire('Error', res.error, 'error');
              }
          });
      }

      function loadModules() {
          const trackId = document.getElementById('moduleTrackSelect').value;
          const tbody = document.getElementById('modulesTableBody');
          
          if (!trackId) {
              tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Please select a track first.</td></tr>';
              return;
          }
          
          fetch(`api/admin_lms.php?action=get_modules&track_id=${trackId}`)
          .then(r => r.json())
          .then(data => {
              if (data.success) {
                  currentModules = data.modules;
                  tbody.innerHTML = '';
                  
                  if (currentModules.length === 0) {
                      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No lessons added to this track yet.</td></tr>';
                  } else {
                      currentModules.forEach(m => {
                          const typeHtml = m.content_type === 'video' ? '<span class="badge bg-label-danger"><i class="bx bxl-youtube me-1"></i> Video</span>' : '<span class="badge bg-label-info"><i class="bx bx-file me-1"></i> Text</span>';
                          const pracHtml = m.requires_practical == 1 ? '<i class="bx bx-check text-success fs-4"></i>' : '<i class="bx bx-x text-muted fs-4"></i>';
                          
                          tbody.innerHTML += `
                              <tr>
                                <td><span class="badge bg-primary rounded-pill">${m.sequence_no}</span></td>
                                <td><strong>${m.title}</strong></td>
                                <td>${typeHtml}</td>
                                <td>${pracHtml}</td>
                                <td>
                                  <i class="bx bx-edit fs-4 table-action-btn" onclick="editModule(${m.id})"></i>
                                </td>
                              </tr>
                          `;
                      });
                  }
              }
          });
      }

      function openModuleModal() {
          const trackId = document.getElementById('moduleTrackSelect').value;
          if (!trackId) {
              Swal.fire('Notice', 'Please select a Track from the dropdown first.', 'info');
              return;
          }
          document.getElementById('moduleId').value = '';
          document.getElementById('moduleTitle').value = '';
          document.getElementById('moduleSeq').value = currentModules.length + 1;
          document.getElementById('moduleType').value = 'video';
          document.getElementById('moduleUrl').value = '';
          document.getElementById('modulePractical').checked = false;
          document.getElementById('moduleModalTitle').innerText = 'Add Lesson';
          new bootstrap.Modal(document.getElementById('moduleModal')).show();
      }

      function editModule(id) {
          const mod = currentModules.find(m => m.id == id);
          if (mod) {
              document.getElementById('moduleId').value = mod.id;
              document.getElementById('moduleTitle').value = mod.title;
              document.getElementById('moduleSeq').value = mod.sequence_no;
              document.getElementById('moduleType').value = mod.content_type;
              document.getElementById('moduleUrl').value = mod.media_url;
              document.getElementById('modulePractical').checked = mod.requires_practical == 1;
              document.getElementById('moduleModalTitle').innerText = 'Edit Lesson';
              new bootstrap.Modal(document.getElementById('moduleModal')).show();
          }
      }

      function saveModule() {
          const trackId = document.getElementById('moduleTrackSelect').value;
          const data = {
              id: document.getElementById('moduleId').value,
              track_id: trackId,
              title: document.getElementById('moduleTitle').value,
              sequence_no: document.getElementById('moduleSeq').value,
              content_type: document.getElementById('moduleType').value,
              media_url: document.getElementById('moduleUrl').value,
              requires_practical: document.getElementById('modulePractical').checked ? 1 : 0
          };
          
          fetch('api/admin_lms.php?action=save_module', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(data)
          }).then(r => r.json()).then(res => {
              if (res.success) {
                  bootstrap.Modal.getInstance(document.getElementById('moduleModal')).hide();
                  Swal.fire('Saved!', 'Lesson has been saved.', 'success');
                  loadModules();
              } else {
                  Swal.fire('Error', res.error, 'error');
              }
          });
      }
    </script>
  </body>
</html>

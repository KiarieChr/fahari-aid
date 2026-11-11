<?php 
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');

$title = "Manage Mentors & Coaches";
include("includes/get_user.php");
require_once("manage/functions.php");

// Restrict access
if(!userHasPermission($db, $user_id, 'senior_leadership') && !userHasPermission($db, $user_id, 'dc_coordinator')) {
    setcookie('error', "Access Denied: You do not have permission to manage trainers.", time() + 5, "/");
    header("Location: dashboard.php");
    exit;
}

// Fetch all active members for dropdowns
$stmtMembers = $db->query("SELECT u.id as user_id, m.first_name, m.last_name, m.phone_no FROM users u JOIN member m ON u.member_id = m.id WHERE (m.delete_status IS NULL OR m.delete_status = 'Active' OR m.delete_status = '0') ORDER BY m.first_name ASC");
$allMembers = $stmtMembers->fetchAll(PDO::FETCH_ASSOC);

// Fetch all tracks for coach dropdown
$stmtTracks = $db->query("SELECT id, title FROM trn_learning_tracks WHERE status = 1 ORDER BY title ASC");
$allTracks = $stmtTracks->fetchAll(PDO::FETCH_ASSOC);

// Fetch current mentors
$stmtMentors = $db->query("
    SELECT t.id as trn_id, u.id as user_id, m.first_name, m.last_name, m.phone_no, t.max_mentees, t.created_at,
           (SELECT COUNT(*) FROM trn_mentorship_assignments a WHERE a.mentor_id = u.id AND a.status = 'active') as assigned_mentees
    FROM trn_mentors t
    JOIN users u ON t.user_id = u.id
    JOIN member m ON u.member_id = m.id
    WHERE t.status = 1
");
$mentorsList = $stmtMentors->fetchAll(PDO::FETCH_ASSOC);

// Fetch current coaches
$stmtCoaches = $db->query("
    SELECT c.id as trn_id, u.id as user_id, m.first_name, m.last_name, m.phone_no, tr.title as track_title, c.created_at
    FROM trn_coaches c
    JOIN users u ON c.user_id = u.id
    JOIN member m ON u.member_id = m.id
    JOIN trn_learning_tracks tr ON c.track_id = tr.id
    WHERE c.status = 1
");
$coachesList = $stmtCoaches->fetchAll(PDO::FETCH_ASSOC);
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
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css" />
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <style>
      .nav-tabs-custom .nav-link { border: none; border-bottom: 2px solid transparent; color: #6b7280; }
      .nav-tabs-custom .nav-link.active { color: #6366f1; border-bottom-color: #6366f1; background: transparent; font-weight: 600; }
      .select2-container { z-index: 9999; }
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
              
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 class="fw-bold py-3 mb-0">Manage Mentors & Coaches</h4>
              </div>

              <div class="nav-align-top mb-4">
                <ul class="nav nav-tabs nav-tabs-custom" role="tablist">
                  <li class="nav-item">
                    <button type="button" class="nav-link active" role="tab" data-bs-toggle="tab" data-bs-target="#navs-mentors" aria-controls="navs-mentors" aria-selected="true">
                      Mentors
                    </button>
                  </li>
                  <li class="nav-item">
                    <button type="button" class="nav-link" role="tab" data-bs-toggle="tab" data-bs-target="#navs-coaches" aria-controls="navs-coaches" aria-selected="false">
                      Coaches
                    </button>
                  </li>
                </ul>
                <div class="tab-content border-0 shadow-sm rounded">
                  <!-- MENTORS TAB -->
                  <div class="tab-pane fade show active" id="navs-mentors" role="tabpanel">
                    <div class="d-flex justify-content-end mb-3">
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addMentorModal"><i class="bx bx-plus me-1"></i> Assign New Mentor</button>
                    </div>
                    <div class="table-responsive">
                      <table class="table table-hover dt-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Max Mentees</th>
                            <th>Assigned</th>
                            <th>Assigned On</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <?php foreach($mentorsList as $mentor): ?>
                          <tr>
                            <td><?= htmlspecialchars($mentor['first_name'] . ' ' . $mentor['last_name']) ?></td>
                            <td><?= htmlspecialchars($mentor['phone_no']) ?></td>
                            <td><?= $mentor['max_mentees'] ?></td>
                            <td><span class="badge bg-label-info"><?= $mentor['assigned_mentees'] ?></span></td>
                            <td><?= date('M d, Y', strtotime($mentor['created_at'])) ?></td>
                            <td>
                              <button class="btn btn-sm btn-danger rounded-pill" onclick="revokeTrainer(<?= $mentor['trn_id'] ?>, 'mentor')">Revoke</button>
                            </td>
                          </tr>
                          <?php endforeach; ?>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- COACHES TAB -->
                  <div class="tab-pane fade" id="navs-coaches" role="tabpanel">
                    <div class="d-flex justify-content-end mb-3">
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addCoachModal"><i class="bx bx-plus me-1"></i> Assign New Coach</button>
                    </div>
                    <div class="table-responsive">
                      <table class="table table-hover dt-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Track Assigned</th>
                            <th>Assigned On</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <?php foreach($coachesList as $coach): ?>
                          <tr>
                            <td><?= htmlspecialchars($coach['first_name'] . ' ' . $coach['last_name']) ?></td>
                            <td><?= htmlspecialchars($coach['phone_no']) ?></td>
                            <td><span class="badge bg-label-primary"><?= htmlspecialchars($coach['track_title']) ?></span></td>
                            <td><?= date('M d, Y', strtotime($coach['created_at'])) ?></td>
                            <td>
                              <button class="btn btn-sm btn-danger rounded-pill" onclick="revokeTrainer(<?= $coach['trn_id'] ?>, 'coach')">Revoke</button>
                            </td>
                          </tr>
                          <?php endforeach; ?>
                        </tbody>
                      </table>
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
    <!-- Add Mentor Modal -->
    <div class="modal fade" id="addMentorModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form id="addMentorForm">
            <div class="modal-header">
              <h5 class="modal-title">Assign New Mentor</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Select User</label>
                <select class="form-select select2" name="user_id" style="width: 100%;" required>
                  <option value=""></option>
                  <?php foreach($allMembers as $mem): ?>
                    <option value="<?= $mem['user_id'] ?>"><?= htmlspecialchars($mem['first_name'].' '.$mem['last_name'].' - '.$mem['phone_no']) ?></option>
                  <?php endforeach; ?>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Max Mentees</label>
                <input type="number" class="form-control" name="max_mentees" value="5" min="1" required>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" id="btnSaveMentor">Save Mentor</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Coach Modal -->
    <div class="modal fade" id="addCoachModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form id="addCoachForm">
            <div class="modal-header">
              <h5 class="modal-title">Assign New Coach</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Select User</label>
                <select class="form-select select2" name="user_id" style="width: 100%;" required>
                  <option value=""></option>
                  <?php foreach($allMembers as $mem): ?>
                    <option value="<?= $mem['user_id'] ?>"><?= htmlspecialchars($mem['first_name'].' '.$mem['last_name'].' - '.$mem['phone_no']) ?></option>
                  <?php endforeach; ?>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Select Track</label>
                <select class="form-select" name="track_id" required>
                  <option value="">Select a Track...</option>
                  <?php foreach($allTracks as $tr): ?>
                    <option value="<?= $tr['id'] ?>"><?= htmlspecialchars($tr['title']) ?></option>
                  <?php endforeach; ?>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" id="btnSaveCoach">Save Coach</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <?php @include('includes/scripts.html');?>
    <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    
    <script>
      $(document).ready(function() {
        $('.dt-table').DataTable({
            "order": []
        });

        $('.select2').select2({
            placeholder: "Select a user",
            allowClear: true
        });

        $('#addMentorForm').on('submit', function(e) {
            e.preventDefault();
            $('#btnSaveMentor').prop('disabled', true).text('Saving...');
            
            $.ajax({
                url: 'manage/assign_mentor.php',
                type: 'POST',
                data: $(this).serialize(),
                dataType: 'json',
                success: function(res) {
                    if(res.success) {
                        Swal.fire('Success!', 'Mentor assigned successfully', 'success').then(() => location.reload());
                    } else {
                        Swal.fire('Error', res.error || 'Failed to assign mentor', 'error');
                        $('#btnSaveMentor').prop('disabled', false).text('Save Mentor');
                    }
                },
                error: function() {
                    Swal.fire('Error', 'Server error occurred', 'error');
                    $('#btnSaveMentor').prop('disabled', false).text('Save Mentor');
                }
            });
        });

        $('#addCoachForm').on('submit', function(e) {
            e.preventDefault();
            $('#btnSaveCoach').prop('disabled', true).text('Saving...');
            
            $.ajax({
                url: 'manage/assign_coach.php',
                type: 'POST',
                data: $(this).serialize(),
                dataType: 'json',
                success: function(res) {
                    if(res.success) {
                        Swal.fire('Success!', 'Coach assigned successfully', 'success').then(() => location.reload());
                    } else {
                        Swal.fire('Error', res.error || 'Failed to assign coach', 'error');
                        $('#btnSaveCoach').prop('disabled', false).text('Save Coach');
                    }
                },
                error: function() {
                    Swal.fire('Error', 'Server error occurred', 'error');
                    $('#btnSaveCoach').prop('disabled', false).text('Save Coach');
                }
            });
        });
      });

      function revokeTrainer(id, type) {
          Swal.fire({
              title: 'Are you sure?',
              text: "This will revoke the " + type + "'s assignment and they will no longer be able to take on this role.",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Yes, revoke it!'
          }).then((result) => {
              if (result.isConfirmed) {
                  $.ajax({
                      url: 'manage/revoke_trainer.php',
                      type: 'POST',
                      data: { trn_id: id, type: type },
                      dataType: 'json',
                      success: function(res) {
                          if(res.success) {
                              Swal.fire('Revoked!', 'The trainer has been removed.', 'success').then(() => location.reload());
                          } else {
                              Swal.fire('Error', res.error || 'Failed to revoke trainer', 'error');
                          }
                      },
                      error: function() {
                          Swal.fire('Error', 'Server error occurred', 'error');
                      }
                  });
              }
          });
      }
    </script>
  </body>
</html>

<?php
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');
$title = "Event Registrations | Events & Programs";
include("includes/get_user.php");

$event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : 0;

// Fetch events for dropdown
$events_stmt = $db->query("SELECT id, ename, start_date FROM event WHERE delete_status = 0 ORDER BY start_date DESC");
$all_events = $events_stmt->fetchAll(PDO::FETCH_ASSOC);

if ($event_id === 0 && !empty($all_events)) {
    $event_id = $all_events[0]['id'];
}

// Fetch registrations for the selected event
$registrations = [];
if ($event_id > 0) {
    $stmt = $db->prepare("SELECT * FROM event_registration WHERE event_id = :event_id ORDER BY created_at DESC");
    $stmt->execute([':event_id' => $event_id]);
    $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>

<!doctype html>
<html lang="en" class="layout-navbar-fixed layout-menu-fixed layout-compact" dir="ltr" data-skin="default" data-assets-path="assets/" data-template="vertical-menu-template" data-bs-theme="light">
  <?php @include('includes/header.php');?>
  <body>
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        <!-- Menu -->
        <?php @include('includes/sidebar.php');?>
        <!-- / Menu -->

        <div class="layout-page">
          <!-- Navbar -->
          <?php @include('includes/nav.php');?>
          <!-- / Navbar -->

          <div class="content-wrapper">
            <div class="container-xxl flex-grow-1 container-p-y">
              
              <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
                  <div>
                      <h4 class="fw-bold mb-1"><i class="bx bx-group me-2"></i>Event Registrations & RSVPs</h4>
                      <p class="text-muted mb-0">Track attendees who have registered for upcoming events</p>
                  </div>
                  <div class="d-flex align-items-center">
                      <label class="me-2 fw-bold">Select Event:</label>
                      <select class="form-select shadow-sm" onchange="window.location.href='event_registrations.php?event_id='+this.value">
                          <?php foreach($all_events as $ev): ?>
                              <option value="<?php echo $ev['id']; ?>" <?php if($ev['id'] == $event_id) echo 'selected'; ?>>
                                  <?php echo htmlspecialchars($ev['ename']) . ' (' . date('M j, Y', strtotime($ev['start_date'])) . ')'; ?>
                              </option>
                          <?php endforeach; ?>
                      </select>
                  </div>
              </div>

              <!-- Metrics -->
              <div class="row mb-4">
                  <div class="col-md-3">
                      <div class="card shadow-sm border-0" style="border-radius:15px;">
                          <div class="card-body">
                              <h6 class="text-muted text-uppercase mb-2">Total RSVPs</h6>
                              <h3 class="mb-0 text-primary fw-bold"><?php echo count($registrations); ?></h3>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Registrations Table -->
              <div class="card shadow-sm border-0" style="border-radius: 15px;">
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-hover" id="registrationsTable">
                      <thead class="table-light">
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Contact</th>
                          <th>Category</th>
                          <th>Residence</th>
                          <th>Registered On</th>
                          <th>QR Token</th>
                        </tr>
                      </thead>
                      <tbody>
                        <?php $cnt = 1; foreach($registrations as $reg): ?>
                        <tr>
                          <td><?php echo $cnt++; ?></td>
                          <td class="fw-bold text-dark">
                              <?php echo htmlspecialchars($reg['names']); ?><br>
                              <small class="text-muted"><?php echo htmlspecialchars($reg['gender']); ?></small>
                          </td>
                          <td>
                              <i class="bx bx-phone me-1"></i> <?php echo htmlspecialchars($reg['phone_no']); ?><br>
                              <i class="bx bx-envelope me-1"></i> <?php echo htmlspecialchars($reg['email']); ?>
                          </td>
                          <td><span class="badge bg-label-info"><?php echo htmlspecialchars($reg['category']); ?></span></td>
                          <td><?php echo htmlspecialchars($reg['residence']); ?></td>
                          <td><?php echo date('M j, Y h:i A', strtotime($reg['created_at'])); ?></td>
                          <td>
                              <?php if(!empty($reg['qr_token'])): ?>
                                <span class="badge bg-label-success"><i class="bx bx-qr"></i> Generated</span>
                              <?php else: ?>
                                <span class="badge bg-label-warning">Pending</span>
                              <?php endif; ?>
                          </td>
                        </tr>
                        <?php endforeach; ?>
                      </tbody>
                    </table>
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

    <?php @include('includes/scripts.html');?>
    <script>
        $(document).ready(function() {
            $('#registrationsTable').DataTable();
        });
    </script>
  </body>
</html>

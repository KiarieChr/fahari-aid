<?php
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');
$title = "Event Check-In | Events & Programs";
include("includes/get_user.php");

$event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : 0;

// Fetch events for dropdown
$events_stmt = $db->query("SELECT id, ename, start_date FROM event WHERE delete_status = 0 ORDER BY start_date DESC");
$all_events = $events_stmt->fetchAll(PDO::FETCH_ASSOC);

if ($event_id === 0 && !empty($all_events)) {
    $event_id = $all_events[0]['id'];
}

// Fetch all registrations and attendance for manual checkin tab
$registrations = [];
$checked_in = 0;
if ($event_id > 0) {
    $stmt = $db->prepare("
        SELECT r.*, a.id as attendance_id, a.check_in_time 
        FROM event_registration r 
        LEFT JOIN event_attendance a ON r.id = a.registration_id 
        WHERE r.event_id = :event_id 
        ORDER BY r.names ASC
    ");
    $stmt->execute([':event_id' => $event_id]);
    $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach($registrations as $r) {
        if ($r['attendance_id']) $checked_in++;
    }
}
$total_rsvps = count($registrations);
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
                      <h4 class="fw-bold mb-1"><i class="bx bx-qr-scan me-2"></i>Day-Of Check-In</h4>
                      <p class="text-muted mb-0">Scan QR codes or manually check-in attendees</p>
                  </div>
                  <div class="d-flex align-items-center">
                      <label class="me-2 fw-bold">Select Event:</label>
                      <select class="form-select shadow-sm" onchange="window.location.href='event_checkin.php?event_id='+this.value" id="eventSelector">
                          <?php foreach($all_events as $ev): ?>
                              <option value="<?php echo $ev['id']; ?>" <?php if($ev['id'] == $event_id) echo 'selected'; ?>>
                                  <?php echo htmlspecialchars($ev['ename']) . ' (' . date('M j, Y', strtotime($ev['start_date'])) . ')'; ?>
                              </option>
                          <?php endforeach; ?>
                      </select>
                  </div>
              </div>

              <div class="row">
                  <!-- QR Scanner Area -->
                  <div class="col-md-5 mb-4">
                      <div class="card shadow-sm border-0" style="border-radius:15px; height: 100%;">
                          <div class="card-header bg-transparent border-bottom">
                              <h5 class="mb-0 fw-bold"><i class="bx bx-camera me-1"></i> Scan Ticket</h5>
                          </div>
                          <div class="card-body text-center pt-4">
                              <div id="reader" style="width:100%; border-radius:10px; overflow:hidden;"></div>
                              <p class="text-muted mt-3">Point camera at the attendee's QR Code</p>
                              <hr>
                              <div class="mt-3">
                                  <label class="form-label text-start w-100 fw-bold">Or enter Token manually</label>
                                  <div class="input-group">
                                    <input type="text" id="manualToken" class="form-control" placeholder="Token string...">
                                    <button class="btn btn-primary" onclick="checkinQR(document.getElementById('manualToken').value)">Check-In</button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <!-- Statistics and Manual List -->
                  <div class="col-md-7 mb-4">
                      <div class="row mb-3">
                          <div class="col-6">
                              <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);">
                                  <div class="card-body text-center text-white">
                                      <h6 class="mb-1 opacity-75">Checked In</h6>
                                      <h2 class="mb-0 fw-bold text-white"><?php echo $checked_in; ?> / <?php echo $total_rsvps; ?></h2>
                                  </div>
                              </div>
                          </div>
                          <div class="col-6">
                              <div class="card shadow-sm border-0 bg-white">
                                  <div class="card-body text-center">
                                      <h6 class="mb-1 text-muted">Pending Check-in</h6>
                                      <h2 class="mb-0 fw-bold text-dark"><?php echo $total_rsvps - $checked_in; ?></h2>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div class="card shadow-sm border-0" style="border-radius:15px;">
                          <div class="card-header bg-transparent border-bottom">
                              <h5 class="mb-0 fw-bold">Manual Search & Check-in</h5>
                          </div>
                          <div class="card-body pt-3">
                              <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                  <table class="table table-hover" id="manualTable">
                                      <thead class="table-light sticky-top">
                                          <tr>
                                              <th>Name</th>
                                              <th>Contact</th>
                                              <th>Status</th>
                                              <th>Action</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          <?php foreach($registrations as $reg): ?>
                                          <tr>
                                              <td class="fw-bold"><?php echo htmlspecialchars($reg['names']); ?></td>
                                              <td><?php echo htmlspecialchars($reg['phone_no']); ?></td>
                                              <td>
                                                  <?php if($reg['attendance_id']): ?>
                                                    <span class="badge bg-label-success"><i class="bx bx-check"></i> Checked In</span>
                                                  <?php else: ?>
                                                    <span class="badge bg-label-warning">Pending</span>
                                                  <?php endif; ?>
                                              </td>
                                              <td>
                                                  <?php if(!$reg['attendance_id']): ?>
                                                    <button class="btn btn-sm btn-primary" onclick="checkinManual(<?php echo $reg['id']; ?>)">Check In</button>
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
    <script src="https://unpkg.com/html5-qrcode"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        const eventId = <?php echo $event_id; ?>;

        $(document).ready(function() {
            $('#manualTable').DataTable({
                "pageLength": 5,
                "lengthChange": false
            });
            
            // Initialize QR Scanner
            const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
            html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        });

        let isScanning = false;
        function onScanSuccess(decodedText, decodedResult) {
            if (isScanning) return;
            isScanning = true;
            checkinQR(decodedText);
        }

        function onScanFailure(error) {
            // handle failure implicitly
        }

        function checkinQR(token) {
            if (!token) return;
            
            fetch('manage/api_event_checkin.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({action: 'checkin_qr', qr_token: token, event_id: eventId})
            })
            .then(res => res.json())
            .then(res => {
                if(res.success) {
                    Swal.fire({
                        title: 'Checked In!',
                        text: res.message,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => window.location.reload());
                } else {
                    Swal.fire('Error', res.error, 'error');
                    isScanning = false;
                }
            }).catch(err => {
                Swal.fire('Error', 'Network Error', 'error');
                isScanning = false;
            });
        }

        function checkinManual(regId) {
            fetch('manage/api_event_checkin.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({action: 'checkin_manual', registration_id: regId, event_id: eventId})
            })
            .then(res => res.json())
            .then(res => {
                if(res.success) {
                    Swal.fire({
                        title: 'Success!',
                        text: res.message,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => window.location.reload());
                } else {
                    Swal.fire('Error', res.error, 'error');
                }
            }).catch(err => {
                Swal.fire('Error', 'Network Error', 'error');
            });
        }
    </script>
  </body>
</html>

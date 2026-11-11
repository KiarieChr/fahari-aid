<?php
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');
$title = "Manage Events | Events & Programs";
include("includes/get_user.php");

// Fetch events
$stmt = $db->query("SELECT * FROM event WHERE delete_status = 0 ORDER BY start_date DESC");
$events = $stmt->fetchAll(PDO::FETCH_ASSOC);
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
                      <h4 class="fw-bold mb-1"><i class="bx bx-calendar-star me-2"></i>Manage Events</h4>
                      <p class="text-muted mb-0">Create, edit, and organize church programs</p>
                  </div>
                  <button class="btn btn-primary shadow-sm" onclick="openAddModal()">
                      <i class="bx bx-plus me-1"></i> Create New Event
                  </button>
              </div>

              <!-- Events Table -->
              <div class="card shadow-sm border-0" style="border-radius: 15px;">
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-hover" id="eventsTable">
                      <thead class="table-light">
                        <tr>
                          <th>Event Name</th>
                          <th>Start Date & Time</th>
                          <th>End Date & Time</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <?php foreach($events as $event): ?>
                        <tr>
                          <td class="fw-bold text-dark"><?php echo htmlspecialchars($event['ename']); ?></td>
                          <td><?php echo date('M j, Y h:i A', strtotime($event['start_date'])); ?></td>
                          <td><?php echo date('M j, Y h:i A', strtotime($event['end_date'])); ?></td>
                          <td><?php echo htmlspecialchars($event['branch']); ?></td>
                          <td><span class="badge bg-label-success">Published</span></td>
                          <td>
                            <div class="dropdown">
                              <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="bx bx-dots-vertical-rounded"></i></button>
                              <div class="dropdown-menu">
                                <a class="dropdown-item text-danger" href="javascript:void(0);" onclick="deleteEvent(<?php echo $event['id']; ?>)"><i class="bx bx-trash me-1"></i> Delete</a>
                              </div>
                            </div>
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

    <!-- Add Event Modal -->
    <div class="modal fade" id="addEventModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content" style="border-radius: 15px;">
          <div class="modal-header border-bottom pb-3">
            <h5 class="modal-title fw-bold" id="exampleModalLabel1">Create New Event</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body pb-0 pt-4">
            <form id="addEventForm">
                <input type="hidden" name="action" value="create">
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label">Event Name</label>
                        <input type="text" name="name" class="form-control" required placeholder="e.g. Annual Youth Retreat">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Start Date & Time</label>
                        <input type="datetime-local" name="start_date" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">End Date & Time</label>
                        <input type="datetime-local" name="end_date" class="form-control" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Location / Venue</label>
                        <input type="text" name="location" class="form-control" placeholder="Main Sanctuary">
                    </div>
                    <div class="col-12">
                        <label class="form-label">Description (Optional)</label>
                        <textarea name="description" class="form-control" rows="3" placeholder="Brief details about the event..."></textarea>
                    </div>
                </div>
            </form>
          </div>
          <div class="modal-footer pt-4 border-top mt-4">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="submitEvent()">Save Event</button>
          </div>
        </div>
      </div>
    </div>

    <?php @include('includes/scripts.html');?>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        $(document).ready(function() {
            $('#eventsTable').DataTable({
                "order": [[ 1, "desc" ]]
            });
        });

        function openAddModal() {
            $('#addEventForm')[0].reset();
            $('#addEventModal').modal('show');
        }

        function submitEvent() {
            const form = document.getElementById('addEventForm');
            if(!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            fetch('manage/api_events.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                if(res.success) {
                    $('#addEventModal').modal('hide');
                    Swal.fire({
                        title: 'Success!',
                        text: res.message,
                        icon: 'success',
                        confirmButtonText: 'Great'
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    Swal.fire('Error', res.error, 'error');
                }
            })
            .catch(err => Swal.fire('Error', 'Network request failed', 'error'));
        }

        function deleteEvent(id) {
            Swal.fire({
                title: 'Are you sure?',
                text: "This event will be archived.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch('manage/api_events.php', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({action: 'delete', id: id})
                    }).then(r=>r.json()).then(res => {
                        if(res.success) {
                            Swal.fire('Deleted!', 'Event has been deleted.', 'success').then(()=>window.location.reload());
                        }
                    });
                }
            })
        }
    </script>
  </body>
</html>

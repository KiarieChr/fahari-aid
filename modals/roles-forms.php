<!-- Small Modal -->
<div class="modal fade" id="addRole" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2">New Role</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/add-role.php" method="post">
          <div class="modal-body">
            <div class="row">
              <div class="col mb-6">
                <label>Role Name</label>
                <input type="text" name="name" class="form-control" placeholder="Manager" />
              </div>
            </div>
            
            
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button type="submit" class="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Second Modal -->
<!-- Small Modal -->
<!-- Large Modal -->
<div class="modal fade" id="newMeetup" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel3">New Meeting</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/add-meeting.php" method="post">
        <div class="modal-body">
            <div class="row">
              <div class=" mb-6">
                <label>Name</label>
                <input type="text" name="name" class="form-control" placeholder="Tuesday Fellowship 101 " />
              </div>
              <div class=" mb-6">
                <label>Facilitator</label>
                <?php
                    try {
                        $stmt = $db->query("SELECT m.first_name,m.last_name, u.id FROM users u join member m on u.member_id = m.id ORDER BY u.id DESC");
                        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    } catch (PDOException $e) {
                        die("Database error: " . $e->getMessage());
                    }?>
                    <select name="facilitator" id="facilitator" class="form-select">
                        <option value="">Select Facilitator</option>
                    <?php if (!empty($users)): ?>
                    <?php foreach ($users as $index => $row):
                      $name = $row['first_name']." ".$row['last_name'];
                      $id= $row['id'];?>
                      <option value="<?php echo htmlspecialchars($id);?>"><?php echo htmlspecialchars($name);?></option>
                      <?php endforeach; endif;?>
                </select>
              </div>
            </div>
            <div class="row">
            <div class=" mb-6">
                <label>Meeting Type</label>
                <?php
                    try {
                        $stmt = $db->query("SELECT * FROM meeting_type where id!=1 order by id DESC");
                        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    } catch (PDOException $e) {
                        die("Database error: " . $e->getMessage());
                    }?>
                    <select name="meeting_type" id="meeting_type" class="form-select">
                        <option value="">Select Category</option>
                    <?php if (!empty($users)): ?>
                    <?php foreach ($users as $index => $row):
                      $name = $row['type'];
                      $id= $row['id'];?>
                      <option value="<?php echo htmlspecialchars($id);?>"><?php echo htmlspecialchars($name);?></option>
                      <?php endforeach; endif;?>
                </select>
              </div>
            </div>
            <div class="row">
              <div class=" mb-6">
                <label>Start Time</label>
                <input type="datetime-local" name="start_time" class="form-control" placeholder="0700000000" />
              </div>
              <div class=" mb-6">
                <label>Meeting Link</label>
                <input type="text" name="meeting_link" class="form-control" placeholder="https://meet.google.com/qox-toth-izc" />
              </div>
              <div class=" mb-6">
                <label>End Time</label>
                <input type="datetime-local" name="end_time" class="form-control" placeholder="4/30/2025" />
              </div>
            </div>
            
          
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <button type="submit" class="btn btn-primary">Save changes</button>
        </div>
        </form>
      </div>
    </div>
  </div>
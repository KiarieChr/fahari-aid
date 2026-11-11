<!-- Small Modal -->
<div class="modal fade" id="showAttendance" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2">Are you sure you want to view Attendance</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="cell_attendance.php"  method="get">
          <div class="modal-body">
            <div class="row">
              <div class="col mb-6">
              <input type="hidden" name="cell_leader" value="<?= $member_id;?>">
                <label>Select Meeting</label>
                <select name="meeting_id" id="meeting_id" class="form-select select2">
                    <option value="">Select Meeting</option>
                    <?php 
                    // get from members who have no cell_id
                    $qq = "SELECT  *FROM meeting";
                    $qq2 = $db->query($qq);

                   
                    
                    $members = $qq2->fetchAll(PDO::FETCH_ASSOC);

                    if(!empty($members)){
                      foreach($members as $member=>$row){
                        ?>
                        <option value ="<?php echo $row['id'];?> " > <?php echo $row['name'];?></option>
                        <?php
                      }
                    }
                    ?>
                </select>
              </div>
            </div>
            
            
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button type="submit" class="btn btn-primary">View Attendance</button>
          </div>
        </form>
      </div>
    </div>
  </div>
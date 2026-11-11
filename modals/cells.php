  <!-- Small Modal -->
  <div class="modal fade" id="newCell" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2">Add A Cell</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/add-cell.php"  method="post">
          <div class="modal-body">
            <div class="row">
              <div class="col mb-6">
                <label>Cell Leader</label>
                <select name="cell_leader" id="cell_leader" class="form-select select2">
                    <option value="Active">Select Cell Leader</option>
                    <?php 
                    // get from members who have no cell_id
                    $qq = "SELECT  *FROM member where cell_id is null ORDER BY first_name";
                    $qq2 = $db->query($qq);

                   
                    
                    $members = $qq2->fetchAll(PDO::FETCH_ASSOC);

                    if(!empty($members)){
                      foreach($members as $member=>$row){
                        ?>
                                           <option value ="<?php echo $row['id'];?> " > <?php echo $row['first_name']." ".$row['last_name'];?></option>
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
            <button type="submit" class="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>

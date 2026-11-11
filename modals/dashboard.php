 <!-- Small Modal -->
 <div class="modal fade" id="attendMeet" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2">Mark Attendance </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/mark-attendance.php"  method="post">
          <div class="modal-body">
            <div class="row">
              <div class="col mb-6">
                <label>Member</label>
                <input type = "hidden" name="member" value="<?= $phone_no;?>">
                <input type="text" name="name" class="form-control" value="<?= $fname."".$lname;?>" placeholder="Education Level Name" readonly/>
              </div>
            </div>
            
            <div class="row">
              <div class="mb-6">
                <label for="meeting_id">Meeting</label>
                <select name="meeting_id" id="meeting_id" class="form-select">
                    <option value="">Select Meeting</option>
                    <?php
                    try { 
                    $get_mt = $db->query("SELECT *FROM meeting where end_time > NOW() order by id desc");
                    //$get_mt->execute();
                    $meetings = $get_mt->fetchAll(PDO::FETCH_ASSOC);
                    }
                    catch(PDOException $e){
                        die("Database error: " . $e->getMessage());
                    }

                    if(!empty($meetings)):
                        foreach($meetings as $index=> $row):
                            $id = $row['id'];
                            $name = $row['name'];
                            ?>
                    <option value="<?php echo $id;?>"><?php echo $name;?></option>
                    <?php endforeach; endif;?>
    
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
  <!-- Large Modal -->
  <div class="modal fade" id="newPType" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2">New Prophecy Type</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/add-ptype.php"  method="post">
          <div class="modal-body">
            <div class="row">
              <div class="col mb-1">
                <label>Prophecy Type</label>
               <input type="text" name="name" class="form-control"  placeholder="Instruction"/>
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
  <div class="modal fade" id="newPType" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2">New Prophecy</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/add-ptype.php"  method="post">
          <div class="modal-body">
            <div class="row">
              <div class="col mb-1">

                <label>Write your Prophetic Instructions here</label>
               <input type="text" name="name" class="form-control"  placeholder="Instruction"/>
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
  <!-- Large Modal -->
 <!-- Small Modal -->
 <div class="modal fade" id="newMaterialType" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2">New Material Type</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/add-type.php"  method="post">
          <div class="modal-body">
            <div class="row">
              <div class="col mb-1">
                <label>Type Name</label>
               <input type="text" name="name" class="form-control"  placeholder="Material Type"/>
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
  <!-- Large Modal -->

    <!-- Small Modal -->
    <div class="modal fade" id="newProphecy" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2">New Prophecy</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/add-instructions.php"  method="post">
          <div class="modal-body">
            <div class="row">
              <div class="col mb-6">
                <label>Purpose</label>
                <select name="purpose" id="purposeSelect" class="form-select select2">
                    <option value="Active">Select Type</option>
                    <?php 
                    // get from members who have no cell_id
                    $qq = "SELECT  *FROM prophecy_purpose order by id";
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
                <label for="title" class="mb-2 form-label">Title(Prophetic Instruction Title)</label>
                <input type="text" name="title" id="title"  placeholder = "Business & Economics Sector" class="form-control mb-2">
                <textarea name="prophecy" id="editor" class="form-control mb-2"></textarea>

                <label for="status" class="mb-2 form-label">Instruction Status</label>
                <select name="status" id="status" class="select2 form-select">
                  <option value="">Status Select</option>
                  <option value="Fulfilled">Fuilfilled</option>
                  <option value="Not Fulfilled">Waiting Fullfilment</option>
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

  <!-- Small Modal -->
  <div class="modal fade" id="newClass" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel2">New Ministry</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="manage/add-dpt.php" method="post">
                <div class="modal-body">
                    <div class="row">
                        <div class="col mb-6">
                            <label>Department Name</label>
                            <input type="text" name="name" class="form-control" placeholder="Music" />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col mb-6">
                          <label for="">Description</label>
                            <textarea name="description" id="description"class="form-control"> </textarea>
                        </div>
                    </div>

                    

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Save changes</button>
                </div>
            </form>
        </div>
    </div>
</div>

                        
  <!-- Large Modal -->
  <div class="modal fade" id="assign-role-<?php echo $id?>" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel3">Assign Roles</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/role-assign.php" method="post">
        <div class="modal-body">
                      
            <div class="row">
              <div class="mb-6">
              <input type="hidden" name="user_id"  value="<?php echo $id?>" />
                <?php
                    try {
                    $stmt = $db->query("SELECT * FROM roles ORDER BY id DESC");
                        $models = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    } catch (PDOException $e) {
                        die("Database error: " . $e->getMessage());
                    }
                    ?>
                <label for="nameSmall" class="form-label">Roles</label><br>
                    <?php if (!empty($models)): ?>
                        <?php foreach ($models as $index => $row):
                    
                      ?>
                      <input type="checkbox" name="roles[]" class="" value = "<?php echo $row['id'];?>"/>
                      <span><?php echo $row['name'];?></span><br>
                      
                      <?php endforeach; ?> 
                     
                        <?php endif; ?>
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
  <!-- Extra Large Modal -->
   <!-- Large Modal -->
  <div class="modal fade" id="editMember-<?php echo $id?>" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel3">Edit Member</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="" method="post">
        <div class="modal-body">
                      
            <div class="row">
              <div class="col mb-6">
                <label for="fname">First Name</label>
                <input type="hidden" name="member_id" value='<?= $id?>'>
                <input type="text" name="fname" value='<?= $fname;?>' class="form-control mb-2">
              </div>
            </div>
            <div class="row">
              <div class="col mb-6">
                <label for="lname" class="">Last Name</label>
                <input type="text" name="lname" value='<?= $lname;?>' class="form-control mb-1">
              </div>
            </div>
            <div class="row">
              <div class="col mb-6">
               

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
  <!-- Extra Large Modal -->
  <div class="modal fade" id="exLargeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel4">Modal title</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <div class="modal-body">
         
        


        
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <button type="button" class="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal for Login As User -->
<div class="modal fade" id="loginAsUserModal-<?php echo $id ?>" tabindex="-1" aria-labelledby="loginAsUserModalLabel-<?php echo $id ?>" aria-hidden="true">
    <div class="modal-dialog modal-md">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="loginAsUserModalLabel-<?php echo $id ?>">Login As User</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to log in as this user?</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <form action="manage/login_as_user.php" method="POST">
                    <input type="hidden" name="user_id" value="<?php echo $id ?>">
                    <button type="submit" class="btn btn-primary">Yes, Login</button>
                </form>
            </div>
        </div>
    </div>
</div>
<!-- Extra Large Modal -->
<div class="modal fade" id="viewInstruction<?=$id;?>" tabindex="-1" aria-hidden="true">
  <?php 
    $prophecyS = "SELECT *FROM prophecies where id=?";
    $get_pro= $db->prepare($prophecyS);
    $get_pro->execute([$id]);

    $prophecy = $get_pro->fetch(PDO::FETCH_OBJ);

  ?>
    <div class="modal-dialog modal-md" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel4">View Instruction on <?= $prophecy->title;?></h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>

        <div class="modal-body">
            <div class="container">
              <h5><?= $prophecy->title;?></h5>
              <div>
                <?= $prophecy->prophecy;?>
                
              </div>
            </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
            Close
          </button>
         
      </div>
    </div>
  
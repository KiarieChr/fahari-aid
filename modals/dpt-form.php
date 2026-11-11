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
  <div class="modal fade" id="newSubMinisterial" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel3">New Sub Ministerial (Department)</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/add-dptS.php" method="post">
        <div class="modal-body">
            <div class="row">
              <div class="col mb-6">
                <label>Sub-Ministerial Name</label>
                <input type="text" name="name" class="form-control" placeholder="Instrumentalist" />
              </div>
            </div>
            
            <div class="row">
              <div class="mb-6">
                <?php
                    try {
                    $stmt = $db->query("SELECT * FROM departments ORDER BY id DESC");
                        $models = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    } catch (PDOException $e) {
                        die("Database error: " . $e->getMessage());
                    }
                    ?>
                <label for="nameSmall" class="form-label">Department</label>
                <select name="department" id="department" class="form-select">
                    <option value="Active">Select department</option>
                    <?php if (!empty($models)): ?>
                        <?php foreach ($models as $index => $row):
                    
                      ?>
                      <option value="<?php echo $row['id'];?> "><?php echo $row['name'];?></option>
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
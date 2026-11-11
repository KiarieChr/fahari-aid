<!-- Small Modal -->
<div class="modal fade" id="newPCategory" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2">New Permission Category</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/add-pcategory.php" method="post" id="permissionCategoryForm">
          <div class="modal-body">
            <div class="row">
              <div class="col mb-6">
                <label>Permission Category Name</label>
                <input type="text" name="name" class="form-control" placeholder="Follow Up" />
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
<!-- Small Modal -->
<div class="modal fade" id="newPermission" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2">New Permission</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/add-permission.php"  method="post" id="permissionForm">
          <div class="modal-body">
            <div class="row">
              <div class="col mb-6">
                <label>Permission</label>
                <input type="text" name="name" class="form-control" placeholder="view_member" />
              </div>
            </div>
            
            <div class="row">
              <div class="mb-6">
                <?php
                    try {
                    $stmt = $db->query("SELECT * FROM permission_category ORDER BY id DESC");
                        $models = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    } catch (PDOException $e) {
                        die("Database error: " . $e->getMessage());
                    }
                    ?>
                <label for="nameSmall" class="form-label">Permission Category</label>
                <select name="category" id="category"class="form-select select2">
                    <option value="Active">Select Category</option>
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
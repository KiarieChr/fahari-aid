<div class="modal fade" id="editRole-<?php echo $id;?>" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2">Edit Role Name</h5>
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
                <input type="text" name="name" class="form-control" placeholder="Manager" value = "<?php echo $name;?>"/>
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
  
  <!-- Assign Permissions Modal -->
<div class="modal fade" id="assignPermissions-<?php echo $id;?>" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Assign Permissions</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
            <div id="permissionsTree-<?php echo $id; ?>" class="permissionsTree" data-role-id="<?php echo $id; ?>"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button"
                    class="btn btn-primary savePermissionsBtn"
                    data-role-id="<?php echo $id; ?>"
                    data-tree-id="permissionsTree-<?php echo $id; ?>">
                Save Changes
            </button>
            </div>
        </div>
    </div>
</div>

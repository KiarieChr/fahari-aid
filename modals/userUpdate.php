<div class="modal fade" id="editProfilePic" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel4">Upload Profile Picture</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/update-user.php" method="post" enctype="multipart/form-data">
          <div class="modal-body">
              <input type="hidden" name="user_id" value="<?= $user_id;?>">
              <input type="file" name="profile_image" id="profile_image" required accept=".jpeg" class="form-control">
              <label for="profile_image" class="form-label">Upload your Profile Picture</label>
           
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
  <div class="modal fade" id="editBannerImg" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel4">Upload Banner Image</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/update-user.php" method="post" enctype="multipart/form-data">
          <div class="modal-body">
              <input type="hidden" name="user_id" value="<?= $user_id;?>">
              <input type="file" name="banner_image" id="banner_image" required accept="image/*" class="form-control">
              <label for="banner_image" class="form-label">Upload your Banner Picture</label>
           
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
 


  <div class="modal fade" id="editLocation" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel4">Edit Location</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/update-user.php" method="post" enctype="multipart/form-data">
          <div class="modal-body">
              <input type="hidden" name="user_id" value="<?= $user_id;?>">

              <label for="countrySelect">Select Your Country</label>
              <select name="country" id="countrySelect" class="select2 form-select">
                <option value="">Select Country Below</option>
                <!-- Load from the Database -->
                <?php
                  $get_country = $db->prepare("SELECT *FROM countries");
                  $get_country->execute();
                  $countries = $get_country->fetchAll(PDO::FETCH_ASSOC);

                  if(!empty($countries)){
                    foreach($countries as $country){
                      echo "<option value=\"{$country['id']}\">{$country['name']}</option>";
                    }
                  }

                ?>
              </select>
              <label for="LocationSelect">Select Your Location:</label>
              <select id="locationSelect"  name = 'city' class="form-select select2" placeholder="Choose Locations...">
                <option value="">Select Your City/Town</option>
                   <!-- Load from the Database -->
              </select>
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
  

  <div class="modal fade" id="editBirthday" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel4">Update My Birthday</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/update-user.php" method="post" enctype="multipart/form-data">
          <div class="modal-body">
              <input type="hidden" name="user_id" value="<?= $user_id;?>">
              <label for="bod">Birthday</label>
              <input type="tel" id="dob" name="dob" class="form-control" maxlength="10" placeholder="MM/DD/YYYY" required>
              <small class="text-muted">Enter DOB: MMDDYYYY .. Typed as 01022009</small>
              <small id="dob-error" class="text-danger" style="display:none;">Invalid date format. Please enter a valid date (MM/DD/YYYY).</small>
           
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

  <div class="modal fade" id="editBio" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel4">Update My Bio</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/update-user.php" method="post" enctype="multipart/form-data">
          <div class="modal-body">
              <input type="hidden" name="user_id" value="<?= $user_id;?>">
              <label for="bod">Bio</label>
              <textarea name="bio" id="bio"  class="form-control" rows=5 placeholder="Write about your self"><?= $res->bio;?></textarea>
              
           
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
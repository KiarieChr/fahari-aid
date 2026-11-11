<!doctype html>
<?php include 'includes/connection.php';?>
<html
  lang="en"
  class="layout-wide customizer-hide"
  data-assets-path="../assets/"
  data-template="vertical-menu-template-free">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />

    <title>Jesus Enthroned Network Portal| New Member Registration</title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../assets/img/favicon/f" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
      rel="stylesheet" />

    <link rel="stylesheet" href="../assets/vendor/fonts/iconify-icons.css" />

    <!-- Core CSS -->
    <!-- build:css assets/vendor/css/theme.css  -->
     <!-- Tom Select CSS -->
    <link href="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/css/tom-select.css" rel="stylesheet">

    <!-- Tom Select JS -->
    <script src="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js"></script>

    <link rel="stylesheet" href="../assets/vendor/css/core.css" />
    <link rel="stylesheet" href="../assets/css/demo.css" />

    <!-- Vendors CSS -->

    <link rel="stylesheet" href="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />

    <!-- endbuild -->

    <!-- Page CSS -->
    <link rel="stylesheet" href="../assets/vendor/css/auth.css">
    <script src="../assets/vendor/js/helpers.js"></script>
  

    <script src="../assets/js/config.js"></script>
  </head>

  <body>
    <!-- Content -->

     

    <div class="">
      <div class="authentication-wrapper authentication-basic">
        <div class="row row-sm">
          <div class="col-sm-12 col-md-6 col-lg-6">            
              <div class="auth-form">
                
                <form action="manage/add-member.php" method='post' id="memberForm">
                  <!-- Pass the meeting id to redirect to the meeting -->
                  <?php if(isset($_GET['meeting_id'])):
                    $meeting_id = $_GET['meeting_id'];
                  ?>
                  <input type="hidden" name="meeting_id" value="<?php echo $meeting_id;?>">
                  <?php
                  endif;
                  ?>
                  <!-- Personal Info -->
                    <div id="personalInfoValidation" class="content">
                      <div class="sm-display">
                        <div class="app-brand justify-content-center">
                          <a href="" class="app-brand-link gap-2">
                            <span class="app-brand-logo demo">
                              <span class="text-primary">

                              </span>
                            </span>
                            <span class="app-brand-text demo text-heading fw-bold">Jesus Enthroned Network</span><br>
                          
                          </a>
                          
                        </div>
                      </div>
                      <div class="content-header mb-6">
                        <h4 class="mb-0">Be Part of Our Story.</h4>
                        <p class="mb-0">You  are the influence the world has been waiting for..</p>
                      </div>
                      <div id="responseAlert" style="display: none;"></div>
                      <div class="row g-6">
                        <div class="col-md-6 form-control-validation">
                          <label class="form-label" for="first_name">First Name</label>
                          <input type="text" required id="first_name" required name="first_name" class="form-control" placeholder="Mary" />
                        </div>
                        <div class="col-md-6">
                          <label class="form-label" for="last_name">Last Name</label>
                          <input type="text" required id="last_name" required name="last_name" class="form-control" placeholder="Ann" />
                        </div>
                        <div class="col-md-6">
                          <label class="form-label" for="phone_no">Phone No</label>
                          <div class="input-group">
                            <span class="input-group-text">KE (+254)</span>
                            <input type="text" id="phone_no" name="phone_no" required class="form-control" placeholder="0700000000" />
                          </div>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label" for="email">Email</label>
                          <input type="email" id="email" name="email" class="form-control" required placeholder="youarelove@gods.com" />
                        </div>
                        <div class="col-md-6 form-control-validation">
                          <label class="form-label" for="residence">Area of Residence</label>
                          <input type="text" id="residence" name="residence" class="form-control" placeholder="Nairobi" required/>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label" for="invited_by">Who invited you to our meetings?</label>
                          <select id="memberSelect"  name = 'invited_by' placeholder="Choose members..." required>
                            <option value="">Select Member</option>
                                <?php
                                $stmt = $db->prepare("SELECT id, first_name, last_name FROM member");
                                $stmt->execute();
                              
                                $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
                              
                                foreach ($members as $member) {
                                    $fullName = $member['first_name'] . ' ' . $member['last_name'];
                                    echo "<option value=\"{$member['first_name']}\">{$fullName}</option>";
                                }
                                ?>
                            </select>
                        
                                <small class="text-primary">Kindly Enter the full name if you in a position to.</small>
                        </div>
                        <div class="col-md-6 form-control-validation">
                          <label class="form-label" for="marital_status">Marital/Relationship Status</label>
                          <select id="marital_status" name="marital_status" class="select2 form-select" required data-allow-clear="true">
                            <option value="">Select</option>
                            <option value="married">Married</option>
                            <option value="engaged">Engaged</option>
                            <option value="dating">Dating</option>
                            <option value="single">Single</option>
                            <option value="separated">Separated</option>
                            <option value="divorced">Divorced</option>
                            <option value="celibate">Celibate</option>
                            
                          </select>
                        </div>
                        <div class="col-md-6 form-control-validation">
                          <label for="empl_status" class="form-label">Employment Status</label>
                          <select name="emp_status" id="emp_status" class="form-select select2" required>
                            <option value="">Select Employment Status</option>
                            <option value="employed">Formal Employment</option>
                            <option value="casual">Casual Employment</option>
                            <option value="self">Self-Employed</option>
                          <option value="student">Student</option>
                            <option value="student-work">Student but also Working</option>
                            <option value="not-employed">No Work at All</option>
                          </select>
                        </div>
                        <div class="col-md-6 form-control-validation">
                          <label for="bod">Birthday</label>
                          <input type="tel" id="dob" name="dob" class="form-control" maxlength="10" placeholder="MM/DD/YYYY" required>
                          <small class="text-muted">Enter DOB: MMDDYYYY .. Typed as 01022009</small>
                          <small id="dob-error" class="text-danger" style="display:none;">Invalid date format. Please enter a valid date (MM/DD/YYYY).</small>




                        </div>
                        <div class="col-md-6 form-control-validation">
                              <label for="study_level" class="form-label">Current Level of Study</label>
                              <select name="study_level" id="study_level" class="form-select select2" required>
                                <option value="" disabled>Select Level</option>
                                <option value="jss">Junior Secondary</option>
                                <option value="high-school">Senior Secondary(High School)</option>
                                <option value="college-artisan">College(TVET)</option>
                              <option value="university-dip-degree">College/University(Degree/Diploma)</option>
                                <option value="post-grad">Post Grad Student</option>
                                <option value="not-in-school">Not in School</option>
                              </select>
                              <small>If currently in School Kindly Indicate which level</small>
                            </div>
                        <div class="col-12 d-flex justify-content-between">
                              
                              <button class="btn btn-primary btn-next" id="submitBtn"><span class="align-middle d-sm-inline-block  me-sm-2 me-0">Join Us</span> <i class="icon-base bx bx-right-arrow-alt icon-sm me-sm-n2"></i></button>
                        </div>
                    </div>
                  </div>


                </form>
                
              </div>           
          </div>
          <div class="sm-none col-md-6 col-lg-6">
            <div class="app-brand justify-content-center">
              <a href="" class="app-brand-link gap-2">
                <span class="app-brand-logo demo">
                  <span class="text-primary">

                  </span>
                </span>
                <span class="app-brand-text demo text-white fw-bold">Jesus Enthroned Network</span><br>
               
              </a>
              
            </div>
          </div>

        </div>
       
      </div>
    </div>

    <!-- / Content -->

    

    <!-- Core JS -->

    <script src="../assets/vendor/libs/jquery/jquery.js"></script>

    <script src="../assets/vendor/libs/popper/popper.js"></script>
    <script src="../assets/vendor/js/bootstrap.js"></script>

    <script src="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>

    <script src="../assets/vendor/js/menu.js"></script>

    <!-- endbuild -->

    <!-- Vendors JS -->

    <!-- Main JS -->

    <script src="../assets/js/main.js"></script>
    <script>
$(document).ready(function() {
    new TomSelect("#memberSelect", {
        plugins: ['remove_button'],
        maxItems: null,
        placeholder: 'Type Here to choose...'
      });
    $('#memberForm').on('submit', function(e) {
        e.preventDefault();
        
        // Validate date format
        const dobInput = document.getElementById('dob');
        const dobError = document.getElementById('dob-error');
        if (dobError.style.display === 'block') {
            $('#responseAlert').html(
                '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
                '<strong>Error!</strong> Please enter a valid date format (MM/DD/YYYY).' +
                '</div>'
            ).show();
            return;
        }
        
        // Get form data
        var formData = $(this).serialize();
        
        // Disable button and show loading state
        $('#submitBtn').prop('disabled', true).html(
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...'
        );
        
        // Hide any previous alerts
        $('#responseAlert').hide().empty();
        
        // AJAX request
        $.ajax({
            url: 'manage/add-member.php',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    // Show success message
                    $('#responseAlert').html(
                        '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
                        '<strong>Success!</strong> ' + response.message +
                        '</div>'
                    ).show();
                    
                    // Redirect after 4s delay
                    if (response.redirect) {
                        setTimeout(function() {
                            window.location.href = response.redirect;
                        }, 4000);
                    }
                } else {
                    // Show error message
                    $('#responseAlert').html(
                        '<div class="alert alert-' + (response.type || 'danger') + ' alert-dismissible fade show" role="alert">' +
                        '<strong>' + (response.title || 'Error') + '</strong> ' + response.message +
                        '</div>'
                    ).show();
                    
                    // Re-enable button if not redirecting
                    if (!response.redirect) {
                        $('#submitBtn').prop('disabled', false).html(
                            '<span class="align-middle d-sm-inline-block d-none me-sm-2 me-0">Submit</span>' +
                            '<i class="icon-base bx bx-right-arrow-alt icon-sm me-sm-n2"></i>'
                        );
                    }
                    
                    // Redirect if needed
                    if (response.redirect) {
                        setTimeout(function() {
                            window.location.href = response.redirect;
                        }, 4000);
                    }
                }
            },
            error: function(xhr, status, error) {
                // Show error message
                $('#responseAlert').html(
                    '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
                    '<strong>Error!</strong> An error occurred. Please try again.' +
                    '</div>'
                ).show();
                
                // Re-enable button
                $('#submitBtn').prop('disabled', false).html(
                    '<span class="align-middle d-sm-inline-block d-none me-sm-2 me-0">Submit</span>' +
                    '<i class="icon-base bx bx-right-arrow-alt icon-sm me-sm-n2"></i>'
                );
            }
        });
    });
});
</script>
    <script>
       document.getElementById('dob').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
  let errorMessage = document.getElementById('dob-error');
  let isValidDate = false;

  // Format input as MM/DD/YYYY
  if (value.length > 2 && value.length <= 4)
    value = value.slice(0, 2) + '/' + value.slice(2);
  else if (value.length > 4 && value.length <= 8)
    value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
  else if (value.length > 8)
    value = value.slice(0, 10); // Limit to MM/DD/YYYY

  // Validate the date using a regular expression
  if (value.length === 10) {
    const dateParts = value.split('/');
    const month = parseInt(dateParts[0], 10);
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    
    // Check if the date is valid (MM between 1-12, DD valid for the month)
    const date = new Date(year, month - 1, day);  // month is 0-indexed in JavaScript
    isValidDate = date.getMonth() + 1 === month && date.getDate() === day && date.getFullYear() === year;
    }

      // Show or hide error message based on validation
      if (isValidDate) {
        errorMessage.style.display = 'none';
      } else {
        errorMessage.style.display = 'block';
      }

      // Update input value with the formatted date
      e.target.value = value;
    });
</script>

  
    
  </body>
</html>

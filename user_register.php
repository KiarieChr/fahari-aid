<!doctype html>

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

    <title>User Register| Members  Portal</title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../assets/img/favicon/favic" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
      rel="stylesheet" />

    <link rel="stylesheet" href="../assets/vendor/fonts/iconify-icons.css" />

    <!-- Core CSS -->
    <!-- build:css assets/vendor/css/theme.css  -->

    <link rel="stylesheet" href="../assets/vendor/css/core.css" />
    <link rel="stylesheet" href="../assets/css/demo.css" />

    <!-- Vendors CSS -->

    <link rel="stylesheet" href="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />

    <!-- endbuild -->

    <!-- Page CSS -->
    <!-- Page -->
    <link rel="stylesheet" href="../assets/vendor/css/pages/page-auth.css" />

    <!-- Helpers -->
    <script src="../assets/vendor/js/helpers.js"></script>
    <!--! Template customizer & Theme config files MUST be included after core stylesheets and helpers.js in the <head> section -->

    <!--? Config:  Mandatory theme config file contain global vars & default theme options, Set your preferred theme option in this file.  -->

    <script src="../assets/js/config.js"></script>
  </head>

  <body>
    <!-- Content -->

    <div class="container-xxl">
      <div class="authentication-wrapper authentication-basic container-p-y">
        <div class="authentication-inner">
          <!-- Register Card -->
          <div class="card px-sm-6 px-0">
            <div class="card-body">
              <!-- Logo -->
              <div class="app-brand justify-content-center mb-6">
                <a href="index.html" class="app-brand-link gap-2">
                  <span class="app-brand-logo demo">
                    <span class="text-primary">
                      
                    </span>
                  </span>
                  <span class="app-brand-text demo text-heading fw-bold">J.E.N Member Portal</span>
                </a>
              </div>
              <!-- /Logo -->
              <h4 class="mb-1">Get Empowered to live to your Purposes</h4>
              <p class="mb-6">Access Materials that will get you to the Top!</p>

              <form id="formAuthentication" method='post' class="mb-6" action="manage/signup.php" onsubmit="validateForm()">
              <?php 
                      if(isset($_SESSION['error'])):
													?>
													<div class="alert alert-warning alert-dismissible fade show" role="alert">
														<span><?= $_SESSION['error'];?></span>
														
													</div>
														<?php unset($_SESSION['error']);
													endif

									?>
                <div class="mb-6">
                  <label for="phone_no" class="form-label">Phone Number</label>
                  <input
                    type="text"
                    class="form-control"
                    id="phone_no"
                    name="phone_no"
                    title="Do not include the +254//"
                    placeholder="07000000000"
                    autofocus onkeyup="checkUsername()"  required/>
                    <div id = "usernameMsg"></div>
                </div>
                <div class="mb-6">
                  <label for="email" class="form-label">Email</label>
                  <input type="text" class="form-control" id="email" name="email" placeholder="jesusenthronednetwork@gmail.com" />
                </div>
                <div class="mb-6">
                  <label for="first_name" class="form-label">Date Of Birth</label>
                  <input type="date" class="form-control" id="dob" name="dob" placeholder="Enter your First Name" />
                </div>
                <div class="mb-6">
                  <label for="location" class="form-label">Area of Residence</label>
                  <input type="text" class="form-control" id="location" name="location" placeholder="Enter your First Name" />
                </div>
                 <div class="mb-6">
                  <label for="empl_status" class="form-label">Employment Status</label>
                  <select name="emp_status" id="emp_status" class="form-control">
                    <option value="">Select Employment Status</option>
                    <option value="employed">Formal Employment</option>
                    <option value="casual">Casual Employment</option>
                    <option value="self">Self-Employed</option>
                   <option value="student">Student</option>
                    <option value="student-work">Student but also Working</option>
                    <option value="not-employed">No Work at All</option>
                  </select>
                </div>
                <div class="form-password-toggle">
                  <label class="form-label" for="password">Password</label>
                  <div class="input-group input-group-merge">
                    <input
                      type="password"
                      id="password"
                      class="form-control"
                      name="password"
                      placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                      aria-describedby="password" />
                    <span class="input-group-text cursor-pointer"><i class="icon-base bx bx-hide"></i></span>
                    
                  </div>
                </div>
                <div class="form-password-toggle">
                  <label class="form-label" for="password">Confirm Password</label>
                  <div class="input-group input-group-merge">
                    <input
                      type="password"
                      id="cpassword"
                      class="form-control"
                      name="cpassword"
                      placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                      aria-describedby="cpassword" onkeyup="checkPassword()" />
                    <span class="input-group-text cursor-pointer"><i class="icon-base bx bx-hide"></i></span>
                    
                  </div>
                  <div id="msgPassword"></div>
                </div>
                <div class="my-7">
                  <div class="form-check mb-0">
                    <input class="form-check-input" type="checkbox" id="terms-conditions" name="terms" />
                    <label class="form-check-label" for="terms-conditions">
                      I agree to
                      <a href="javascript:void(0);">privacy policy & terms</a>
                    </label>
                  </div>
                </div>
                <button class="btn btn-primary d-grid w-100">Sign up</button>
              </form>

              <p class="text-center">
                <span>Already have an account?</span>
                <a href="login.php">
                  <span>Sign in instead</span>
                </a>
              </p>
            </div>
          </div>
          <!-- Register Card -->
        </div>
      </div>
    </div>

    <!-- / Content -->

    

    <script >
			function checkUsername(){
				let username = document.getElementById("username").value;
				let message = document.getElementById("usernameMsg");

				if(username.length<=3){
					message.innerHTML = "<span class='text-danger'> Username Too Short </span>";
					return;
				}else{
					message.innerHTML="";
				}
				let xhr = new XMLHttpRequest();
				xhr.open("POST","manage/checker.php",true);
				xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
				xhr.onreadystatechange = function (){
					if(xhr.readyState == 4 && xhr.status == 200){
						if(xhr.responseText === "taken"){
							message.innerHTML="<div class='spinner-border spinner-border-sm text-danger' role='status'></div><span class='text-danger'>Username has been taken</span> ";
						}
						else{
							message.innerHTML= "<div class='spinner-border spinner-border-sm text-success' role='status'></div><span class='text-success'>Username Available</span> ";
						}
					}
				};
				xhr.send("username="+ encodeURIComponent(username));
			}
			function validateForm(){
				let username = document.getElementById('username');
				let email = document.getElementById('email');
				
				let errorMsg = "";

				if(username == ""){
					errorMsg +="Username is Required\n";
				}
				let emailPattern = /^[a-zA-Z0-9._%+-]@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
				if(!email.match(emailPattern)){
					errorMsg+="Invalid email format. \n";
				}
				if(errorMsg){
					alert(errorMsg);
					return false;
				}
				return true;

			}
			function checkPassword(){
				let passworddiv = document.getElementById('msgPassword')
				let password= document.getElementById('password').value;
				let cpassword = document.getElementById('cpassword').value;

				if(password !== cpassword){
					passworddiv.innerHTML = "<span class='text-warning'>Password Mismatch!Toggle the Eye icon to Check</span>";
				}
				else{
					passworddiv.innerHTML = "";
				}
				return true;

			}
		</script>


    <script src="../assets/vendor/libs/jquery/jquery.js"></script>

    <script src="../assets/vendor/libs/popper/popper.js"></script>
    <script src="../assets/vendor/js/bootstrap.js"></script>

    <script src="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>

    <script src="../assets/vendor/js/menu.js"></script>

    <!-- endbuild -->

    <!-- Vendors JS -->

    <!-- Main JS -->

    <script src="../assets/js/main.js"></scrip t>

    <!-- Page JS -->

    <!-- Place this tag before closing body tag for github widget button. -->
    <script async defer src="https://buttons.github.io/buttons.js"></script>
  </body>
</html>

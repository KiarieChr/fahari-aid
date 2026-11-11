<?php 
include('includes/checklogin.php');

$title = "Cell Management | Cell Analytics";
include("includes/get_user.php");
//@include('manage/functions.php');
?>

<!doctype html>

<html
  lang="en"
  class="layout-navbar-fixed layout-menu-fixed layout-compact "
  data-assets-path="../assets/"
  data-template="vertical-menu-template-free">
    <?php @include('includes/header.php');?>

  <body>
    <!-- Layout wrapper -->
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        <!-- Menu -->
         <?php
          @include('includes/sidebar.php');
          ?>
        <!-- / Menu -->

        <!-- Layout container -->
        <div class="layout-page">
          <!-- Navbar -->
          <?php
          @include('includes/nav.php');
          @include('modals/dashboard.php');
          ?>

          <!-- / Navbar -->

          <!-- Content wrapper -->
          <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-p-y">
              <div class="row">
                <div class="col-xxl-4 col-lg-4 mb-6 order-0">
                  <div class="row">
                    <div class="col-lg-12 col-md-12">
                      <div class="card">
                        <div class="card-body">
                          <div class="card-title d-flex align-items-start justify-content-between mb-4">
                          <div class="avatar flex-shrink-0">
                              <img
                                src="../assets/img/icons/unicons/wallet-info.png"
                                alt="chart success"
                                class="rounded" />
                            </div>
                            <div class="dropdown">
                              <button
                                class="btn p-0"
                                type="button"
                                id="cardOpt3"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false">
                                <i class="icon-base bx bx-dots-vertical-rounded text-body-secondary"></i>
                              </button>
                              <div class="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt3">
                                <a class="dropdown-item" href="javascript:void(0);">View More</a>
                                <a class="dropdown-item" href="javascript:void(0);">D</a>
                              </div>
                            </div>
                          </div>
                          <?php
                          // the member id ;;
                          $mid = $db->query("SELECT COUNT(*) AS num_rows from member WHERE cell_id IS NOT NULL");

                          $member = $mid->fetch(PDO::FETCH_ASSOC);

                          $assigned = $member['num_rows'];
                          



                          $unassignedq ="SELECT COUNT(*) AS num_rows from member WHERE cell_id IS NULL";

                          $md = $db->query($unassignedq);
                          

                          $res = $md->fetch(PDO::FETCH_ASSOC);

                          $mattend = $res['num_rows'];

                          // get the total members for the month

                          $meet = $db->query("SELECT count(*) as members from member");
                          $meeting = $meet->fetch(PDO::FETCH_OBJ);

                          $members2 = $meeting->members;

                          $percentage1 = round(($assigned / $members2) *100,2);
                          ?>
                          <p class="mb-0">Assigned Members</p>
                          <h5 class="card-title mb-3"><?= $assigned;?> of <?= $members2; ?> Members</h5>
                          <small class="text-success fw-medium"
                            ><i class="icon-base bx bx-info-circle"></i> <?= $percentage1; ?>% of total Members</small
                          >
                          </div>
                        </div>
                      </div>
                    
                    
                    
                  </div>
                </div>
                <div class="col-xxl-4 col-lg-4 mb-6 order-0">
                  <div class="row">
                    <div class="col-lg-12 col-md-12">
                      <div class="card">
                        <div class="card-body">
                          <div class="card-title d-flex align-items-start justify-content-between mb-4">
                          <div class="avatar flex-shrink-0">
                              <img
                                src="../assets/img/icons/unicons/wallet-info.png"
                                alt="chart success"
                                class="rounded" />
                            </div>
                            <div class="dropdown">
                              <button
                                class="btn p-0"
                                type="button"
                                id="cardOpt3"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false">
                                <i class="icon-base bx bx-dots-vertical-rounded text-body-secondary"></i>
                              </button>
                              <div class="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt3">
                                <a class="dropdown-item" href="javascript:void(0);">View More</a>
                                <a class="dropdown-item" href="javascript:void(0);">D</a>
                              </div>
                            </div>
                          </div>
                          <?php
                          // the member id ;;
                          $mid = $db->query("SELECT COUNT(*) AS num_rows from member WHERE cell_id IS NOT NULL");

                          $member = $mid->fetch(PDO::FETCH_ASSOC);

                          $assigned = $member['num_rows'];
                          



                          $unassignedq ="SELECT COUNT(*) AS num_rows from member WHERE cell_id IS NULL";

                          $md = $db->query($unassignedq);
                          

                          $res = $md->fetch(PDO::FETCH_ASSOC);

                          $mattend = $res['num_rows'];

                          // get the total members for the month

                          $meet = $db->query("SELECT count(*) as members from member");
                          $meeting = $meet->fetch(PDO::FETCH_OBJ);

                          $members2 = $meeting->members;

                          $percentage =round(($mattend / $members2) *100,2);
                          ?>
                          <p class="mb-0">Un-Assigned Members</p>
                          <h5 class="card-title mb-3"><?= $mattend;?> of <?= $members2; ?> Members</h5>
                          <small class="text-success fw-medium"
                            ><i class="icon-base bx bx-info-circle"></i> <?= $percentage; ?>% of total Members</small
                          >
                          </div>
                        </div>
                      </div>
                    
                    
                    
                  </div>
                </div>
                <div class="col-xxl-4 col-lg-4 mb-6 order-0">
                  <div class="row">
                    <div class="col-lg-12 col-md-12">
                      <div class="card">
                        <div class="card-body">
                          <div class="card-title d-flex align-items-start justify-content-between mb-4">
                          <div class="avatar flex-shrink-0">
                              <img
                                src="../assets/img/icons/unicons/wallet-info.png"
                                alt="chart success"
                                class="rounded" />
                            </div>
                            <div class="dropdown">
                              <button
                                class="btn p-0"
                                type="button"
                                id="cardOpt3"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false">
                                <i class="icon-base bx bx-dots-vertical-rounded text-body-secondary"></i>
                              </button>
                              <div class="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt3">
                                <a class="dropdown-item" href="javascript:void(0);">View More</a>
                                <a class="dropdown-item" href="javascript:void(0);">D</a>
                              </div>
                            </div>
                          </div>
                          <?php
                          // the member id ;;
                          $cidd = $db->query("SELECT COUNT(*) AS num_rows from cells");

                          $cells = $cidd->fetch(PDO::FETCH_ASSOC);

                          $no_cells = $cells['num_rows'];
                          

                          // average members percels

                          $average = ceil($assigned/$no_cells);

                          ?>
                          <p class="mb-0">No of Cells</p>
                          <h5 class="card-title mb-3"><?= $no_cells;?> Cells</h5>
                          <small class="text-success fw-medium"
                            ><i class="icon-base bx bx-info-circle"></i>An average of <?= $average?> Members per cell</small
                          >
                          </div>
                        </div>
                      </div>
                    
                    
                    
                  </div>
                </div>
              </div>
                
              
            
            <div class="col-12 col-xxl-8 order-2 order-md-3 order-xxl-2 mb-6 total-revenue">
                <div class="card">
                    <div class="card-header border-bottom">
                        <h5 class="card-title mb-0">Filters -- Unassigned Members</h5>
                        <div class="d-flex justify-content-between align-items-center row pt-4 gap-md-0 g-6">
                            <div class="col-md-4 user_role"></div>
                            <div class="col-md-4 user_plan"></div>
                            <div class="col-md-4 user_status"></div>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table  table-stripped table-bordered" id="unassignedTable">
                            <thead>
                                <tr>
                                    
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Invited By</th>
                                    <th>Phone No</th>
                                    <th>Meeting</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                try {

                                    $stmt = $db->prepare("SELECT id, first_name, last_name,phone_no, location, department FROM member WHERE cell_id IS NULL");
                                    $stmt->execute();;
                                    $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                } catch (PDOException $e) {
                                    die("Database error: " . $e->getMessage());
                                }
                                $cnt=1;
                                if (!empty($attendance)): ?>
                                <?php foreach ($attendance as $index => $row):
                                $department = $row['department'];
                                $name = $row['first_name']." ".$row['last_name'];
                                $contact = $row['phone_no'];
                                $meeting_id = $row['location'];
                                
                                //$status = $row['status'];date("M d, Y h:i a",strtotime($date));
                                ?>
                                <tr>
                                    <td> <?php echo $cnt;?></td>
                                    <td><?php echo htmlspecialchars($name);?></td>
                                    
                                    <td><?php echo htmlspecialchars($department);?></td>
                                    <td><?php echo htmlspecialchars($contact);
                                    //echo htmlspecialchars(date("M d, Y h:i a",strtotime($last_login)));?></td>
                                    <td><?php echo htmlspecialchars($meeting_id);?></td>
                                    <?php $cnt+=1; endforeach; endif;?>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                
                </div>
            </div>
            <div class="col-12 col-xxl-8 order-2 order-md-3 order-xxl-2 mb-6 total-revenue">
                <div class="card">
                    <div class="card-header border-bottom">
                        <h5 class="card-title mb-0">Filters -- Assigned Members</h5>
                        <div class="d-flex justify-content-between align-items-center row pt-4 gap-md-0 g-6">
                            <div class="col-md-4 user_role"></div>
                            <div class="col-md-4 user_plan"></div>
                            <div class="col-md-4 user_status"></div>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table  table-stripped table-bordered" id="assignedTable">
                            <thead>
                                <tr>
                                    
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Invited By</th>
                                    <th>Phone No</th>
                                    <th>Meeting</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                try {

                                    $stmt = $db->prepare("SELECT id, first_name, last_name,phone_no, location, department FROM member WHERE cell_id IS NOT NULL");
                                    $stmt->execute();;
                                    $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                } catch (PDOException $e) {
                                    die("Database error: " . $e->getMessage());
                                }
                                $cnt=1;
                                if (!empty($attendance)): ?>
                                <?php foreach ($attendance as $index => $row):
                                $department = $row['department'];
                                $name = $row['first_name']." ".$row['last_name'];
                                $contact = $row['phone_no'];
                                $meeting_id = $row['location'];
                                
                                //$status = $row['status'];date("M d, Y h:i a",strtotime($date));
                                ?>
                                <tr>
                                    <td> <?php echo $cnt;?></td>
                                    <td><?php echo htmlspecialchars($name);?></td>
                                    
                                    <td><?php echo htmlspecialchars($department);?></td>
                                    <td><?php echo htmlspecialchars($contact);
                                    //echo htmlspecialchars(date("M d, Y h:i a",strtotime($last_login)));?></td>
                                    <td><?php echo htmlspecialchars($meeting_id);?></td>
                                    <?php $cnt+=1; endforeach; endif;?>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                
                </div>
            </div>
               
                <!--/ Total Revenue -->
                <div class="col-12 col-md-8 col-lg-12 col-xxl-4 order-3 order-md-2 profile-report">
                  <div class="row">
                    <div class="col-md-4 col-sm-12 mb-6 payments">
                      <div class="card h-100">
                        <div class="card-body">
                          <div class="card-title d-flex align-items-start justify-content-between mb-4">
                            <div class="avatar flex-shrink-0">
                              <img src="../assets/img/icons/unicons/cc-primary.png" alt="paypal" class="rounded" />
                            </div>
                            <div class="dropdown">
                              <button
                                class="btn p-0"
                                type="button"
                                id="cardOpt4"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false">
                                <i class="icon-base bx bx-dots-vertical-rounded text-body-secondary"></i>
                              </button>
                              <div class="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt4">
                                <a class="dropdown-item" href="javascript:void(0);">View More</a>
                                <a class="dropdown-item" href="javascript:void(0);">Delete</a>
                              </div>
                            </div>
                          </div>
                          <p class="mb-1">Souls Won</p>
                          <h4 class="card-title mb-3">20 Souls</h4>
                          <small class="text-success fw-medium"
                            ><i class="icon-base bx bx-down-arrow-alt"></i> Last 30 Days</small
                          >
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4 col-sm-12 mb-6 payments">
                      <div class="card h-100">
                        <div class="card-body">
                          <div class="card-title d-flex align-items-start justify-content-between mb-4">
                            <div class="avatar flex-shrink-0">
                              <img src="../assets/img/icons/unicons/cc-primary.png" alt="paypal" class="rounded" />
                            </div>
                            <div class="dropdown">
                              <button
                                class="btn p-0"
                                type="button"
                                id="cardOpt4"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false">
                                <i class="icon-base bx bx-dots-vertical-rounded text-body-secondary"></i>
                              </button>
                              <div class="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt4">
                                <a class="dropdown-item" href="javascript:void(0);">View More</a>
                                <a class="dropdown-item" href="javascript:void(0);">Delete</a>
                              </div>
                            </div>
                          </div>
                          <p class="mb-1">Members Invited By Me</p>
                          <?php 
                          $count = "SELECT COUNT(*) as num_rows FROM member WHERE department LIKE :fname OR department LIKE :lname";
                          
                          $do = $db->prepare($count);
                          $do->bindParam(':fname',$fname,PDO::PARAM_STR);
                          $do->bindParam(':lname',$lname,PDO::PARAM_STR);
                          $do->execute();
                          $result = $do->fetch(PDO::FETCH_ASSOC);

                          $rows = $result['num_rows'];
                          ?>
                          <h4 class="card-title mb-3"><?= $rows; ?> Members</h4>
                          <small class="text-success fw-medium"
                            ><i class="icon-base bx bx-down-arrow-alt"></i> Last 30 Days</small
                          >
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4 col-sm-12 mb-6 transactions">
                      <div class="card h-100">
                        <div class="card-body">
                          <div class="card-title d-flex align-items-start justify-content-between mb-4">
                            <div class="avatar flex-shrink-0">
                              <img src="../assets/img/icons/unicons/cc-primary.png" alt="Credit Card" class="rounded" />
                            </div>
                            <div class="dropdown">
                              <button
                                class="btn p-0"
                                type="button"
                                id="cardOpt1"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false">
                                <i class="icon-base bx bx-dots-vertical-rounded text-body-secondary"></i>
                              </button>
                              <div class="dropdown-menu" aria-labelledby="cardOpt1">
                                <a class="dropdown-item" href="javascript:void(0);">View More</a>
                                <a class="dropdown-item" href="javascript:void(0);">Delete</a>
                              </div>
                            </div>
                          </div>
                          <p class="mb-1">Upcoming Outreaches</p>
                          <h4 class="card-title mb-3">3 Outreaches</h4>
                          <small class="text-success fw-medium"
                            ><i class="icon-base bx bx-up-arrow-alt"></i> In the next 4months</small
                          >
                        </div>
                      </div>
                    </div>
                    <!--Total Attendance -->
                <?php if(userHasPermission($db,$user_id,'meeting_analysis')){?>
                    <div class="col-12 mb-6 profile-report">
                      <div class="card h-100">
                        <div class="card-body">
                          <div
                            class="d-flex justify-content-between align-items-center flex-sm-row flex-column gap-10 flex-wrap">
                            <div class="d-flex flex-sm-column flex-row align-items-start justify-content-between">
                              <div class="card-title mb-6">
                                <h5 class="text-nowrap mb-1">Profile Report</h5>
                                <span class="badge bg-label-warning">YEAR 2022</span>
                              </div>
                              <div class="mt-sm-auto">
                                <span class="text-success text-nowrap fw-medium"
                                  ><i class="icon-base bx bx-up-arrow-alt"></i> 68.2%</span
                                >
                                <h4 class="mb-0">$84,686k</h4>
                              </div>
                            </div>
                            <div id="profileReportChart"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  <?php }?>
                  </div>
                </div>
              </div>
              <?php if(userHasPermission($db,$user_id,'meeting_analysis')){?>
              <div class="row">
                <!-- Order Statistics -->
                <div class="col-md-6 col-lg-4 col-xl-4 order-0 mb-6">
                  <div class="card h-100">
                    <div class="card-header d-flex justify-content-between">
                      <div class="card-title mb-0">
                        <h5 class="mb-1 me-2">Order Statistics</h5>
                        <p class="card-subtitle">42.82k Total Sales</p>
                      </div>
                      <div class="dropdown">
                        <button
                          class="btn text-body-secondary p-0"
                          type="button"
                          id="orederStatistics"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false">
                          <i class="icon-base bx bx-dots-vertical-rounded icon-lg"></i>
                        </button>
                        <div class="dropdown-menu dropdown-menu-end" aria-labelledby="orederStatistics">
                          <a class="dropdown-item" href="javascript:void(0);">Select All</a>
                          <a class="dropdown-item" href="javascript:void(0);">Refresh</a>
                          <a class="dropdown-item" href="javascript:void(0);">Share</a>
                        </div>
                      </div>
                    </div>
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-center mb-6">
                        <div class="d-flex flex-column align-items-center gap-1">
                          <h3 class="mb-1">8,258</h3>
                          <small>Total Orders</small>
                        </div>
                        <div id="orderStatisticsChart"></div>
                      </div>
                      <ul class="p-0 m-0">
                        <li class="d-flex align-items-center mb-5">
                          <div class="avatar flex-shrink-0 me-3">
                            <span class="avatar-initial rounded bg-label-primary"
                              ><i class="icon-base bx bx-mobile-alt"></i
                            ></span>
                          </div>
                          <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                            <div class="me-2">
                              <h6 class="mb-0">Electronic</h6>
                              <small>Mobile, Earbuds, TV</small>
                            </div>
                            <div class="user-progress">
                              <h6 class="mb-0">82.5k</h6>
                            </div>
                          </div>
                        </li>
                        <li class="d-flex align-items-center mb-5">
                          <div class="avatar flex-shrink-0 me-3">
                            <span class="avatar-initial rounded bg-label-success"
                              ><i class="icon-base bx bx-closet"></i
                            ></span>
                          </div>
                          <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                            <div class="me-2">
                              <h6 class="mb-0">Fashion</h6>
                              <small>T-shirt, Jeans, Shoes</small>
                            </div>
                            <div class="user-progress">
                              <h6 class="mb-0">23.8k</h6>
                            </div>
                          </div>
                        </li>
                        <li class="d-flex align-items-center mb-5">
                          <div class="avatar flex-shrink-0 me-3">
                            <span class="avatar-initial rounded bg-label-info"
                              ><i class="icon-base bx bx-home-alt"></i
                            ></span>
                          </div>
                          <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                            <div class="me-2">
                              <h6 class="mb-0">Decor</h6>
                              <small>Fine Art, Dining</small>
                            </div>
                            <div class="user-progress">
                              <h6 class="mb-0">849k</h6>
                            </div>
                          </div>
                        </li>
                        <li class="d-flex align-items-center">
                          <div class="avatar flex-shrink-0 me-3">
                            <span class="avatar-initial rounded bg-label-secondary"
                              ><i class="icon-base bx bx-football"></i
                            ></span>
                          </div>
                          <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                            <div class="me-2">
                              <h6 class="mb-0">Sports</h6>
                              <small>Football, Cricket Kit</small>
                            </div>
                            <div class="user-progress">
                              <h6 class="mb-0">99</h6>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <!--/ Order Statistics -->

                <!-- Expense Overview -->
                <div class="col-md-6 col-lg-4 order-1 mb-6">
                  <div class="card h-100">
                    <div class="card-header nav-align-top">
                      <ul class="nav nav-pills flex-wrap row-gap-2" role="tablist">
                        <li class="nav-item">
                          <button
                            type="button"
                            class="nav-link active"
                            role="tab"
                            data-bs-toggle="tab"
                            data-bs-target="#navs-tabs-line-card-income"
                            aria-controls="navs-tabs-line-card-income"
                            aria-selected="true">
                            Income
                          </button>
                        </li>
                        <li class="nav-item">
                          <button type="button" class="nav-link" role="tab">Expenses</button>
                        </li>
                        <li class="nav-item">
                          <button type="button" class="nav-link" role="tab">Profit</button>
                        </li>
                      </ul>
                    </div>
                    <div class="card-body">
                      <div class="tab-content p-0">
                        <div class="tab-pane fade show active" id="navs-tabs-line-card-income" role="tabpanel">
                          <div class="d-flex mb-6">
                            <div class="avatar flex-shrink-0 me-3">
                              <img src="../assets/img/icons/unicons/wallet.png" alt="User" />
                            </div>
                            <div>
                              <p class="mb-0">Total Balance</p>
                              <div class="d-flex align-items-center">
                                <h6 class="mb-0 me-1">$459.10</h6>
                                <small class="text-success fw-medium">
                                  <i class="icon-base bx bx-chevron-up icon-lg"></i>
                                  42.9%
                                </small>
                              </div>
                            </div>
                          </div>
                          <div id="incomeChart"></div>
                          <div class="d-flex align-items-center justify-content-center mt-6 gap-3">
                            <div class="flex-shrink-0">
                              <div id="expensesOfWeek"></div>
                            </div>
                            <div>
                              <h6 class="mb-0">Income this week</h6>
                              <small>$39k less than last week</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!--/ Expense Overview -->

                <!-- Transactions -->
                <div class="col-md-6 col-lg-4 order-2 mb-6">
                  <div class="card h-100">
                    <div class="card-header d-flex align-items-center justify-content-between">
                      <h5 class="card-title m-0 me-2">Transactions</h5>
                      <div class="dropdown">
                        <button
                          class="btn text-body-secondary p-0"
                          type="button"
                          id="transactionID"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false">
                          <i class="icon-base bx bx-dots-vertical-rounded icon-lg"></i>
                        </button>
                        <div class="dropdown-menu dropdown-menu-end" aria-labelledby="transactionID">
                          <a class="dropdown-item" href="javascript:void(0);">Last 28 Days</a>
                          <a class="dropdown-item" href="javascript:void(0);">Last Month</a>
                          <a class="dropdown-item" href="javascript:void(0);">Last Year</a>
                        </div>
                      </div>
                    </div>
                    <div class="card-body pt-4">
                      <ul class="p-0 m-0">
                        <li class="d-flex align-items-center mb-6">
                          <div class="avatar flex-shrink-0 me-3">
                            <img src="../assets/img/icons/unicons/paypal.png" alt="User" class="rounded" />
                          </div>
                          <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                            <div class="me-2">
                              <small class="d-block">Paypal</small>
                              <h6 class="fw-normal mb-0">Send money</h6>
                            </div>
                            <div class="user-progress d-flex align-items-center gap-2">
                              <h6 class="fw-normal mb-0">+82.6</h6>
                              <span class="text-body-secondary">USD</span>
                            </div>
                          </div>
                        </li>
                        <li class="d-flex align-items-center mb-6">
                          <div class="avatar flex-shrink-0 me-3">
                            <img src="../assets/img/icons/unicons/wallet.png" alt="User" class="rounded" />
                          </div>
                          <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                            <div class="me-2">
                              <small class="d-block">Wallet</small>
                              <h6 class="fw-normal mb-0">Mac'D</h6>
                            </div>
                            <div class="user-progress d-flex align-items-center gap-2">
                              <h6 class="fw-normal mb-0">+270.69</h6>
                              <span class="text-body-secondary">USD</span>
                            </div>
                          </div>
                        </li>
                        <li class="d-flex align-items-center mb-6">
                          <div class="avatar flex-shrink-0 me-3">
                            <img src="../assets/img/icons/unicons/chart.png" alt="User" class="rounded" />
                          </div>
                          <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                            <div class="me-2">
                              <small class="d-block">Transfer</small>
                              <h6 class="fw-normal mb-0">Refund</h6>
                            </div>
                            <div class="user-progress d-flex align-items-center gap-2">
                              <h6 class="fw-normal mb-0">+637.91</h6>
                              <span class="text-body-secondary">USD</span>
                            </div>
                          </div>
                        </li>
                        <li class="d-flex align-items-center mb-6">
                          <div class="avatar flex-shrink-0 me-3">
                            <img src="../assets/img/icons/unicons/cc-primary.png" alt="User" class="rounded" />
                          </div>
                          <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                            <div class="me-2">
                              <small class="d-block">Credit Card</small>
                              <h6 class="fw-normal mb-0">Ordered Food</h6>
                            </div>
                            <div class="user-progress d-flex align-items-center gap-2">
                              <h6 class="fw-normal mb-0">-838.71</h6>
                              <span class="text-body-secondary">USD</span>
                            </div>
                          </div>
                        </li>
                        <li class="d-flex align-items-center mb-6">
                          <div class="avatar flex-shrink-0 me-3">
                            <img src="../assets/img/icons/unicons/wallet.png" alt="User" class="rounded" />
                          </div>
                          <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                            <div class="me-2">
                              <small class="d-block">Wallet</small>
                              <h6 class="fw-normal mb-0">Starbucks</h6>
                            </div>
                            <div class="user-progress d-flex align-items-center gap-2">
                              <h6 class="fw-normal mb-0">+203.33</h6>
                              <span class="text-body-secondary">USD</span>
                            </div>
                          </div>
                        </li>
                        <li class="d-flex align-items-center">
                          <div class="avatar flex-shrink-0 me-3">
                            <img src="../assets/img/icons/unicons/cc-warning.png" alt="User" class="rounded" />
                          </div>
                          <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                            <div class="me-2">
                              <small class="d-block">Mastercard</small>
                              <h6 class="fw-normal mb-0">Ordered Food</h6>
                            </div>
                            <div class="user-progress d-flex align-items-center gap-2">
                              <h6 class="fw-normal mb-0">-92.45</h6>
                              <span class="text-body-secondary">USD</span>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <!--/ Transactions -->
              </div>
              <?php }?>
            </div>
            <!-- / Content -->

            <!-- Footer -->
            <?php @include('includes/footer.php');?>
            <!-- / Footer -->

            
          <!-- Content wrapper -->
        </div>
        <!-- / Layout page -->
      </div>

      <!-- Overlay -->
      <div class="layout-overlay layout-menu-toggle"></div>
    </div>
    <!-- / Layout wrapper -->

    

    <!-- Core JS -->
    <?php include("includes/scripts.html");?>
    <script>
  $(document).ready(function() {
    $('#unassignedTable').DataTable({
      "paging": true,  // Enables pagination
      "searching": true,  // Enables search bar
      "ordering": true,  // Enables sorting
      "info": true,  // Shows info text
      "lengthChange": true // Enables page length change
    });
    $('#assignedTable').DataTable({
      "paging": true,  // Enables pagination
      "searching": true,  // Enables search bar
      "ordering": true,  // Enables sorting
      "info": true,  // Shows info text
      "lengthChange": true // Enables page length change
    });
  });
</script>
    <!-- Page JS -->
    <script src="../assets/js/dashboards-analytics.js"></script>

    <!-- Place this tag before closing body tag for github widget button. -->
    </body>
</html>
<!-- 
    ?>
    <script>
         Swal.fire({
        title: 'You do not have permissions here',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Go Back',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.isConfirmed) {
            // Redirect to logout script
            window.history.back();
        }
    });
    </script>
   
?> -->


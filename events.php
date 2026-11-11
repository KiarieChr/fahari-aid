
<?php
include('includes/checklogin.php');

$title = "Events | Jesus Enthroned Events";
include("includes/get_user.php");
$today = date('Y-m-d');
// get the upcoming event
$stmt = $db->prepare("SELECT *FROM event where start_date >= :today order by start_date asc");
$stmt->execute([':today'=>$today]);

$event = $stmt->fetch(PDO::FETCH_ASSOC);


?>
<!doctype html>

<html
  lang="en"
  class=" layout-navbar-fixed layout-menu-fixed layout-compact "
  dir="ltr"
  data-skin="default"
  data-assets-path="assets/"
  data-template="vertical-menu-template"
  data-bs-theme="light">
  <?php @include('includes/header.php');?>
  <style>
    .nav-tabs-custom {
      border-bottom: none;
      background: #f8f9fa;
      padding: 10px;
      border-radius: 15px;
      box-shadow: inset 0 2px 5px rgba(0,0,0,0.02);
    }
    .nav-tabs-custom .nav-item {
      margin-right: 10px;
    }
    .nav-tabs-custom .nav-link {
      border: none;
      color: #6b7280;
      font-weight: 600;
      padding: 12px 25px;
      border-radius: 12px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nav-tabs-custom .nav-link:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
    .nav-tabs-custom .nav-link.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .hero-event-card {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      border-radius: 20px;
      padding: 30px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 15px 30px rgba(30, 60, 114, 0.2);
      border: none;
    }
    .hero-event-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 300px;
      height: 300px;
      background: rgba(255,255,255,0.05);
      border-radius: 50%;
    }
    .hero-countdown {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      text-align: center;
      margin-top: 20px;
    }

    .empty-state-card {
      background: white;
      border-radius: 20px;
      padding: 50px 20px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      border: 2px dashed #e2e8f0;
    }
    .empty-state-icon {
      font-size: 4rem;
      color: #cbd5e0;
      margin-bottom: 20px;
    }

    /* Rest of original stats styles */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 25px;
    }
    .stat-card {
        background: white;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        position: relative;
        overflow: hidden;
    }
    .stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
    }
    .stat-card:nth-child(1)::before { background: linear-gradient(90deg, #667eea, #764ba2); }
    .stat-card:nth-child(2)::before { background: linear-gradient(90deg, #f093fb, #f5576c); }
    .stat-card:nth-child(3)::before { background: linear-gradient(90deg, #4facfe, #00f2fe); }
    .stat-card:nth-child(4)::before { background: linear-gradient(90deg, #43e97b, #38f9d7); }
    .stat-icon {
        font-size: 2.5rem;
        margin-bottom: 15px;
        opacity: 0.2;
    }
    .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #2d3748;
        margin-bottom: 5px;
    }
    .stat-label {
        color: #718096;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 0.85rem;
    }
    .chart-card {
        background: white;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        overflow: hidden;
    }
    .chart-header {
        background: linear-gradient(135deg, #f7fafc, #edf2f7);
        padding: 20px;
        border-bottom: 1px solid #e2e8f0;
    }
    .chart-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #2d3748;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .chart-body {
        padding: 20px;
    }
    .loading {
        text-align: center;
        padding: 60px 20px;
        color: #718096;
    }
    .loading i {
        font-size: 3rem;
        animation: spin 1s linear infinite;
        color: #667eea;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .full-width {
        grid-column: 1 / -1;
    }
    @media (max-width: 768px) {
        .charts-grid {
            grid-template-columns: 1fr;
        }
    }
  </style>

  <body>


        <!-- Layout wrapper -->
    <div class="layout-wrapper layout-content-navbar  ">
    <div class="layout-container">




    <!-- Menu -->
    <?php
          @include('includes/sidebar.php');
          ?>
        <!-- / Menu -->



    <div class="menu-mobile-toggler d-xl-none rounded-1">
      <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large text-bg-secondary p-2 rounded-1">
        <i class="bx bx-menu icon-base"></i>
        <i class="bx bx-chevron-right icon-base"></i>
      </a>
    </div>
    <!-- / Menu -->



    <!-- Layout container -->
    <div class="layout-page">
        <?php
          @include('includes/nav.php');
          @include('modals/meeting-m.php');
          ?>



      <!-- Content wrapper -->
      <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">

            <div class=" mb-3">
                <div class="">
                  <div class="row m-2">
                    <div class="col-md-12 col-sm-6">
                      <div class="nav-align-top mb-4">
                        <ul class="nav nav-tabs-custom flex-column flex-sm-row mb-0 gap-2">
                          <li class="nav-item">
                            <a href="#events" class="nav-link active" data-bs-target="#events" data-bs-toggle='tab' role='tab'>
                              <i class="bx bx-calendar-event"></i> Dashboard
                            </a>
                          </li>
                          <li class="nav-item">
                            <a href="#statistics" class="nav-link" data-bs-target="#statistics" data-bs-toggle='tab' role='tab'>
                              <i class="bx bx-bar-chart-alt-2"></i> Global Statistics
                            </a>
                          </li>
                          <li class="nav-item">
                            <a href="#mobilisation" class="nav-link" data-bs-target="#mobilisation" data-bs-toggle='tab' role='tab'>
                              <i class="bx bx-group"></i> Mobilisation <span class="badge bg-label-warning ms-2">Coming Soon</span>
                            </a>
                          </li>
                          <li class="nav-item">
                            <a href="#all" class="nav-link" data-bs-target="#all" data-bs-toggle='tab' role='tab'>
                              <i class="bx bx-list-ul"></i> All Events
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            <!-- Tab content -->
            <div class="tab-content p-0 bg-transparent mt-1 border-0 shadow-none">
              <div class="tab-pane fade show active" id="events">
                  <div class="row">
                    <div class="col-md-12 col-lg-<?= !empty($event) ? '5' : '12' ?> mb-4">
                      <?php if(!empty($event)){ $start_date = $event['start_date']; ?>
                        <div class="card hero-event-card">
                          <div class="d-flex justify-content-between align-items-center mb-3" style="position:relative; z-index:2;">
                            <span class="badge bg-white text-primary rounded-pill px-3 py-2 fw-bold">Next Event</span>
                            <div class="dropdown">
                              <button class="btn btn-sm btn-icon text-white dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="bx bx-dots-vertical-rounded"></i></button>
                              <div class="dropdown-menu dropdown-menu-end">
                                <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#editMeeting-<?=$event['id'];?>"><i class="bx bx-edit me-1"></i> Edit</a>
                                <a class="dropdown-item" href="event_registration.php?event_id=<?=$event['id'];?>"><i class="bx bx-group me-1"></i> Attendees</a>
                                <a class="dropdown-item text-danger" href="javascript:void(0);"><i class="bx bx-calendar-x me-1"></i> Postpone</a>
                              </div>
                            </div>
                          </div>

                          <h3 class="text-white fw-bold mb-1" style="position:relative; z-index:2;"><?= htmlspecialchars($event['ename']);?></h3>
                          <p class="text-white-50 mb-0" style="position:relative; z-index:2;">
                            <i class="bx bx-time me-1"></i> <?= date('l, jS F Y', strtotime($start_date));?>
                          </p>

                          <div class="hero-countdown" style="position:relative; z-index:2;">
                            <h6 class="text-white-50 text-uppercase letter-spacing-1 mb-2" style="font-size:0.75rem;">Time Remaining</h6>
                            <div class="days-togo" id="days-togo" style="font-size:2rem; font-weight:800;">
                                <!-- JS fills this -->
                            </div>
                          </div>

                          <div class="mt-4 d-flex gap-2" style="position:relative; z-index:2;">
                             <a href="event_registration.php?event_id=<?=$event['id'];?>" class="btn btn-light rounded-pill flex-grow-1 text-primary fw-bold">
                               View Attendees
                             </a>
                             <a href="event_form.php?event_id=<?=$event['id'];?>" target="_blank" class="btn btn-outline-light rounded-pill px-3">
                               <i class="bx bx-link-external"></i>
                             </a>
                          </div>
                        </div>
                      <?php } else { ?>
                        <div class="empty-state-card h-100 d-flex flex-column justify-content-center">
                          <i class="bx bx-calendar-event empty-state-icon"></i>
                          <h4 class="fw-bold mb-2">No Upcoming Events</h4>
                          <p class="text-muted mb-4">There are currently no events on the horizon. Ready to plan the next big gathering?</p>
                          <div>
                            <button type="button" class="btn btn-primary rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#newEvent">
                              <i class="bx bx-plus me-1"></i> Create New Event
                            </button>
                          </div>
                        </div>
                      <?php } ?>
                    </div>
                    
                    <?php if(!empty($event)){ ?>
                    <div class="col-md-6 col-lg-3 mb-4">
                        <div class="card h-100 shadow-sm border-0" style="border-radius:20px;">
                          <div class="card-body">
                            <h6 class="text-muted text-uppercase mb-3" style="font-size:0.8rem; font-weight:700;">Registration Target</h6>
                            <div class="chart" id="upcoming-statistics-chart"></div>
                          </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4 mb-4">
                      <div class="card h-100 shadow-sm border-0" style="border-radius:20px;">
                        <div class="card-body">
                          <h6 class="text-muted text-uppercase mb-3" style="font-size:0.8rem; font-weight:700;">Financial Overview</h6>
                          <div class="chart" id="financialStats"></div>
                        </div>
                      </div>
                    </div>
                    <?php } ?>
                  </div>
              </div>
              <div class="tab-pane fade" id="mobilisation">
                  <!-- Mobilisation dashboard that is used for the events -->
                  <div class="empty-state-card h-100 d-flex flex-column justify-content-center mt-4">
                    <i class="bx bx-group empty-state-icon"></i>
                    <h4 class="fw-bold mb-2">Mobilisation Engine</h4>
                    <p class="text-muted mb-0">This feature is currently under development. Soon you'll be able to track event invitations, follow-ups, and volunteer mobilization!</p>
                  </div>
              </div>
              <div class="tab-pane fade" id="statistics">
                  <div class="stats-grid mt-4" id="statsGrid">
                      <div class="stat-card">
                          <div class="stat-icon"><i class="fas fa-users"></i></div>
                          <div class="stat-value" id="totalRegistrations">-</div>
                          <div class="stat-label">Total Registrations</div>
                      </div>
                      <div class="stat-card">
                          <div class="stat-icon"><i class="fas fa-calendar"></i></div>
                          <div class="stat-value" id="totalEvents">-</div>
                          <div class="stat-label">Active Events</div>
                      </div>
                      <div class="stat-card">
                          <div class="stat-icon"><i class="fas fa-venus-mars"></i></div>
                          <div class="stat-value" id="genderRatio">-</div>
                          <div class="stat-label">Male/Female Ratio</div>
                      </div>
                      <div class="stat-card">
                          <div class="stat-icon"><i class="fas fa-hands-helping"></i></div>
                          <div class="stat-value" id="servingCount">-</div>
                          <div class="stat-label">Willing to Serve</div>
                      </div>
                  </div>
                  <div class="charts-grid">
                    <!-- Registrations per Event -->
                    <div class="chart-card full-width mb-4">
                        <div class="chart-header">
                            <div class="chart-title">
                                <i class="fas fa-chart-bar"></i>
                                Registrations per Event
                            </div>
                        </div>
                        <div class="chart-body">
                            <div id="registrationsPerEventChart" class="loading">
                                <i class="fas fa-spinner"></i>
                                <p>Loading chart data...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Gender Distribution -->
                    <div class="chart-card mb-4">
                        <div class="chart-header">
                            <div class="chart-title">
                                <i class="fas fa-venus-mars"></i>
                                Gender Distribution
                            </div>
                        </div>
                        <div class="chart-body">
                            <div id="genderDistributionChart" class="loading">
                                <i class="fas fa-spinner"></i>
                                <p>Loading chart data...</p>
                            </div>
                        </div>
                    </div>

                  <!-- Category Distribution -->
                  <div class="chart-card mb-3">
                      <div class="chart-header">
                          <div class="chart-title">
                              <i class="fas fa-users-cog"></i>
                              Category Distribution
                          </div>
                      </div>
                      <div class="chart-body">
                          <div id="categoryDistributionChart" class="loading">
                              <i class="fas fa-spinner"></i>
                          </div>
                      </div>
                  </div>

                  <!-- Registration Timeline -->
                  <div class="chart-card full-width mb-3">
                      <div class="chart-header">
                          <div class="chart-title">
                              <i class="fas fa-chart-line"></i>
                              Registration Timeline
                          </div>
                      </div>
                      <div class="chart-body">
                          <div id="registrationTimelineChart" class="loading">
                              <i class="fas fa-spinner"></i>
                          </div>
                      </div>
                  </div>

                  <!-- Top Locations -->
                  <div class="chart-card mb-3">
                      <div class="chart-header">
                          <div class="chart-title">
                              <i class="fas fa-map-marker-alt"></i>
                              Top Registration Locations
                          </div>
                      </div>
                      <div class="chart-body">
                          <div id="topLocationsChart" class="loading">
                              <i class="fas fa-spinner"></i>
                          </div>
                      </div>
                  </div>

                  <!-- Sponsorship Distribution -->
                  <div class="chart-card mb-3">
                      <div class="chart-header">
                          <div class="chart-title">
                              <i class="fas fa-hand-holding-usd"></i>
                              Sponsorship Status
                          </div>
                      </div>
                      <div class="chart-body">
                          <div id="sponsorshipChart" class="loading">
                              <i class="fas fa-spinner"></i>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
            <div class="tab-pane fade" id="all">
              <div class="row">

              </div>
                  <div class="col-md-12 col-sm-12 col-lg-12">
                      <div class="card shadow-sm border-0" style="border-radius:20px;">
                          <div class="card-header border-bottom">
                              <div class="demo-inline-spacing">
                                  <button
                                    type="button"
                                    class="btn btn-outline-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#newEvent">
                                    New Event
                                  </button>
                                </div>
                          </div>
                          <div class="card-datatable table-responsive">
                              <table class="datatables-users table table-striped border-top" id="usersTable">
                                  <thead>
                                  <tr>

                                      <th>Name</th>
                                      <th>Facilitator</th>
                                      <th>Meeting Schedule</th>
                                      <th>Action</th>
                                  </tr>
                                  </thead>
                                  <tbody>
                                  <?php
                                  try {
                                      $stmt = $db->query("SELECT * from event order by id");
                                      $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                  } catch (PDOException $e) {
                                      die("Database error: " . $e->getMessage());
                                  }

                                  if (!empty($events)): ?>
                              <?php foreach ($events as $index => $row):
                                    $name = $row['ename'];
                                    $event_id = $row['id'];
                                    $notes = $row['notes'];
                                    $stime = $row['start_date'];
                                    $etime = $row['end_date'];
                                    //$status = $row['status'];date("M d, Y h:i a",strtotime($date));
                                  ?>
                                  <tr>
                                      <td><?php echo htmlspecialchars($name);?></td>
                                      <td><?php echo htmlspecialchars($notes)?></td>
                                      <td><?php echo htmlspecialchars(date("M d, Y h:i a",strtotime($stime)))."-".htmlspecialchars(date("M d, Y h:i a",strtotime($etime)));?></td>
                                      <td>
                                        <div class="dropdown">
                                          <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="icon-base bx bx-cog me-1"></i>
                                          <i class="icon-base bx bx-dots-vertical-rounded"></i>
                                          </button>
                                          <div class="dropdown-menu">
                                              <?php if (userHasPermission($db,$user_id,'view_meeting')){?>
                                              <a href="event_form_setting.php?event_id=<?php echo $event_id;?>" class="dropdown-item"><i class="icon-base bx bx-note me-1"></i>Form Settings</a>
                                              <?php }
                                              if(userHasPermission($db,$user_id,'view_meeting')){
                                              ?>

                                              <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#editMeeting-<?=$event_id;?>"
                                                ><i class="icon-base bx bx-edit me-1"></i> Edit</a>
                                              <?php

                                              }?>
                                              <?php if(userHasPermission($db,$user_id,'edit_meeting')){
                                                ?>
                                              <a class="dropdown-item" href="event_form.php?event_id=<?php echo $event_id;?>"
                                                ><i class="icon-base bx bx-copy me-1"></i>Registration Link</a>
                                              <?php

                                              }?>

                                              <?php if(userHasPermission($db,$user_id,'edit_meeting')){
                                                ?>
                                              <a class="dropdown-item" href="event_registration.php?event_id=<?php echo $event_id;?>"
                                                ><i class="icon-base bx bx-copy me-1"></i>Registered Members</a>
                                              <?php }?>

                                              <a class="dropdown-item" href=""
                                                ><i class="icon-base bx bx-book-open me-1"></i>Meeting Minutes</a
                                              >
                                          </div>
                                        </div>
                                    </td>

                                  </tr>
                                  <?php endforeach; endif;?>
                                  </tbody>
                              </table>
                          </div>
                      </div>
                    </div>

              </div>

             </div>



        </div>
        <!-- / Content -->




                    <!-- Footer -->
                      <?php include 'includes/footer.php';?>
                    <!-- / Footer -->


        <div class="content-backdrop fade"></div>
      </div>
      <!-- Content wrapper -->
    </div>
    <!-- / Layout page -->
  </div>






  <!-- Drag Target Area To SlideIn Menu On Small Screens -->
  <div class="drag-target"></div>

</div>
<!-- / Layout wrapper -->





    <!-- Script JS -->
    <?php include('includes/scripts.html');?>
    <!-- Page js here -->



    <!-- Page JS -->

    <script>
  $(document).ready(function() {
    $('#usersTable').DataTable({
      "paging": true,  // Enables pagination
      "searching": true,  // Enables search bar
      "ordering": true,  // Enables sorting
      "info": true,  // Shows info text
      "lengthChange": true // Enables page length change
    });
    $('#catTable').DataTable({
      "paging": true,  // Enables pagination
      "searching": true,  // Enables search bar
      "ordering": true,  // Enables sorting
      "info": true,  // Shows info text
      "lengthChange": true // Enables page length change
    });
    async function loadEventStats()
    {
        const response = await fetch('api/get_upcoming_stats.php');
        const data = await response.json();
        const upcomingStats = document.getElementById('upcoming-statistics-chart');



        if(!data.success){
          upcomingStats.innerHTML= '<p> Error Loading chart data. </p>';
          return;
        }
        // prepare the chart data
        const events = data.events.map(event=>({
          name: event.ename,
          target: parseInt(event.target_attendees),
          registered: parseInt(event.total_registrations),
          invited: parseInt(event.total_invitees)
        }));
        const labels = events.map(e=>e.name);
        const targets = events.map(e=>e.target);
        const registered = events.map(e=> e.registered);
        const invited = events.map(e=> e.invited);

        // show registered, invited as portin of the invited
        const totalTarget = targets.reduce((a,b)=> a+b, 0);
        const totalRegistered = registered.reduce((a,b)=> a+b, 0);
        const totalInvited = invited.reduce((a,b)=> a+b, 0);

        // chart options
        const options = {
          chart: {
            type: 'pie',
            height: 200,
            toolbar: {show:false},
            sparkline: {enabled: true}
          },
          markers:{
            size: 4,
            colors: 'transparent',
            strokeColors: 'transparent',
            strokeWidth: 3,

          },
          labels:['Target Attendees', 'Registered', 'Invited'],
          series: [totalTarget,
          totalRegistered, totalInvited],
          colors: ['#0ec2e6','#0d0221', '#f1c40f'],
          title: {
            text: "Overall Registration Progress",
            align: 'center',
            style: {fontSize: '14px'}
          },
          dataLabels: {
            enabled: true,
            formatter: function(val, opts){
              return val.toFixed(1)+'%';
            }
          },
          legend: {
            position: "bottom"
          }


        };
        const chart = new ApexCharts(document.querySelector("#upcoming-statistics-chart"), options);
        chart.render();

    }
    async function loadEventFinancials() {
      const chartContainer = document.querySelector("#financialStats");

      try {
        const response = await fetch("analysis/get_event_financials.php");
        const data = await response.json();

        if (!data.success) {
          chartContainer.innerHTML = "<p class='text-danger'>Error loading chart data.</p>";
          return;
        }

        const stats = data.stats;

        // Prepare chart data
        const categories = [
          "Total Collection Target",
          "Sponsored Collection",
          "Amount Collected",
          "Pending Collection"
        ];

        const values = [
          parseFloat(stats.total_collection || 0),
          parseFloat(stats.sponsored_collection || 0),
          parseFloat(stats.collected || 0),
          parseFloat(stats.pending || 0)
        ];

        // Configure ApexCharts
        const options = {
          chart: {
            type: "bar",
            height: 350,
            toolbar: { show: false },
            background: "transparent"
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "45%",
              borderRadius: 6
            }
          },
          colors: ["#0ec2e6", "#0d0221", "#eff2c0", "#f6c23e"],
          dataLabels: {
            enabled: true,
            formatter: (val) => val.toLocaleString(),
            style: { colors: ["#333"], fontWeight: "bold" }
          },
          xaxis: {
            categories,
            labels: { style: { fontSize: "13px" } }
          },
          yaxis: {
            title: { text: "Amount (Ksh)" },
            labels: {
              formatter: (val) => val.toLocaleString()
            }
          },
          title: {
            text: "Event Financial Summary",
            align: "center",
            style: { fontSize: "16px", fontWeight: "bold", color: "#0d0221" }
          },
          tooltip: {
            y: {
              formatter: (val) => "Ksh " + val.toLocaleString()
            }
          },
          series: [
            {
              name: "Amount (Ksh)",
              data: values
            }
          ]
        };

        const chart = new ApexCharts(chartContainer, options);
        chart.render();

      } catch (error) {
        console.error("Error loading financial chart:", error);
        chartContainer.innerHTML = "<p class='text-danger'>Failed to load financial data.</p>";
      }
    }
    async function loadAllData() {
            try {
                // Fetch all analytics data
                const response = await fetch('analysis/get_event_demo.php');

                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data');
                }

                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                // Update statistics
                updateStatistics(data.statistics);

                // Render all charts
                renderRegistrationsPerEvent(data.registrations_per_event);
                renderGenderDistribution(data.gender_distribution);
                renderCategoryDistribution(data.category_distribution);
                renderRegistrationTimeline(data.registration_timeline);
                renderTopLocations(data.top_locations);
                renderSponsorshipDistribution(data.sponsorship_distribution);

            } catch (error) {
                console.error('Error loading analytics:', error);
                showError('Failed to load analytics data: ' + error.message);
            }
        }

        function updateStatistics(stats) {
            document.getElementById('totalRegistrations').textContent = stats.total_registrations || 0;
            document.getElementById('totalEvents').textContent = stats.total_events || 0;
            document.getElementById('genderRatio').textContent = stats.gender_ratio || '-';
            document.getElementById('servingCount').textContent = stats.serving_count || 0;
        }

        function renderRegistrationsPerEvent(data) {
            const options = {
                series: [{
                    name: 'Registrations',
                    data: data.map(item => item.count)
                }],
                chart: {
                    type: 'bar',
                    height: 350,
                    toolbar: {
                        show: true
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '55%',
                        endingShape: 'rounded',
                        dataLabels: {
                            position: 'top'
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    offsetY: -20,
                    style: {
                        fontSize: '12px',
                        colors: ['#304758']
                    }
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ['transparent']
                },
                xaxis: {
                    categories: data.map(item => item.event_name),
                    labels: {
                        rotate: -45,
                        rotateAlways: true,
                        style: {
                            fontSize: '11px'
                        }
                    }
                },
                yaxis: {
                    title: {
                        text: 'Number of Registrations'
                    }
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shade: 'light',
                        type: 'vertical',
                        shadeIntensity: 0.5,
                        gradientToColors: ['#667eea'],
                        inverseColors: false,
                        opacityFrom: 0.85,
                        opacityTo: 0.85,
                        stops: [0, 100]
                    }
                },
                colors: ['#764ba2'],
                tooltip: {
                    y: {
                        formatter: function(val) {
                            return val + ' registrations';
                        }
                    }
                }
            };

            const chart = new ApexCharts(document.querySelector('#registrationsPerEventChart'), options);
           // const chart = new ApexCharts(document.querySelector('#registrationsPerEventChart'), options);
            const chartEl = document.querySelector('#registrationsPerEventChart');
            if (chartEl) chartEl.classList.remove('loading');
            chart.render(); //chart.render();
        }

        function renderGenderDistribution(data) {
            const options = {
                series: data.map(item => item.count),
                chart: {
                    type: 'donut',
                    height: 200
                },
                labels: data.map(item => item.gender),
                colors: ['#667eea', '#f093fb', '#4facfe'],
                legend: {
                    position: 'bottom'
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '65%',
                            labels: {
                                show: true,
                                name: {
                                    show: true,
                                    fontSize: '22px',
                                    fontWeight: 600
                                },
                                value: {
                                    show: true,
                                    fontSize: '16px',
                                    fontWeight: 400
                                },
                                total: {
                                    show: true,
                                    label: 'Total',
                                    formatter: function(w) {
                                        return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                    }
                                }
                            }
                        }
                    }
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 300
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }]
            };

            const chart = new ApexCharts(document.querySelector('#genderDistributionChart'), options);
            const chartEl = document.querySelector('#genderDistributionChart');
          if (chartEl) chartEl.classList.remove('loading');
            chartEl.innerHTML='';
            chart.render();
        }

        function renderCategoryDistribution(data) {
            const options = {
                series: data.map(item => item.count),
                chart: {
                    type: 'pie',
                    height: 350
                },
                labels: data.map(item => item.category),
                colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b'],
                legend: {
                    position: 'bottom'
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 300
                        }
                    }
                }]
            };

            const chart = new ApexCharts(document.querySelector('#categoryDistributionChart'), options);
            chart.render();
        }

        function renderRegistrationTimeline(data) {
            const options = {
                series: [{
                    name: 'Registrations',
                    data: data.map(item => item.count)
                }],
                chart: {
                    type: 'area',
                    height: 350,
                    zoom: {
                        enabled: true
                    },
                    toolbar: {
                        show: true
                    }
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth',
                    width: 3
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.2,
                        stops: [0, 90, 100]
                    }
                },
                colors: ['#667eea'],
                xaxis: {
                    categories: data.map(item => item.date),
                    labels: {
                        rotate: -45
                    }
                },
                yaxis: {
                    title: {
                        text: 'Number of Registrations'
                    }
                },
                tooltip: {
                    x: {
                        format: 'dd MMM yyyy'
                    }
                }
            };

            const chart = new ApexCharts(document.querySelector('#registrationTimelineChart'), options);
            chart.render();
        }

        function renderTopLocations(data) {
            const options = {
                series: [{
                    name: 'Registrations',
                    data: data.map(item => item.count)
                }],
                chart: {
                    type: 'bar',
                    height: 350
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        distributed: true,
                        dataLabels: {
                            position: 'bottom'
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    textAnchor: 'start',
                    style: {
                        colors: ['#fff']
                    },
                    offsetX: 0
                },
                xaxis: {
                    categories: data.map(item => item.location)
                },
                colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#38f9d7', '#5f27cd'],
                legend: {
                    show: false
                }
            };

            const chart = new ApexCharts(document.querySelector('#topLocationsChart'), options);
            chart.render();
        }

        function renderSponsorshipDistribution(data) {
            const options = {
                series: data.map(item => item.count),
                chart: {
                    type: 'donut',
                    height: 350
                },
                labels: data.map(item => item.sponsorship || 'Not Specified'),
                colors: ['#43e97b', '#38f9d7', '#667eea', '#f093fb'],
                legend: {
                    position: 'bottom'
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '65%'
                        }
                    }
                }
            };

            const chart = new ApexCharts(document.querySelector('#sponsorshipChart'), options);
            chart.render();
        }

        function refreshData() {
            // Clear all charts
            document.querySelectorAll('[id$="Chart"]').forEach(el => {
                el.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Loading chart data...</p></div>';
            });

            // Reload data
            loadAllData();
        }

        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';

            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
        loadAllData();

 loadEventFinancials();

  loadEventStats();

  });



  // Setup countdown timer for the Hero Card
  const eventDateStr = "<?php echo !empty($event) ? $event['start_date'] : ''; ?>";
  if(eventDateStr) {
      const countDownDate = new Date(eventDateStr).getTime();
      const countdownInterval = setInterval(function() {
          const now = new Date().getTime();
          const distance = countDownDate - now;

          if (distance < 0) {
              clearInterval(countdownInterval);
              document.getElementById("days-togo").innerHTML = "Event Started";
              return;
          }

          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          
          document.getElementById("days-togo").innerHTML = days + "d " + hours + "h " + minutes + "m";
      }, 1000);
  }

</script>
  </body>
</html>

  <!-- beautify ignore:end -->


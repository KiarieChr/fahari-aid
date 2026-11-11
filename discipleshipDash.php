<?php 
include('includes/checklogin.php');

$title = "Discipleship | Dashboard";
include("includes/get_user.php");

// 1. Total Courses Count
try {
    $course_stmt = $db->query("SELECT COUNT(*) AS count FROM trn_learning_tracks WHERE status = 1");
    $courses_count = $course_stmt->fetch(PDO::FETCH_ASSOC)['count'];
} catch(PDOException $e) { $courses_count = 0; }

// 2. Total Lessons Count
try {
    $lessons_stmt = $db->query("SELECT COUNT(*) AS count FROM trn_learning_modules");
    $lessons_count = $lessons_stmt->fetch(PDO::FETCH_ASSOC)['count'];
} catch(PDOException $e) { $lessons_count = 0; }

// 3. User Completed Lessons
try {
    $progress_stmt = $db->prepare("
        SELECT COUNT(*) AS count 
        FROM trn_module_progress p
        JOIN trn_track_enrollments e ON p.enrollment_id = e.id
        WHERE e.trainee_id = :user_id AND p.status = 'completed'
    ");
    $progress_stmt->execute([':user_id' => $user_id]);
    $completed_lessons_count = $progress_stmt->fetch(PDO::FETCH_ASSOC)['count'];
} catch(PDOException $e) { $completed_lessons_count = 0; }

// 4. Latest Courses
try {
    $latest_courses_stmt = $db->query("
        SELECT id, title, description, badge_icon as thumbnail_url, created_at 
        FROM trn_learning_tracks 
        WHERE status = 1
        ORDER BY id DESC 
        LIMIT 4
    ");
    $latest_courses = $latest_courses_stmt->fetchAll(PDO::FETCH_ASSOC);
} catch(PDOException $e) { $latest_courses = []; }

// 5. All Courses for Datatable
try {
    $all_courses_stmt = $db->query("
        SELECT c.id, c.title, c.description, c.created_at, c.badge_icon as thumbnail_url,
               (SELECT COUNT(*) FROM trn_learning_modules l WHERE l.track_id = c.id) as total_lessons
        FROM trn_learning_tracks c
        WHERE status = 1
        ORDER BY c.id DESC
    ");
    $all_courses = $all_courses_stmt->fetchAll(PDO::FETCH_ASSOC);
} catch(PDOException $e) { $all_courses = []; }

// End of LMS Queries
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

  <body>
    <div class="layout-wrapper layout-content-navbar  ">
        <div class="layout-container">
    
            <?php @include('includes/sidebar.php');?>

            <div class="menu-mobile-toggler d-xl-none rounded-1">
              <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large text-bg-secondary p-2 rounded-1">
                  <i class="bx bx-menu icon-base"></i>
                  <i class="bx bx-chevron-right icon-base"></i>
              </a>
            </div>
            <!-- / Menu -->

                

                <!-- Layout container -->
                <div class="layout-page">
    
                    <!-- Navbar -->
                     <?php @include('includes/nav.php');
                     @include('modals/dashboard.php')
                     ?>

      

                  <!-- Content wrapper -->
                  <div class="content-wrapper">
                    <!-- Content -->
                    <div class="container-xxl flex-grow-1 container-p-y">
                      <style>
                      /* Scoped modern LMS CSS */
                      .lms-hero {
                          background: linear-gradient(135deg, #696cff 0%, #2b2c66 100%);
                          color: #fff;
                          border-radius: 12px;
                          padding: 3rem 2rem;
                          position: relative;
                          overflow: hidden;
                          box-shadow: 0 10px 30px rgba(105, 108, 255, 0.4);
                      }
                      .lms-hero::after {
                          content: '';
                          position: absolute;
                          right: -10%;
                          top: -20%;
                          width: 300px;
                          height: 300px;
                          background: rgba(255,255,255,0.1);
                          border-radius: 50%;
                      }
                      .lms-hero-content {
                          position: relative;
                          z-index: 1;
                      }
                      .course-card {
                          transition: all 0.3s ease;
                          border: none;
                          border-radius: 12px;
                          overflow: hidden;
                          background: #fff;
                          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                      }
                      .course-card:hover {
                          transform: translateY(-5px);
                          box-shadow: 0 12px 25px rgba(0,0,0,0.1);
                      }
                      .course-thumbnail {
                          height: 180px;
                          object-fit: cover;
                          width: 100%;
                      }
                      .course-thumbnail-placeholder {
                          height: 180px;
                          width: 100%;
                          background: linear-gradient(45deg, #e0e0e0, #f5f5f5);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: #a0a0a0;
                      }
                      .stat-widget {
                          background: rgba(255, 255, 255, 0.9);
                          backdrop-filter: blur(10px);
                          border-radius: 12px;
                          padding: 1.5rem;
                          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                          transition: transform 0.2s;
                          border: 1px solid rgba(0,0,0,0.05);
                      }
                      .stat-widget:hover {
                          transform: translateY(-2px);
                      }
                      </style>

                      <!-- Hero Section -->
                      <div class="row mt-4 mb-6">
                          <div class="col-12">
                              <div class="lms-hero">
                                  <div class="lms-hero-content">
                                      <h2 class="text-white mb-2">Welcome Back, <?php echo $fname; ?>! 👋</h2>
                                      <p class="text-white-50 mb-4 fs-5">Ready to continue your journey? You're doing great!</p>
                                      
                                      <?php if (!empty($latest_courses)): ?>
                                      <div class="d-flex align-items-center gap-4 mt-4">
                                          <a href="lms_viewer.php?course_id=<?php echo $latest_courses[0]['id']; ?>" class="btn btn-light btn-lg text-primary fw-bold px-5 rounded-pill shadow-sm">Resume Learning</a>
                                          <span class="text-white">Next Up: <strong><?php echo htmlspecialchars($latest_courses[0]['title']); ?></strong></span>
                                      </div>
                                      <?php else: ?>
                                      <div class="d-flex align-items-center gap-4 mt-4">
                                          <a href="#browse-courses" class="btn btn-light btn-lg text-primary fw-bold px-5 rounded-pill shadow-sm">Browse Courses</a>
                                      </div>
                                      <?php endif; ?>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Quick Stats -->
                      <div class="row g-4 mb-6">
                          <div class="col-12 col-md-4">
                              <div class="stat-widget d-flex align-items-center gap-4">
                                  <div class="avatar avatar-lg">
                                      <div class="avatar-initial bg-label-primary rounded-circle">
                                          <i class="bx bx-book-bookmark fs-2"></i>
                                      </div>
                                  </div>
                                  <div>
                                      <h4 class="mb-0 fw-bold"><?php echo $courses_count; ?></h4>
                                      <span class="text-muted">Available Courses</span>
                                  </div>
                              </div>
                          </div>
                          <div class="col-12 col-md-4">
                              <div class="stat-widget d-flex align-items-center gap-4">
                                  <div class="avatar avatar-lg">
                                      <div class="avatar-initial bg-label-info rounded-circle">
                                          <i class="bx bx-play-circle fs-2"></i>
                                      </div>
                                  </div>
                                  <div>
                                      <h4 class="mb-0 fw-bold"><?php echo $lessons_count; ?></h4>
                                      <span class="text-muted">Total Lessons</span>
                                  </div>
                              </div>
                          </div>
                          <div class="col-12 col-md-4">
                              <div class="stat-widget d-flex align-items-center gap-4">
                                  <div class="avatar avatar-lg">
                                      <div class="avatar-initial bg-label-success rounded-circle">
                                          <i class="bx bx-trophy fs-2"></i>
                                      </div>
                                  </div>
                                  <div>
                                      <h4 class="mb-0 fw-bold"><?php echo $completed_lessons_count; ?></h4>
                                      <span class="text-muted">Lessons Completed</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Recommended Courses -->
                      <h4 class="mb-4 fw-bold" id="browse-courses">Recommended For You</h4>
                      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-6">
                          <?php if (empty($all_courses)): ?>
                              <div class="col-12 text-center py-5 w-100">
                                  <i class="bx bx-book-open fs-1 text-muted mb-3 d-block"></i>
                                  <p class="text-muted">No courses available at the moment.</p>
                              </div>
                          <?php else: ?>
                              <?php foreach ($all_courses as $course): ?>
                              <div class="col">
                                  <div class="card course-card h-100">
                                      <?php if (!empty($course['thumbnail_url'])): ?>
                                          <img src="<?php echo htmlspecialchars($course['thumbnail_url']); ?>" class="course-thumbnail" alt="Course Thumbnail">
                                      <?php else: ?>
                                          <div class="course-thumbnail-placeholder">
                                              <i class="bx bx-image fs-1 opacity-50"></i>
                                          </div>
                                      <?php endif; ?>
                                      <div class="card-body d-flex flex-column">
                                          <div class="d-flex justify-content-between align-items-start mb-2">
                                              <span class="badge bg-label-primary"><?php echo $course['total_lessons']; ?> Lessons</span>
                                          </div>
                                          <h5 class="card-title text-truncate-2 mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"><?php echo htmlspecialchars($course['title']); ?></h5>
                                          <p class="card-text text-muted small text-truncate-3 mb-4" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                                              <?php echo htmlspecialchars(strip_tags($course['description'] ?? 'No description provided.')); ?>
                                          </p>
                                          <div class="mt-auto">
                                              <a href="lms_viewer.php?course_id=<?php echo $course['id']; ?>" class="btn btn-outline-primary w-100">Start Course</a>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <?php endforeach; ?>
                          <?php endif; ?>
                      </div>

                    </div>
                    <!-- / Content -->

                    
                    

                        <!-- Footer -->
                            <?php @include('includes/footer.php');?>
                        <!-- / Footer -->

                    
                    <div class="content-backdrop fade"></div>
                  </div>
                  <!-- Content wrapper -->
                </div>
                <!-- / Layout page -->
        </div>
    </div>
    <!-- / Layout wrapper -->

    <div class="buy-now">
      <a href="" target="" class="btn btn-success btn-buy-now">Giving</a>
    </div>
    <!-- Core JS -->
    <!-- build:js assets/vendor/js/theme.js  -->
     <?php include('includes/scripts.html');?>
    <!-- ApexCharts CDN -->
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    
    <script>
    $(document).ready(function() {
        // Any custom JS for LMS can go here
    });
    </script>
  </body>
</html>

  <!-- beautify ignore:end -->

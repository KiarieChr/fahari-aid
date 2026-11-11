<?php 
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');

$title = "Training & Mentorship | Dashboard";
include("includes/get_user.php");
?>

<!doctype html>
<html lang="en"
  class="layout-navbar-fixed layout-menu-fixed layout-compact"
  dir="ltr"
  data-skin="default"
  data-assets-path="assets/"
  data-template="vertical-menu-template"
  data-bs-theme="light">
  
  <?php @include('includes/header.php');?>
  <head>
    <style>
      .course-card {
        border: none;
        border-radius: 15px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .course-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
      }
      .course-icon-wrapper {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
      }
      .module-item {
        padding: 1rem;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        transition: background 0.2s;
      }
      .module-item:hover {
        background: rgba(0,0,0,0.02);
      }
      .module-item:last-child {
        border-bottom: none;
      }
      .module-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        
        <!-- Menu -->
        <?php @include('includes/sidebar.php');?>
        <!-- / Menu -->

        <div class="layout-page">
          <!-- Navbar -->
          <?php @include('includes/nav.php');?>
          <!-- / Navbar -->

          <div class="content-wrapper">
            <div class="container-xxl flex-grow-1 container-p-y">
              
              <!-- Header -->
              <div class="card mb-4 overflow-hidden" style="border-radius: 15px; border: none; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                <div class="row g-0">
                  <div class="col-md-8 p-4">
                    <h4 class="fw-bold mb-1" style="color: #4338ca;">
                      <i class="bx bx-book-reader me-2"></i> Training & Mentorship
                    </h4>
                    <p class="text-muted mb-3" style="font-size: 0.9rem;">Equipping leaders for ministry through relational discipleship and skill-based coaching.</p>
                  </div>
                </div>
              </div>

              <!-- Available Tracks -->
              <h5 class="fw-bold mb-3">Available Learning Tracks</h5>
              <div class="row" id="tracksContainer">
                <div class="col-12 text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>

              <!-- Course Player Modal -->
              <div class="modal fade" id="playerModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
                  <div class="modal-content" style="border-radius:20px; overflow:hidden;">
                    <div class="modal-header border-bottom">
                      <h5 class="modal-title fw-bold" id="playerModalTitle">Module Title</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-0 d-flex flex-column flex-md-row" style="height: 70vh;">
                      
                      <!-- Video Player Side -->
                      <div class="flex-grow-1 bg-dark d-flex align-items-center justify-content-center" style="min-height: 300px;">
                        <iframe id="videoPlayer" width="100%" height="100%" style="border:none;" allowfullscreen></iframe>
                      </div>

                      <!-- Curriculum Sidebar -->
                      <div class="bg-white border-start" style="width: 350px; overflow-y: auto;">
                        <div class="p-3 border-bottom bg-light">
                          <h6 class="mb-0 fw-bold text-uppercase text-muted" style="font-size: 0.75rem; letter-spacing: 1px;">Course Curriculum</h6>
                        </div>
                        <div id="moduleList">
                          <!-- Modules injected here -->
                        </div>
                        
                        <!-- Actions Tab -->
                        <div class="p-4 mt-auto border-top">
                          <h6 class="fw-bold mb-2">Mentor Reflection</h6>
                          <p class="small text-muted mb-3">Send your reflection for this module to your mentor.</p>
                          <button class="btn btn-primary w-100 mb-2" onclick="openReflectionModal()"><i class="bx bx-pencil me-1"></i> Write Reflection</button>
                          
                          <div id="practicalAssignmentBtn" style="display:none;">
                            <hr>
                            <h6 class="fw-bold mb-2 text-warning"><i class="bx bx-video-recording"></i> Skill Practice</h6>
                            <p class="small text-muted mb-3">This module requires a video submission for coach evaluation.</p>
                            <button class="btn btn-warning w-100" onclick="openPracticalModal()"><i class="bx bx-upload me-1"></i> Submit Assignment</button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            <?php @include('includes/footer.php');?>
            <div class="content-backdrop fade"></div>
          </div>
        </div>
      </div>
      <div class="layout-overlay layout-menu-toggle"></div>
    </div>

    <?php @include('includes/scripts.html');?>
    <script>
      let currentTracks = [];
      let currentActiveModule = null;

      document.addEventListener('DOMContentLoaded', function() {
          loadTracks();
      });

      function loadTracks() {
          fetch('manage/get_learning_tracks.php')
          .then(r => r.json())
          .then(data => {
              const container = document.getElementById('tracksContainer');
              container.innerHTML = '';
              if (!data.success) {
                  container.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                  return;
              }
              currentTracks = data.tracks;

              if(currentTracks.length === 0) {
                  container.innerHTML = `<div class="col-12"><div class="card p-4 text-center text-muted">No learning tracks available.</div></div>`;
                  return;
              }

              currentTracks.forEach(track => {
                  const isEnrolled = track.enrollment !== null;
                  const progress = isEnrolled ? track.enrollment.progress_pct : 0;
                  
                  // Gatekeeping Logic
                  const dcStage = data.dc_stage;
                  const isEligible = (dcStage === 'Ministry' || dcStage === 'Multiplication');
                  
                  let btnHtml = '';
                  if (isEnrolled) {
                      btnHtml = `<button class="btn btn-primary w-100" onclick="openTrack(${track.id})">Continue Learning</button>`;
                  } else if (isEligible) {
                      btnHtml = `<button class="btn btn-outline-primary w-100" onclick="enrollTrack(${track.id})">Enroll Now</button>`;
                  } else {
                      btnHtml = `<button class="btn btn-secondary w-100 disabled" onclick="showLockedMessage()"><i class="bx bx-lock-alt me-1"></i> Locked</button>`;
                  }

                  const html = `
                    <div class="col-md-6 col-lg-4 mb-4">
                      <div class="card h-100 course-card shadow-sm border ${!isEnrolled && !isEligible ? 'bg-light' : ''}">
                        <div class="card-body d-flex flex-column">
                          <div class="d-flex align-items-center mb-3">
                            <div class="course-icon-wrapper me-3">
                              <i class="${track.badge_icon}"></i>
                            </div>
                            <div>
                              <h5 class="card-title mb-1 fw-bold text-dark">${track.title}</h5>
                              <span class="badge bg-label-${isEnrolled ? 'success' : (isEligible ? 'primary' : 'secondary')}">${isEnrolled ? 'Enrolled' : (isEligible ? 'Available' : 'Prerequisite Required')}</span>
                            </div>
                          </div>
                          <p class="card-text text-muted small flex-grow-1">${track.description}</p>
                          
                          ${isEnrolled ? `
                            <div class="mb-3">
                              <div class="d-flex justify-content-between small fw-semibold mb-1">
                                <span>Progress</span>
                                <span>${progress}%</span>
                              </div>
                              <div class="progress" style="height: 6px;">
                                <div class="progress-bar bg-success" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                              </div>
                            </div>
                          ` : ''}

                          <div class="mt-auto">
                            ${btnHtml}
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
                  container.insertAdjacentHTML('beforeend', html);
              });
          })
          .catch(err => {
              document.getElementById('tracksContainer').innerHTML = `<div class="alert alert-danger">Network error loading tracks.</div>`;
          });
      }

      function enrollTrack(trackId) {
          Swal.fire({
              title: 'Enroll in Track?',
              text: "You will be assigned a coach and can begin immediately.",
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Yes, Enroll me!'
          }).then((result) => {
              if (result.isConfirmed) {
                  fetch('manage/enroll_track.php', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({track_id: trackId})
                  }).then(r=>r.json()).then(res => {
                      if(res.success) {
                          Swal.fire('Enrolled!', 'You have been enrolled.', 'success');
                          loadTracks();
                      } else {
                          Swal.fire('Error', res.error, 'error');
                      }
                  });
              }
          });
      }

      function showLockedMessage() {
          Swal.fire({
              title: 'Track Locked',
              text: 'Please speak to your cell leader about completing your current discipleship growth stage first. You must reach the "Ministry" or "Multiplication" stage.',
              icon: 'warning',
              confirmButtonText: 'Understood'
          });
      }

      function openTrack(trackId) {
          const track = currentTracks.find(t => t.id == trackId);
          if (!track || track.modules.length === 0) {
              Swal.fire('Notice', 'No modules uploaded yet.', 'info');
              return;
          }
          
          const modal = new bootstrap.Modal(document.getElementById('playerModal'));
          const list = document.getElementById('moduleList');
          list.innerHTML = '';
          
          track.modules.forEach((mod, index) => {
              list.innerHTML += `
                  <div class="module-item" onclick="playModule(${mod.id}, '${mod.title}', '${mod.media_url}', ${mod.requires_practical})">
                    <div class="module-icon"><i class="bx ${mod.content_type === 'video' ? 'bx-play' : 'bx-file'}"></i></div>
                    <div>
                      <h6 class="mb-0 fw-semibold" style="font-size:0.9rem;">${index + 1}. ${mod.title}</h6>
                      <small class="text-muted">${mod.content_type.toUpperCase()}</small>
                    </div>
                  </div>
              `;
          });

          // Play first module by default
          playModule(track.modules[0].id, track.modules[0].title, track.modules[0].media_url, track.modules[0].requires_practical);
          modal.show();
      }

      function playModule(id, title, url, requiresPractical) {
          currentActiveModule = id;
          document.getElementById('playerModalTitle').innerText = title;
          document.getElementById('videoPlayer').src = url;
          document.getElementById('practicalAssignmentBtn').style.display = requiresPractical ? 'block' : 'none';
          
          // Highlight active module in sidebar
          document.querySelectorAll('.module-item').forEach(el => el.style.background = 'transparent');
          // (In a real app, we'd add an active class based on data-id)
      }

      function openReflectionModal() {
          if (!currentActiveModule) return;
          Swal.fire({
            title: 'Submit Mentor Reflection',
            input: 'textarea',
            inputLabel: 'What did you learn and how does it apply to your ministry?',
            inputPlaceholder: 'Type your reflection here...',
            inputAttributes: {
              'aria-label': 'Type your reflection here'
            },
            showCancelButton: true,
            confirmButtonText: 'Submit to Mentor',
            showLoaderOnConfirm: true,
            preConfirm: (text) => {
                if (!text) {
                    Swal.showValidationMessage('Reflection cannot be empty');
                    return false;
                }
                return fetch('manage/submit_reflection.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ module_id: currentActiveModule, reflection_text: text })
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        throw new Error(data.error || 'Server error');
                    }
                    return data;
                })
                .catch(error => {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                });
            },
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
              if (result.isConfirmed) {
                  Swal.fire('Submitted!', 'Your reflection has been sent to your mentor.', 'success');
                  loadTracks(); // Refresh progress
              }
          })
      }

      function openPracticalModal() {
          if (!currentActiveModule) return;
          Swal.fire({
            title: 'Submit Practical Assignment',
            input: 'url',
            inputLabel: 'Enter the URL to your video/document (e.g. YouTube, Google Drive)',
            inputPlaceholder: 'https://...',
            showCancelButton: true,
            confirmButtonText: 'Submit for Review',
            showLoaderOnConfirm: true,
            preConfirm: (url) => {
                if (!url) {
                    Swal.showValidationMessage('URL is required');
                    return false;
                }
                return fetch('manage/submit_assignment.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ module_id: currentActiveModule, media_url: url })
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        throw new Error(data.error || 'Server error');
                    }
                    return data;
                })
                .catch(error => {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                });
            },
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
              if (result.isConfirmed) {
                  Swal.fire('Submitted!', 'Your assignment has been submitted to your coach for review.', 'success');
              }
          })
      }
    </script>
  </body>
</html>

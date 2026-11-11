 <!-- Footer -->
 <footer class="content-footer footer bg-footer-theme">
              <div class="container-xxl">
                <div
                  class="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
                  <div class="mb-2 mb-md-0">
                    © 2024 -
                    <script>
                      document.write(new Date().getFullYear());
                    </script>
                    , made with ❤️ by
                    <a href="https://royalsoftwares.co.ke" target="" class="footer-link">Royal Softwares</a>
                  </div>
                  <div class="d-none d-lg-inline-block">
                    <a
                      href="https://royalsoftwares.co.ke/contact"
                      target=""
                      class="footer-link me-4"
                      >Contact</a
                    >

                    <a href="https://royalsoftwares.co.ke" class="footer-link me-4" target="">Request Demo</a>
                    

                  </div>
                </div>
              </div>
            </footer>
            <!-- / Footer -->
            <script>
              function loadNotifications(userId) 
              {
                fetch('manage/get-notifications.php?user_id=' + userId)
                  .then(res => res.json())
                  .then(notifs => {
                    const notifList = document.querySelector('.dropdown-notifications-list .list-group');
                    const notifBadge = document.querySelector('.badge-notifications');
                    const notifCounter = document.querySelector('.dropdown-menu-header .badge');

                    notifList.innerHTML = '';

                    if (notifs.length === 0) {
                      notifList.innerHTML = `
                        <li class="list-group-item dropdown-notifications-item text-center text-muted">
                          No new notifications
                        </li>`;
                      notifBadge.classList.add('d-none');
                      notifCounter.textContent = '';
                      return;
                    }

                    notifBadge.classList.remove('d-none');
                    notifCounter.textContent = `${notifs.length} New`;

                    notifs.forEach(n => {
                              const iconMap = {
                        info:    { icon: 'bx-info-circle', color: 'info' },
                        success: { icon: 'bx-check-circle', color: 'success' },
                        warning: { icon: 'bx-error-circle', color: 'warning' },
                        danger:  { icon: 'bx-x-circle', color: 'danger' }
                      };

                        const type = n.type || 'info';
                        const iconClass = iconMap[type]?.icon || 'bx-bell';
                        const colorClass = iconMap[type]?.color || 'secondary';
                      notifList.innerHTML += `
                        <li class="list-group-item list-group-item-action dropdown-notifications-item" data-id="${n.id}">
                          <div class="d-flex">
                            <div class="flex-shrink-0 me-3">
                              <div class="avatar">
                                <i class="bx ${iconClass} text-${colorClass} fs-4 "></i>
                              </div>
                            </div>
                            <div class="flex-grow-1">
                              <h6 class="small mb-0">${n.title}</h6>
                              <small class="mb-1 d-block text-body">${n.message}</small>
                              <small class="text-body-secondary">${timeAgo(n.created_at)}</small>
                            </div>
                            <div class="flex-shrink-0 dropdown-notifications-actions">
                              <a href="javascript:void(0)" class="dropdown-notifications-read"><span class="badge badge-dot"></span></a>
                              <a href="javascript:void(0)" class="dropdown-notifications-archive"><span class="icon-base bx bx-x"></span></a>
                            </div>
                          </div>
                        </li>`;
                    });
                  })
                  .catch(err => {
                    console.error('Notification load failed:', err);
                  });
}
function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return date.toLocaleDateString(); // fallback
}
const userId = <?= $user_id;?>
 // Replace this dynamically

// Load initially on page load
loadNotifications(userId);

document.querySelector('.dropdown-notifications-list').addEventListener('click', function(e) {
  const notifItem = e.target.closest('.dropdown-notifications-item');
  if (!notifItem) return;

  const notifId = notifItem.getAttribute('data-id');
  if (!notifId) return;

  // Send request to mark as read
  fetch('manage/mark-as-read.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `id=${notifId}`
  })
  .then(res => res.text())
  .then(response => {
    console.log('Marked as read:', response);
    // Optionally remove or style the item
    notifItem.classList.add('text-muted'); // Visual change
    // Or reload
    loadNotifications(userId);
  })
  .catch(err => console.error('Failed to mark as read:', err));
});


// Refresh every 3 seconds
setInterval(() => {
  loadNotifications(userId);
}, 3000);

</script>

<?php
// ── Assimilation Toasts Logic ──
$showAssignedToast = false;
$showManagerToast = false;
$assignedCount = 0;
$totalUncontacted = 0;
$latestMembersHtml = '';

if (isset($user_id) && isset($db)) {
    // 1. Check if user has assigned tasks
    $astmt = $db->prepare("SELECT COUNT(*) FROM new_member_assimilation WHERE assigned_to = :uid AND assimilation_status IN ('uncontacted', 'attempted')");
    $astmt->execute([':uid' => $user_id]);
    $assignedCount = (int)$astmt->fetchColumn();
    if ($assignedCount > 0) {
        $showAssignedToast = true;
    }

    // 2. Check if user is Admin or dc_coordinator
    $isAdminStmt = $db->prepare("
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = :uid AND r.name IN ('Administrator', 'General Admin')
        LIMIT 1
    ");
    $isAdminStmt->execute([':uid' => $user_id]);
    $isAdmin = (bool)$isAdminStmt->fetchColumn();

    $isDc = false;
    // For dc_coordinator we check permissions
    $isDcStmt = $db->prepare("
        SELECT 1 FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = :uid AND p.name = 'dc_coordinator'
        LIMIT 1
    ");
    $isDcStmt->execute([':uid' => $user_id]);
    $isDc = (bool)$isDcStmt->fetchColumn();

    if ($isAdmin || $isDc) {
        $showManagerToast = true;
        // Total uncontacted
        $totalUncontacted = (int)$db->query("SELECT COUNT(*) FROM new_member_assimilation WHERE assimilation_status = 'uncontacted'")->fetchColumn();
        
        // Latest 5
        $latest = $db->query("
            SELECT m.first_name, m.last_name, a.created_at
            FROM new_member_assimilation a
            JOIN member m ON a.member_id = m.id
            ORDER BY a.created_at DESC LIMIT 5
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($latest)) {
            $latestMembersHtml .= "<ul class='mb-0 ps-3 mt-2 small'>";
            foreach($latest as $l) {
                $name = htmlspecialchars(trim(($l['first_name'] ?? '') . ' ' . ($l['last_name'] ?? '')));
                $date = date('M j', strtotime($l['created_at']));
                $latestMembersHtml .= "<li><b>{$name}</b> ({$date})</li>";
            }
            $latestMembersHtml .= "</ul>";
        } else {
            $latestMembersHtml = "<p class='small text-muted mb-0 mt-1'>No new members found.</p>";
        }
    }
}
?>

<?php if ($showAssignedToast || $showManagerToast): ?>
<!-- Toast Styles & FAB Styling -->
<style>
.assim-fab {
    position: fixed;
    bottom: 25px;
    right: 25px;
    width: 55px;
    height: 55px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #0ec2e6 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    cursor: pointer;
    z-index: 9999;
    transition: all 0.3s ease;
    border: none;
}
.assim-fab:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
}
.assim-fab i {
    font-size: 24px;
}
.assim-fab .badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #eb3349;
    color: white;
    border: 2px solid white;
    border-radius: 50%;
    padding: 3px 6px;
    font-size: 11px;
    font-weight: 700;
}
</style>

<!-- Floating Action Button for Oversight Alert -->
<?php if ($showManagerToast): ?>
<button id="btnManagerFab" class="assim-fab" onclick="toggleAssimToast('toastManager')" title="Toggle Oversight Alerts">
    <i class="bx bx-bell"></i>
    <?php if ($totalUncontacted > 0): ?>
        <span class="badge"><?= $totalUncontacted ?></span>
    <?php endif; ?>
</button>
<?php endif; ?>

<!-- Toast Container -->
<div class="toast-container position-fixed bottom-0 end-0 p-4" style="z-index: 10000; margin-bottom: 70px;">

    <?php if ($showAssignedToast): ?>
    <div id="toastAssigned" class="toast border-0 shadow-lg mb-3 d-flex flex-column" style="width: 350px; overflow: hidden; border-radius: 12px;" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
        <div class="toast-header w-100 border-bottom-0" style="background: radial-gradient(circle at 10% 20%, rgba(13, 2, 33, 1) 0%, rgba(20, 24, 60, 1) 90.2%); color: #fff;">
            <i class="bx bx-bell me-2" style="color: #0ec2e6; font-size: 1.2rem;"></i>
            <strong class="me-auto" style="letter-spacing: 0.5px;">Your Follow-ups</strong>
            <button type="button" class="btn-close btn-close-white" style="filter: invert(1); opacity: 0.8;" data-bs-dismiss="toast" aria-label="Close" onclick="dismissAssimToast('toastAssigned')"></button>
        </div>
        <div class="toast-body w-100" style="background-color: #fdfbf7; color: #14183c; font-weight: 500;">
            You have <b><?= $assignedCount ?></b> pending member follow-up(s) assigned to you.
            <div class="mt-3 pt-3 text-end" style="border-top: 1px solid rgba(20, 24, 60, 0.1);">
                <a href="assimilation.php" class="btn btn-sm text-white border-0 shadow-sm" style="background: linear-gradient(135deg, #0ec2e6 0%, #8b5cf6 100%); font-weight: 600; border-radius: 8px;">Go to Assimilation</a>
            </div>
        </div>
    </div>
    <?php endif; ?>

    <?php if ($showManagerToast): ?>
    <div id="toastManager" class="toast border-0 shadow-lg d-flex flex-column" style="width: 350px; overflow: hidden; border-radius: 12px;" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
        <div class="toast-header w-100 border-bottom-0" style="background: radial-gradient(circle at 10% 20%, rgba(13, 2, 33, 1) 0%, rgba(20, 24, 60, 1) 90.2%); color: #fff;">
            <i class="bx bx-bar-chart-alt-2 me-2" style="color: #8b5cf6; font-size: 1.2rem;"></i>
            <strong class="me-auto" style="letter-spacing: 0.5px;">Oversight Alert</strong>
            <button type="button" class="btn-close btn-close-white" style="filter: invert(1); opacity: 0.8;" aria-label="Close" onclick="minimizeAssimToast('toastManager')"></button>
        </div>
        <div class="toast-body w-100" style="background-color: #fdfbf7; color: #14183c; font-weight: 500;">
            Total uncontacted members: <b style="color: #eb3349; font-size: 1.1rem;"><?= $totalUncontacted ?></b>
            <div class="mt-3 pt-2 fw-bold" style="border-top: 1px solid rgba(20, 24, 60, 0.1); color: #2c3e50;">
                Latest 5 Members:
            </div>
            <?= $latestMembersHtml ?>
            <div class="mt-3 pt-3 text-end" style="border-top: 1px solid rgba(20, 24, 60, 0.1);">
                <a href="assimilation.php#pane-oversight" class="btn btn-sm text-white border-0 shadow-sm" style="background: linear-gradient(135deg, #8b5cf6 0%, #0ec2e6 100%); font-weight: 600; border-radius: 8px;">View Dashboard</a>
            </div>
        </div>
    </div>
    <?php endif; ?>

</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize toastManager based on saved localStorage state
    var toastEl = document.getElementById('toastManager');
    if (toastEl) {
        var savedState = localStorage.getItem('toastManager_state');
        var toast = new bootstrap.Toast(toastEl, { autohide: false });
        
        if (savedState === 'minimized') {
            toastEl.classList.remove('show');
            toastEl.style.display = 'none';
        } else {
            setTimeout(function() {
                toast.show();
            }, 500);
        }
    }

    // 2. Initialize toastAssigned based on sessionStorage
    var assignedEl = document.getElementById('toastAssigned');
    if (assignedEl) {
        if (!sessionStorage.getItem('dismissed_toastAssigned')) {
            var assignedToast = new bootstrap.Toast(assignedEl, { autohide: false });
            setTimeout(function() {
                assignedToast.show();
            }, 500);
        } else {
            assignedEl.style.display = 'none';
        }
    }
});

function minimizeAssimToast(id) {
    localStorage.setItem(id + '_state', 'minimized');
    var el = document.getElementById(id);
    if (el) {
        var bsToast = bootstrap.Toast.getInstance(el);
        if (bsToast) {
            bsToast.hide();
        } else {
            el.style.display = 'none';
            el.classList.remove('show');
        }
    }
}

function maximizeAssimToast(id) {
    localStorage.setItem(id + '_state', 'maximized');
    var el = document.getElementById(id);
    if (el) {
        el.style.display = 'block';
        var bsToast = bootstrap.Toast.getInstance(el) || new bootstrap.Toast(el, { autohide: false });
        bsToast.show();
    }
}

function toggleAssimToast(id) {
    var el = document.getElementById(id);
    if (el && el.classList.contains('show') && el.style.display !== 'none') {
        minimizeAssimToast(id);
    } else {
        maximizeAssimToast(id);
    }
}

function dismissAssimToast(id) {
    sessionStorage.setItem('dismissed_' + id, 'true');
    var el = document.getElementById(id);
    if (el) {
        var bsToast = bootstrap.Toast.getInstance(el);
        if (bsToast) {
            bsToast.hide();
        } else {
            el.style.display = 'none';
        }
    }
}
</script>
<?php endif; ?>
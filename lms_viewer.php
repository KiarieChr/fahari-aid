<?php
session_start();
require_once('includes/connection.php');
include('includes/checklogin.php');

$currentUserId = $user_id ?? 0;
if (!$currentUserId) {
    header("Location: login.php");
    exit;
}

$trackId = isset($_GET['course_id']) ? (int)$_GET['course_id'] : 0;
$moduleId = isset($_GET['lesson_id']) ? (int)$_GET['lesson_id'] : 0;

if ($trackId === 0) {
    echo "Invalid course ID.";
    exit;
}

// Ensure enrollment exists
$enrollStmt = $db->prepare("SELECT id FROM trn_track_enrollments WHERE trainee_id = :uid AND track_id = :tid LIMIT 1");
$enrollStmt->execute([':uid' => $currentUserId, ':tid' => $trackId]);
$enrollment = $enrollStmt->fetch(PDO::FETCH_ASSOC);

if (!$enrollment) {
    // Auto-enroll if they access it directly
    $insertEnroll = $db->prepare("INSERT INTO trn_track_enrollments (trainee_id, track_id, status) VALUES (:uid, :tid, 'in_progress')");
    $insertEnroll->execute([':uid' => $currentUserId, ':tid' => $trackId]);
    $enrollmentId = $db->lastInsertId();
} else {
    $enrollmentId = $enrollment['id'];
}

// Handle Form Submission: Mark Complete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'complete_lesson') {
    $completeModuleId = (int)($_POST['module_id'] ?? 0);
    
    if ($completeModuleId > 0) {
        // Insert progress (ON DUPLICATE KEY UPDATE logic doesn't strictly apply unless there's a UNIQUE constraint, but we can check first)
        $progCheck = $db->prepare("SELECT id FROM trn_module_progress WHERE enrollment_id = :eid AND module_id = :mid LIMIT 1");
        $progCheck->execute([':eid' => $enrollmentId, ':mid' => $completeModuleId]);
        if (!$progCheck->fetch()) {
            $insertProg = $db->prepare("INSERT INTO trn_module_progress (enrollment_id, module_id, status) VALUES (:eid, :mid, 'completed')");
            $insertProg->execute([':eid' => $enrollmentId, ':mid' => $completeModuleId]);
            
            // Trigger an update to trn_track_enrollments progress_pct (simplified)
            $db->prepare("UPDATE trn_track_enrollments SET progress_pct = progress_pct + 1 WHERE id = :eid")->execute([':eid' => $enrollmentId]);
        }
    }
    
    // Find next module
    $nextStmt = $db->prepare("SELECT id FROM trn_learning_modules WHERE track_id = :tid AND sequence_no > (SELECT sequence_no FROM trn_learning_modules WHERE id = :mid) ORDER BY sequence_no ASC LIMIT 1");
    $nextStmt->execute([':tid' => $trackId, ':mid' => $completeModuleId]);
    $nextModule = $nextStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($nextModule) {
        header("Location: lms_viewer.php?course_id=$trackId&lesson_id=" . $nextModule['id']);
    } else {
        header("Location: discipleshipDash.php?msg=course_finished");
    }
    exit;
}

// Fetch track details
$trackStmt = $db->prepare("SELECT title, description FROM trn_learning_tracks WHERE id = :tid");
$trackStmt->execute([':tid' => $trackId]);
$track = $trackStmt->fetch(PDO::FETCH_ASSOC);

// Fetch all modules for this track
$modulesStmt = $db->prepare("SELECT id, title, content_type, sequence_no, media_url, requires_practical FROM trn_learning_modules WHERE track_id = :tid ORDER BY sequence_no ASC");
$modulesStmt->execute([':tid' => $trackId]);
$modules = $modulesStmt->fetchAll(PDO::FETCH_ASSOC);

// Fetch completed modules
$compStmt = $db->prepare("SELECT module_id FROM trn_module_progress WHERE enrollment_id = :eid AND status = 'completed'");
$compStmt->execute([':eid' => $enrollmentId]);
$completedModuleIds = $compStmt->fetchAll(PDO::FETCH_COLUMN);

// Determine active module
if ($moduleId === 0 && !empty($modules)) {
    // Find first incomplete module
    foreach ($modules as $m) {
        if (!in_array($m['id'], $completedModuleIds)) {
            $moduleId = $m['id'];
            break;
        }
    }
    // If all completed, default to last module
    if ($moduleId === 0) {
        $moduleId = end($modules)['id'];
    }
    header("Location: lms_viewer.php?course_id=$trackId&lesson_id=$moduleId");
    exit;
}

// Find current module data
$currentModule = null;
$previousModuleCompleted = true; // First module is always unlocked

foreach ($modules as $idx => $m) {
    if ($m['id'] == $moduleId) {
        $currentModule = $m;
        // Check if previous exists and is completed
        if ($idx > 0) {
            $prevModId = $modules[$idx - 1]['id'];
            $previousModuleCompleted = in_array($prevModId, $completedModuleIds);
        }
        break;
    }
}

if (!$currentModule) {
    echo "Module not found.";
    exit;
}

// Enforce linear progression
if (!$previousModuleCompleted) {
    echo "You must complete previous lessons before accessing this one. <a href='lms_viewer.php?course_id=$trackId'>Go Back</a>";
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($track['title'] ?? 'Course Viewer'); ?> - LMS</title>
    <!-- Standard Boostrap -->
    <link href="assets/vendor/css/core.css" rel="stylesheet">
    <link href="assets/vendor/css/theme-default.css" rel="stylesheet">
    <link href="assets/vendor/fonts/boxicons.css" rel="stylesheet">
    <style>
        :root {
            --primary: #696cff;
            --success: #71dd37;
            --gray-100: #f5f5f9;
            --gray-300: #d9dee3;
            --gray-600: #697a8d;
        }
        body { margin: 0; font-family: 'Public Sans', sans-serif; display: flex; height: 100vh; background: #fff; overflow: hidden; }
        
        /* Sidebar Styles */
        .lms-sidebar { width: 320px; background: var(--gray-100); border-right: 1px solid var(--gray-300); overflow-y: auto; display: flex; flex-direction: column; }
        .sidebar-header { padding: 20px; background: #fff; border-bottom: 1px solid var(--gray-300); }
        .sidebar-body { padding: 20px; flex-grow: 1; overflow-y: auto; }
        
        .lesson-item { padding: 15px; margin-bottom: 10px; border-radius: 8px; background: white; border: 1px solid var(--gray-300); display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s; text-decoration: none; color: inherit; }
        .lesson-item.active { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(105, 108, 255, 0.2); }
        .lesson-item.locked { opacity: 0.6; cursor: not-allowed; background: var(--gray-100); }
        .lesson-item:hover:not(.locked) { border-color: var(--primary); color: inherit;}
        
        .status-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; flex-shrink:0; }
        .completed .status-icon { background: var(--success); color: white; }
        .unlocked .status-icon { background: white; border: 2px solid var(--primary); color: var(--primary); }
        .locked .status-icon { background: var(--gray-300); color: white; }
        
        /* Content Area Styles */
        .lms-content { flex: 1; overflow-y: auto; background: white; display: flex; flex-direction: column;}
        .content-nav { padding: 15px 30px; border-bottom: 1px solid var(--gray-300); display: flex; justify-content: space-between; align-items: center; }
        .content-body { max-width: 900px; margin: 0 auto; padding: 40px; line-height: 1.6; color: var(--gray-600); width: 100%; }
        
        .video-container { position: relative; padding-bottom: 56.25%; height: 0; margin-bottom: 30px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .video-container iframe, .video-container video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
        
        .btn-complete { margin-top: 40px; padding: 15px 30px; background: var(--success); color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold; width: 100%; transition: transform 0.2s, background 0.2s;}
        .btn-complete:hover { background: #5bbd2a; transform: translateY(-2px); }
    </style>
</head>
<body>

    <!-- Sidebar: Lesson List -->
    <aside class="lms-sidebar">
        <div class="sidebar-header">
            <a href="discipleshipDash.php" class="btn btn-sm btn-outline-secondary mb-3"><i class="bx bx-arrow-back me-1"></i> Back to Dashboard</a>
            <h5 class="fw-bold mb-1 text-truncate" title="<?php echo htmlspecialchars($track['title']); ?>"><?php echo htmlspecialchars($track['title']); ?></h5>
            <div class="progress mt-2" style="height: 6px;">
                <?php 
                    $pct = count($modules) > 0 ? (count($completedModuleIds) / count($modules)) * 100 : 0;
                ?>
                <div class="progress-bar bg-success" role="progressbar" style="width: <?php echo $pct; ?>%"></div>
            </div>
        </div>
        
        <div class="sidebar-body">
            <?php 
            $isLocked = false;
            foreach ($modules as $idx => $m): 
                $isCompleted = in_array($m['id'], $completedModuleIds);
                $isActive = ($m['id'] == $currentModule['id']);
                
                // Determine CSS Classes
                $classes = [];
                if ($isActive) $classes[] = 'active';
                if ($isCompleted) $classes[] = 'completed';
                if ($isLocked) $classes[] = 'locked';
                if (!$isCompleted && !$isLocked) $classes[] = 'unlocked';
                
                // Determine icon
                if ($isCompleted) {
                    $icon = '<i class="bx bx-check"></i>';
                } elseif ($isLocked) {
                    $icon = '<i class="bx bx-lock-alt"></i>';
                } else {
                    $icon = $idx + 1;
                }
                
                // Link
                $href = $isLocked ? '#' : "lms_viewer.php?course_id=$trackId&lesson_id={$m['id']}";
            ?>
            
            <a href="<?php echo $href; ?>" class="lesson-item <?php echo implode(' ', $classes); ?>">
                <div class="status-icon"><?php echo $icon; ?></div>
                <div class="lesson-title fw-semibold text-truncate" style="font-size:0.95rem;"><?php echo htmlspecialchars($m['title']); ?></div>
            </a>
            
            <?php 
                // If this module isn't completed, lock all subsequent modules
                if (!$isCompleted) {
                    $isLocked = true;
                }
            endforeach; 
            ?>
        </div>
    </aside>

    <!-- Main Content Area -->
    <main class="lms-content">
        <div class="content-nav">
            <span class="fw-bold text-dark"><i class="bx <?php echo $currentModule['content_type'] == 'video' ? 'bx-play-circle' : 'bx-file'; ?> text-primary me-2"></i> <?php echo htmlspecialchars($currentModule['title']); ?></span>
        </div>
        
        <div class="content-body">
            <h2 class="mb-4 text-dark fw-bold"><?php echo htmlspecialchars($currentModule['title']); ?></h2>

            <?php if ($currentModule['content_type'] == 'video' && !empty($currentModule['media_url'])): ?>
                <?php 
                    $url = $currentModule['media_url'];
                    $isYoutube = strpos($url, 'youtube.com') !== false || strpos($url, 'youtu.be') !== false;
                ?>
                <div class="video-container">
                    <?php if ($isYoutube): ?>
                        <?php 
                            // Convert standard watch?v= link to embed link
                            $embedUrl = $url;
                            if (preg_match('/[\\?\\&]v=([^\\?\\&]+)/', $url, $matches)) {
                                $embedUrl = 'https://www.youtube.com/embed/' . $matches[1];
                            }
                        ?>
                        <iframe src="<?php echo htmlspecialchars($embedUrl); ?>" frameborder="0" allowfullscreen></iframe>
                    <?php else: ?>
                        <!-- Standard HTML5 Video for mp4 -->
                        <video controls controlsList="nodownload">
                            <source src="<?php echo htmlspecialchars($url); ?>" type="video/mp4">
                            Your browser does not support HTML video.
                        </video>
                    <?php endif; ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($currentModule['content_type'])): ?>
                <div class="text-content fs-5 mb-5">
                    <?php 
                        // If there is an assignment instruction it would go here.
                        if ($currentModule['requires_practical']) {
                            echo '<div class="alert alert-info"><i class="bx bx-info-circle me-2"></i> This module requires a practical assignment. You will need to submit a link to complete this lesson.</div>';
                        }
                    ?>
                </div>
            <?php endif; ?>

            <!-- Completion Form -->
            <form method="POST">
                <input type="hidden" name="action" value="complete_lesson">
                <input type="hidden" name="module_id" value="<?php echo $currentModule['id']; ?>">
                
                <?php if ($currentModule['requires_practical']): ?>
                    <!-- If practical required, ideally we need them to submit a URL -->
                    <div class="mb-3">
                        <label class="form-label fw-bold">Assignment Link</label>
                        <input type="url" name="assignment_url" class="form-control form-control-lg" placeholder="https://..." required>
                    </div>
                <?php endif; ?>
                
                <button type="submit" class="btn-complete d-flex justify-content-center align-items-center gap-2">
                    <i class="bx bx-check-circle fs-4"></i> Mark as Complete & Continue
                </button>
            </form>

        </div>
    </main>

</body>
</html>

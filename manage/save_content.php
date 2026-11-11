<?php
require '../includes/connection.php';
include '../includes/sweetalert.html';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $material_id = isset($_POST['material_id']) ? intval($_POST['material_id']) : 0;
    $title = isset($_POST['material_title']) ? trim($_POST['material_title']) : '';
    $type = isset($_POST['material_type']) ? intval($_POST['material_type']) : 0;
    $content = isset($_POST['content']) ? $_POST['content'] : '';
    $user_id = isset($_COOKIE['jen_idd']) ? intval($_COOKIE['jen_idd']) : 1;

    if (empty($title) || empty($content) || empty($type)) {
        echo "<script>
            document.addEventListener('DOMContentLoaded', function() {
                Swal.fire({
                    title: 'Missing Fields',
                    text: 'Please fill in all fields before saving.',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#ffc107'
                });
                setTimeout(function() {
                    window.history.back();
                }, 3000);
            });
        </script>";
        exit;
    }

    try {
        if ($material_id > 0) {
            $stmt = $db->prepare("UPDATE materials SET title = :title, content = :content, type = :type WHERE id = :id");
            $stmt->execute([
                ':title' => $title,
                ':content' => $content,
                ':type' => $type,
                ':id' => $material_id
            ]);
            $msg = 'Material Updated Successfully';
        } else {
            $stmt = $db->prepare("INSERT INTO materials (user_id, title, content, type, created_at) VALUES (:user_id, :title, :content, :type, NOW())");
            $stmt->execute([
                ':user_id' => $user_id,
                ':title' => $title,
                ':content' => $content,
                ':type' => $type
            ]);
            $msg = 'Material Saved Successfully';
        }

        echo "<script>
            document.addEventListener('DOMContentLoaded', function() {
                Swal.fire({
                    title: " . json_encode($msg) . ",
                    text: 'Redirecting to Discipleship Dashboard...',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#57a94f'
                });
                setTimeout(function() {
                    window.location.href = '../discipleshipDash.php';
                }, 2000);
            });
        </script>";
    } catch (PDOException $e) {
        echo "<script>
            document.addEventListener('DOMContentLoaded', function() {
                Swal.fire({
                    title: 'Database Error',
                    text: " . json_encode($e->getMessage()) . ",
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#57a94f'
                });
                setTimeout(function() {
                    window.history.back();
                }, 5000);
            });
        </script>";
    }
} else {
    header("Location: ../discipleshipDash.php");
    exit;
}
?>

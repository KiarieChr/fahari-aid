<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Test SweetAlert2</title>
  <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
</head>
<body>
  
  <!-- Place your content here -->

  <!-- SweetAlert2 CDN -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script>
    // Wait for document ready (this is a simple alternative)
    document.addEventListener('DOMContentLoaded', function() {
      Swal.fire({
        title: 'Login Success',
        text: 'Successfully logged in. Redirecting in 5 seconds...',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#57a94f'
      }).then(function() {
        window.location.href = 'index.php';
      });

      // Fallback redirect if the user doesn't tap "OK"
      setTimeout(function() {
        window.location.href = 'index.php';
      }, 5000);
    });
  </script>
</body>
</html>

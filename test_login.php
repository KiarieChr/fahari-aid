<!DOCTYPE html>
<html>
<head>
    <title>Test Login API</title>
    <style>
        body { font-family: sans-serif; margin: 40px; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 8px; box-sizing: border-box; }
        button { padding: 10px 15px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        pre { background: #f4f4f4; padding: 15px; overflow-x: auto; border: 1px solid #ddd; }
    </style>
</head>
<body>

<div class="container">
    <h2>Test Login API</h2>
    <div class="form-group">
        <label>Email:</label>
        <input type="email" id="email" value="admin@jesusenthroned.net" />
    </div>
    <div class="form-group">
        <label>Password:</label>
        <input type="password" id="password" value="password123" />
    </div>
    <button onclick="testLogin()">Test Login</button>

    <h3>Raw Response:</h3>
    <pre id="output">Waiting for test...</pre>
</div>

<script>
async function testLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const output = document.getElementById('output');

    output.innerText = "Sending request...";

    try {
        const response = await fetch('api/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const status = response.status;
        const text = await response.text();

        let formatted = text;
        try {
            formatted = JSON.stringify(JSON.parse(text), null, 2);
        } catch(e) {}

        output.innerText = `HTTP Status: ${status}\n\n${formatted}`;
    } catch (err) {
        output.innerText = `Error: ${err.message}`;
    }
}
</script>

</body>
</html>

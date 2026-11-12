# JEN Website + PHP Backend Integration

This document explains the integration between the React frontend (JEN-Website) and the PHP backend (jesusenthroned_net).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│                   (JEN-Website - Vite)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ AuthContext │  │ API Service  │  │  Auth Pages         │ │
│  │ (JWT state) │  │  (Axios)     │  │  (Login/Register)   │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      PHP Backend                             │
│               (jesusenthroned_net/pages/api)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ CORS Config │  │ JWT Library  │  │  Auth Middleware    │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┤
│  │ Auth Endpoints: /api/auth/login.php                      │
│  │                 /api/auth/register.php                   │
│  │                 /api/auth/me.php                         │
│  │                 /api/auth/refresh.php                    │
│  │                 /api/auth/logout.php                     │
│  └──────────────────────────────────────────────────────────┤
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  MySQL Database │
                    │   (jen)         │
                    └─────────────────┘
```

## Setup Instructions

### 1. Database Setup

Run the migration SQL to create required tables:

```bash
mysql -u root -p jen < jesusenthroned_net/pages/api/migrations/001_auth_tables.sql
```

Or execute the SQL manually in phpMyAdmin.

### 2. PHP Backend Setup

1. Ensure the PHP project is accessible via local server (XAMPP/WAMP):
   ```
   http://localhost/jesusenthroned_net/
   ```

2. Update JWT secret in `pages/api/config.php`:
   ```php
   define('JWT_SECRET', 'your-very-secure-random-secret-key');
   ```

3. Configure allowed CORS origins in `pages/api/config.php`:
   ```php
   $allowed_origins = [
       'http://localhost:5173',
       'http://localhost:5174',
       'https://yourdomain.com'  // Production
   ];
   ```

### 3. React Frontend Setup

1. Install dependencies:
   ```bash
   cd JEN-Website
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Update `.env.local` with your API URL:
   ```
   VITE_API_URL=http://localhost/jesusenthroned_net/pages/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Authentication Flow

### Login Flow
1. User enters credentials on `/login` page
2. React sends POST to `/api/auth/login.php`
3. PHP validates credentials, generates JWT + refresh token
4. Tokens stored in localStorage
5. User redirected to `/portal/dashboard`

### Token Refresh Flow
1. Access token expires (24 hours)
2. API returns 401
3. React interceptor automatically calls `/api/auth/refresh.php`
4. New tokens received and stored
5. Original request retried

### Protected Routes
```jsx
// In App.jsx
<Route path="/portal" element={
  <ProtectedRoute>
    <PortalLayout />
  </ProtectedRoute>
}>
  <Route path="dashboard" element={<Dashboard />} />
</Route>
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login.php` | Login user | No |
| POST | `/api/auth/register.php` | Register new user | No |
| GET | `/api/auth/me.php` | Get current user | Yes |
| POST | `/api/auth/refresh.php` | Refresh tokens | No (uses refresh token) |
| POST | `/api/auth/logout.php` | Logout user | Yes |

### Request Format

```json
// Login
POST /api/auth/login.php
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "abc123...",
    "token_type": "Bearer",
    "expires_in": 86400,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstname": "John",
      "lastname": "Doe"
    }
  }
}
```

### Protected Endpoint Example

```php
<?php
require_once __DIR__ . '/middleware.php';

// Authenticate user
$user = authenticate();

// $user now contains authenticated user data
// Continue with protected logic...
```

## Files Created/Modified

### PHP Backend (jesusenthroned_net)
- `pages/api/config.php` - CORS, JWT config, helpers
- `pages/api/jwt.php` - JWT token generation/validation
- `pages/api/middleware.php` - Auth middleware
- `pages/api/auth/login.php` - Login endpoint
- `pages/api/auth/register.php` - Registration endpoint
- `pages/api/auth/me.php` - Get current user
- `pages/api/auth/refresh.php` - Token refresh
- `pages/api/auth/logout.php` - Logout endpoint
- `pages/api/migrations/001_auth_tables.sql` - Database migration

### React Frontend (JEN-Website)
- `src/services/api.js` - Axios instance with interceptors
- `src/services/authService.js` - Auth API functions
- `src/context/AuthContext.jsx` - Auth state management
- `src/components/ProtectedRoute.jsx` - Route protection
- `src/Portal/pages/auth/Login.jsx` - Login page
- `src/Portal/pages/auth/Register.jsx` - Registration page
- `src/Portal/pages/auth/Auth.css` - Auth styles
- `.env.example` - Environment template
- `src/App.jsx` - Updated with auth routes

## Security Considerations

1. **JWT Secret**: Change the default JWT_SECRET in production
2. **HTTPS**: Use HTTPS in production for secure token transmission
3. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for higher security)
4. **CORS**: Only allow specific origins in production
5. **Password Hashing**: Uses PASSWORD_DEFAULT (bcrypt)

## Testing

1. Start PHP server (XAMPP/WAMP)
2. Start React dev server: `npm run dev`
3. Navigate to `http://localhost:5174/login`
4. Login with existing user credentials
5. Verify redirect to dashboard

## Troubleshooting

### CORS Errors
- Check `$allowed_origins` in `config.php`
- Ensure PHP server is running
- Check browser console for specific CORS error

### 401 Unauthorized
- Token may be expired
- Check localStorage for `jen_access_token`
- Verify JWT_SECRET matches between requests

### Database Connection
- Verify credentials in `includes/connection.php`
- Ensure MySQL server is running
- Run migration SQL if tables don't exist

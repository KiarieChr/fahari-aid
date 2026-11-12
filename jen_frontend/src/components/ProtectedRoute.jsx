import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Wrapper for routes that require authentication
 * 
 * Usage:
 * <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 * 
 * With required permissions:
 * <Route path="/admin" element={<ProtectedRoute requiredPermissions={['manage_users']}><Admin /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ 
    children, 
    requiredPermissions = [], 
    requireAll = false 
}) => {
    const { isAuthenticated, loading, hasPermission, hasAllPermissions, hasAnyPermission } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="auth-loading">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check permissions if specified
    if (requiredPermissions.length > 0) {
        const hasAccess = requireAll 
            ? hasAllPermissions(requiredPermissions)
            : hasAnyPermission(requiredPermissions);
        
        if (!hasAccess) {
            // User is authenticated but lacks permission
            return (
                <div className="access-denied">
                    <h2>Access Denied</h2>
                    <p>You don't have permission to access this page.</p>
                </div>
            );
        }
    }

    return children;
};

export default ProtectedRoute;

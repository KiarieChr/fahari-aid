import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { register } from '../../../services/authService';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        phone_no: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: '',
        location: '',
        emp_status: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        setError('');

        try {
            const result = await register({
                phone_no: formData.phone_no,
                email: formData.email,
                password: formData.password,
                dob: formData.dob,
                location: formData.location,
                emp_status: formData.emp_status
            });
            
            if (result.success) {
                navigate('/portal/dashboard', { replace: true });
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
        
        setIsSubmitting(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-card auth-card-register">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <span className="logo-text">J.E.N</span>
                        </div>
                        <h1>Create Account</h1>
                        <p>Join Jesus Enthroned Network</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone_no">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9.366 10.682a10.556 10.556 0 003.952 3.952l.884-1.238a1 1 0 011.294-.296 11.422 11.422 0 004.583 1.364 1 1 0 01.921.997v4.462a1 1 0 01-.898.995c-.53.055-1.064.082-1.602.082C9.94 21 3 14.06 3 5.5c0-.538.027-1.072.082-1.602A1 1 0 014.077 3h4.462a1 1 0 01.997.921A11.422 11.422 0 0010.9 8.504a1 1 0 01-.296 1.294l-1.238.884z"/>
                                    </svg>
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    id="phone_no"
                                    name="phone_no"
                                    value={formData.phone_no}
                                    onChange={handleChange}
                                    placeholder="e.g. 0712345678"
                                    required
                                />
                                <small className="form-hint">Use the phone number registered by your referrer</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 3h18a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z"/>
                                    </svg>
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 8h2a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h2V7a6 6 0 1112 0v1zm-2 0V7a4 4 0 10-8 0v1h8z"/>
                                    </svg>
                                    Password *
                                </label>
                                <div className="password-input">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 characters"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 8h2a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h2V7a6 6 0 1112 0v1zm-2 0V7a4 4 0 10-8 0v1h8z"/>
                                    </svg>
                                    Confirm Password *
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="dob">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 1v2h6V1h2v2h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h4V1h2zm11 9H4v9h16v-9zm-5 2v2h2v-2h-2zM4 5v3h16V5H4z"/>
                                    </svg>
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    id="dob"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 20.9l4.95-4.95a7 7 0 10-9.9 0L12 20.9zm0 2.828l-6.364-6.364a9 9 0 1112.728 0L12 23.728zM12 13a2 2 0 100-4 2 2 0 000 4z"/>
                                    </svg>
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Nairobi"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="emp_status">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 5V2a1 1 0 011-1h8a1 1 0 011 1v3h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1h4zm2-2v2h6V3H9z"/>
                                </svg>
                                Employment Status
                            </label>
                            <select
                                id="emp_status"
                                name="emp_status"
                                value={formData.emp_status}
                                onChange={handleChange}
                            >
                                <option value="">Select status</option>
                                <option value="Employed">Employed</option>
                                <option value="Self-Employed">Self-Employed</option>
                                <option value="Student">Student</option>
                                <option value="Unemployed">Unemployed</option>
                                <option value="Retired">Retired</option>
                            </select>
                        </div>

                        <button 
                            type="submit" 
                            className="auth-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner"></span>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

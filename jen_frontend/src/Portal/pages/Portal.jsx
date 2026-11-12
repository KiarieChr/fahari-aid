import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register } from '../../services/authService';
import Navbar from '../../website/components/Navbar';
import Footer from '../../website/components/Footer';

const Portal = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Login form state
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    
    // Register form state
    const [registerData, setRegisterData] = useState({
        phone_no: '',
        email: '',
        dob: '',
        location: '',
        emp_status: '',
        password: '',
        confirmPassword: ''
    });
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const result = await login(loginData.email, loginData.password);
            if (result.success) {
                navigate('/portal/dashboard');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (registerData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        setIsLoading(true);
        
        try {
            const result = await register({
                phone_no: registerData.phone_no,
                email: registerData.email,
                password: registerData.password,
                dob: registerData.dob,
                location: registerData.location,
                emp_status: registerData.emp_status
            });
            
            if (result.success) {
                navigate('/portal/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <Navbar />
            
            <section style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                padding: '6rem 1rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background glow effects */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(34, 193, 230, 0.05) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-10%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(34, 193, 230, 0.03) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}></div>

                <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div className="portal-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '4rem',
                        alignItems: 'center'
                    }}>
                        {/* Left: Login/Register Card */}
                        <div style={{
                            background: 'white',
                            padding: '3rem 2.5rem',
                            borderRadius: '24px',
                            boxShadow: '0 20px 40px -15px rgba(18, 13, 32, 0.08)',
                            border: '1px solid rgba(18, 13, 32, 0.04)',
                            textAlign: 'left'
                        }}>
                            {/* Header */}
                            <div style={{ marginBottom: '2rem' }}>
                                <span style={{
                                    color: '#22c1e6',
                                    fontSize: '0.75rem',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    display: 'block',
                                    marginBottom: '0.5rem'
                                }}>
                                    MEMBER PORTAL
                                </span>
                                <h2 style={{ fontSize: '2rem', fontWeight: '850', color: '#120D20', margin: 0, letterSpacing: '-0.02em' }}>
                                    {activeTab === 'login' ? 'Welcome Back' : activeTab === 'register' ? 'Join the Network' : 'Reset Password'}
                                </h2>
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <div style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    padding: '0.85rem 1rem',
                                    borderRadius: '10px',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}
                            
                            {/* Switch Tabs */}
                            {activeTab !== 'forgot-password' && (
                                <div style={{
                                    display: 'flex',
                                    background: '#f1f5f9',
                                    padding: '0.35rem',
                                    borderRadius: '12px',
                                    marginBottom: '2rem'
                                }}>
                                    <button
                                        onClick={() => { setActiveTab('login'); setError(''); }}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: activeTab === 'login' ? 'white' : 'transparent',
                                            color: activeTab === 'login' ? '#120D20' : '#64748b',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: activeTab === 'login' ? '0 4px 10px rgba(0,0,0,0.04)' : 'none'
                                        }}
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('register'); setError(''); }}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: activeTab === 'register' ? 'white' : 'transparent',
                                            color: activeTab === 'register' ? '#120D20' : '#64748b',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: activeTab === 'register' ? '0 4px 10px rgba(0,0,0,0.04)' : 'none'
                                        }}
                                    >
                                        Register
                                    </button>
                                </div>
                            )}

                            {/* Login Form */}
                            {activeTab === 'login' && (
                                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#120D20' }}>Email Address</label>
                                        <input 
                                            type="email" 
                                            placeholder="your@email.com" 
                                            value={loginData.email}
                                            onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                                            required
                                            style={{
                                                padding: '0.85rem 1rem', 
                                                borderRadius: '10px', 
                                                border: '1px solid #e2e8f0', 
                                                background: '#f8fafc', 
                                                outline: 'none',
                                                fontSize: '0.95rem',
                                                transition: 'all 0.2s'
                                            }}
                                            onFocus={e => e.currentTarget.style.borderColor = '#22c1e6'}
                                            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#120D20' }}>Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <input 
                                                type={showPassword ? 'text' : 'password'} 
                                                placeholder="••••••••" 
                                                value={loginData.password}
                                                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                                required
                                                style={{
                                                    width: '100%', 
                                                    padding: '0.85rem 2.5rem 0.85rem 1rem', 
                                                    borderRadius: '10px', 
                                                    border: '1px solid #e2e8f0', 
                                                    background: '#f8fafc', 
                                                    outline: 'none',
                                                    fontSize: '0.95rem',
                                                    boxSizing: 'border-box'
                                                }} 
                                                onFocus={e => e.currentTarget.style.borderColor = '#22c1e6'}
                                                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                            />
                                            <span 
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.6 }}
                                            >
                                                {showPassword ? '🙈' : '👁️'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('forgot-password')}
                                            style={{ background: 'transparent', border: 'none', color: '#22c1e6', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        style={{
                                            background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, #120D20 0%, #22c1e6 100%)',
                                            color: 'white',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            fontWeight: '800',
                                            border: 'none',
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            fontSize: '0.95rem',
                                            marginTop: '0.5rem',
                                            boxShadow: '0 10px 20px -5px rgba(34, 193, 230, 0.25)',
                                            transition: 'all 0.25s'
                                        }}
                                        onMouseEnter={e => { if(!isLoading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                                        onMouseLeave={e => { if(!isLoading) e.currentTarget.style.transform = 'translateY(0)' }}
                                    >
                                        {isLoading ? 'Signing in...' : 'Sign In'}
                                    </button>
                                </form>
                            )}

                            {/* Forgot Password */}
                            {activeTab === 'forgot-password' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: '1.5', margin: 0 }}>
                                        Enter your email below and we'll send you instructions to reset your password.
                                    </p>
                                    <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#120D20' }}>Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="your@email.com"
                                                required
                                                style={{
                                                    padding: '0.85rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    background: '#f8fafc',
                                                    outline: 'none',
                                                    fontSize: '0.95rem',
                                                    width: '100%',
                                                    boxSizing: 'border-box'
                                                }}
                                                onFocus={e => e.currentTarget.style.borderColor = '#22c1e6'}
                                                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            style={{
                                                background: 'linear-gradient(135deg, #120D20 0%, #22c1e6 100%)',
                                                color: 'white',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                fontWeight: '800',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.95rem',
                                                marginTop: '0.5rem',
                                                boxShadow: '0 10px 20px -5px rgba(34, 193, 230, 0.25)'
                                            }}
                                        >
                                            Send Reset Instructions
                                        </button>
                                    </form>
                                    <div style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={() => setActiveTab('login')}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#22c1e6',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                fontWeight: '700'
                                            }}
                                        >
                                            ← Back to login
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Register Form */}
                            {activeTab === 'register' && (
                                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Phone Number */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#120D20' }}>Phone Number</label>
                                        <input 
                                            type="tel" 
                                            placeholder="e.g. 0700000000" 
                                            value={registerData.phone_no}
                                            onChange={(e) => setRegisterData({...registerData, phone_no: e.target.value})}
                                            required
                                            style={{
                                                padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.95rem'
                                            }} 
                                            onFocus={e => e.currentTarget.style.borderColor = '#22c1e6'}
                                            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#120D20' }}>Email Address</label>
                                        <input 
                                            type="email" 
                                            placeholder="your@email.com" 
                                            value={registerData.email}
                                            onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                            required
                                            style={{
                                                padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.95rem'
                                            }} 
                                            onFocus={e => e.currentTarget.style.borderColor = '#22c1e6'}
                                            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>

                                    {/* Date Of Birth */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#120D20' }}>Date Of Birth</label>
                                        <input 
                                            type="date" 
                                            value={registerData.dob}
                                            onChange={(e) => setRegisterData({...registerData, dob: e.target.value})}
                                            required
                                            style={{
                                                padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.95rem', color: '#64748b'
                                            }} 
                                            onFocus={e => e.currentTarget.style.borderColor = '#22c1e6'}
                                            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>

                                    {/* Area of Residence */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#120D20' }}>Area of Residence</label>
                                        <input 
                                            type="text" 
                                            placeholder="Enter your residence city or town" 
                                            value={registerData.location}
                                            onChange={(e) => setRegisterData({...registerData, location: e.target.value})}
                                            required
                                            style={{
                                                padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.95rem'
                                            }} 
                                            onFocus={e => e.currentTarget.style.borderColor = '#22c1e6'}
                                            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>

                                    {/* Employment Status */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#120D20' }}>Employment Status</label>
                                        <select 
                                            value={registerData.emp_status}
                                            onChange={(e) => setRegisterData({...registerData, emp_status: e.target.value})}
                                            required
                                            style={{
                                                padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.95rem', color: '#64748b'
                                            }}
                                            onFocus={e => e.currentTarget.style.borderColor = '#22c1e6'}
                                            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                        >
                                            <option value="">Select Employment Status</option>
                                            <option value="Employed">Employed</option>
                                            <option value="Self-Employed">Self-Employed</option>
                                            <option value="Student">Student</option>
                                            <option value="Unemployed">Unemployed</option>
                                        </select>
                                    </div>

                                    {/* Password */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#120D20' }}>Password</label>
                                        <input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={registerData.password}
                                            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                            required
                                            style={{
                                                padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.95rem'
                                            }} 
                                            onFocus={e => e.currentTarget.style.borderColor = '#22c1e6'}
                                            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#120D20' }}>Confirm Password</label>
                                        <input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={registerData.confirmPassword}
                                            onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                                            required
                                            style={{
                                                padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.95rem'
                                            }} 
                                            onFocus={e => e.currentTarget.style.borderColor = '#22c1e6'}
                                            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569', marginTop: '0.5rem' }}>
                                        <input type="checkbox" id="terms" required style={{ accentColor: '#22c1e6' }} />
                                        <label htmlFor="terms">I agree to the <span style={{ fontWeight: '700', color: '#120D20' }}>Privacy Policy & Terms</span></label>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        style={{
                                            background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, #120D20 0%, #22c1e6 100%)',
                                            color: 'white',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            fontWeight: '800',
                                            border: 'none',
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            fontSize: '0.95rem',
                                            marginTop: '0.5rem',
                                            boxShadow: '0 10px 20px -5px rgba(34, 193, 230, 0.25)',
                                            transition: 'all 0.25s'
                                        }}
                                    >
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Right: Dashboard Features Mockup Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #120D20 0%, #0d091a 100%)',
                            padding: '3rem 2.5rem',
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            textAlign: 'left',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '-20%',
                                right: '-20%',
                                width: '300px',
                                height: '300px',
                                background: 'radial-gradient(circle, rgba(34, 193, 230, 0.12) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            }}></div>

                            <h3 style={{ fontSize: '2rem', fontWeight: '850', color: 'white', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                                Your Personal Portal
                            </h3>
                            <p style={{ color: '#94a3b8', marginBottom: '2.5rem', fontSize: '1.025rem', lineHeight: 1.6 }}>
                                Log in to access all church resources, events calendar, giving history, cell group communication, and prophetic study plans.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                {[
                                    { icon: '🎧', title: 'Sermon Library', desc: 'Watch, listen and read study outlines.' },
                                    { icon: '📅', title: 'Event Registration', desc: 'Book tickets and schedule calendar reminders.' },
                                    { icon: '❤', title: 'Giving History', desc: 'Securely manage tithes, pledges and receipts.' },
                                    { icon: '🏠', title: 'Cell Connection', desc: 'Engage directly with your fellowship hub group.' },
                                ].map((feature, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        transition: 'all 0.25s'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.borderColor = '#22c1e6';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    }}
                                    >
                                        <div style={{
                                            width: '36px', height: '36px',
                                            borderRadius: '8px',
                                            background: 'rgba(34, 193, 230, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#22c1e6', marginBottom: '0.85rem',
                                            fontSize: '1.25rem'
                                        }}>
                                            {feature.icon}
                                        </div>
                                        <h4 style={{ fontWeight: '800', color: 'white', marginBottom: '0.4rem', fontSize: '0.95rem' }}>{feature.title}</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4, margin: 0 }}>{feature.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                background: 'rgba(34, 193, 230, 0.08)',
                                padding: '1.25rem 1.5rem',
                                borderRadius: '16px',
                                fontSize: '0.85rem',
                                color: '#22c1e6',
                                border: '1px solid rgba(34, 193, 230, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span>💡</span>
                                <span><strong>Covenant Security:</strong> All personal data is encrypted and handled in strict alignment with Article VIII of the Constitution.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                @media (max-width: 968px) {
                    .portal-grid {
                        grid-template-columns: 1fr !important;
                        gap: 3rem !important;
                    }
                }
            `}</style>
            
            <Footer />
        </div>
    );
};

export default Portal;

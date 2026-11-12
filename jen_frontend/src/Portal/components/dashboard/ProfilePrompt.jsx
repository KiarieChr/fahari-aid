import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const ProfilePrompt = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    // Logic to check if profile is complete
    const isComplete =
        user.profile?.full_name &&
        user.date_of_birth &&
        user.residence;

    if (isComplete) return null;

    return (
        <div className="profile-prompt-container" style={{
            background: 'linear-gradient(135deg, rgba(34, 193, 230, 0.1), rgba(16, 185, 129, 0.1))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(34, 193, 230, 0.2)',
            borderRadius: '1.25rem',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            animation: 'slideIn 0.5s ease-out',
            boxShadow: '0 8px 32px rgba(34, 193, 230, 0.1)'
        }}>
            <style>{`
                @media (max-width: 768px) {
                    .profile-prompt-container {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        padding: 1.25rem !important;
                        gap: 1rem !important;
                    }
                    .profile-prompt-container button {
                        width: 100% !important;
                        text-align: center !important;
                    }
                }
            `}</style>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '1rem',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(34, 193, 230, 0.3)'
                }}>
                    ✨
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-color)' }}>
                        Complete Your Member Profile
                    </h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Hey {user.username}! Help us serve you better by updating your personal details.
                    </p>
                </div>
            </div>

            <button
                onClick={() => navigate('/portal/users/account')}
                style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(34, 193, 230, 0.3)'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(34, 193, 230, 0.4)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 193, 230, 0.3)';
                }}
            >
                Update Profile Now →
            </button>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ProfilePrompt;

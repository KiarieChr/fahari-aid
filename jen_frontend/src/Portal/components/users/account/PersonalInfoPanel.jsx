import React, { useContext } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { ThemeContext } from '../../../../context/ThemeContext';

const InfoField = ({ label, value, icon, isDark }) => (
    <div style={{
        padding: '1.25rem 1.4rem',
        background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
        borderRadius: '0.85rem',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        transition: 'border-color 0.2s ease'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: isDark ? 'rgba(37,99,235,0.18)' : '#eff6ff',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            flexShrink: 0
        }}>
            {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: '0.725rem',
                marginBottom: '0.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '700'
            }}>
                {label}
            </div>
            <div style={{
                color: value ? (isDark ? '#f8fafc' : '#0f172a') : (isDark ? '#64748b' : '#94a3b8'),
                fontWeight: value ? '600' : '400',
                fontSize: '0.925rem',
                fontStyle: value ? 'normal' : 'italic',
                wordBreak: 'break-word',
                lineHeight: 1.4
            }}>
                {value || 'Not provided'}
            </div>
        </div>
    </div>
);

const capitalize = (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === 'boolean') return val ? 'Active' : 'Inactive';
    const str = String(val).trim();
    if (!str) return null;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase().replace(/_/g, ' ');
};

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
};

const PersonalInfoPanel = ({ onEditProfile }) => {
    const { user } = useAuth();
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    if (!user) {
        return (
            <div style={{
                background: isDark ? '#1a1625' : '#ffffff',
                borderRadius: '1.25rem',
                padding: '3rem',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                color: isDark ? '#94a3b8' : '#64748b',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                Loading profile credentials...
            </div>
        );
    }

    const fullName = user.full_name || `${user.first_name || user.firstname || ''} ${user.last_name || user.lastname || ''}`.trim();
    const roleNames = user.role || (user.roles || []).map(r => r.name).join(', ') || (user.is_staff ? 'Administrator' : 'Church Member');
    const phone = user.phone_no || user.phone;

    return (
        <div style={{
            background: isDark ? '#1a1625' : '#ffffff',
            borderRadius: '1.25rem',
            padding: '2rem',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 12px rgba(15,23,42,0.04)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.75rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                paddingBottom: '1.25rem'
            }}>
                <div>
                    <h2 style={{
                        margin: '0 0 0.25rem 0',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '1.25rem',
                        fontWeight: '800'
                    }}>
                        Personal Information & Church Records
                    </h2>
                    <p style={{
                        margin: 0,
                        color: isDark ? '#94a3b8' : '#64748b',
                        fontSize: '0.85rem'
                    }}>
                        Official contact information and fellowship records maintained in the church database
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                        background: isDark ? 'rgba(34,197,94,0.15)' : '#ecfdf5',
                        color: '#22c55e',
                        border: `1px solid ${isDark ? 'rgba(34,197,94,0.25)' : '#a7f3d0'}`,
                        padding: '0.3rem 0.85rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                    }}>
                        <span>●</span>
                        <span>{user.status ? capitalize(user.status) : 'Active Account'}</span>
                    </span>

                    {onEditProfile && (
                        <button
                            onClick={onEditProfile}
                            style={{
                                background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                                color: isDark ? '#f8fafc' : '#0f172a',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                borderRadius: '9999px',
                                padding: '0.35rem 0.85rem',
                                fontSize: '0.775rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ✎ Edit
                        </button>
                    )}
                </div>
            </div>

            {/* Fields Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.15rem'
            }}>
                <InfoField isDark={isDark} icon="👤" label="Full Legal Name" value={fullName} />
                <InfoField isDark={isDark} icon="✉️" label="Email Address" value={user.email} />
                <InfoField isDark={isDark} icon="📞" label="Phone Number" value={phone} />
                <InfoField isDark={isDark} icon="📍" label="Residential Location" value={user.location} />
                <InfoField isDark={isDark} icon="🏠" label="Postal Address" value={user.address} />
                <InfoField isDark={isDark} icon="🎂" label="Date of Birth" value={formatDate(user.dob)} />
                <InfoField isDark={isDark} icon="⚧" label="Gender" value={capitalize(user.gender)} />
                <InfoField isDark={isDark} icon="💍" label="Marital Status" value={capitalize(user.marital)} />
                <InfoField isDark={isDark} icon="🛡️" label="Ministry Role" value={roleNames} />
                <InfoField isDark={isDark} icon="🏘️" label="Cell Fellowship / Member ID" value={user.cell_code || (user.member_id ? `Member ID #${user.member_id}` : null)} />
                <InfoField isDark={isDark} icon="💼" label="Employment Status" value={capitalize(user.emp_status)} />
                <InfoField isDark={isDark} icon="🗓️" label="Member Since" value={formatDate(user.date || user.created_at || user.last_login) || 'November 2026'} />
            </div>

            {/* Bio & Calling Section */}
            <div style={{
                marginTop: '1.75rem',
                padding: '1.4rem 1.6rem',
                background: isDark ? 'rgba(37,99,235,0.06)' : '#f0f9ff',
                borderRadius: '1rem',
                border: `1px solid ${isDark ? 'rgba(37,99,235,0.18)' : '#bae6fd'}`
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.45rem'
                }}>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#0284c7',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Spiritual Calling & Bio Statement
                    </span>
                    {onEditProfile && (
                        <button
                            onClick={onEditProfile}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#0284c7',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ✎ Update
                        </button>
                    )}
                </div>
                <p style={{
                    margin: 0,
                    color: isDark ? '#e2e8f0' : '#0f172a',
                    fontSize: '0.925rem',
                    fontStyle: 'italic',
                    lineHeight: 1.6
                }}>
                    "{user.bio || 'Anointed servant of God devoted to Kingdom service and fellowship.'}"
                </p>
            </div>
        </div>
    );
};

export default PersonalInfoPanel;

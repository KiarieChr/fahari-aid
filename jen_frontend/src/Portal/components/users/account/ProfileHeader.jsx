import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { ThemeContext } from '../../../../context/ThemeContext';
import { getMediaUrl } from '../../../../services/api';

// Helper: format a date string like "September 10th, 1992"
const formatDOB = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const day = d.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st'
        : day === 2 || day === 22 ? 'nd'
        : day === 3 || day === 23 ? 'rd' : 'th';
    return `${monthNames[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
};

// Helper: format joined date
const formatJoined = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
};

const ProfileHeader = ({ onEditProfilePic, onEditProfile }) => {
    const { user } = useAuth();
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const fullName = user?.full_name || `${user?.first_name || user?.firstname || ''} ${user?.last_name || user?.lastname || ''}`.trim() || user?.email?.split('@')[0] || 'User Profile';

    const rawPhoto = user?.photo || user?.profile_picture || user?.avatar;
    const avatarUrl = getMediaUrl(rawPhoto);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [avatarUrl]);

    const initials = fullName
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || '??';

    const bio = user?.bio || 'Anointed servant of God devoted to Kingdom service and fellowship.';
    const location = user?.location || 'Nairobi, Kenya';
    const dob = formatDOB(user?.dob);
    const joined = formatJoined(user?.date || user?.created_at || user?.last_login) || 'November 2026';
    const roleLabel = user?.role || (user?.is_superuser ? 'Super Administrator' : (user?.is_staff ? 'Administrator' : 'Church Member'));
    const phone = user?.phone_no || user?.phone;
    const isActive = user?.status === 'active' || user?.is_active !== false;

    return (
        <div style={{
            background: isDark ? '#1a1625' : '#ffffff',
            borderRadius: '1.25rem',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 12px rgba(15,23,42,0.04)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* Elegant Header Banner */}
            <div style={{
                height: '130px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #0284c7 100%)',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.3rem 0.85rem',
                    borderRadius: '9999px',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                }}>
                    <span style={{ color: '#22c55e', fontSize: '0.7rem' }}>●</span>
                    <span>Account Active</span>
                </div>
            </div>

            <div style={{ padding: '0 2rem 1.75rem 2rem', position: 'relative' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                }}>
                    {/* Left: Avatar + Identity */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Avatar */}
                        <div style={{
                            position: 'relative',
                            marginTop: '-55px',
                            flexShrink: 0
                        }}>
                            <div style={{
                                width: '110px',
                                height: '110px',
                                borderRadius: '1.25rem',
                                border: `4px solid ${isDark ? '#1a1625' : '#ffffff'}`,
                                overflow: 'hidden',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.25rem',
                                fontWeight: '800',
                                color: '#ffffff',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
                            }}>
                                {avatarUrl && !imgError ? (
                                    <img
                                        src={avatarUrl}
                                        alt={fullName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={() => setImgError(true)}
                                    />
                                ) : initials}
                            </div>

                            {/* Camera Edit Pill */}
                            <button
                                onClick={onEditProfilePic}
                                title="Change Profile Photo"
                                style={{
                                    position: 'absolute',
                                    bottom: '-4px',
                                    right: '-4px',
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '50%',
                                    background: '#2563eb',
                                    color: '#ffffff',
                                    border: `2px solid ${isDark ? '#1a1625' : '#ffffff'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                                    transition: 'transform 0.15s ease'
                                }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                            </button>
                        </div>

                        {/* Name and Meta */}
                        <div style={{ paddingTop: '0.65rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                                <h1 style={{
                                    fontSize: '1.65rem',
                                    fontWeight: '800',
                                    color: isDark ? '#ffffff' : '#0f172a',
                                    margin: 0,
                                    lineHeight: 1.2
                                }}>
                                    {fullName}
                                </h1>

                                <span style={{
                                    background: isDark ? 'rgba(37,99,235,0.18)' : '#eff6ff',
                                    color: '#3b82f6',
                                    border: `1px solid ${isDark ? 'rgba(37,99,235,0.35)' : '#dbeafe'}`,
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700'
                                }}>
                                    {roleLabel}
                                </span>

                                {user?.member_id && (
                                    <span style={{
                                        background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                                        color: isDark ? '#94a3b8' : '#64748b',
                                        padding: '0.25rem 0.65rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.725rem',
                                        fontWeight: '600'
                                    }}>
                                        Member #{user.member_id}
                                    </span>
                                )}
                            </div>

                            {/* Bio */}
                            <p style={{
                                margin: '0 0 0.85rem 0',
                                color: isDark ? '#cbd5e1' : '#475569',
                                fontSize: '0.875rem',
                                maxWidth: '620px',
                                lineHeight: 1.5
                            }}>
                                {bio}
                            </p>

                            {/* Metadata Row */}
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '1.25rem',
                                fontSize: '0.8125rem',
                                color: isDark ? '#94a3b8' : '#64748b'
                            }}>
                                {user?.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span>✉️</span>
                                        <span style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{user.email}</span>
                                    </div>
                                )}
                                {phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span>📞</span>
                                        <span style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{phone}</span>
                                    </div>
                                )}
                                {location && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span>📍</span>
                                        <span style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{location}</span>
                                    </div>
                                )}
                                {dob && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span>🎂</span>
                                        <span style={{ color: isDark ? '#e2e8f0' : '#334155' }}>Born {dob}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span>🗓️</span>
                                    <span style={{ color: isDark ? '#e2e8f0' : '#334155' }}>Joined {joined}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={onEditProfile}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                background: 'linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '9999px',
                                padding: '0.55rem 1.15rem',
                                fontSize: '0.8125rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(14, 165, 233, 0.25)',
                                transition: 'transform 0.15s ease'
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            <span>Edit Profile</span>
                        </button>

                        <button
                            onClick={onEditProfilePic}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                                color: isDark ? '#f8fafc' : '#0f172a',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                borderRadius: '9999px',
                                padding: '0.55rem 1.1rem',
                                fontSize: '0.8125rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span>Change Photo</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;

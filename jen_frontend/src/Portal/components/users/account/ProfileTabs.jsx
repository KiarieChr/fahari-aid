import React, { useContext } from 'react';
import { ThemeContext } from '../../../../context/ThemeContext';

const ProfileTabs = ({ activeTab, onTabChange }) => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const tabs = [
        { id: 'profile', label: 'Personal Information', icon: '👤' },
        { id: 'attendance', label: 'My Attendance Record', icon: '📊' },
        { id: 'invited', label: 'Members I Introduced', icon: '🤝' },
        { id: 'security', label: 'Security & Password', icon: '🔐' },
    ];

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            width: '100%'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: isDark ? '#1a1625' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                borderRadius: '9999px',
                padding: '0.25rem',
                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(15,23,42,0.04)',
                overflowX: 'auto',
                maxWidth: '100%'
            }}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            style={{
                                background: isActive ? '#2563eb' : 'transparent',
                                color: isActive ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                                border: 'none',
                                borderRadius: '9999px',
                                padding: '0.45rem 1rem',
                                fontSize: '0.8125rem',
                                fontWeight: isActive ? '600' : '500',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s ease',
                                boxShadow: isActive ? '0 2px 6px rgba(37,99,235,0.25)' : 'none'
                            }}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ProfileTabs;

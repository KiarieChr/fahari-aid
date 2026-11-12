import React, { useState, useContext } from 'react';
import ProfileHeader from '../components/users/account/ProfileHeader';
import ProfileTabs from '../components/users/account/ProfileTabs';
import PersonalInfoPanel from '../components/users/account/PersonalInfoPanel';
import AttendanceRecordPanel from '../components/users/account/AttendanceRecordPanel';
import MembersInvitedPanel from '../components/users/account/MembersInvitedPanel';
import AccountSecurityPanel from '../components/users/account/AccountSecurityPanel';
import EditProfilePictureModal from '../components/users/account/EditProfilePictureModal';
import EditProfileModal from '../components/users/account/EditProfileModal';
import { ThemeContext } from '../../context/ThemeContext';

const MyAccountDashboard = () => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [activeTab, setActiveTab] = useState('profile');
    const [isEditProfilePicModalOpen, setIsEditProfilePicModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div style={{ width: '100%', paddingBottom: '3rem' }}>
            {/* Breadcrumb Header Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8125rem',
                color: isDark ? '#94a3b8' : '#64748b',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Portal</span>
                    <span style={{ color: isDark ? '#475569' : '#cbd5e1', fontSize: '0.75rem' }}>&gt;</span>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Users & Security</span>
                    <span style={{ color: isDark ? '#475569' : '#cbd5e1', fontSize: '0.75rem' }}>&gt;</span>
                    <span style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: '600' }}>My Account Profile</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.775rem' }}>
                    <span style={{ color: '#22c55e', fontSize: '0.75rem' }}>●</span>
                    <span style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Account Active</span>
                    <span style={{ color: isDark ? '#475569' : '#cbd5e1' }}>•</span>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Updated just now</span>
                    <button
                        onClick={() => setRefreshKey(k => k + 1)}
                        title="Refresh account details"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: isDark ? '#94a3b8' : '#64748b',
                            fontSize: '0.95rem',
                            padding: '0 0.2rem',
                            transition: 'transform 0.2s ease'
                        }}
                    >
                        ⟳
                    </button>
                </div>
            </div>

            {/* Profile Header Hero */}
            <ProfileHeader
                key={`header-${refreshKey}`}
                onEditProfilePic={() => setIsEditProfilePicModalOpen(true)}
                onEditProfile={() => setIsEditProfileModalOpen(true)}
            />

            {/* Pill Tabs Navigation */}
            <ProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Tab Panels */}
            {activeTab === 'profile' && (
                <PersonalInfoPanel
                    key={`info-${refreshKey}`}
                    onEditProfile={() => setIsEditProfileModalOpen(true)}
                />
            )}
            {activeTab === 'attendance' && (
                <AttendanceRecordPanel
                    key={`att-${refreshKey}`}
                />
            )}
            {activeTab === 'invited' && (
                <MembersInvitedPanel
                    key={`inv-${refreshKey}`}
                />
            )}
            {activeTab === 'security' && (
                <AccountSecurityPanel
                    key={`sec-${refreshKey}`}
                />
            )}

            {/* Modals */}
            {isEditProfilePicModalOpen && (
                <EditProfilePictureModal
                    onClose={() => {
                        setIsEditProfilePicModalOpen(false);
                        setRefreshKey(k => k + 1);
                    }}
                />
            )}
            {isEditProfileModalOpen && (
                <EditProfileModal
                    onClose={() => {
                        setIsEditProfileModalOpen(false);
                        setRefreshKey(k => k + 1);
                    }}
                />
            )}
        </div>
    );
};

export default MyAccountDashboard;

import React from 'react';

const AuditItem = ({ user, action, time }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.8rem 0',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '0.85rem'
    }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
        <div style={{ flex: 1 }}>
            <span style={{ color: 'var(--text-color)', fontWeight: '600' }}>{user}</span> <span style={{ color: 'var(--text-muted)' }}>{action}</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{time}</div>
    </div>
);

const UserAuditLog = () => {
    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1rem' }}>Recent Security Activity</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }}>View All</span>
            </div>

            <div>
                <AuditItem user="John Doe" action="logged in" time="2 mins ago" />
                <AuditItem user="Jane Smith" action="updated role for Mike" time="15 mins ago" />
                <AuditItem user="System" action="locked account USR005" time="1 hour ago" />
                <AuditItem user="Sarah Connor" action="reset password" time="2 hours ago" />
                <AuditItem user="John Doe" action="exported user list" time="Yesterday" />
            </div>
        </div>
    );
};

export default UserAuditLog;

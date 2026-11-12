import React from 'react';

const ActionButton = ({ icon, label, primary = false }) => (
    <button style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1rem',
        borderRadius: '0.5rem',
        border: primary ? 'none' : '1px solid var(--border-color)',
        background: primary ? 'var(--primary)' : 'var(--border-color)',
        color: primary ? 'var(--bg-color)' : 'var(--text-color)',
        fontWeight: primary ? '700' : '500',
        fontSize: '0.9rem',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
    }}>
        <span>{icon}</span> {label}
    </button>
);

const UserActionsMenu = ({ onAddUser, onAssignRoles, onBulkDeactivate }) => {
    return (
        <div style={{
            background: 'var(--surface-1)',
            padding: '1rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            overflowX: 'auto'
        }}>
            <div onClick={onAddUser}>
                <ActionButton icon="➕" label="Add New User" primary={true} />
            </div>
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
            <div onClick={onAssignRoles}>
                <ActionButton icon="🛡️" label="Assign Roles" />
            </div>
            <ActionButton icon="🔗" label="Link Profile" />
            <div onClick={onBulkDeactivate}>
                <ActionButton icon="🚫" label="Bulk Deactivate" />
            </div>
        </div>
    );
};

export default UserActionsMenu;

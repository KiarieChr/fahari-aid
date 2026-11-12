import React from 'react';

const ActionButton = ({ icon, label, primary = false, onClick }) => (
    <button onClick={onClick} style={{
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
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap'
    }}>
        <span>{icon}</span> {label}
    </button>
);

const MembersActionBar = ({ onNewMember, onUploadExcel, onNewCategory, onNewCellGroup, onAddCommittedMember }) => {
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
            <ActionButton icon="➕" label="New Member" primary={true} onClick={onNewMember} />
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
            <ActionButton icon="📂" label="Upload Excel" onClick={onUploadExcel} />
            <ActionButton icon="🏷️" label="New Category" onClick={onNewCategory} />
            <ActionButton icon="🏘️" label="New Cell Group" onClick={onNewCellGroup} />
            <ActionButton icon="🤝" label="Add Committed Member" onClick={onAddCommittedMember} />
        </div>
    );
};

export default MembersActionBar;

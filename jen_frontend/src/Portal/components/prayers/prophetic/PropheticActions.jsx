import React from 'react';

const ActionButton = ({ label, primary, green, filled }) => {
    let background = 'transparent';
    let border = '1px solid var(--secondary)'; // Purple border default
    let color = 'var(--secondary)';

    if (filled) {
        background = 'var(--secondary)';
        border = 'none';
        color = 'white';
    } else if (green) {
        // Keeping green distinct or maybe defined as 'success' variable later?
        // For now hardcoding green is fine if it's semantic "Success/Schedule",
        // but let's check index.css. I don't have --success.
        // Let's hardcode for now as it's specific UI, but ensure text is readable.
        border = '1px solid #22c55e';
        color = '#22c55e';
    }

    return (
        <button style={{
            background,
            border,
            color,
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
        }}>
            {label}
        </button>
    );
};

const PropheticActions = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <ActionButton label="New Prophecy Type" />
                <ActionButton label="New Prophecy/Instruction" />
                <ActionButton label="Download All Communications" filled />
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <ActionButton label="Add A Prayer Schedule" green />
                <ActionButton label="View Prayer Schedules" green />
            </div>
        </div>
    );
};

export default PropheticActions;

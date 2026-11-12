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

const FinanceActionBar = ({ onAddIncome, onAddExpense, onAddContribution, onAddBudget, onAddPledge }) => {
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
            <ActionButton icon="💰" label="Record Income" primary={true} onClick={onAddIncome} />
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
            <ActionButton icon="📤" label="Record Expense" onClick={onAddExpense} />
            <ActionButton icon="🤝" label="Record Contribution" onClick={onAddContribution} />
            <ActionButton icon="🙏" label="Make Pledge" onClick={onAddPledge} />
            <ActionButton icon="📋" label="Create Budget" onClick={onAddBudget} />
        </div>
    );
};

export default FinanceActionBar;

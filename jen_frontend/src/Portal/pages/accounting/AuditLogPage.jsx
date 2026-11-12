import React from 'react';
import AuditLog from '../../components/accounting/AuditLog';

const AuditLogPage = () => {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>Audit Log</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Complete audit trail of all financial transactions and changes.</p>
            </div>
            <AuditLog />
        </div>
    );
};

export default AuditLogPage;

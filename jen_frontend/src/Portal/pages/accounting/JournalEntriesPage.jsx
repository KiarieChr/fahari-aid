import React from 'react';
import JournalEntries from '../../components/accounting/JournalEntries';

const JournalEntriesPage = () => {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>Journal Entries</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>View, create, and reverse double-entry journal entries.</p>
            </div>
            <JournalEntries />
        </div>
    );
};

export default JournalEntriesPage;

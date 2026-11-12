import React from 'react';
import FastingStatsCards from '../../components/prayers/fasting/FastingStatsCards';
import FastingFilters from '../../components/prayers/fasting/FastingFilters';
import FastingTable from '../../components/prayers/fasting/FastingTable';
import FastingAnalytics from '../../components/prayers/fasting/FastingAnalytics';

const FastingCommitment = () => {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{
                background: 'var(--surface-1)',
                borderRadius: '1.5rem',
                border: '1px solid var(--border-color)',
                padding: '2rem',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>🔥</span>
                        <div>
                            <h1 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: 'var(--text-color)',
                                lineHeight: 1.2
                            }}>
                                Prayer & Fasting Dashboard
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
                                Manage and view fasting commitments across the network
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Components */}
            <FastingStatsCards />
            <FastingFilters />
            <FastingTable />
            <FastingAnalytics />

        </div>
    );
};

export default FastingCommitment;

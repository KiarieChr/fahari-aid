import React from 'react';
import CommStats from '../../components/prayers/communications/CommStats';
import ComposeMessage from '../../components/prayers/communications/ComposeMessage';
import MessageHistory from '../../components/prayers/communications/MessageHistory';

const PrayerCommunications = () => {
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
                        <span style={{ fontSize: '2rem' }}>📧</span>
                        <div>
                            <h1 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: 'var(--text-color)',
                                lineHeight: 1.2
                            }}>
                                Member Communications
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
                                Send alerts and manage messaging for the prayer network
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <CommStats />

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '1.5rem',
                alignItems: 'start'
            }}>
                <ComposeMessage />
                <MessageHistory />
            </div>
        </div>
    );
};

export default PrayerCommunications;

import React from 'react';

const GivingCard = ({ icon, title, desc, children, dark = false }) => (
    <div style={{
        background: dark ? '#120D20' : 'white',
        color: dark ? 'white' : '#120D20',
        padding: '2.5rem',
        borderRadius: '1.5rem',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    }}>
        <div style={{
            width: '50px', height: '50px',
            background: dark ? '#22c1e6' : 'rgba(34, 193, 230, 0.1)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: dark ? 'white' : '#22c1e6', fontSize: '1.5rem',
            marginBottom: '1.5rem'
        }}>
            {icon}
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: dark ? '#94a3b8' : '#64748b', lineHeight: 1.5, marginBottom: '2rem' }}>
            {desc}
        </p>

        <div style={{ marginTop: 'auto' }}>
            {children}
        </div>
    </div>
);

const GivingOptions = () => {
    return (
        <section style={{ padding: '2rem 0 6rem', background: '#eff3c1' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#120D20' }}>How to Give</h2>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        Choose the giving method that works best for you. Every gift makes a difference.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {/* M-Pesa Card (Dark) */}
                    <GivingCard
                        dark={true}
                        icon="📱"
                        title="M-Pesa"
                        desc="Send your offering via M-Pesa for quick and convenient giving."
                    >
                        <div style={{ fontSize: '0.875rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <div>Go to M-Pesa Menu</div>
                            <div>Select 'Paybill'</div>
                            <div>Business Number: <strong style={{ color: 'white' }}>123456</strong></div>
                            <div>Account: <strong style={{ color: 'white' }}>Your Name</strong></div>
                        </div>
                        <button style={{
                            width: '100%',
                            background: '#22c1e6',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem',
                            borderRadius: '9999px',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}>
                            Give via M-Pesa
                        </button>
                    </GivingCard>

                    {/* Card / Online (White) */}
                    <GivingCard
                        icon="💳"
                        title="Card / Online"
                        desc="Give securely using your debit or credit card through our online portal."
                    >
                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div>Visa, Mastercard accepted</div>
                            <div>One-time or recurring giving</div>
                            <div style={{ color: '#22c1e6', fontWeight: '600' }}>Secure & encrypted</div>
                        </div>
                    </GivingCard>

                    {/* Bank Transfer (White) */}
                    <GivingCard
                        icon="🏢"
                        title="Bank Transfer"
                        desc="Make a direct transfer to our ministry bank account."
                    >
                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div>Bank: <strong style={{ color: '#120D20' }}>Equity Bank</strong></div>
                            <div>Branch: <strong style={{ color: '#120D20' }}>Nairobi Main</strong></div>
                            <div>Account: <strong style={{ color: '#120D20' }}>1234567890</strong></div>
                            <div>Name: <strong style={{ color: '#120D20' }}>Jesus Enthroned Network</strong></div>
                        </div>
                    </GivingCard>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    section {
                        padding: 3rem 0 4rem !important;
                    }
                    div[style*="padding: 2.5rem"] {
                        padding: 1.5rem !important;
                    }
                    h2 {
                        fontSize: 1.75rem !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default GivingOptions;

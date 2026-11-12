import React, { useState } from 'react';

const FloatingContactWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        subject: 'Quick Help Inquiry',
        message: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/jen/api/';
            const response = await fetch(`${baseUrl}public_send_message.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Message sent successfully!');
                setFormData({
                    full_name: '',
                    email: '',
                    phone: '',
                    subject: 'Quick Help Inquiry',
                    message: ''
                });
                setTimeout(() => {
                    setIsOpen(false);
                    setSuccessMessage('');
                }, 3000);
            } else {
                setErrorMessage(data.error || 'Failed to send message.');
            }
        } catch (err) {
            setErrorMessage('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '75px', right: '24px', zIndex: 9999 }}>
            {/* Pop-up Widget */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    bottom: '76px',
                    right: 0,
                    width: '350px',
                    maxWidth: '90vw',
                    background: 'white',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(18, 13, 32, 0.15)',
                    border: '1px solid rgba(18, 13, 32, 0.06)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #120D20 0%, #0d091a 100%)',
                        padding: '1.25rem 1.5rem',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ✉️ Talk to Us
                            </h4>
                            <span style={{ fontSize: '0.75rem', color: '#22c1e6' }}>Typically replies within a few hours</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.25rem', cursor: 'pointer', opacity: 0.8 }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <div style={{ padding: '1.5rem', maxHeight: '420px', overflowY: 'auto' }}>
                        {successMessage ? (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#16a34a' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
                                <h5 style={{ margin: '0 0 0.5rem 0', fontWeight: '800' }}>Message Sent!</h5>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Thank you for reaching out. We will get back to you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                                {errorMessage && (
                                    <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                                        {errorMessage}
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#120D20' }}>Full Name</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        placeholder="Your Name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#120D20' }}>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#120D20' }}>Phone Number (Optional)</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="e.g. 0700000000"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#120D20' }}>Message</label>
                                    <textarea
                                        name="message"
                                        placeholder="How can we support or partner with you?"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows="3"
                                        style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', resize: 'vertical' }}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{
                                        background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, #120D20 0%, #22c1e6 100%)',
                                        color: 'white',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontWeight: '800',
                                        fontSize: '0.85rem',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        marginTop: '0.5rem',
                                        boxShadow: '0 8px 16px rgba(34, 193, 230, 0.15)'
                                    }}
                                >
                                    {isLoading ? 'Sending Inquiry...' : 'Submit Message'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Quick WhatsApp Action Footer */}
                    <div style={{
                        padding: '0.85rem 1.5rem',
                        background: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Need instant answers?</span>
                        <a
                            href="https://wa.me/254702761913"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.75rem',
                                color: 'white',
                                background: '#25D366',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '9999px',
                                textDecoration: 'none',
                                fontWeight: '700'
                            }}
                        >
                            <span>💬</span> WhatsApp
                        </a>
                    </div>
                </div>
            )}

            {/* Toggle FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #120D20 0%, #22c1e6 100%)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bottom: '20px',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(34, 193, 230, 0.35)',
                    fontSize: '1.5rem',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? '×' : '💬'}
            </button>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default FloatingContactWidget;

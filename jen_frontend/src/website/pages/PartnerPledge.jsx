import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePaystackPayment } from 'react-paystack';
import axios from 'axios';
import {
    buildPaystackConfig,
    verifyAndRedeemPaystack,
    initiateMpesaSTK,
    waitForMpesaPayment,
    formatKES,
} from '../../services/paymentService';

const PartnerPledge = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [pledges, setPledges] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedPledge, setSelectedPledge] = useState(null);
    const [amountToPay, setAmountToPay] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [payTab, setPayTab] = useState('paystack'); // 'paystack' | 'mpesa'
    const [mpesaPhone, setMpesaPhone] = useState('');
    const [mpesaStatus, setMpesaStatus] = useState(''); // '' | 'waiting' | 'done' | 'failed'

    // Toast State & Effect
    const [showToast, setShowToast] = useState(false);
    useEffect(() => {
        if (message.text) {
            setShowToast(true);
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // OTP States
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [sessionToken, setSessionToken] = useState('');

    // New Pledge Form
    const [showNewPledgeForm, setShowNewPledgeForm] = useState(false);
    const [newPledge, setNewPledge] = useState({
        full_name: '', email: '', phone_no: '', pledges_amount: '', purpose: 'Partner Contribution'
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/jesusenthroned/api/';

    // Calculate individual stats automatically based on the fetched pledges array
    const stats = useMemo(() => {
        return {
            totalPledged: pledges.reduce((sum, p) => sum + parseFloat(p.pledges_amount || 0), 0),
            totalRedeemed: pledges.reduce((sum, p) => sum + parseFloat(p.total_redeemed || 0), 0),
            totalPending: pledges.reduce((sum, p) => sum + parseFloat(p.remaining_balance || 0), 0),
        };
    }, [pledges]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const res = await axios.post(`${API_URL}public_send_otp.php`, { search_term: searchQuery });
            if (res.data.success) {
                setMaskedEmail(res.data.data.email);
                setShowOtpForm(true);
                setMessage({ text: 'A verification code has been sent to ' + res.data.data.email, type: 'success' });
            } else {
                setMessage({ text: res.data.error || 'Failed to request verification code', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: error.response?.data?.error || 'Failed to search details.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const res = await axios.post(`${API_URL}public_verify_otp.php`, {
                search_term: searchQuery,
                otp_code: otpCode
            });
            if (res.data.success) {
                setSessionToken(res.data.data.token);
                setPledges(res.data.data.pledges);
                setHasSearched(true);
                setShowOtpForm(false);
                setMessage({ text: 'Identity verified successfully! Welcome back.', type: 'success' });
            } else {
                setMessage({ text: res.data.error || 'Invalid verification code', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: error.response?.data?.error || 'Verification failed.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewPledge = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}public_add_pledge.php`, { ...newPledge, date: new Date().toISOString().split('T')[0] });
            if (res.data.success) {
                setMessage({ text: 'Pledge created successfully! You can now proceed to pay.', type: 'success' });
                setShowNewPledgeForm(false);
                setSelectedPledge({
                    id: res.data.data.id,
                    full_name: newPledge.full_name,
                    email: newPledge.email,
                    phone_no: newPledge.phone_no,
                    pledges_amount: newPledge.pledges_amount,
                    remaining_balance: newPledge.pledges_amount
                });
                setAmountToPay(newPledge.pledges_amount);
                // Refresh the list to include the new pledge if they already searched
                if (hasSearched && newPledge.email && sessionToken) {
                    setSearchQuery(newPledge.email);
                    // Minimal re-fetch to update stats behind the scenes
                    axios.post(`${API_URL}public_get_pledge.php`, { search_term: newPledge.email, token: sessionToken })
                        .then(r => { if(r.data.success) setPledges(r.data.data); });
                }
            } else {
                setMessage({ text: res.data.error || 'Failed to create pledge', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: error.response?.data?.error || 'Error creating pledge.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // ── Paystack ──────────────────────────────────────────────────────────────
    const paystackConfig = buildPaystackConfig({
        email: selectedPledge?.email || newPledge?.email || 'guest@example.com',
        amount: amountToPay,
        pledgeId: selectedPledge?.id,
    });

    const initializePayment = usePaystackPayment(paystackConfig);

    const onSuccess = async (reference) => {
        setLoading(true);
        const result = await verifyAndRedeemPaystack({
            pledgeId: selectedPledge.id,
            amount: amountToPay,
            reference: reference.reference,
            email: selectedPledge.email,
        });
        if (result.success) {
            setMessage({ text: 'Payment successful and recorded! 🎉', type: 'success' });
            setSelectedPledge(null);
            if (searchQuery && sessionToken) {
                const r = await axios.post(`${API_URL}public_get_pledge.php`, { search_term: searchQuery, token: sessionToken });
                if (r.data.success) setPledges(r.data.data);
            }
        } else {
            setMessage({ text: result.error || 'Payment recorded failed', type: 'error' });
        }
        setLoading(false);
    };

    const onClose = () => setMessage({ text: 'Payment was cancelled.', type: 'error' });

    // ── M-Pesa STK Push ───────────────────────────────────────────────────────
    const handleMpesaPay = async () => {
        if (!mpesaPhone || !amountToPay || amountToPay <= 0) return;
        setLoading(true);
        setMpesaStatus('waiting');
        setMessage({ text: 'STK Push sent — check your phone and enter your M-Pesa PIN.', type: 'success' });

        const push = await initiateMpesaSTK({
            phone: mpesaPhone,
            amount: amountToPay,
            pledgeId: selectedPledge.id,
            description: 'JEN Pledge',
        });

        if (!push.success) {
            setMpesaStatus('failed');
            setMessage({ text: push.error || 'Failed to send STK Push', type: 'error' });
            setLoading(false);
            return;
        }

        // Poll for confirmation
        const result = await waitForMpesaPayment(push.checkoutRequestId, { intervalMs: 3000, maxAttempts: 10 });
        if (result.paid) {
            setMpesaStatus('done');
            setMessage({ text: 'M-Pesa payment received and recorded! 🎉', type: 'success' });
            setSelectedPledge(null);
            if (searchQuery && sessionToken) {
                const r = await axios.post(`${API_URL}public_get_pledge.php`, { search_term: searchQuery, token: sessionToken });
                if (r.data.success) setPledges(r.data.data);
            }
        } else {
            setMpesaStatus('failed');
            setMessage({ text: result.error || 'Payment not confirmed. Check M-Pesa messages.', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 35px rgba(34, 193, 230, 0.35); }
                    50% { box-shadow: 0 0 55px rgba(34, 193, 230, 0.7); }
                }
                @keyframes slowFloat {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
                    50% { transform: translateY(-15px) scale(1.08); opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateY(20px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .hero-fade-in {
                    opacity: 0;
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .hero-pulse {
                    animation: pulseGlow 3s infinite ease-in-out;
                }
                .hero-float {
                    animation: slowFloat 8s infinite ease-in-out;
                }
                .toast-enter {
                    animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            <Navbar />
            
            {/* Premium Dark Hero Section */}
            <section style={{
                background: 'linear-gradient(180deg, #120D20 0%, #0d091a 100%)',
                padding: '0 1rem 3rem',
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div 
                    className="hero-float"
                    style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-20%',
                        width: '70%',
                        height: '150%',
                        background: 'radial-gradient(circle, rgba(34, 193, 230, 0.05) 0%, transparent 70%)',
                        zIndex: 0,
                        pointerEvents: 'none'
                    }}
                ></div>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div 
                        className="hero-pulse hero-fade-in"
                        style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 2rem',
                            background: 'radial-gradient(circle, #22c1e6 10%, rgba(34, 193, 230, 0) 70%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animationDelay: '0.1s'
                        }}
                    >
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: '#22c1e6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            color: 'white'
                        }}>
                            🤝
                        </div>
                    </div>

                    <span 
                        className="hero-fade-in"
                        style={{
                            background: 'rgba(34, 193, 230, 0.1)',
                            color: '#22c1e6',
                            padding: '0.5rem 1rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'inline-block',
                            marginBottom: '1.5rem',
                            animationDelay: '0.2s'
                        }}
                    >
                        MY PLEDGES
                    </span>

                    <h1 
                        className="hero-fade-in"
                        style={{
                            fontSize: '3.5rem',
                            fontWeight: '800',
                            marginBottom: '1.5rem',
                            lineHeight: 1.1,
                            animationDelay: '0.35s'
                        }}
                    >
                        Manage Your Giving
                    </h1>

                    <p 
                        className="hero-fade-in"
                        style={{
                            fontSize: '1.125rem',
                            color: '#94a3b8',
                            maxWidth: '600px',
                            margin: '0 auto',
                            lineHeight: 1.6,
                            animationDelay: '0.5s'
                        }}
                    >
                        Track your contributions, fulfill your pledges securely via Paystack, or make a new commitment to support the vision.
                    </p>
                </div>
            </section>

            <div style={{ flex: 1, padding: '3rem 1rem', maxWidth: '900px', margin: '-4rem auto 0', width: '100%', position: 'relative', zIndex: 10 }}>
                {message.text && (
                    <div style={{ 
                        padding: '1rem 1.5rem', 
                        marginBottom: '2rem', 
                        borderRadius: '12px', 
                        backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        color: message.type === 'success' ? '#065f46' : '#991b1b',
                        border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontWeight: '500'
                    }}>
                        {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                    </div>
                )}

                {/* OTP Verification Form */}
                {!selectedPledge && !showNewPledgeForm && showOtpForm && (
                    <div style={{ 
                        background: 'white', 
                        padding: '2.5rem', 
                        borderRadius: '24px', 
                        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(0, 0, 0, 0.03)',
                        textAlign: 'center'
                    }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Verify Your Email</h2>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>We sent a 6-digit verification code to <strong style={{ color: '#0f172a' }}>{maskedEmail}</strong>.</p>
                        </div>
                        
                        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '400px', margin: '0 auto' }}>
                            <input 
                                type="text" 
                                placeholder="Enter 6-digit code" 
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength="6"
                                style={{ 
                                    padding: '1.1rem 1.4rem', 
                                    borderRadius: '16px', 
                                    border: '2px solid #e2e8f0', 
                                    fontSize: '1.5rem', 
                                    fontWeight: '800', 
                                    textAlign: 'center', 
                                    letterSpacing: '8px', 
                                    outline: 'none', 
                                    transition: 'all 0.2s ease' 
                                }}
                                onFocus={e => { e.target.style.borderColor = '#22c1e6'; e.target.style.boxShadow = '0 0 0 4px rgba(34, 193, 230, 0.15)'; }}
                                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                                required
                            />
                            
                            <button 
                                type="submit" 
                                disabled={loading || otpCode.length < 6}
                                style={{ 
                                    padding: '1.1rem', 
                                    background: 'linear-gradient(135deg, #120D20 0%, #22c1e6 100%)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '16px', 
                                    fontWeight: '800', 
                                    fontSize: '1rem', 
                                    cursor: (loading || otpCode.length < 6) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 6px 20px rgba(34, 193, 230, 0.2)',
                                    opacity: (loading || otpCode.length < 6) ? 0.6 : 1
                                }}
                            >
                                {loading ? 'Verifying...' : 'Verify & View Pledges'}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => {
                                    setShowOtpForm(false);
                                    setOtpCode('');
                                    setMessage({ text: '', type: '' });
                                }}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#64748b', 
                                    cursor: 'pointer', 
                                    fontSize: '0.9rem', 
                                    fontWeight: '600', 
                                    textDecoration: 'underline' 
                                }}
                            >
                                Change Email / Phone
                            </button>
                        </form>
                    </div>
                )}

                {/* Main Content Area */}
                {!selectedPledge && !showNewPledgeForm && !showOtpForm && (
                    <div style={{ 
                        background: 'white', 
                        padding: '2.5rem', 
                        borderRadius: '24px', 
                        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(0, 0, 0, 0.03)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Find Your Pledges</h2>
                            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>Enter your email or phone number to securely access your pledge history.</p>
                        </div>
                        
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <input 
                                    type="text" 
                                    placeholder="e.g. name@example.com or 0712345678" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ 
                                        flex: '1 1 300px', 
                                        padding: '1.1rem 1.4rem', 
                                        borderRadius: '16px', 
                                        border: '2px solid #e2e8f0', 
                                        fontSize: '1rem', 
                                        outline: 'none', 
                                        transition: 'all 0.2s ease', 
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                                        fontWeight: '500'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#22c1e6'; e.target.style.boxShadow = '0 0 0 4px rgba(34, 193, 230, 0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                                    required
                                />
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    style={{ 
                                        flex: '1 1 150px',
                                        padding: '1.1rem 2rem', 
                                        backgroundColor: '#22c1e6', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '16px', 
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontWeight: '700',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 6px 20px rgba(34, 193, 230, 0.3)',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'Searching...' : 'Search Pledges'}
                                </button>
                            </div>
                        </form>

                        <div style={{ marginTop: '2.5rem', textAlign: 'center', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '1px', background: '#e2e8f0', zIndex: 0 }}></div>
                            <span style={{ background: 'white', padding: '0 1.25rem', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', position: 'relative', zIndex: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or start fresh</span>
                        </div>
                        
                        <div style={{ marginTop: '1.5rem' }}>
                            <button 
                                onClick={() => setShowNewPledgeForm(true)}
                                style={{ 
                                    width: '100%',
                                    padding: '1.1rem 2rem', 
                                    backgroundColor: 'transparent', 
                                    color: '#0f172a', 
                                    border: '2px dashed #cbd5e1', 
                                    borderRadius: '16px', 
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    transition: 'all 0.25s ease',
                                }}
                                onMouseEnter={e => { e.target.style.borderColor = '#22c1e6'; e.target.style.color = '#22c1e6'; e.target.style.backgroundColor = 'rgba(34, 193, 230, 0.02)'; }}
                                onMouseLeave={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.color = '#0f172a'; e.target.style.backgroundColor = 'transparent'; }}
                            >
                                ✨ Make a New Pledge Commitment
                            </button>
                        </div>

                        {/* Individual Stats & Pledges List (Shows after searching) */}
                        {hasSearched && pledges.length > 0 && (
                            <div style={{ marginTop: '3.5rem', animation: 'fadeIn 0.5s ease-in' }}>
                                
                                {/* Personal Statistics Dashboard */}
                                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '1.5rem', color: '#0f172a', letterSpacing: '-0.01em' }}>Your Pledge Summary</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pledged</span>
                                            <span style={{ fontSize: '1.25rem' }}>💰</span>
                                        </div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>KES {stats.totalPledged.toLocaleString()}</div>
                                    </div>
                                    <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #a7f3d0', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Redeemed</span>
                                            <span style={{ fontSize: '1.25rem' }}>✅</span>
                                        </div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#059669', marginTop: '0.5rem' }}>KES {stats.totalRedeemed.toLocaleString()}</div>
                                    </div>
                                    <div style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #fecaca', boxShadow: '0 4px 12px rgba(225, 29, 72, 0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#be123c', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pending</span>
                                            <span style={{ fontSize: '1.25rem' }}>⏳</span>
                                        </div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#e11d48', marginTop: '0.5rem' }}>KES {stats.totalPending.toLocaleString()}</div>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a', letterSpacing: '-0.01em' }}>Active Commitments</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {pledges.map((p) => {
                                        const pct = p.pledges_amount > 0 ? Math.min(100, (p.total_redeemed / p.pledges_amount) * 100) : 0;
                                        const isComplete = parseFloat(p.remaining_balance) <= 0;
                                        
                                        return (
                                            <div key={p.id} style={{ 
                                                padding: '1.75rem', 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: '18px', 
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '1.5rem',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: isComplete ? '#f8fafc' : 'white',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                                                transition: 'all 0.25s ease',
                                            }}
                                            className="pledge-list-card"
                                            >
                                                <div style={{ flex: '1 1 280px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.2rem', letterSpacing: '-0.01em' }}>{p.purpose || 'General Pledge'}</span>
                                                        {isComplete ? (
                                                            <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: '700' }}>Fulfilled</span>
                                                        ) : (
                                                            <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: '700' }}>In Progress</span>
                                                        )}
                                                    </div>
                                                    
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                                                        <span><strong style={{ color: '#475569' }}>Pledged:</strong> KES {parseFloat(p.pledges_amount).toLocaleString()}</span>
                                                        <span><strong style={{ color: '#059669' }}>Paid:</strong> KES {parseFloat(p.total_redeemed).toLocaleString()}</span>
                                                        {!isComplete && <span><strong style={{ color: '#e11d48' }}>Remaining:</strong> KES {parseFloat(p.remaining_balance).toLocaleString()}</span>}
                                                    </div>

                                                    {/* Progress Bar Container */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${pct}%`, height: '100%', background: isComplete ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #22c1e6, #06b6d4)', borderRadius: '999px', transition: 'width 0.5s ease-out' }}></div>
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isComplete ? '#059669' : '#06b6d4' }}>{pct.toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => {
                                                        setSelectedPledge(p);
                                                        setAmountToPay(p.remaining_balance > 0 ? p.remaining_balance : '');
                                                    }}
                                                    disabled={isComplete}
                                                    style={{ 
                                                        flex: '0 0 auto',
                                                        padding: '0.85rem 1.75rem', 
                                                        backgroundColor: isComplete ? '#cbd5e1' : '#10b981', 
                                                        color: isComplete ? '#94a3b8' : 'white', 
                                                        border: 'none', 
                                                        borderRadius: '12px', 
                                                        cursor: isComplete ? 'not-allowed' : 'pointer',
                                                        fontWeight: '700',
                                                        fontSize: '0.95rem',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: isComplete ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.25)',
                                                    }}
                                                >
                                                    {isComplete ? 'Fulfilled' : 'Redeem Pledge'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Create New Pledge Form */}
                {showNewPledgeForm && (
                    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>New Pledge</h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Enter your details to make a new commitment.</p>
                            </div>
                            <button onClick={() => setShowNewPledgeForm(false)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '8px' }}>Cancel</button>
                        </div>
                        <form onSubmit={handleCreateNewPledge} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Full Name *</label>
                                <input type="text" required value={newPledge.full_name} onChange={e => setNewPledge({...newPledge, full_name: e.target.value})} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Email Address *</label>
                                <input type="email" required value={newPledge.email} onChange={e => setNewPledge({...newPledge, email: e.target.value})} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Phone Number</label>
                                <input type="tel" value={newPledge.phone_no} onChange={e => setNewPledge({...newPledge, phone_no: e.target.value})} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Pledge Amount (KES) *</label>
                                <input type="number" required min="1" value={newPledge.pledges_amount} onChange={e => setNewPledge({...newPledge, pledges_amount: e.target.value})} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1.125rem', fontWeight: '600' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                                <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}>
                                    {loading ? 'Processing...' : 'Create & Proceed to Pay'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Checkout/Paystack Form */}
                {selectedPledge && (
                    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>Complete Payment</h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Securely fulfill your pledge via Paystack.</p>
                            </div>
                            <button onClick={() => setSelectedPledge(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', padding: '0.5rem', textDecoration: 'underline' }}>Back to Pledges</button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500' }}>Pledger Name</span>
                                <span style={{ color: '#0f172a', fontWeight: '700' }}>{selectedPledge.full_name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500' }}>Pledge Purpose</span>
                                <span style={{ color: '#0f172a', fontWeight: '700' }}>{selectedPledge.purpose || 'General'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fff1f2', borderRadius: '8px', border: '1px dashed #fecdd3' }}>
                                <span style={{ color: '#be123c', fontWeight: '600' }}>Remaining Balance</span>
                                <span style={{ color: '#e11d48', fontWeight: '800', fontSize: '1.125rem' }}>KES {parseFloat(selectedPledge.remaining_balance).toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>Enter Amount to Pay Now (KES)</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: '600' }}>KES</span>
                                <input 
                                    type="number" 
                                    value={amountToPay} 
                                    onChange={(e) => setAmountToPay(e.target.value)}
                                    min="1"
                                    max={selectedPledge.remaining_balance}
                                    style={{ padding: '1rem 1rem 1rem 3.5rem', borderRadius: '12px', border: '2px solid #e2e8f0', width: '100%', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>You can pay partially or fulfill the entire remaining balance.</p>
                        </div>


                        {/* ── Payment Method Tabs ── */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem' }}>Select Payment Method</p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {[['paystack', '💳 Card / Paystack'], ['mpesa', '📱 M-Pesa STK Push']].map(([key, label]) => (
                                    <button key={key} onClick={() => setPayTab(key)} style={{
                                        flex: 1, padding: '0.75rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                                        background: payTab === key ? '#0f172a' : '#f1f5f9',
                                        color: payTab === key ? 'white' : '#64748b',
                                        border: payTab === key ? '2px solid #0f172a' : '2px solid #e2e8f0',
                                    }}>{label}</button>
                                ))}
                            </div>
                        </div>

                        {/* ── Paystack Tab ── */}
                        {payTab === 'paystack' && (
                            <button
                                onClick={() => initializePayment({ onSuccess, onClose })}
                                disabled={!amountToPay || amountToPay <= 0 || amountToPay > parseFloat(selectedPledge.remaining_balance) || loading}
                                style={{
                                    padding: '1.25rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px',
                                    fontWeight: '800', fontSize: '1.125rem', width: '100%', cursor: 'pointer',
                                    boxShadow: '0 10px 15px -3px rgba(16,185,129,0.3)', transition: 'all 0.2s',
                                    opacity: (!amountToPay || loading) ? 0.6 : 1,
                                }}
                            >
                                {loading ? 'Processing...' : `Pay ${formatKES(amountToPay)} via Card`}
                            </button>
                        )}

                        {/* ── M-Pesa Tab ── */}
                        {payTab === 'mpesa' && (
                            <div>
                                <label style={{ display: 'block', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                                    M-Pesa Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="07XXXXXXXX or 2547XXXXXXXX"
                                    value={mpesaPhone}
                                    onChange={e => setMpesaPhone(e.target.value)}
                                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '1rem', marginBottom: '1rem', outline: 'none' }}
                                    onFocus={e => e.target.style.borderColor = '#16a34a'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                                {mpesaStatus === 'waiting' && (
                                    <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', color: '#713f12', fontWeight: '600' }}>
                                        ⏳ Waiting for M-Pesa confirmation… Enter your PIN on your phone.
                                    </div>
                                )}
                                <button
                                    onClick={handleMpesaPay}
                                    disabled={!mpesaPhone || !amountToPay || amountToPay <= 0 || loading || mpesaStatus === 'waiting'}
                                    style={{
                                        width: '100%', padding: '1.25rem', backgroundColor: '#16a34a', color: 'white', border: 'none',
                                        borderRadius: '12px', fontWeight: '800', fontSize: '1.125rem', cursor: 'pointer',
                                        boxShadow: '0 10px 15px -3px rgba(22,163,74,0.3)', transition: 'all 0.2s',
                                        opacity: (!mpesaPhone || loading || mpesaStatus === 'waiting') ? 0.6 : 1,
                                    }}
                                >
                                    {mpesaStatus === 'waiting' ? '⏳ Awaiting confirmation…' : `📱 Send ${formatKES(amountToPay)} STK Push`}
                                </button>
                            </div>
                        )}

                    </div>
                )}
            </div>

            <Footer />

            {/* Floating Toast Notification */}
            {showToast && message.text && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 1100,
                    background: message.type === 'success' 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                        : 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                    color: 'white',
                    padding: '1.1rem 1.6rem',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    fontWeight: '600',
                    minWidth: '300px',
                    maxWidth: '380px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
                className="toast-enter"
                >
                    <span style={{ fontSize: '1.25rem' }}>{message.type === 'success' ? '✅' : '⚠️'}</span>
                    <div style={{ flex: 1, fontSize: '0.9rem', lineHeight: '1.4' }}>{message.text}</div>
                    <button 
                        onClick={() => setShowToast(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1.3rem',
                            opacity: 0.8,
                            padding: '0 0 0 0.5rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >×</button>
                </div>
            )}
        </div>
    );
};

export default PartnerPledge;

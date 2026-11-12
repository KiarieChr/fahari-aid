import React, { useState, useEffect, useRef, useContext } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ThemeContext } from '../../../context/ThemeContext';

const QRScannerModal = ({ onClose, onScan, eventName }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    const startScanner = async () => {
        setError(null);
        try {
            const html5QrCode = new Html5Qrcode('qr-reader');
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText) => {
                    if (/^EVT-\d+-REG-\d+-[a-f0-9]{32}$/.test(decodedText)) {
                        setLastResult(decodedText);
                        onScan(decodedText);
                    } else {
                        setError('Invalid QR code scanned');
                    }
                },
                () => {} // ignore errors during scanning
            );
            setScanning(true);
        } catch (err) {
            console.error('Scanner error:', err);
            setError(
                err.toString().includes('NotAllowedError')
                    ? 'Camera permission denied. Please allow camera access.'
                    : err.toString().includes('NotFoundError')
                        ? 'No camera found on this device.'
                        : 'Failed to start camera: ' + err.message
            );
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && scanning) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
            } catch (e) {
                console.warn('Scanner stop error:', e);
            }
            setScanning(false);
        }
    };

    useEffect(() => {
        startScanner();
        return () => {
            stopScanner();
        };
    }, []);

    const handleClose = async () => {
        await stopScanner();
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
        }} onClick={handleClose}>
            <div style={{
                background: isDark ? '#151128' : '#ffffff',
                borderRadius: '1.25rem',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                color: isDark ? '#f8fafc' : '#0f172a'
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.15rem'
                        }}>
                            📷
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.15rem', color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '700' }}>
                                QR Attendance Scanner
                            </h2>
                            {eventName && (
                                <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                    {eventName}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{
                            background: isDark ? '#252038' : '#f1f5f9',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                            color: isDark ? '#94a3b8' : '#64748b',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Scanner Area */}
                <div style={{ padding: '1.5rem' }}>
                    <div
                        id="qr-reader"
                        ref={scannerRef}
                        style={{
                            width: '100%',
                            borderRadius: '0.75rem',
                            overflow: 'hidden',
                            marginBottom: '1rem',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`
                        }}
                    />

                    {error && (
                        <div style={{
                            background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
                            borderRadius: '0.5rem',
                            padding: '0.75rem 1rem',
                            color: '#dc2626',
                            fontSize: '0.85rem',
                            marginBottom: '1rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    {lastResult && (
                        <div style={{
                            background: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
                            border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0'}`,
                            borderRadius: '0.5rem',
                            padding: '0.75rem 1rem',
                            color: '#16a34a',
                            fontSize: '0.85rem',
                            marginBottom: '1rem',
                            textAlign: 'center',
                            fontWeight: '600'
                        }}>
                            ✓ QR code scanned! Check-in verified.
                        </div>
                    )}

                    <p style={{
                        color: isDark ? '#94a3b8' : '#64748b',
                        fontSize: '0.825rem',
                        textAlign: 'center',
                        margin: '0.5rem 0 0',
                        lineHeight: 1.5
                    }}>
                        Point your camera at the member's QR pass to record attendance in real time.
                        The camera stays active for continuous scanning.
                    </p>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem'
                }}>
                    <button
                        onClick={handleClose}
                        style={{
                            padding: '0.65rem 1.25rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                            background: isDark ? '#252038' : '#f1f5f9',
                            color: isDark ? '#cbd5e1' : '#475569',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Close Scanner
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRScannerModal;

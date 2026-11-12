/**
 * Payment Service
 * Centralised payment utilities for Paystack (card) and M-Pesa STK Push.
 * Import the helpers you need; they all resolve to { success, data, error }.
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/jesusenthroned/api/';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a unique Paystack reference tied to the current timestamp + pledge id.
 * @param {string|number} [suffix=''] - Extra suffix to make it deterministic (e.g. pledge id)
 */
export const generateReference = (suffix = '') =>
    `JEN-${Date.now()}${suffix ? `-${suffix}` : ''}`;


// ─────────────────────────────────────────────────────────────────────────────
// PAYSTACK HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a Paystack config object ready for usePaystackPayment().
 * @param {{ email: string, amount: number, pledgeId?: number }} opts
 * @returns {object} config
 */
export const buildPaystackConfig = ({ email, amount, pledgeId }) => ({
    reference: generateReference(pledgeId),
    email: email || 'guest@example.com',
    amount: Math.round(parseFloat(amount) * 100), // kobo / cents
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    currency: 'KES',
    metadata: { pledge_id: pledgeId },
});

/**
 * Verify a Paystack transaction and record a pledge redemption via the API.
 * @param {{ pledgeId, amount, reference, email }} opts
 * @returns {Promise<{ success: boolean, data?, error? }>}
 */
export const verifyAndRedeemPaystack = async ({ pledgeId, amount, reference, email }) => {
    try {
        const res = await axios.post(`${API_URL}public_redeem_pledge.php`, {
            pledge_id: pledgeId,
            amount,
            reference,
            email,
        });
        return res.data.success
            ? { success: true, data: res.data.data }
            : { success: false, error: res.data.error || 'Paystack redemption failed' };
    } catch (err) {
        return { success: false, error: err.response?.data?.error || err.message };
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// M-PESA STK PUSH HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Trigger an M-Pesa STK Push.
 * Sends a payment prompt to the user's phone via the backend.
 *
 * @param {{ phone: string, amount: number, pledgeId: number, description?: string }} opts
 * @returns {Promise<{ success: boolean, checkoutRequestId?, error? }>}
 */
export const initiateMpesaSTK = async ({ phone, amount, pledgeId, description }) => {
    // Normalise phone: strip leading 0 and add 254 prefix
    const normalised = normaliseMpesaPhone(phone);
    if (!normalised) {
        return { success: false, error: 'Invalid phone number. Use format 07XXXXXXXX or 2547XXXXXXXX.' };
    }

    try {
        const res = await axios.post(`${API_URL}mpesa_stk_push.php`, {
            phone: normalised,
            amount: Math.round(parseFloat(amount)),
            pledge_id: pledgeId,
            description: description || 'JEN Pledge Payment',
        });

        return res.data.success
            ? { success: true, checkoutRequestId: res.data.data?.CheckoutRequestID }
            : { success: false, error: res.data.error || 'STK Push failed' };
    } catch (err) {
        return { success: false, error: err.response?.data?.error || err.message };
    }
};

/**
 * Poll the backend to check if an STK Push was completed.
 * Call every ~3 s for up to ~30 s.
 *
 * @param {string} checkoutRequestId
 * @returns {Promise<{ success: boolean, paid: boolean, error? }>}
 */
export const checkMpesaSTKStatus = async (checkoutRequestId) => {
    try {
        const res = await axios.get(`${API_URL}mpesa_stk_status.php`, {
            params: { checkout_request_id: checkoutRequestId },
        });
        return {
            success: res.data.success,
            paid: res.data.data?.paid === true,
            error: res.data.error,
        };
    } catch (err) {
        return { success: false, paid: false, error: err.message };
    }
};

/**
 * Poll until paid or timeout, then return result.
 * @param {string} checkoutRequestId
 * @param {{ intervalMs?: number, maxAttempts?: number }} opts
 * @returns {Promise<{ paid: boolean, error? }>}
 */
export const waitForMpesaPayment = (checkoutRequestId, { intervalMs = 3000, maxAttempts = 10 } = {}) => {
    return new Promise((resolve) => {
        let attempts = 0;
        const timer = setInterval(async () => {
            attempts++;
            const result = await checkMpesaSTKStatus(checkoutRequestId);
            if (result.paid) {
                clearInterval(timer);
                resolve({ paid: true });
            } else if (attempts >= maxAttempts) {
                clearInterval(timer);
                resolve({ paid: false, error: 'Payment timed out. Check your M-Pesa messages.' });
            }
        }, intervalMs);
    });
};


// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTION HISTORY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieve all pledge payment transactions (cash, M-Pesa, Paystack) for a pledge
 * or across the whole system (admin).
 *
 * @param {{ pledgeId?: number, method?: string, dateFrom?: string, dateTo?: string, token: string }} opts
 * @returns {Promise<{ success: boolean, transactions?, error? }>}
 */
export const getPaymentTransactions = async ({ pledgeId, method, dateFrom, dateTo, token } = {}) => {
    try {
        const params = new URLSearchParams();
        if (pledgeId) params.append('pledge_id', pledgeId);
        if (method) params.append('method', method);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);

        const res = await axios.get(`${API_URL}get_payment_transactions.php?${params.toString()}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        return res.data.success
            ? { success: true, transactions: res.data.data.transactions, summary: res.data.data.summary }
            : { success: false, error: res.data.error || 'Failed to load transactions' };
    } catch (err) {
        return { success: false, error: err.response?.data?.error || err.message };
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise a Kenyan phone number to 2547XXXXXXXX format.
 * Returns null if invalid.
 */
export const normaliseMpesaPhone = (phone = '') => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('254') && digits.length === 12) return digits;
    if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
    if (digits.length === 9) return '254' + digits;
    return null;
};

/**
 * Format a number as KES currency string.
 */
export const formatKES = (amount) =>
    `KES ${parseFloat(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 })}`;

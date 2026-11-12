/**
 * Finance API Service
 * Connects jen_frontend to jenc_backend Django REST endpoints under /api/finance/
 */

import api from './api';

/**
 * Fetch financial settings (accounting periods, payment methods, income/expense types, funds, GL accounts)
 */
export const getFinanceSettings = async (section = 'all') => {
  const params = section !== 'all' ? `?section=${section}` : '';
  const res = await api.get(`finance/settings/${params}`);
  return res;
};

/**
 * Manage finance setting (create, update, toggle, close_period)
 */
export const manageFinanceSetting = async (payload) => {
  const res = await api.post('finance/settings/', payload);
  return res;
};

export default {
  getFinanceSettings,
  manageFinanceSetting,
};


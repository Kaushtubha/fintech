/**
 * FinSight API Client Service
 * Connects frontend dashboard components to FastAPI analytics endpoints.
 */

const API_BASE = '/api';

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

export async function fetchDashboardSummary(params = {}) {
  const res = await fetch(`${API_BASE}/dashboard/summary${buildQuery(params)}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchDashboardTrends(params = {}) {
  const res = await fetch(`${API_BASE}/dashboard/trends${buildQuery(params)}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard trends');
  return res.json();
}

export async function fetchRevenueAnalytics(params = {}) {
  const res = await fetch(`${API_BASE}/analytics/revenue${buildQuery(params)}`);
  if (!res.ok) throw new Error('Failed to fetch revenue analytics');
  return res.json();
}

export async function fetchExpenseAnalytics(params = {}) {
  const res = await fetch(`${API_BASE}/analytics/expenses${buildQuery(params)}`);
  if (!res.ok) throw new Error('Failed to fetch expense analytics');
  return res.json();
}

export async function fetchCategoryAnalytics(params = {}) {
  const res = await fetch(`${API_BASE}/analytics/categories${buildQuery(params)}`);
  if (!res.ok) throw new Error('Failed to fetch category analytics');
  return res.json();
}

export async function fetchPaymentAnalytics(params = {}) {
  const res = await fetch(`${API_BASE}/analytics/payments${buildQuery(params)}`);
  if (!res.ok) throw new Error('Failed to fetch payment analytics');
  return res.json();
}

export async function fetchCustomerAnalytics(params = {}) {
  const res = await fetch(`${API_BASE}/analytics/customers${buildQuery(params)}`);
  if (!res.ok) throw new Error('Failed to fetch customer analytics');
  return res.json();
}

export async function fetchTransactions(params = {}) {
  const res = await fetch(`${API_BASE}/transactions${buildQuery(params)}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function fetchAnomalies(params = {}) {
  const res = await fetch(`${API_BASE}/anomalies${buildQuery(params)}`);
  if (!res.ok) throw new Error('Failed to fetch anomalies');
  return res.json();
}

export async function fetchAnomalySummary() {
  const res = await fetch(`${API_BASE}/anomalies/summary`);
  if (!res.ok) throw new Error('Failed to fetch anomaly summary');
  return res.json();
}

export async function fetchMonthlyReport(month = '') {
  const param = month ? `?month=${month}` : '';
  const res = await fetch(`${API_BASE}/reports/monthly${param}`);
  if (!res.ok) throw new Error('Failed to fetch monthly report');
  return res.json();
}

export async function fetchDataQuality() {
  const res = await fetch(`${API_BASE}/data-quality`);
  if (!res.ok) throw new Error('Failed to fetch data quality');
  return res.json();
}

export function getExportCsvUrl(params = {}) {
  return `${API_BASE}/transactions${buildQuery({ ...params, export_csv: true })}`;
}

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewPage from './pages/OverviewPage';
import RevenuePage from './pages/RevenuePage';
import ExpensesPage from './pages/ExpensesPage';
import TransactionsPage from './pages/TransactionsPage';
import PaymentsPage from './pages/PaymentsPage';
import AnomaliesPage from './pages/AnomaliesPage';
import ReportsPage from './pages/ReportsPage';
import DataQualityPage from './pages/DataQualityPage';
import {
  fetchDashboardSummary,
  fetchDashboardTrends,
  fetchRevenueAnalytics,
  fetchExpenseAnalytics,
  fetchPaymentAnalytics,
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    region: '',
  });

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        region: filters.region,
      };

      const [sumRes, trendsRes, revRes, expRes, payRes] = await Promise.all([
        fetchDashboardSummary(params),
        fetchDashboardTrends(params),
        fetchRevenueAnalytics(params),
        fetchExpenseAnalytics(params),
        fetchPaymentAnalytics(params),
      ]);

      setSummary(sumRes);
      setTrends(trendsRes || []);
      setRevenueData(revRes);
      setExpenseData(expRes);
      setPaymentData(payRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-900">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Filter Header */}
        <Header
          filters={filters}
          setFilters={setFilters}
          onRefresh={loadDashboardData}
          loading={loading}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'overview' && (
              <OverviewPage
                summary={summary}
                trends={trends}
                revenueData={revenueData}
                expenseData={expenseData}
                paymentData={paymentData}
              />
            )}

            {activeTab === 'revenue' && (
              <RevenuePage revenueData={revenueData} trends={trends} />
            )}

            {activeTab === 'expenses' && (
              <ExpensesPage expenseData={expenseData} trends={trends} />
            )}

            {activeTab === 'transactions' && (
              <TransactionsPage globalFilters={filters} />
            )}

            {activeTab === 'payments' && (
              <PaymentsPage paymentData={paymentData} />
            )}

            {activeTab === 'anomalies' && <AnomaliesPage />}

            {activeTab === 'reports' && <ReportsPage />}

            {activeTab === 'data-quality' && <DataQualityPage />}
          </div>
        </main>
      </div>
    </div>
  );
}

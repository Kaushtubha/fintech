import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Printer,
} from 'lucide-react';
import { fetchMonthlyReport } from '../services/api';

const AVAILABLE_MONTHS = [
  '2026-05',
  '2026-04',
  '2026-03',
  '2026-02',
  '2026-01',
  '2025-12',
  '2025-11',
  '2025-10',
];

function formatCurrency(val) {
  if (val === undefined || val === null) return '₹0';
  const num = Number(val);
  if (Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async (m) => {
    setLoading(true);
    try {
      const data = await fetchMonthlyReport(m);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(selectedMonth);
  }, [selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  const summary = report?.summary || {};
  const observations = report?.key_observations || [];
  const topIncome = report?.top_income_categories || [];
  const topExpense = report?.top_expense_categories || [];
  const unusualTxns = report?.unusual_transactions || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Executive Financial & Cash Flow Performance Report
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmic period intelligence report generating dynamic observations based on verified accounting metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              {AVAILABLE_MONTHS.map((m) => (
                <option key={m} value={m}>
                  Report: {m}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-slate-400">
          Generating financial analytics report for {selectedMonth}...
        </div>
      )}

      {report && !loading && (
        <div className="space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Realized Revenue
              </span>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(summary.income)}
              </h4>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span
                  className={
                    Number(summary.mom_income_growth_pct) >= 0
                      ? 'text-emerald-600 font-semibold'
                      : 'text-rose-600 font-semibold'
                  }
                >
                  {summary.mom_income_growth_pct}% MoM
                </span>
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Operational Expenses
              </span>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(summary.expenses)}
              </h4>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span
                  className={
                    Number(summary.mom_expense_growth_pct) <= 0
                      ? 'text-emerald-600 font-semibold'
                      : 'text-rose-600 font-semibold'
                  }
                >
                  {summary.mom_expense_growth_pct}% MoM
                </span>
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Net Period Cash Flow
              </span>
              <h4
                className={`text-2xl font-bold mt-1 ${
                  Number(summary.net_cash_flow) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {formatCurrency(summary.net_cash_flow)}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Variance: {summary.net_cash_flow_diff >= 0 ? '+' : ''}
                {formatCurrency(summary.net_cash_flow_diff)} vs prev month
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Gateway Conversion
              </span>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">
                {summary.success_rate_pct}%
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {summary.failed_transactions} dropped | {formatCurrency(summary.reversals_amount)} rev
              </p>
            </div>
          </div>

          {/* Algorithmic Key Observations Section */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-xl p-6 text-white shadow-md border border-indigo-950">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold tracking-tight">
                Data-Driven Algorithmic Insights ({selectedMonth})
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              These observations are automatically synthesized by comparing calculated period metrics, category variances, and clearing health against established financial benchmarks.
            </p>

            <div className="space-y-3">
              {observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-emerald-400">{idx + 1}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {obs}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Departmental Drivers: Top Inflows & Outflows */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Revenue Pillars */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
                Top Revenue Pillars in {selectedMonth}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Primary incoming commercial categories for this month.
              </p>
              <div className="space-y-3">
                {topIncome.map((c, i) => (
                  <div
                    key={c.category}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{c.category}</span>
                        <span className="text-[10px] text-slate-400">{c.count} transactions</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      {formatCurrency(c.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Outflow Drivers */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
                Top Operating Cost Drivers in {selectedMonth}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Largest expenditure categories for this period.
              </p>
              <div className="space-y-3">
                {topExpense.map((c, i) => (
                  <div
                    key={c.category}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{c.category}</span>
                        <span className="text-[10px] text-slate-400">{c.count} disbursements</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-rose-700">
                      {formatCurrency(c.spend)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

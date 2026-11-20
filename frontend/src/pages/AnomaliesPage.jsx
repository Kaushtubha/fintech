import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  SlidersHorizontal,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { fetchAnomalies, fetchAnomalySummary } from '../services/api';

const SEVERITY_BADGES = {
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-blue-50 text-blue-700 border-blue-200',
};

const METHOD_BADGES = {
  IQR: 'bg-purple-50 text-purple-700 border-purple-200',
  'Z-Score': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Rule-Based': 'bg-slate-100 text-slate-800 border-slate-200',
};

const STATUS_BADGES = {
  Reviewed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Escalated: 'bg-rose-50 text-rose-700 border-rose-200',
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
};

function formatCurrency(val) {
  if (val === undefined || val === null) return '₹0';
  const num = Number(val);
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('all');
  const [severity, setSeverity] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        fetchAnomalies({
          method: method === 'all' ? '' : method,
          severity: severity,
          limit: 100,
        }),
        fetchAnomalySummary(),
      ]);
      setAnomalies(listRes || []);
      setSummary(sumRes || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [method, severity]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-500" />
          Statistical Anomaly & Outlier Review Engine
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Automated outlier flagging using Tukey's Interquartile Range (IQR), 3-Sigma Z-Score standardization, and velocity rules.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Flagged for Audit
          </span>
          <h4 className="text-2xl font-bold text-slate-900 mt-1">
            {summary ? Number(summary.total_flagged).toLocaleString() : '...'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Outliers across all categories</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
            High Severity Flier
          </span>
          <h4 className="text-2xl font-bold text-rose-700 mt-1">
            {summary ? Number(summary.high_severity_count).toLocaleString() : '...'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">&gt; Q3 + 3.0×IQR or &gt; ₹100k</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            Medium Severity
          </span>
          <h4 className="text-2xl font-bold text-amber-700 mt-1">
            {summary ? Number(summary.medium_severity_count).toLocaleString() : '...'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Between ₹50k and ₹100k</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
            Outlier Capital Sum
          </span>
          <h4 className="text-2xl font-bold text-indigo-700 mt-1">
            {summary ? `₹${(Number(summary.total_flagged_amount) / 10000000).toFixed(2)} Cr` : '...'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Total reviewable amount</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-600 mr-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Method:
          </span>
          {['all', 'IQR', 'Z-Score', 'Rule-Based'].map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                method === m
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m === 'all' ? 'All Methods' : m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Severity:</span>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Severities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Txn ID</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Amount (INR)</th>
                <th className="py-3 px-3.5">Method</th>
                <th className="py-3 px-3.5">Severity</th>
                <th className="py-3 px-3.5">Statistical Rationale</th>
                <th className="py-3 px-3.5">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {anomalies.map((anom) => (
                <tr key={`${anom.transaction_id}-${anom.detection_method}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-800">
                    {anom.transaction_id}
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-600 whitespace-nowrap">
                    {anom.transaction_date}
                  </td>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-800">
                    {anom.category}
                  </td>
                  <td className="py-2.5 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(anom.amount)}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${METHOD_BADGES[anom.detection_method] || 'bg-slate-100'}`}>
                      {anom.detection_method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${SEVERITY_BADGES[anom.severity] || 'bg-slate-100'}`}>
                      {anom.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-600 font-medium max-w-xs truncate" title={anom.reason}>
                    {anom.reason}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGES[anom.review_status] || 'bg-slate-100'}`}>
                      {anom.review_status}
                    </span>
                  </td>
                </tr>
              ))}

              {anomalies.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No flagged anomalies match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

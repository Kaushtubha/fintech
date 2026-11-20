import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { CreditCard, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

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

export default function PaymentsPage({ paymentData }) {
  const channels = paymentData?.by_channel || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Payment Method Intelligence & Gateway Performance
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Evaluate clearing reliability, failure drop-offs, and channel economics across UPI, Cards, and Net Banking.
        </p>
      </div>

      {/* Gateway Conversion Comparison Chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
          Settled Volume vs Failed / Dropped Inflow by Gateway
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Financial impact of transaction declines across banking rails.
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channels} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="payment_method" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`}
                tickLine={false}
              />
              <Tooltip
                formatter={(val, name) => [formatCurrency(val), name]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Bar dataKey="settled_volume" name="Settled Volume" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="failed_volume" name="Dropped Value" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gateway Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Comprehensive Channel Conversion Scorecard
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Realized volume, failure rates, and reversal frequency by channel.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Payment Rail</th>
                <th className="py-3 px-4">Initiated Count</th>
                <th className="py-3 px-4">Success Rate</th>
                <th className="py-3 px-4">Failed Requests</th>
                <th className="py-3 px-4">Reversals</th>
                <th className="py-3 px-4">Settled Value</th>
                <th className="py-3 px-4">Failure Value Lost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channels.map((pm) => (
                <tr key={pm.payment_method} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>{pm.payment_method}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {Number(pm.total_transactions).toLocaleString()} ({pm.volume_share_pct}%)
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${pm.success_rate_pct}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-emerald-700">
                        {pm.success_rate_pct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-rose-600 font-semibold">
                    {Number(pm.failed_count).toLocaleString()} ({pm.failure_rate_pct}%)
                  </td>
                  <td className="py-3 px-4 text-purple-600 font-medium">
                    {Number(pm.reversed_count).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatCurrency(pm.settled_volume)}
                  </td>
                  <td className="py-3 px-4 text-rose-700 font-medium">
                    {formatCurrency(pm.failed_volume)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

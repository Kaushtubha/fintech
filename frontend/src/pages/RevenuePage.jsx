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
  LineChart,
  Line,
} from 'recharts';
import { Award, UserCheck, TrendingUp, Compass } from 'lucide-react';

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

export default function RevenuePage({ revenueData, trends }) {
  const byCategory = revenueData?.by_category || [];
  const byRegion = revenueData?.by_region || [];
  const topCustomers = revenueData?.top_customers || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Revenue Intelligence & Expansion Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          In-depth breakdown of gross inflows, category mix, regional performance, and key enterprise accounts.
        </p>
      </div>

      {/* Revenue Trajectory & MoM Acceleration */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Monthly Revenue Trajectory & MoM Expansion Velocity
            </h3>
            <p className="text-xs text-slate-500">
              Completed income receipts (green bars) alongside month-over-month growth rate percentage (purple line).
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`}
                tickLine={false}
              />
              <Tooltip
                formatter={(val, name) => [
                  name === 'MoM Growth %' ? `${val}%` : formatCurrency(val),
                  name,
                ]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Bar dataKey="income" name="Monthly Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Contribution & Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Contribution Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
            Revenue by Functional Category
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Aggregated gross value, volume, and average order value per stream.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Revenue Share</th>
                  <th className="py-2.5 px-3">Total Value</th>
                  <th className="py-2.5 px-3">Avg Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byCategory.map((cat) => (
                  <tr key={cat.category} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {cat.category}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${cat.percentage_share}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-600 font-medium">
                          {cat.percentage_share}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {formatCurrency(cat.total_revenue)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      ₹{Number(cat.avg_transaction_value).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regional Performance */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
            Geographic Revenue Contribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Commercial territory performance across India.
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byRegion}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`}
                />
                <YAxis dataKey="region" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="total_revenue" name="Regional Revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 10 Spenders Leaderboard */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Top 10 High-Value Enterprise Accounts
              </h3>
              <p className="text-xs text-slate-500">
                Key client accounts driving maximum aggregate inflow.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Completed Orders</th>
                <th className="py-2.5 px-3">Total Spend</th>
                <th className="py-2.5 px-3">Avg Order Value</th>
                <th className="py-2.5 px-3">Account Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topCustomers.map((cust, idx) => (
                <tr key={cust.customer_id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-600">
                    {cust.customer_id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {Number(cust.orders_count).toLocaleString()} txns
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {formatCurrency(cust.total_spend)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    ₹{Number(cust.avg_order_value).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Enterprise Tier 1
                    </span>
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

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  CheckCircle,
  AlertOctagon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from 'recharts';
import KpiCard from '../components/KpiCard';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
const STATUS_COLORS = {
  Completed: '#10b981',
  Pending: '#f59e0b',
  Failed: '#ef4444',
  Reversed: '#8b5cf6',
};

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

export default function OverviewPage({ summary, trends, revenueData, expenseData, paymentData }) {
  if (!summary) {
    return (
      <div className="p-8 flex items-center justify-center text-slate-400">
        Loading financial analytics data...
      </div>
    );
  }

  const categoryIncome = revenueData?.by_category || [];
  const categoryExpenses = expenseData?.by_category || [];
  const paymentMethods = paymentData?.by_channel || [];
  const statusDistribution = paymentData?.by_status || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial Health & Cash Flow Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cash ledger aggregations based on verified accounting recognition rules.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200">
            Ledger Status: Balanced
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Gross Revenue"
          value={formatCurrency(summary.total_income)}
          subvalue={`${Number(summary.completed_txns || 0).toLocaleString()} completed receipts`}
          trend={summary.income_growth_pct}
          trendLabel="MoM"
          icon={TrendingUp}
          color="emerald"
        />
        <KpiCard
          title="Operating Expenses"
          value={formatCurrency(summary.total_expenses)}
          subvalue="Cost of operations & payroll"
          trend={summary.expense_growth_pct}
          trendLabel="MoM"
          icon={TrendingDown}
          color="rose"
          invertTrend={true}
        />
        <KpiCard
          title="Net Cash Flow"
          value={formatCurrency(summary.net_cash_flow)}
          subvalue={`Margin: ${summary.net_cash_margin_pct}%`}
          trend={null}
          icon={DollarSign}
          color={Number(summary.net_cash_flow) >= 0 ? 'emerald' : 'rose'}
        />
        <KpiCard
          title="Transaction Volume"
          value={Number(summary.total_transactions || 0).toLocaleString()}
          subvalue={`${Number(summary.unique_customers || 0).toLocaleString()} unique accounts`}
          trend={null}
          icon={Receipt}
          color="blue"
        />
        <KpiCard
          title="Success Rate"
          value={`${summary.success_rate_pct}%`}
          subvalue={`${summary.failed_txns || 0} failed | ₹${Number(summary.reversal_amount || 0).toLocaleString()} rev.`}
          trend={null}
          icon={CheckCircle}
          color="indigo"
        />
      </div>

      {/* Primary Chart: Monthly Inflow vs Outflow vs Net Cash Flow */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Cash Flow Trajectory (Income vs Expenses vs Net Flow)
            </h3>
            <p className="text-xs text-slate-500">
              Monthly recognized income (green bars), completed operating burn (red bars), and net cash surplus/deficit (blue line).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span> Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-400 inline-block"></span> Expense
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-indigo-600 inline-block"></span> Net Cash Flow
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`}
                tickLine={false}
              />
              <Tooltip
                formatter={(val, name) => [formatCurrency(val), name]}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Line type="monotone" dataKey="net_cash_flow" name="Net Cash Flow" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts: Revenue by Category & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Category */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
            Revenue by Category Share
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Percentage contribution across commercial products and service retainers.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryIncome}
                  dataKey="total_revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {categoryIncome.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
            Expenditure by Cost Center
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Total operational capital deployed across functional departments.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryExpenses}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`}
                />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="total_expense" name="Expense Amount" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tertiary Row: Payment Methods & Status Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Volume */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
            Payment Channel Throughput & Settled Value
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Comparison between transaction volume and total settled monetary volume.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Volume Share</th>
                  <th className="py-2.5 px-3">Settled Value</th>
                  <th className="py-2.5 px-3">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentMethods.map((pm) => (
                  <tr key={pm.payment_method} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {pm.payment_method}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${pm.volume_share_pct}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-600 font-medium">
                          {pm.volume_share_pct}% ({Number(pm.total_transactions).toLocaleString()})
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {formatCurrency(pm.settled_volume)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          Number(pm.success_rate_pct) >= 85
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {pm.success_rate_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
            Ledger Status Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Proportion of transactions by settlement state.
          </p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {statusDistribution.map((entry) => (
                    <Cell
                      key={`status-${entry.status}`}
                      fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => Number(val).toLocaleString()}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

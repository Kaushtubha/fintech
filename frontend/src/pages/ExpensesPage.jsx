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
} from 'recharts';
import { Building2, TrendingDown, Layers } from 'lucide-react';

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

export default function ExpensesPage({ expenseData, trends }) {
  const byCategory = expenseData?.by_category || [];
  const byMerchant = expenseData?.by_merchant || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Expense Analysis & Operational Burn Rate
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive cost accounting across departmental budgets, major vendors, and recurring burn.
        </p>
      </div>

      {/* Monthly Expense Burn Trajectory */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
          Monthly Operating Expenditure Burn
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Historical timeline of finalized operational disbursements.
        </p>

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
                formatter={(val) => [formatCurrency(val), 'Monthly Burn']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="expenses" name="Operational Outflow" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown & Vendor Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Category Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Cost Allocation by Functional Center
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Total outflow, transaction counts, and ticket size benchmarks.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Cost Center</th>
                  <th className="py-2.5 px-3">Share</th>
                  <th className="py-2.5 px-3">Total Spend</th>
                  <th className="py-2.5 px-3">Avg Invoice</th>
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
                            className="bg-rose-500 h-1.5 rounded-full"
                            style={{ width: `${cat.percentage_share}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-600 font-medium">
                          {cat.percentage_share}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {formatCurrency(cat.total_expense)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      ₹{Number(cat.avg_expense_size).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Major Vendors Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Top Corporate Vendors & Suppliers
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Largest institutional counterparties receiving operational disbursements.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Vendor / Merchant</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Disbursed Invoices</th>
                  <th className="py-2.5 px-3">Total Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byMerchant.map((m) => (
                  <tr key={`${m.merchant}-${m.category}`} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {m.merchant}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                        {m.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {m.payment_count} disbursements
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {formatCurrency(m.total_spent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

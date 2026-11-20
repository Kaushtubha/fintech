import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { fetchTransactions, getExportCsvUrl } from '../services/api';

const STATUS_BADGES = {
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Failed: 'bg-rose-50 text-rose-700 border-rose-200',
  Reversed: 'bg-purple-50 text-purple-700 border-purple-200',
};

const CATEGORIES = [
  'All Categories',
  'Sales',
  'Services',
  'Subscription',
  'Interest',
  'Other Income',
  'Operations',
  'Marketing',
  'Payroll',
  'Rent',
  'Utilities',
  'Software',
  'Logistics',
  'Other Expenses',
];

const PAYMENT_METHODS = ['All Channels', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Wallet'];
const STATUSES = ['All Statuses', 'Completed', 'Pending', 'Failed', 'Reversed'];

export default function TransactionsPage({ globalFilters }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [txnType, setTxnType] = useState('');
  const [sortBy, setSortBy] = useState('transaction_date');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchTransactions({
        page,
        limit,
        sort_by: sortBy,
        order,
        search,
        category: category === 'All Categories' ? '' : category,
        payment_method: paymentMethod === 'All Channels' ? '' : paymentMethod,
        status: status === 'All Statuses' ? '' : status,
        transaction_type: txnType,
        start_date: globalFilters?.startDate || '',
        end_date: globalFilters?.endDate || '',
        region: globalFilters?.region || '',
      });
      setTransactions(res.records || []);
      setTotalRecords(res.total_records || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, sortBy, order, category, paymentMethod, status, txnType, globalFilters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };

  const exportUrl = getExportCsvUrl({
    search,
    category: category === 'All Categories' ? '' : category,
    payment_method: paymentMethod === 'All Channels' ? '' : paymentMethod,
    status: status === 'All Statuses' ? '' : status,
    transaction_type: txnType,
    sort_by: sortBy,
    order,
    start_date: globalFilters?.startDate || '',
    end_date: globalFilters?.endDate || '',
    region: globalFilters?.region || '',
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Transaction Ledger & Financial Records
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, inspect, and export atomic transactional records across all commercial channels.
          </p>
        </div>

        <a
          href={exportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Cleaned CSV</span>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Customer, or Merchant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </form>

          {/* Quick Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Payment Method */}
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Type */}
            <select
              value={txnType}
              onChange={(e) => {
                setTxnType(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="Income">Income (+)</option>
              <option value="Expense">Expense (-)</option>
            </select>
          </div>
        </div>

        {/* Record Count Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800">{transactions.length}</strong> of{' '}
            <strong className="text-slate-800">{Number(totalRecords).toLocaleString()}</strong> records
          </span>
          {loading && <span className="text-emerald-600 font-medium animate-pulse">Filtering ledger...</span>}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('transaction_id')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Txn ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('transaction_date')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Type</th>
                <th className="py-3 px-3.5">Category</th>
                <th
                  onClick={() => handleSort('amount')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Amount (INR)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Channel</th>
                <th className="py-3 px-3.5">Customer / Merchant</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Region</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => {
                const isIncome = tx.transaction_type === 'Income';
                const statusBadge = STATUS_BADGES[tx.status] || 'bg-slate-50 text-slate-700 border-slate-200';
                return (
                  <tr key={tx.transaction_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-800">
                      {tx.transaction_id}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 whitespace-nowrap">
                      {tx.transaction_date}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isIncome ? '+ Inflow' : '- Outflow'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 font-medium">
                      {tx.category}
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                      <span className={isIncome ? 'text-emerald-700' : 'text-slate-900'}>
                        ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600">
                      {tx.payment_method}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="leading-tight">
                        <span className="font-semibold text-slate-800 block">
                          {tx.merchant}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tx.customer_id}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 font-medium">
                      {tx.region}
                    </td>
                  </tr>
                );
              })}

              {transactions.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    No transactions match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="py-3 px-4 border-t border-slate-200 flex items-center justify-between text-xs bg-slate-50/50">
          <span className="text-slate-500">
            Page <strong className="text-slate-800">{page}</strong> of{' '}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 font-medium transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 font-medium transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

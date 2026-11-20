import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  ReceiptText,
  CreditCard,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Database,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'expenses', label: 'Expenses', icon: TrendingDown },
  { id: 'transactions', label: 'Transactions', icon: ReceiptText },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle, badge: 'Risk' },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'data-quality', label: 'Data Quality', icon: CheckCircle2 },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-emerald-500/20">
          FS
        </div>
        <div>
          <h1 className="font-bold text-white tracking-tight text-base leading-none">
            FinSight
          </h1>
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
            Analytics Platform
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Analytics & Intelligence
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Footbar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div className="text-xs">
            <p className="text-slate-200 font-medium leading-none">DuckDB + PostgreSQL</p>
            <p className="text-[10px] text-slate-500 mt-0.5">69,137 Records Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

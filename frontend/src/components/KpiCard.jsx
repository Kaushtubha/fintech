import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({
  title,
  value,
  subvalue,
  trend,
  trendLabel = 'vs prev month',
  icon: Icon,
  color = 'blue',
  invertTrend = false,
}) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0 || trend === null || trend === undefined;

  // For expenses, trend > 0 might be considered adverse (red)
  const isGood = invertTrend ? !isPositive : isPositive;

  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  }[color] || 'bg-slate-50 text-slate-600 border-slate-100';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorStyles}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </h3>
        {subvalue && (
          <p className="text-xs text-slate-500 mt-0.5">{subvalue}</p>
        )}
      </div>

      {!isNeutral && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-semibold ${
              isGood
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </span>
          <span className="text-slate-400 font-normal">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

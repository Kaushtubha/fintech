import React from 'react';
import { Calendar, MapPin, RefreshCw, Filter } from 'lucide-react';

const DATE_PRESETS = [
  { label: 'All Time (18 Mos)', start: '', end: '' },
  { label: '2026 YTD', start: '2026-01-01', end: '2026-06-30' },
  { label: 'Q1 2026', start: '2026-01-01', end: '2026-03-31' },
  { label: 'Q2 2026', start: '2026-04-01', end: '2026-06-30' },
  { label: 'Full Year 2025', start: '2025-01-01', end: '2025-12-31' },
];

const REGIONS = ['All Regions', 'North', 'South', 'East', 'West', 'Central'];

export default function Header({
  filters,
  setFilters,
  onRefresh,
  loading = false,
}) {
  const currentPreset =
    DATE_PRESETS.find(
      (p) => p.start === filters.startDate && p.end === filters.endDate
    )?.label || 'Custom Period';

  const handlePresetChange = (label) => {
    const selected = DATE_PRESETS.find((p) => p.label === label);
    if (selected) {
      setFilters((prev) => ({
        ...prev,
        startDate: selected.start,
        endDate: selected.end,
      }));
    }
  };

  const handleRegionChange = (reg) => {
    setFilters((prev) => ({
      ...prev,
      region: reg === 'All Regions' ? '' : reg,
    }));
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-xs">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filters</span>
        </div>
        {filters.region && (
          <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
            Region: {filters.region}
          </span>
        )}
        {filters.startDate && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            Period: {filters.startDate} to {filters.endDate}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Date Preset Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={currentPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer text-slate-700"
          >
            {DATE_PRESETS.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Region Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.region ? filters.region : 'All Regions'}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer text-slate-700"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50"
          title="Reload analytical data"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`}
          />
        </button>
      </div>
    </header>
  );
}

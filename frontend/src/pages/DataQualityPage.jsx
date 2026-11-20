import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { fetchDataQuality } from '../services/api';

export default function DataQualityPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchDataQuality();
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          Data Ingestion & Cleaning Pipeline Audit
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Automated data validation report tracking schema conformity, deduplication, regex harmonization, and null handling.
        </p>
      </div>

      {/* Ingestion Pipeline Funnel Summary */}
      {report && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
            End-to-End Data Cleansing Lifecycle Funnel
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                1. Raw Ingested Records
              </span>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">
                {Number(report.initial_raw_rows).toLocaleString()}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Synthetic & multi-channel CSV</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                2. Duplicates Removed
              </span>
              <h4 className="text-2xl font-bold text-rose-700 mt-1">
                -{Number(report.duplicates_removed).toLocaleString()}
              </h4>
              <p className="text-xs text-rose-600/80 mt-0.5">Duplicate transaction_id tags</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                3. Invalid Dates & Amounts
              </span>
              <h4 className="text-2xl font-bold text-amber-700 mt-1">
                -{Number(report.corrupted_dates_dropped + report.zero_or_invalid_amounts_dropped).toLocaleString()}
              </h4>
              <p className="text-xs text-amber-700/80 mt-0.5">Unparseable or zero rows</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                4. Clean Production Rows
              </span>
              <h4 className="text-2xl font-bold text-emerald-800 mt-1">
                {Number(report.final_cleaned_rows).toLocaleString()}
              </h4>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                {report.clean_retention_rate_pct}% Quality Retention
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Granular Audit Metrics Breakdown */}
      {report && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Data Quality Transformations & Operations Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact quantitative measure of all automated cleanings executed by `backend/scripts/clean_data.py`.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Cleaning Operation</th>
                  <th className="py-3 px-4">Transformation Type</th>
                  <th className="py-3 px-4">Affected Rows</th>
                  <th className="py-3 px-4">Resolution Logic</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    Deduplication
                  </td>
                  <td className="py-3 px-4 text-slate-500">De-duplication Filter</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {Number(report.duplicates_removed).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Removed redundant transaction_id records, retaining latest record
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Resolved
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    Corrupted Dates
                  </td>
                  <td className="py-3 px-4 text-slate-500">Temporal Normalization</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {Number(report.corrupted_dates_dropped).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Parsed multiple formats (YYYY-MM-DD, DD/MM/YYYY, dots); dropped unparseable strings
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Standardized
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    Negative Amounts
                  </td>
                  <td className="py-3 px-4 text-slate-500">Monetary Rectification</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {Number(report.negative_amounts_rectified).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Converted signed accounting debits to positive magnitude
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Rectified
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    Category Harmonization
                  </td>
                  <td className="py-3 px-4 text-slate-500">Regex Taxonomy Mapping</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {Number(report.categories_standardized).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Mapped typos & casing variants (e.g. 'sale_rev', 'mktg', 'ops') to canonical enums
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Mapped
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    Payment Method Harmonization
                  </td>
                  <td className="py-3 px-4 text-slate-500">Banking Rail Normalization</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {Number(report.payment_methods_standardized).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Harmonized formats like 'upi_pay', 'Credit-Card', 'NEFT/RTGS' into official names
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Harmonized
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    Missing Customer IDs
                  </td>
                  <td className="py-3 px-4 text-slate-500">Referential Imputation</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {Number(report.missing_customer_ids_imputed).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Imputed null and blank string customer IDs with canonical 'CUST_ANON'
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Imputed
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    Missing Merchants & Regions
                  </td>
                  <td className="py-3 px-4 text-slate-500">Metadata Defaulting</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {Number(report.missing_merchants_imputed + report.missing_regions_imputed).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Defaulted blank counterparties to 'Direct Merchant Partner' and region to 'Central'
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Defaulted
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interview Discussion Guide Card */}
      <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold tracking-tight text-white">
            ZenStatement Interview Talking Points: Data Cleaning & Ingestion
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          When asked how data quality was handled in FinSight, here are the real architectural decisions you implemented:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <h5 className="font-bold text-emerald-400 mb-1">1. Deduplication Logic</h5>
            <p className="text-slate-300">
              Used transaction_id as the primary natural key. Tracked duplicate rates (~1.5%) and kept the first validated record while logging dropped instances for compliance audits.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <h5 className="font-bold text-indigo-400 mb-1">2. Temporal & Format Normalization</h5>
            <p className="text-slate-300">
              Multi-pass regex parser evaluated ISO, slash, and dot date strings into canonical YYYY-MM-DD. Trapped calendar boundary violations (e.g. Feb 31) without crashing the pipeline.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <h5 className="font-bold text-amber-400 mb-1">3. Accounting Integrity</h5>
            <p className="text-slate-300">
              Failed, pending, and reversed transactions are preserved in the database for channel health metrics, but strictly segregated from recognized revenue and net cash flow calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

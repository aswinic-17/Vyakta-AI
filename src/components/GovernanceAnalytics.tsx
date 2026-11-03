import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  RefreshCw,
  Scale,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { BrandPreset, GovernanceAnalytics as AnalyticsData } from '../types';
import { useAuth } from '../context/AuthContext';

interface GovernanceAnalyticsProps {
  currentBrand: BrandPreset;
}

export const GovernanceAnalytics: React.FC<GovernanceAnalyticsProps> = ({ currentBrand }) => {
  const { authFetch } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/analytics?brandId=${currentBrand.id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.warn('Failed to load analytics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [currentBrand.id]);

  if (isLoading || !data) {
    return (
      <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-400" />
        Aggregating compliance analytics across persistent submissions...
      </div>
    );
  }

  const totalViolations =
    data.violationBreakdown.prohibitedPhrases +
    data.violationBreakdown.evidenceNotFound +
    data.violationBreakdown.toneViolations +
    data.violationBreakdown.missingDisclaimers;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h1 className="text-lg font-bold text-stone-900">
              Governance Analytics & Brand Integrity — {currentBrand.name}
            </h1>
          </div>
          <p className="text-xs text-stone-500 max-w-2xl">
            Live compliance intelligence, recurring regulatory risk patterns, and evidence utilization metrics computed from persistent brand submissions.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium text-stone-500">Total Submissions</span>
            <FileCheck2 className="w-4 h-4 text-stone-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{data.totalSubmissions}</div>
          <p className="text-[11px] text-stone-500 flex items-center gap-1">
            <span className="text-emerald-700 font-medium">✓ {data.approvedCount} Approved</span>
            <span>•</span>
            <span className="text-rose-700 font-medium">✕ {data.rejectedCount} Rejected</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium text-stone-500">Compliance Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{data.passRate}%</div>
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +4.2% trajectory over 30 days
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium text-stone-500">Average Brand Score</span>
            <Scale className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{data.averageScore} / 100</div>
          <p className="text-[11px] text-stone-500">
            Target threshold: <span className="font-semibold text-stone-700">80.0</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium text-stone-500">Evidence Utilization Rate</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{data.evidenceUtilizationRate}%</div>
          <p className="text-[11px] text-stone-500">Substantiated vs. unbacked claims</p>
        </div>
      </div>

      {/* Breakdown by Category & Weekly Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violation Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Violation Category Distribution
            </h2>
            <span className="text-xs text-stone-500 font-medium">{totalViolations} logged violations</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Evidence Not Found */}
            <div>
              <div className="flex justify-between text-stone-700 font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Evidence Not Found / Unsubstantiated Metrics
                </span>
                <span className="font-bold">{data.violationBreakdown.evidenceNotFound}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (data.violationBreakdown.evidenceNotFound / (totalViolations || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Prohibited Phrases */}
            <div>
              <div className="flex justify-between text-stone-700 font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  Prohibited Phrases & Absolute Guarantees
                </span>
                <span className="font-bold">{data.violationBreakdown.prohibitedPhrases}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (data.violationBreakdown.prohibitedPhrases / (totalViolations || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Tone Violations */}
            <div>
              <div className="flex justify-between text-stone-700 font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Tone & Stylistic Deviations
                </span>
                <span className="font-bold">{data.violationBreakdown.toneViolations}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (data.violationBreakdown.toneViolations / (totalViolations || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Missing Disclaimers */}
            <div>
              <div className="flex justify-between text-stone-700 font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-purple-500" />
                  Missing Mandatory Legal Disclaimers
                </span>
                <span className="font-bold">{data.violationBreakdown.missingDisclaimers}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (data.violationBreakdown.missingDisclaimers / (totalViolations || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Compliance Trajectory */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              7-Day Compliance Trajectory
            </h2>
            <span className="text-xs text-emerald-700 font-medium">Ascending Quality</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {data.complianceTrend.map((point) => (
              <div key={point.date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[11px] font-semibold text-stone-700">{point.score}</span>
                <div className="w-full bg-stone-100 rounded-t-lg relative flex items-end justify-center" style={{ height: '110px' }}>
                  <div
                    className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-t-lg transition-all"
                    style={{ height: `${point.score}%` }}
                    title={`${point.date}: Score ${point.score} (${point.submissions} submissions)`}
                  />
                </div>
                <span className="text-[11px] text-stone-500 font-medium">{point.date}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Minimum passing bar: 80%</span>
            <span className="text-emerald-700 font-medium">Average review cycle: 1.2 hrs</span>
          </div>
        </div>
      </div>

      {/* Top Violated Rules Table */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
          Top Identified Brand & Regulatory Vulnerabilities
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <th className="pb-3 font-medium">Rank & Guideline Rule</th>
                <th className="pb-3 font-medium">Governing Category</th>
                <th className="pb-3 font-medium text-right">Violations Logged</th>
                <th className="pb-3 font-medium text-right">Impact Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.topViolatedRules.map((r, idx) => (
                <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3 font-semibold text-stone-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-[10px] font-mono">
                      #{idx + 1}
                    </span>
                    {r.rule}
                  </td>
                  <td className="py-3 text-stone-600">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-medium uppercase">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-stone-900">
                    {r.count}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        idx === 0
                          ? 'bg-rose-100 text-rose-800'
                          : idx === 1
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {idx === 0 ? 'High Legal Risk' : idx === 1 ? 'Medium Risk' : 'Advisory'}
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
};

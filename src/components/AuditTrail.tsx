import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  FileText,
  KeyRound,
  FileCheck2,
  Sliders,
  Database,
  Image,
} from 'lucide-react';
import { AuditEvent } from '../types';
import { useAuth } from '../context/AuthContext';

export const AuditTrail: React.FC = () => {
  const { authFetch } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuditEvents = async () => {
    setIsLoading(true);
    try {
      const url = filterAction !== 'all' ? `/api/audit?action=${filterAction}` : '/api/audit?limit=100';
      const res = await authFetch(url);
      if (res.ok) {
        const list: AuditEvent[] = await res.json();
        setEvents(list);
      }
    } catch (e) {
      console.warn('Failed to load audit events:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditEvents();
  }, [filterAction]);

  const filteredEvents = events.filter((ev) => {
    const s = search.toLowerCase();
    return (
      ev.action.toLowerCase().includes(s) ||
      (ev.userEmail && ev.userEmail.toLowerCase().includes(s)) ||
      (ev.brandId && ev.brandId.toLowerCase().includes(s)) ||
      (ev.details && JSON.stringify(ev.details).toLowerCase().includes(s))
    );
  });

  const getActionIcon = (action: string) => {
    if (action.startsWith('AUTH_')) return <KeyRound className="w-3.5 h-3.5 text-indigo-600" />;
    if (action.startsWith('DECISION_')) return <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />;
    if (action.startsWith('GUIDELINES_')) return <Sliders className="w-3.5 h-3.5 text-purple-600" />;
    if (action.startsWith('EVIDENCE_')) return <Database className="w-3.5 h-3.5 text-blue-600" />;
    if (action.startsWith('IMAGE_')) return <Image className="w-3.5 h-3.5 text-pink-600" />;
    if (action.startsWith('DOCUMENT_')) return <FileText className="w-3.5 h-3.5 text-amber-600" />;
    return <Clock className="w-3.5 h-3.5 text-stone-600" />;
  };

  const getActionBadgeClass = (action: string) => {
    if (action.includes('APPROVED')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('REJECTED')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('LOGIN') || action.includes('REGISTER')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (action.includes('EVIDENCE')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('GUIDELINE')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-stone-100 text-stone-700 border-stone-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h1 className="text-lg font-bold text-stone-900">
              Regulatory Audit Trail & Governance Log
            </h1>
          </div>
          <p className="text-xs text-stone-500 max-w-2xl">
            Immutable system logs documenting authentication, content validation runs, guideline modifications, evidence revisions, and editorial approval decisions.
          </p>
        </div>

        <button
          onClick={loadAuditEvents}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Log
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, user email, or brand..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-xs cursor-pointer"
          >
            <option value="all">All System Actions</option>
            <option value="AUTH_LOGIN">AUTH_LOGIN</option>
            <option value="CONTENT_VALIDATED">CONTENT_VALIDATED</option>
            <option value="DECISION_APPROVED">DECISION_APPROVED</option>
            <option value="DECISION_REJECTED">DECISION_REJECTED</option>
            <option value="GUIDELINES_UPDATED">GUIDELINES_UPDATED</option>
            <option value="EVIDENCE_ADDED">EVIDENCE_ADDED</option>
            <option value="DOCUMENT_PARSED">DOCUMENT_PARSED</option>
            <option value="IMAGE_INSPECTED">IMAGE_INSPECTED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-stone-500">Loading audit records...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            No audit records matching your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-stone-100">
              <thead className="bg-stone-50/80 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor / Email</th>
                  <th className="py-3 px-4">Brand Workspace</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEvents.map((ev) => {
                  const isExpanded = expandedId === ev.id;
                  return (
                    <React.Fragment key={ev.id}>
                      <tr className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border ${getActionBadgeClass(
                              ev.action
                            )}`}
                          >
                            {getActionIcon(ev.action)}
                            {ev.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-700 font-medium">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-stone-400" />
                            {ev.userEmail || 'System Service'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                          {ev.brandId || 'Global / Account'}
                        </td>
                        <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                          {new Date(ev.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            {isExpanded ? 'Hide' : 'Inspect'}
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-stone-50/70 border-b border-stone-100">
                          <td colSpan={5} className="p-4">
                            <div className="bg-stone-900 text-stone-200 font-mono text-[11px] p-3 rounded-xl overflow-x-auto space-y-1">
                              <div className="text-stone-400">// Audit Event Payload — ID: {ev.id}</div>
                              <pre>{JSON.stringify(ev.details || { note: 'No metadata payload' }, null, 2)}</pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

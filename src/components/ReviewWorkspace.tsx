import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileCheck,
  Check,
  X,
  Edit2,
  Eye,
  Sliders,
  RotateCw,
  Clock,
  Download,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { ValidationReport, ValidationFinding, BrandPreset, ReviewDecision } from '../types';
import { SAMPLE_DRAFTS } from '../data/defaultBrands';
import { useAuth } from '../context/AuthContext';

interface ReviewWorkspaceProps {
  copy: string;
  onChangeCopy: (copy: string) => void;
  documentTitle: string;
  onChangeDocumentTitle: (title: string) => void;
  brand: BrandPreset;
  report: ValidationReport | null;
  isValidating: boolean;
  onAnalyzeCopy: () => void;
  selectedFindingId: string | null;
  onSelectFinding: (findingId: string) => void;
  onApplyRewrite: (finding: ValidationFinding, customText?: string) => void;
  onDismissFinding: (findingId: string, reason: string) => void;
  decision: ReviewDecision;
  onUpdateDecision: (decision: ReviewDecision) => void;
  onDownloadReport: () => void;
  onNavigateToSubmit?: () => void;
  onNavigateToGuidelines?: () => void;
}

export const ReviewWorkspace: React.FC<ReviewWorkspaceProps> = ({
  copy,
  onChangeCopy,
  documentTitle,
  onChangeDocumentTitle,
  brand,
  report,
  isValidating,
  onAnalyzeCopy,
  selectedFindingId,
  onSelectFinding,
  onApplyRewrite,
  onDismissFinding,
  decision,
  onUpdateDecision,
  onDownloadReport,
  onNavigateToSubmit,
  onNavigateToGuidelines,
}) => {
  const { authFetch } = useAuth();
  const [viewMode, setViewMode] = useState<'audit' | 'edit'>('audit');
  const [activeCategory, setActiveCategory] = useState<'all' | string>('all');
  const [editingFindingId, setEditingFindingId] = useState<string | null>(null);
  const [customEditText, setCustomEditText] = useState<string>('');
  const [reviewerName, setReviewerName] = useState(decision.reviewerName || 'Editorial Reviewer');
  const [reviewerNotes, setReviewerNotes] = useState(decision.reviewerNotes || '');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const quickDocInputRef = React.useRef<HTMLInputElement>(null);

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await authFetch('/api/documents/parse', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        onChangeCopy(data.text);
        onChangeDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err) {
      console.error('Quick document upload error:', err);
    } finally {
      setIsUploadingDoc(false);
      if (quickDocInputRef.current) quickDocInputRef.current.value = '';
    }
  };

  const loadSample = (brandKey: string) => {
    const s = SAMPLE_DRAFTS[brandKey];
    if (s) {
      onChangeDocumentTitle(s.title);
      onChangeCopy(s.copy);
    }
  };

  const handleApprove = () => {
    onUpdateDecision({
      status: 'approved',
      reviewerName: reviewerName.trim() || 'Editorial Reviewer',
      reviewerNotes: reviewerNotes.trim() || 'Content complies with brand guidelines and policy requirements.',
      decidedAt: new Date().toLocaleString(),
    });
  };

  const handleReject = () => {
    onUpdateDecision({
      status: 'rejected',
      reviewerName: reviewerName.trim() || 'Editorial Reviewer',
      reviewerNotes: reviewerNotes.trim() || 'Revisions required on flagged issues before publication.',
      decidedAt: new Date().toLocaleString(),
    });
  };

  // Render text with gentle pastel highlights
  const renderHighlightedCopy = () => {
    if (!report || report.findings.length === 0) {
      return (
        <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-stone-700">
          {copy || <span className="text-stone-400 italic">No copy entered yet.</span>}
        </div>
      );
    }

    const openFindings = report.findings
      .filter((f) => f.status === 'open' && f.type !== 'missing_disclaimer')
      .sort((a, b) => a.startIndex - b.startIndex);

    if (openFindings.length === 0) {
      return (
        <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-stone-800">
          {copy}
        </div>
      );
    }

    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    openFindings.forEach((f, idx) => {
      let start = f.startIndex;
      let end = f.endIndex;

      // Match check
      if (copy.substring(start, end).toLowerCase() !== f.originalText.toLowerCase()) {
        const found = copy.toLowerCase().indexOf(f.originalText.toLowerCase(), Math.max(0, start - 20));
        if (found !== -1) {
          start = found;
          end = found + f.originalText.length;
        } else {
          return;
        }
      }

      if (start < currentIndex) return;

      if (start > currentIndex) {
        elements.push(
          <span key={`text-${idx}-${currentIndex}`}>
            {copy.substring(currentIndex, start)}
          </span>
        );
      }

      const isSelected = selectedFindingId === f.id;

      // Soft pastel badge styles
      let highlightClass = 'bg-rose-100 text-rose-900 border-b-2 border-rose-300 hover:bg-rose-200/80';
      let tagLabel = 'Prohibited';
      let tagClass = 'bg-rose-200 text-rose-800';

      if (f.type === 'evidence_not_found') {
        highlightClass = 'bg-amber-100 text-amber-900 border-b-2 border-amber-300 hover:bg-amber-200/80';
        tagLabel = 'Evidence Not Found';
        tagClass = 'bg-amber-200 text-amber-800';
      } else if (f.type === 'tone_violation') {
        highlightClass = 'bg-yellow-100 text-yellow-900 border-b-2 border-yellow-300 hover:bg-yellow-200/80';
        tagLabel = 'Tone';
        tagClass = 'bg-yellow-200 text-yellow-800';
      } else if (f.type === 'terminology_opportunity') {
        highlightClass = 'bg-sky-100 text-sky-900 border-b-2 border-sky-300 hover:bg-sky-200/80';
        tagLabel = 'Preferred Term';
        tagClass = 'bg-sky-200 text-sky-800';
      }

      elements.push(
        <span
          key={`finding-${f.id}-${start}`}
          onClick={() => onSelectFinding(f.id)}
          className={`inline-flex items-baseline px-1.5 py-0.5 rounded cursor-pointer transition-all ${highlightClass} ${
            isSelected ? 'ring-2 ring-indigo-400 ring-offset-1 font-semibold' : ''
          }`}
          title={`${f.title}: Click to view suggested correction`}
        >
          <span>{copy.substring(start, end)}</span>
          <span className={`ml-1 text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 rounded ${tagClass}`}>
            {tagLabel}
          </span>
        </span>
      );

      currentIndex = end;
    });

    if (currentIndex < copy.length) {
      elements.push(
        <span key={`text-end-${currentIndex}`}>
          {copy.substring(currentIndex)}
        </span>
      );
    }

    return (
      <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-stone-800 select-text">
        {elements}
      </div>
    );
  };

  const filteredFindings = report?.findings.filter((f) => {
    if (activeCategory === 'all') return true;
    return f.type === activeCategory;
  }) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
      {/* LEFT COLUMN: Content Editor & Highlight Space (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {/* Editor Header Bar */}
        <div className="px-5 py-3.5 border-b border-stone-100 bg-[#fafafa]/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => onChangeDocumentTitle(e.target.value)}
              placeholder="Campaign / Draft Document Title..."
              className="w-full bg-transparent font-semibold text-sm text-stone-900 focus:outline-none focus:border-b focus:border-indigo-400"
            />
            <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-stone-500">
              <span>Governing Brand: <strong className="text-stone-800">{brand.name}</strong></span>
              <span>•</span>
              <span>{report?.metrics.wordCount || 0} words</span>
              <span>•</span>
              <span>{report?.metrics.readingGradeLevel || 'Standard'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToSubmit && (
              <button
                onClick={onNavigateToSubmit}
                className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors font-medium flex items-center gap-1 shadow-2xs"
                title="Go to Content Submission Page"
              >
                <span>← New Submission</span>
              </button>
            )}

            {onNavigateToGuidelines && (
              <button
                onClick={onNavigateToGuidelines}
                className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors font-medium flex items-center gap-1 shadow-2xs"
                title="Configure Brand Guidelines"
              >
                <span>Guidelines</span>
              </button>
            )}

            {/* Upload Any Document Action */}
            <input
              ref={quickDocInputRef}
              type="file"
              accept="*/*"
              onChange={handleQuickUpload}
              className="hidden"
              id="review-quick-upload-input"
            />
            <label
              htmlFor="review-quick-upload-input"
              className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors font-medium flex items-center gap-1 shadow-2xs cursor-pointer hover:border-indigo-300"
              title="Upload any document file to review"
            >
              <Upload className="w-3.5 h-3.5 text-stone-500" />
              <span>{isUploadingDoc ? 'Parsing...' : 'Upload Doc'}</span>
            </label>

            {/* Quick Sample Button */}
            <button
              onClick={() => loadSample(brand.id)}
              className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              title="Load pre-configured sample copy"
            >
              Load Sample Copy
            </button>

            {/* Toggle View Mode */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
              <button
                onClick={() => setViewMode('audit')}
                className={`p-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'audit'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Highlighted Audit View"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                <span>Audit</span>
              </button>
              <button
                onClick={() => setViewMode('edit')}
                className={`p-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'edit'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Direct Text Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            {/* Run Analysis Action */}
            <button
              onClick={onAnalyzeCopy}
              disabled={isValidating || !copy.trim()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isValidating ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Analyze Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 p-5 overflow-y-auto bg-white min-h-[380px]">
          {viewMode === 'edit' ? (
            <textarea
              value={copy}
              onChange={(e) => onChangeCopy(e.target.value)}
              placeholder="Paste or write marketing copy, announcements, or product content to evaluate against brand guidelines..."
              className="w-full h-full min-h-[380px] bg-transparent text-stone-800 font-sans text-sm leading-relaxed placeholder-stone-400 focus:outline-none resize-none"
            />
          ) : (
            <div className="min-h-[380px] cursor-text" onClick={() => setViewMode('edit')}>
              {renderHighlightedCopy()}
            </div>
          )}
        </div>

        {/* Legend Footer */}
        <div className="px-5 py-2.5 border-t border-stone-100 bg-[#fafafa]/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center flex-wrap gap-2.5">
            <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              Issue Highlights:
            </span>
            <span className="flex items-center gap-1 text-[11px] text-rose-800">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-200 border border-rose-400" />
              Prohibited Words
            </span>
            <span className="flex items-center gap-1 text-[11px] text-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-200 border border-amber-400" />
              Evidence Not Found
            </span>
            <span className="flex items-center gap-1 text-[11px] text-yellow-800">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-200 border border-yellow-400" />
              Voice / Tone
            </span>
            <span className="flex items-center gap-1 text-[11px] text-sky-800">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-200 border border-sky-400" />
              Preferred Terms
            </span>
          </div>

          <span className="text-[11px] text-stone-400">
            Click any highlighted phrase to jump to suggestion
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Review Issues, Suggested Corrections & Sign-Off (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        {/* Review Findings & Suggested Corrections Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs flex-1 flex flex-col overflow-hidden">
          {/* Findings Header */}
          <div className="p-4 border-b border-stone-100 bg-[#fafafa]/80">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-stone-900">
                    Review Findings & Corrections
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Evidence-Aware
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {report?.findings.length || 0} policy evaluations • Strict prohibition against fabricated numbers
                </p>
              </div>

              {/* Compliance Gauge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-medium">Score:</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    (report?.overallScore || 0) >= 80
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : (report?.overallScore || 0) >= 60
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {report?.overallScore || 0}%
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-0.5">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                All ({report?.findings.length || 0})
              </button>

              <button
                onClick={() => setActiveCategory('prohibited_phrase')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === 'prohibited_phrase'
                    ? 'bg-rose-100 text-rose-900 border border-rose-300 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                Prohibited ({report?.breakdown.prohibitedPhrases || 0})
              </button>

              <button
                onClick={() => setActiveCategory('evidence_not_found')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === 'evidence_not_found'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                Evidence ({report?.breakdown.evidenceNotFound || 0})
              </button>

              <button
                onClick={() => setActiveCategory('missing_disclaimer')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === 'missing_disclaimer'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                Disclaimers ({report?.breakdown.missingDisclaimers || 0})
              </button>
            </div>
          </div>

          {/* Findings List */}
          <div className="p-4 overflow-y-auto space-y-3.5 flex-1 max-h-[380px]">
            {filteredFindings.length === 0 ? (
              <div className="text-center py-10 text-xs text-stone-400">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-stone-700">No issues found in this category</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Content aligns with active guidelines.</p>
              </div>
            ) : (
              filteredFindings.map((finding) => {
                const isSelected = selectedFindingId === finding.id;
                const isEditing = editingFindingId === finding.id;

                let badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
                if (finding.type === 'evidence_not_found') badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
                if (finding.type === 'terminology_opportunity') badgeStyle = 'bg-sky-50 text-sky-800 border-sky-200';
                if (finding.type === 'missing_disclaimer') badgeStyle = 'bg-purple-50 text-purple-800 border-purple-200';

                return (
                  <div
                    key={finding.id}
                    onClick={() => onSelectFinding(finding.id)}
                    className={`p-3.5 rounded-xl border transition-all ${
                      finding.status === 'applied'
                        ? 'bg-emerald-50/40 border-emerald-200 opacity-80'
                        : finding.status === 'dismissed'
                        ? 'bg-stone-50 border-stone-200 opacity-60'
                        : isSelected
                        ? 'bg-white border-indigo-400 ring-2 ring-indigo-100 shadow-sm'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {/* Finding Title & Badges */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                            {finding.type === 'evidence_not_found'
                              ? 'Evidence Not Found'
                              : finding.type === 'prohibited_phrase'
                              ? 'Prohibited Phrase'
                              : finding.type === 'missing_disclaimer'
                              ? 'Missing Disclaimer'
                              : 'Tone / Nomenclature'}
                          </span>

                          {finding.status === 'applied' && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Correction Applied
                            </span>
                          )}

                          {finding.status === 'dismissed' && (
                            <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                              Waived
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-stone-900 mt-1">
                          {finding.title}
                        </h4>
                      </div>

                      <span className="text-[10px] text-stone-400 font-mono">
                        {finding.severity}
                      </span>
                    </div>

                    {/* Excerpt */}
                    {finding.type !== 'missing_disclaimer' && (
                      <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 text-xs mb-2">
                        <span className="text-stone-400 text-[11px] block">Flagged Text:</span>
                        <span className="font-mono text-rose-700 font-medium">"{finding.originalText}"</span>
                      </div>
                    )}

                    {/* Issue Explanation & Citation */}
                    <p className="text-xs text-stone-600 mb-1.5 leading-relaxed">
                      {finding.explanation}
                    </p>
                    <p className="text-[11px] text-stone-400 font-mono mb-2.5">
                      Citation: {finding.policyCitation}
                    </p>

                    {/* Suggested Correction Box */}
                    {finding.suggestedRewrite && finding.status === 'open' && (() => {
                      const isNoEvidence = finding.suggestedRewrite.toLowerCase().includes('no evidence-backed correction available');
                      const cleanAlternative = finding.neutralAlternative || finding.suggestedRewrite.replace(/^No evidence-backed correction available:\s*/i, '').trim();

                      return (
                        <div className={`rounded-xl p-3 space-y-2 border ${
                          isNoEvidence
                            ? 'bg-amber-50/80 border-amber-300'
                            : 'bg-emerald-50/70 border-emerald-200'
                        }`}>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-semibold flex items-center gap-1.5 ${
                              isNoEvidence ? 'text-amber-900' : 'text-emerald-900'
                            }`}>
                              {isNoEvidence ? (
                                <>
                                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>No evidence-backed correction available</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>Suggested Correction</span>
                                </>
                              )}
                            </span>
                            <button
                              onClick={() => {
                                setEditingFindingId(finding.id);
                                setCustomEditText(cleanAlternative);
                              }}
                              className={`text-[11px] flex items-center gap-1 transition-colors ${
                                isNoEvidence ? 'text-amber-700 hover:text-amber-900' : 'text-emerald-700 hover:text-emerald-900'
                              }`}
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit Suggestion</span>
                            </button>
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                rows={2}
                                value={customEditText}
                                onChange={(e) => setCustomEditText(e.target.value)}
                                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingFindingId(null)}
                                  className="px-2.5 py-1 text-stone-500 text-xs"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    onApplyRewrite(finding, customEditText.trim());
                                    setEditingFindingId(null);
                                  }}
                                  className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-lg"
                                >
                                  Apply Custom
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {isNoEvidence && (
                                <p className="text-[11px] text-amber-800 leading-snug">
                                  Vyakta AI prevents fabricating numbers. Safe qualitative alternative offered:
                                </p>
                              )}
                              <div className={`p-2 rounded-lg border text-xs font-medium ${
                                isNoEvidence
                                  ? 'bg-white border-amber-200 text-stone-900'
                                  : 'bg-white border-emerald-200 text-emerald-950'
                              }`}>
                                {cleanAlternative}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Action Buttons: 1-Click Apply, Waive */}
                    {finding.status === 'open' && (
                      <div className="flex items-center justify-between pt-2 gap-2 mt-1">
                        {finding.suggestedRewrite && !isEditing && (
                          <button
                            onClick={() => onApplyRewrite(finding)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Apply Correction</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDismissFinding(finding.id, 'Waived by reviewer after evaluation')}
                          className="text-xs text-stone-400 hover:text-stone-700 transition-colors ml-auto"
                        >
                          Waive Issue
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* REVIEWER DECISION & SIGN-OFF PANEL */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Reviewer Decision & Sign-Off
              </h3>
              <p className="text-xs text-stone-500">
                Record your formal editorial evaluation and feedback.
              </p>
            </div>

            <button
              onClick={onDownloadReport}
              className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Download formal audit report in PDF format"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Download PDF Report</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Reviewer Name
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Jordan Hayes (Senior Brand Editor)"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Reviewer Feedback & Notes
              </label>
              <textarea
                rows={2}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Add editorial comments, required adjustments, or publication rationale..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            {/* Decision Status Notification */}
            {decision.status !== 'pending' && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  decision.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <div>
                  <strong className="block">
                    {decision.status === 'approved' ? '✓ Content Approved' : '✗ Content Rejected'}
                  </strong>
                  <span className="text-[11px] opacity-80">
                    By {decision.reviewerName} on {decision.decidedAt}
                  </span>
                </div>
                <button
                  onClick={onDownloadReport}
                  className="px-2.5 py-1 rounded bg-white text-stone-800 font-medium text-[11px] shadow-xs border border-stone-200"
                >
                  Download PDF Report
                </button>
              </div>
            )}

            {/* Approve / Reject Actions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleReject}
                className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Reject Content</span>
              </button>

              <button
                onClick={handleApprove}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Approve Content</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

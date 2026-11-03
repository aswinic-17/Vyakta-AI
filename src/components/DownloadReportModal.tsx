import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  CheckCircle2,
  FileCheck,
  Check,
  Copy,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { ValidationReport, BrandPreset, ReviewDecision } from '../types';
import { downloadPdfReport } from '../utils/generatePdfReport';
import { runDeterministicValidation } from '../services/deterministicValidator';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ValidationReport | null;
  brand: BrandPreset;
  content: string;
  documentTitle: string;
  decision: ReviewDecision;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  onClose,
  report: initialReport,
  brand,
  content,
  documentTitle,
  decision,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Ensure report is guaranteed to exist
  const report: ValidationReport = initialReport || (() => {
    const det = runDeterministicValidation(content, brand);
    const criticals = det.findings.filter((f) => f.severity === 'critical').length;
    const warnings = det.findings.filter((f) => f.severity === 'warning').length;
    const score = Math.max(0, 100 - criticals * 25 - warnings * 10);
    return {
      id: `rep-${Date.now()}`,
      brandId: brand.id,
      brandName: brand.name,
      overallScore: score,
      status: criticals > 0 ? 'critical_violations' : warnings > 0 ? 'needs_revision' : 'compliant',
      metrics: det.metrics,
      breakdown: det.breakdown,
      toneAssessment: {
        formalityScore: brand.voiceTone.formality,
        enthusiasmScore: brand.voiceTone.enthusiasm,
        technicalityScore: brand.voiceTone.technicality,
        overallToneScore: 85,
        critique: 'Standard baseline evaluation generated.',
      },
      findings: det.findings,
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: 'deterministic' as const,
    };
  })();

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      downloadPdfReport(report, brand, content, documentTitle, decision);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyReport = () => {
    const textReport = `VYAKTA AI - BRAND GOVERNANCE AUDIT REPORT
Document: ${documentTitle}
Brand: ${brand.name} (${brand.industry})
Date: ${new Date().toLocaleString()}
Status: ${decision.status.toUpperCase()}
Compliance Score: ${report.overallScore}%
Reviewer: ${decision.reviewerName || 'Editorial Reviewer'}
Feedback: ${decision.reviewerNotes || 'Content reviewed under brand guidelines.'}

EVALUATED CONTENT:
${content}

FINDINGS (${report.findings.length}):
${report.findings
  .map(
    (f, i) =>
      `${i + 1}. [${f.severity.toUpperCase()}] ${f.title}\n   Excerpt: "${f.originalText}"\n   Citation: ${f.policyCitation}\n   Issue: ${f.explanation}${
        f.suggestedRewrite ? `\n   Suggested Correction: ${f.suggestedRewrite}` : ''
      }`
  )
  .join('\n\n')}
`;
    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl w-full max-w-xl flex flex-col shadow-xl border border-stone-200 overflow-hidden print:border-none print:shadow-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-xs">
              PDF
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                Download Audit Report (PDF)
              </h3>
              <p className="text-xs text-stone-500">
                Official pre-publication audit document for "{documentTitle}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF Document Preview Card */}
        <div className="p-6 space-y-5">
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                <span className="font-bold text-xs text-stone-900">
                  vyakta-audit-report.pdf
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                PDF Document
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center bg-white p-3 rounded-xl border border-stone-200 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-medium">Brand</span>
                <span className="font-bold text-stone-800 truncate block">{brand.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-medium">Decision</span>
                <span
                  className={`font-bold uppercase text-[11px] ${
                    decision.status === 'approved'
                      ? 'text-emerald-700'
                      : decision.status === 'rejected'
                      ? 'text-rose-700'
                      : 'text-amber-700'
                  }`}
                >
                  {decision.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-medium">Score</span>
                <span className="font-bold text-stone-800">{report.overallScore}%</span>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 space-y-1">
              <div>• Includes complete reviewed copy draft ({report.metrics.wordCount} words)</div>
              <div>• Includes {report.findings.length} evaluated policy findings and suggested corrections</div>
              <div>• Includes Reviewer remarks by {decision.reviewerName || 'Editorial Reviewer'}</div>
              <div>• Formatted for standard A4 printable PDF with executive headers and page numbers</div>
            </div>
          </div>

          {/* Primary PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>PDF Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Report in PDF Format (.pdf)</span>
              </>
            )}
          </button>

          {/* Secondary Actions: Print or Copy */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              onClick={() => window.print()}
              className="text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Print to PDF (Browser Dialog)</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copy Report Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/60 flex items-center justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

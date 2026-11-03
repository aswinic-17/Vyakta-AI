import { jsPDF } from 'jspdf';
import { ValidationReport, BrandPreset, ReviewDecision } from '../types';

export function downloadPdfReport(
  report: ValidationReport,
  brand: BrandPreset,
  content: string,
  documentTitle: string,
  decision: ReviewDecision
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin + 10;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 50) {
      doc.addPage();
      y = margin + 10;
      addHeaderBanner();
    }
  };

  const addHeaderBanner = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('VYAKTA AI — BRAND CONTENT GOVERNANCE & REVIEW SYSTEM', margin, y);
    y += 12;
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 18;
  };

  // Top header on first page
  addHeaderBanner();

  // Document Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Brand Governance Audit Report', margin, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Official pre-publication audit documentation for: "${documentTitle || 'Marketing Asset'}"`, margin, y);
  y += 20;

  // Executive Summary Card Box
  const summaryBoxY = y;
  const summaryBoxHeight = 85;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.roundedRect(margin, summaryBoxY, contentWidth, summaryBoxHeight, 6, 6, 'FD');

  const col1 = margin + 16;
  const col2 = margin + 180;
  const col3 = margin + 350;

  // Col 1: Brand & Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TARGET BRAND', col1, summaryBoxY + 20);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(brand.name, col1, summaryBoxY + 34);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(brand.industry, col1, summaryBoxY + 46);

  doc.setFont('helvetica', 'bold');
  doc.text('DATE:', col1, summaryBoxY + 68);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString(), col1 + 32, summaryBoxY + 68);

  // Col 2: Reviewer & Decision
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('EDITORIAL DECISION', col2, summaryBoxY + 20);

  const isApproved = decision.status === 'approved';
  const isRejected = decision.status === 'rejected';
  const statusColor: [number, number, number] = isApproved
    ? [5, 150, 105] // emerald
    : isRejected
    ? [225, 29, 72] // rose
    : [217, 119, 6]; // amber

  doc.setFontSize(12);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(decision.status.toUpperCase(), col2, summaryBoxY + 34);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('REVIEWER:', col2, summaryBoxY + 68);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(decision.reviewerName || 'Editorial Reviewer', col2 + 55, summaryBoxY + 68);

  // Col 3: Compliance Score & Total Findings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('COMPLIANCE INDEX', col3, summaryBoxY + 20);
  doc.setFontSize(18);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`${report.overallScore}%`, col3, summaryBoxY + 38);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ISSUES DETECTED:', col3, summaryBoxY + 68);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`${report.findings.length} findings`, col3 + 90, summaryBoxY + 68);

  y = summaryBoxY + summaryBoxHeight + 18;

  // Reviewer Feedback Box
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Reviewer Feedback & Remarks', margin, y);
  y += 12;

  const notesText =
    decision.reviewerNotes ||
    (isApproved
      ? 'Content conforms with brand guidelines, approved vocabulary, and truth-in-advertising policies. Approved for distribution.'
      : isRejected
      ? 'Content contains regulatory or brand guideline violations that require modification prior to publication.'
      : 'Review pending final editorial verification.');

  const splitNotes = doc.splitTextToSize(notesText, contentWidth - 24);
  const notesBoxHeight = splitNotes.length * 12 + 16;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, notesBoxHeight, 4, 4, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(splitNotes, margin + 12, y + 14);
  y += notesBoxHeight + 20;

  // Evaluated Content Draft Section
  checkPageBreak(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Evaluated Copy Draft (${report.metrics.wordCount} words)`, margin, y);
  y += 12;

  const splitContent = doc.splitTextToSize(content, contentWidth - 24);
  const contentBoxHeight = Math.min(180, splitContent.length * 12 + 18);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, contentBoxHeight, 4, 4, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  // If text fits in box, render, else truncate with notice
  const maxLines = Math.floor((contentBoxHeight - 16) / 12);
  const linesToRender = splitContent.slice(0, maxLines);
  doc.text(linesToRender, margin + 12, y + 14);
  y += contentBoxHeight + 22;

  // Section: Categorized Findings & Suggested Corrections
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Policy Findings & Suggested Corrections (${report.findings.length})`, margin, y);
  y += 14;

  if (report.findings.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105);
    doc.text('✓ No violations detected. Copy fully satisfies active brand policies.', margin, y);
    y += 20;
  } else {
    report.findings.forEach((finding, index) => {
      checkPageBreak(85);

      const itemBoxY = y;
      const typeLabel =
        finding.type === 'prohibited_phrase'
          ? 'PROHIBITED PHRASE'
          : finding.type === 'evidence_not_found'
          ? 'EVIDENCE NOT FOUND'
          : finding.type === 'missing_disclaimer'
          ? 'MISSING DISCLAIMER'
          : 'VOICE / TONE';

      // Item Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`${index + 1}. ${finding.title}`, margin, y);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`[${typeLabel}]  Severity: ${finding.severity.toUpperCase()}`, margin + contentWidth - 160, y);
      y += 12;

      // Policy Citation & Flagged text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Policy Citation:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(finding.policyCitation, margin + 70, y);
      y += 11;

      if (finding.originalText && finding.type !== 'missing_disclaimer') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text('Flagged Text:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(225, 29, 72);
        doc.text(`"${finding.originalText}"`, margin + 70, y);
        y += 11;
      }

      // Explanation
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('Issue Reason:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const splitExp = doc.splitTextToSize(finding.explanation, contentWidth - 80);
      doc.text(splitExp, margin + 70, y);
      y += splitExp.length * 10 + 2;

      // Suggested Correction Box
      if (finding.suggestedRewrite) {
        checkPageBreak(40);
        const isNoEvidence = finding.suggestedRewrite.toLowerCase().includes('no evidence-backed correction available');
        const cleanAlternative = finding.neutralAlternative || finding.suggestedRewrite.replace(/^No evidence-backed correction available:\s*/i, '').trim();

        if (isNoEvidence) {
          const splitNotice = doc.splitTextToSize(
            `[Evidence Guard] No evidence-backed correction available (Fabricated numbers prohibited).\nSafe Qualitative Alternative: "${cleanAlternative}"`,
            contentWidth - 20
          );
          const noticeHeight = splitNotice.length * 10 + 12;
          doc.setFillColor(254, 243, 199); // amber-100
          doc.setDrawColor(245, 158, 11); // amber-500
          doc.roundedRect(margin, y, contentWidth, noticeHeight, 3, 3, 'FD');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(146, 64, 14); // amber-800
          doc.text(splitNotice, margin + 8, y + 11);
          y += noticeHeight + 8;
        } else {
          const splitSug = doc.splitTextToSize(`Suggested Correction: ${finding.suggestedRewrite}`, contentWidth - 20);
          const sugHeight = splitSug.length * 10 + 10;
          doc.setFillColor(240, 253, 244); // emerald-50
          doc.setDrawColor(187, 247, 208); // emerald-200
          doc.roundedRect(margin, y, contentWidth, sugHeight, 3, 3, 'FD');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(6, 95, 70); // emerald-800
          doc.text(splitSug, margin + 8, y + 11);
          y += sugHeight + 8;
        }
      }

      // Separator line
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y, margin + contentWidth, y);
      y += 12;
    });
  }

  // Footer on all pages
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Vyakta AI Audit Report • ${brand.name} • ${new Date().toLocaleDateString()}`,
      margin,
      pageHeight - 24
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 50,
      pageHeight - 24
    );
  }

  // Safe file name
  const safeTitle = (documentTitle || 'audit-report').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `vyakta-audit-${safeTitle}-${dateStr}.pdf`;

  // Trigger direct PDF download
  doc.save(filename);
}

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavView } from './components/Navbar';
import { ContentSubmissionPage } from './components/ContentSubmissionPage';
import { ReviewWorkspace } from './components/ReviewWorkspace';
import { EvidenceLibrary } from './components/EvidenceLibrary';
import { BrandGuidelinesEditor } from './components/BrandGuidelinesEditor';
import { GovernanceAnalytics } from './components/GovernanceAnalytics';
import { AuditTrail } from './components/AuditTrail';
import { DownloadReportModal } from './components/DownloadReportModal';
import { CreateBrandModal } from './components/CreateBrandModal';
import { LoginPage } from './components/LoginPage';
import { DEFAULT_BRANDS, SAMPLE_DRAFTS } from './data/defaultBrands';
import {
  BrandPreset,
  ValidationReport,
  ValidationFinding,
  ReviewDecision,
} from './types';
import { runDeterministicValidation } from './services/deterministicValidator';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, isLoading, authFetch } = useAuth();

  const [brands, setBrands] = useState<BrandPreset[]>(DEFAULT_BRANDS);
  const [currentBrand, setCurrentBrand] = useState<BrandPreset>(DEFAULT_BRANDS[0]);
  const [activeView, setActiveView] = useState<NavView>('submit');

  const [documentTitle, setDocumentTitle] = useState<string>(SAMPLE_DRAFTS.apexcloud.title);
  const [copy, setCopy] = useState<string>(SAMPLE_DRAFTS.apexcloud.copy);

  const [report, setReport] = useState<ValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  // Reviewer Decision State (Pending, Approved, Rejected)
  const [decision, setDecision] = useState<ReviewDecision>({
    status: 'pending',
    reviewerName: 'Editorial Reviewer',
    reviewerNotes: '',
  });

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isCreateBrandModalOpen, setIsCreateBrandModalOpen] = useState(false);

  // Sync active view with URL hash for direct navigation when authenticated
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavView;
      if (['submit', 'review', 'evidence', 'guidelines', 'analytics', 'audit'].includes(hash)) {
        setActiveView(hash);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigateView = (view: NavView) => {
    setActiveView(view);
    window.location.hash = view;
  };

  // Fetch persistent brands from SQLite backend
  const fetchBrands = useCallback(async () => {
    try {
      const res = await authFetch('/api/brands');
      if (res.ok) {
        const data: BrandPreset[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBrands(data);
          // Preserve current brand if it exists in data, otherwise default to first
          setCurrentBrand((prev) => {
            const found = data.find((b) => b.id === prev.id);
            return found || data[0];
          });
        }
      }
    } catch (e) {
      console.warn('Backend brands fetch failed, fallback to local defaults:', e);
    }
  }, [authFetch]);

  useEffect(() => {
    if (user) {
      fetchBrands();
    }
  }, [fetchBrands, user]);

  // Execute validation
  const executeValidation = useCallback(
    async (textToValidate: string, brandToUse: BrandPreset): Promise<ValidationReport | null> => {
      if (!textToValidate.trim()) {
        setReport(null);
        return null;
      }

      setIsValidating(true);
      try {
        const response = await authFetch('/api/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            copy: textToValidate,
            brand: brandToUse,
            title: documentTitle,
          }),
        });

        if (!response.ok) {
          throw new Error('Server returned non-200');
        }

        const data: ValidationReport = await response.json();
        setReport(data);
        return data;
      } catch (err) {
        console.warn('Backend API validation unavailable, executing deterministic client validator:', err);
        const clientDet = runDeterministicValidation(textToValidate, brandToUse);

        const criticals = clientDet.findings.filter((f) => f.severity === 'critical').length;
        const warnings = clientDet.findings.filter((f) => f.severity === 'warning').length;
        const advisories = clientDet.findings.filter((f) => f.severity === 'advisory').length;
        const score = Math.max(0, Math.min(100, 100 - criticals * 25 - warnings * 10 - advisories * 4));

        const fallbackReport: ValidationReport = {
          id: `rep-${Date.now()}`,
          brandId: brandToUse.id,
          brandName: brandToUse.name,
          overallScore: score,
          status: criticals > 0 ? 'critical_violations' : warnings > 0 ? 'needs_revision' : 'compliant',
          metrics: clientDet.metrics,
          breakdown: clientDet.breakdown,
          toneAssessment: {
            formalityScore: brandToUse.voiceTone.formality,
            enthusiasmScore: brandToUse.voiceTone.enthusiasm,
            technicalityScore: brandToUse.voiceTone.technicality,
            overallToneScore: 80,
            critique: 'Deterministic keyword, regex, and disclaimer checks completed.',
          },
          findings: clientDet.findings,
          evaluatedAt: new Date().toISOString(),
          evaluatedBy: 'deterministic',
        };

        setReport(fallbackReport);
        return fallbackReport;
      } finally {
        setIsValidating(false);
      }
    },
    [authFetch, documentTitle]
  );

  // Run initial validation
  useEffect(() => {
    executeValidation(copy, currentBrand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When switching brands, load corresponding default copy or keep existing
  const handleSelectBrand = (newBrand: BrandPreset) => {
    setCurrentBrand(newBrand);
    const sample = SAMPLE_DRAFTS[newBrand.id];
    if (sample) {
      setDocumentTitle(sample.title);
      setCopy(sample.copy);
      executeValidation(sample.copy, newBrand);
    } else {
      executeValidation(copy, newBrand);
    }
    setDecision({
      status: 'pending',
      reviewerName: decision.reviewerName,
      reviewerNotes: '',
    });
  };

  // Add any new brand dynamically
  const handleCreateBrand = async (newBrand: BrandPreset) => {
    try {
      await authFetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrand),
      });
      fetchBrands();
    } catch (e) {
      console.warn('Backend brand creation failed:', e);
    }

    const nextBrands = [...brands, newBrand];
    setBrands(nextBrands);
    setCurrentBrand(newBrand);
    setDocumentTitle(`${newBrand.name} - Campaign Copy`);
    setCopy(`Introducing ${newBrand.name}: ${newBrand.tagline}.\n\nOur team delivers exceptional quality and service for all our customers.`);
    executeValidation(`Introducing ${newBrand.name}: ${newBrand.tagline}.\n\nOur team delivers exceptional quality and service for all our customers.`, newBrand);
    setActiveView('guidelines');
  };

  // Delete a brand
  const handleDeleteBrand = async (brandId: string) => {
    if (brands.length <= 1) return;
    try {
      await authFetch(`/api/brands/${brandId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete brand failed:', e);
    }
    const nextBrands = brands.filter((b) => b.id !== brandId);
    setBrands(nextBrands);
    const fallback = nextBrands[0];
    setCurrentBrand(fallback);
    executeValidation(copy, fallback);
  };

  // Submit from Content Submission Page
  const handleSubmitContentForReview = async () => {
    await executeValidation(copy, currentBrand);
    setActiveView('review');
  };

  // 1-Click Apply Suggested Correction
  const handleApplyRewrite = (finding: ValidationFinding, customText?: string) => {
    let replacementText = customText !== undefined ? customText : (finding.neutralAlternative || finding.suggestedRewrite);
    if (!replacementText) return;

    if (!customText && replacementText.startsWith('No evidence-backed correction available:')) {
      replacementText = replacementText.replace(/^No evidence-backed correction available:\s*/i, '').trim();
    }

    let updatedCopy = copy;

    if (finding.type === 'missing_disclaimer') {
      if (!updatedCopy.includes(replacementText.trim())) {
        updatedCopy = `${updatedCopy.trimEnd()}\n\n${replacementText.trim()}`;
      }
    } else {
      const idx = updatedCopy.toLowerCase().indexOf(finding.originalText.toLowerCase());
      if (idx !== -1) {
        updatedCopy =
          updatedCopy.substring(0, idx) +
          replacementText +
          updatedCopy.substring(idx + finding.originalText.length);
      } else {
        updatedCopy = updatedCopy.replace(finding.originalText, replacementText);
      }
    }

    setCopy(updatedCopy);

    if (report) {
      const updatedFindings = report.findings.map((f) =>
        f.id === finding.id ? { ...f, status: 'applied' as const } : f
      );

      const openCriticals = updatedFindings.filter(
        (f) => f.severity === 'critical' && f.status === 'open'
      ).length;
      const openWarnings = updatedFindings.filter(
        (f) => f.severity === 'warning' && f.status === 'open'
      ).length;
      const openAdvisories = updatedFindings.filter(
        (f) => f.severity === 'advisory' && f.status === 'open'
      ).length;

      const newScore = Math.min(
        100,
        Math.max(0, 100 - openCriticals * 25 - openWarnings * 10 - openAdvisories * 4)
      );

      setReport({
        ...report,
        overallScore: newScore,
        status: openCriticals > 0 ? 'critical_violations' : openWarnings > 0 ? 'needs_revision' : 'compliant',
        findings: updatedFindings,
      });
    }
  };

  // Waive / Dismiss a finding
  const handleDismissFinding = (findingId: string, reason: string) => {
    if (!report) return;

    const updatedFindings = report.findings.map((f) =>
      f.id === findingId ? { ...f, status: 'dismissed' as const, dismissReason: reason } : f
    );

    const openCriticals = updatedFindings.filter(
      (f) => f.severity === 'critical' && f.status === 'open'
    ).length;
    const openWarnings = updatedFindings.filter(
      (f) => f.severity === 'warning' && f.status === 'open'
    ).length;
    const openAdvisories = updatedFindings.filter(
      (f) => f.severity === 'advisory' && f.status === 'open'
    ).length;

    const newScore = Math.min(
      100,
      Math.max(0, 100 - openCriticals * 25 - openWarnings * 10 - openAdvisories * 4)
    );

    setReport({
      ...report,
      overallScore: newScore,
      status: openCriticals > 0 ? 'critical_violations' : openWarnings > 0 ? 'needs_revision' : 'compliant',
      findings: updatedFindings,
    });
  };

  // Save Brand Guidelines from Editor
  const handleSaveBrand = async (updated: BrandPreset) => {
    try {
      await authFetch(`/api/brands/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      fetchBrands();
    } catch (e) {
      console.warn('Backend brand update failed:', e);
    }
    const nextBrands = brands.map((b) => (b.id === updated.id ? updated : b));
    setBrands(nextBrands);
    setCurrentBrand(updated);
    executeValidation(copy, updated);
  };

  const handleResetBrand = () => {
    const original = DEFAULT_BRANDS.find((b) => b.id === currentBrand.id);
    if (original) {
      handleSaveBrand(original);
    }
  };

  // Persist editorial decision to backend
  const handleUpdateDecision = async (newDecision: ReviewDecision) => {
    setDecision(newDecision);
    try {
      await authFetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newDecision.status,
          reviewerName: newDecision.reviewerName,
          reviewerNotes: newDecision.reviewerNotes,
          reportId: report?.id,
        }),
      });
    } catch (e) {
      console.warn('Decision persistence error:', e);
    }
  };

  // Loading splash state while verifying stored session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/assets/aistudio/image_e94e150e.png"
            alt="Vyakta AI Logo"
            className="w-12 h-12 object-contain rounded-2xl shadow-sm border border-stone-200/80 p-1 bg-white animate-pulse"
          />
          <div className="flex items-center gap-2 text-stone-600 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            <span>Verifying Vyakta AI session...</span>
          </div>
        </div>
      </div>
    );
  }

  // Login-first application access: dedicated full-page login screen for unauthenticated visitors
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentBrand={currentBrand}
        brands={brands}
        onSelectBrand={handleSelectBrand}
        onOpenCreateBrandModal={() => setIsCreateBrandModalOpen(true)}
        activeView={activeView}
        onChangeView={handleNavigateView}
        decision={decision}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        report={report}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeView === 'submit' && (
          <ContentSubmissionPage
            copy={copy}
            onChangeCopy={setCopy}
            documentTitle={documentTitle}
            onChangeDocumentTitle={setDocumentTitle}
            brand={currentBrand}
            brands={brands}
            onSelectBrand={handleSelectBrand}
            onOpenCreateBrandModal={() => setIsCreateBrandModalOpen(true)}
            onSubmitForReview={handleSubmitContentForReview}
            isValidating={isValidating}
            onNavigateToReview={() => handleNavigateView('review')}
            onNavigateToGuidelines={() => handleNavigateView('guidelines')}
          />
        )}

        {activeView === 'review' && (
          <ReviewWorkspace
            copy={copy}
            onChangeCopy={setCopy}
            documentTitle={documentTitle}
            onChangeDocumentTitle={setDocumentTitle}
            brand={currentBrand}
            report={report}
            isValidating={isValidating}
            onAnalyzeCopy={() => executeValidation(copy, currentBrand)}
            selectedFindingId={selectedFindingId}
            onSelectFinding={setSelectedFindingId}
            onApplyRewrite={handleApplyRewrite}
            onDismissFinding={handleDismissFinding}
            decision={decision}
            onUpdateDecision={handleUpdateDecision}
            onDownloadReport={() => setIsDownloadModalOpen(true)}
            onNavigateToSubmit={() => handleNavigateView('submit')}
            onNavigateToGuidelines={() => handleNavigateView('guidelines')}
          />
        )}

        {activeView === 'evidence' && (
          <EvidenceLibrary
            currentBrand={currentBrand}
            draftCopy={copy}
            onApplyCorrectionToDraft={(orig, corr) => {
              const updated = copy.replace(orig, corr);
              setCopy(updated);
              executeValidation(updated, currentBrand);
              handleNavigateView('review');
            }}
          />
        )}

        {activeView === 'guidelines' && (
          <BrandGuidelinesEditor
            brand={currentBrand}
            brands={brands}
            onSelectBrand={handleSelectBrand}
            onOpenCreateBrandModal={() => setIsCreateBrandModalOpen(true)}
            onSaveBrand={handleSaveBrand}
            onResetBrand={handleResetBrand}
            onDeleteBrand={handleDeleteBrand}
            onBackToReview={() => handleNavigateView('review')}
          />
        )}

        {activeView === 'analytics' && (
          <GovernanceAnalytics currentBrand={currentBrand} />
        )}

        {activeView === 'audit' && (
          <AuditTrail />
        )}
      </main>

      {/* Multi-Format Audit Report Download Modal */}
      <DownloadReportModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        report={report}
        brand={currentBrand}
        content={copy}
        documentTitle={documentTitle}
        decision={decision}
      />

      {/* Create / Add Any Brand Modal */}
      <CreateBrandModal
        isOpen={isCreateBrandModalOpen}
        onClose={() => setIsCreateBrandModalOpen(false)}
        onCreateBrand={handleCreateBrand}
      />
    </div>
  );
}

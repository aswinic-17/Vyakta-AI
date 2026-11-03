import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Database,
  FileCheck,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  Building2,
  History,
} from 'lucide-react';
import { BrandPreset, ApprovedTerm, ProhibitedPhrase, FactualBenchmark, RequiredDisclaimer } from '../types';
import { GuidelineVersionModal } from './GuidelineVersionModal';

interface BrandGuidelinesEditorProps {
  brand: BrandPreset;
  brands: BrandPreset[];
  onSelectBrand: (brand: BrandPreset) => void;
  onOpenCreateBrandModal: () => void;
  onSaveBrand: (updated: BrandPreset) => void;
  onResetBrand: () => void;
  onDeleteBrand?: (brandId: string) => void;
  onBackToReview: () => void;
}

export const BrandGuidelinesEditor: React.FC<BrandGuidelinesEditorProps> = ({
  brand,
  brands,
  onSelectBrand,
  onOpenCreateBrandModal,
  onSaveBrand,
  onResetBrand,
  onDeleteBrand,
  onBackToReview,
}) => {
  const [localBrand, setLocalBrand] = useState<BrandPreset>(brand);
  const [activeTab, setActiveTab] = useState<'details' | 'prohibited' | 'terms' | 'tone' | 'benchmarks' | 'disclaimers'>('details');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // New item draft states
  const [newProhibited, setNewProhibited] = useState<{
    phrase: string;
    severity: 'critical' | 'warning' | 'advisory';
    category: string;
    reason: string;
    suggestedAlternative: string;
    policyCitation: string;
  }>({
    phrase: '',
    severity: 'critical',
    category: 'Legal Risk',
    reason: '',
    suggestedAlternative: '',
    policyCitation: '',
  });

  const [newTerm, setNewTerm] = useState<{
    term: string;
    context: string;
    preferredOver: string;
    reason: string;
  }>({
    term: '',
    context: '',
    preferredOver: '',
    reason: '',
  });

  const [newBenchmark, setNewBenchmark] = useState<{
    claim: string;
    category: string;
    source: string;
    evidenceText: string;
  }>({
    claim: '',
    category: 'Performance',
    source: '',
    evidenceText: '',
  });

  const [newDisclaimer, setNewDisclaimer] = useState<{
    triggerKeywords: string;
    disclaimerText: string;
    mandateLevel: 'mandatory' | 'recommended';
    governingLawOrPolicy: string;
  }>({
    triggerKeywords: '',
    disclaimerText: '',
    mandateLevel: 'mandatory',
    governingLawOrPolicy: '',
  });

  React.useEffect(() => {
    setLocalBrand(brand);
  }, [brand]);

  const handleSave = () => {
    onSaveBrand(localBrand);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const addProhibitedPhrase = () => {
    if (!newProhibited.phrase.trim()) return;
    const item: ProhibitedPhrase = {
      id: `p-${Date.now()}`,
      phrase: newProhibited.phrase.trim(),
      severity: newProhibited.severity,
      category: newProhibited.category || 'Brand Policy',
      reason: newProhibited.reason || 'Conflicts with governing brand policy.',
      suggestedAlternative: newProhibited.suggestedAlternative || 'Compliant alternative',
      policyCitation: newProhibited.policyCitation || `${localBrand.name} Guidelines § 1.0`,
    };
    setLocalBrand({ ...localBrand, prohibitedPhrases: [...localBrand.prohibitedPhrases, item] });
    setNewProhibited({
      phrase: '',
      severity: 'critical',
      category: 'Legal Risk',
      reason: '',
      suggestedAlternative: '',
      policyCitation: '',
    });
  };

  const removeProhibitedPhrase = (id: string) => {
    setLocalBrand({
      ...localBrand,
      prohibitedPhrases: localBrand.prohibitedPhrases.filter((p) => p.id !== id),
    });
  };

  const addApprovedTerm = () => {
    if (!newTerm.term.trim()) return;
    const item: ApprovedTerm = {
      term: newTerm.term.trim(),
      context: newTerm.context || 'General Copy',
      preferredOver: newTerm.preferredOver
        ? newTerm.preferredOver.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      reason: newTerm.reason || 'Approved standardized brand nomenclature.',
    };
    setLocalBrand({ ...localBrand, approvedTerms: [...localBrand.approvedTerms, item] });
    setNewTerm({ term: '', context: '', preferredOver: '', reason: '' });
  };

  const removeApprovedTerm = (index: number) => {
    const next = [...localBrand.approvedTerms];
    next.splice(index, 1);
    setLocalBrand({ ...localBrand, approvedTerms: next });
  };

  const addBenchmark = () => {
    if (!newBenchmark.claim.trim()) return;
    const item: FactualBenchmark = {
      id: `bm-${Date.now()}`,
      claim: newBenchmark.claim.trim(),
      category: newBenchmark.category,
      source: newBenchmark.source || 'Audited Benchmark Test',
      evidenceText: newBenchmark.evidenceText || 'Verified by internal audit.',
      verifiedDate: new Date().toISOString().split('T')[0],
    };
    setLocalBrand({ ...localBrand, factualBenchmarks: [...localBrand.factualBenchmarks, item] });
    setNewBenchmark({ claim: '', category: 'Performance', source: '', evidenceText: '' });
  };

  const removeBenchmark = (id: string) => {
    setLocalBrand({
      ...localBrand,
      factualBenchmarks: localBrand.factualBenchmarks.filter((b) => b.id !== id),
    });
  };

  const addDisclaimer = () => {
    if (!newDisclaimer.disclaimerText.trim()) return;
    const item: RequiredDisclaimer = {
      id: `disc-${Date.now()}`,
      triggerKeywords: newDisclaimer.triggerKeywords.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
      disclaimerText: newDisclaimer.disclaimerText.trim(),
      mandateLevel: newDisclaimer.mandateLevel,
      governingLawOrPolicy: newDisclaimer.governingLawOrPolicy || 'Required Disclosure Rule',
      placementGuidance: 'Footer disclosure',
    };
    setLocalBrand({ ...localBrand, requiredDisclaimers: [...localBrand.requiredDisclaimers, item] });
    setNewDisclaimer({
      triggerKeywords: '',
      disclaimerText: '',
      mandateLevel: 'mandatory',
      governingLawOrPolicy: '',
    });
  };

  const removeDisclaimer = (id: string) => {
    setLocalBrand({
      ...localBrand,
      requiredDisclaimers: localBrand.requiredDisclaimers.filter((d) => d.id !== id),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner with Brand Selector & Add Brand */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-indigo-500" />
            <h2 className="text-lg font-bold text-stone-900 tracking-tight">
              Brand Details & Guidelines Editor
            </h2>
            <div className="flex items-center gap-1.5 bg-stone-100 rounded-lg px-2 py-1">
              <span className="text-xs text-stone-500 font-medium">Active:</span>
              <select
                value={localBrand.id}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    onOpenCreateBrandModal();
                  } else {
                    const found = brands.find((b) => b.id === e.target.value);
                    if (found) onSelectBrand(found);
                  }
                }}
                className="bg-transparent font-bold text-xs text-stone-800 focus:outline-none cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
                <option value="__add_new__">+ Add Custom Brand...</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Configure identity, prohibited phrases, approved nomenclature, voice & tone rules, and verified claim benchmarks for <strong>{localBrand.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateBrandModal}
            className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Any Brand</span>
          </button>

          <button
            onClick={onResetBrand}
            className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Reset active brand to initial defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Reset</span>
          </button>

          {onDeleteBrand && brands.length > 1 && (
            <button
              onClick={() => onDeleteBrand(localBrand.id)}
              className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors flex items-center gap-1"
              title="Delete this brand"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsVersionModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Inspect historical versions and rollback"
          >
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>Version History</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Brand Guidelines</span>
              </>
            )}
          </button>

          <button
            onClick={onBackToReview}
            className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
          >
            Return to Review
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'details'
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200 font-semibold'
              : 'text-stone-600 hover:text-stone-900 bg-stone-100/60'
          }`}
        >
          Brand Identity
        </button>

        <button
          onClick={() => setActiveTab('prohibited')}
          className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'prohibited'
              ? 'bg-rose-50 text-rose-800 border border-rose-200 font-semibold'
              : 'text-stone-600 hover:text-stone-900 bg-stone-100/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span>Prohibited Words ({localBrand.prohibitedPhrases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'terms'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
              : 'text-stone-600 hover:text-stone-900 bg-stone-100/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Approved Terms ({localBrand.approvedTerms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tone')}
          className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'tone'
              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold'
              : 'text-stone-600 hover:text-stone-900 bg-stone-100/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
          <span>Voice & Tone</span>
        </button>

        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'benchmarks'
              ? 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold'
              : 'text-stone-600 hover:text-stone-900 bg-stone-100/60'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-amber-500" />
          <span>Factual Benchmarks ({localBrand.factualBenchmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('disclaimers')}
          className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'disclaimers'
              ? 'bg-purple-50 text-purple-800 border border-purple-200 font-semibold'
              : 'text-stone-600 hover:text-stone-900 bg-stone-100/60'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-purple-500" />
          <span>Disclaimers ({localBrand.requiredDisclaimers.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs">
        {/* TAB 1: Brand Details */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 mb-2">
              Brand Identity & Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={localBrand.name}
                  onChange={(e) => setLocalBrand({ ...localBrand, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Industry / Domain
                </label>
                <input
                  type="text"
                  value={localBrand.industry}
                  onChange={(e) => setLocalBrand({ ...localBrand, industry: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Brand Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={localBrand.tagline}
                  onChange={(e) => setLocalBrand({ ...localBrand, tagline: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Brand Overview & Positioning Strategy
                </label>
                <textarea
                  rows={4}
                  value={localBrand.description}
                  onChange={(e) => setLocalBrand({ ...localBrand, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  placeholder="Describe what your brand does, target audience, and legal posture..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Prohibited Phrases */}
        {activeTab === 'prohibited' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Prohibited Words & Phrases for {localBrand.name}
              </h3>
              <p className="text-xs text-stone-500">
                Terms that violate {localBrand.name}'s standards, invite regulatory penalties, or breach truth-in-advertising guidelines.
              </p>
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-stone-50/40">
              {localBrand.prohibitedPhrases.map((item) => (
                <div key={item.id} className="p-3 flex items-start justify-between gap-3 hover:bg-white transition-colors">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        "{item.phrase}"
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        {item.severity}
                      </span>
                      <span className="text-[11px] text-stone-500">{item.policyCitation}</span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">{item.reason}</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      <span className="text-stone-400">Suggest:</span> {item.suggestedAlternative}
                    </p>
                  </div>
                  <button
                    onClick={() => removeProhibitedPhrase(item.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Prohibited Word */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-rose-600" />
                Add Prohibited Term for {localBrand.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Phrase to prohibit (e.g. unhackable)"
                  value={newProhibited.phrase}
                  onChange={(e) => setNewProhibited({ ...newProhibited, phrase: e.target.value })}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <select
                  value={newProhibited.severity}
                  onChange={(e: any) => setNewProhibited({ ...newProhibited, severity: e.target.value })}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                >
                  <option value="critical">Critical (Blocks Approval)</option>
                  <option value="warning">Warning (Requires Review)</option>
                  <option value="advisory">Advisory (Style Guideline)</option>
                </select>
                <input
                  type="text"
                  placeholder="Policy Citation (e.g. Brand Policy § 4.1)"
                  value={newProhibited.policyCitation}
                  onChange={(e) => setNewProhibited({ ...newProhibited, policyCitation: e.target.value })}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Reason / Ground for prohibition"
                  value={newProhibited.reason}
                  onChange={(e) => setNewProhibited({ ...newProhibited, reason: e.target.value })}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Suggested Approved Alternative"
                  value={newProhibited.suggestedAlternative}
                  onChange={(e) => setNewProhibited({ ...newProhibited, suggestedAlternative: e.target.value })}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={addProhibitedPhrase}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Add Phrase Rule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Approved Terminology */}
        {activeTab === 'terms' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Approved Terminology & Nomenclature
              </h3>
              <p className="text-xs text-stone-500">
                Standardized approved vocabulary to maintain professional consistency.
              </p>
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-stone-50/40">
              {localBrand.approvedTerms.map((item, idx) => (
                <div key={idx} className="p-3 flex items-start justify-between gap-3 hover:bg-white transition-colors">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {item.term}
                      </span>
                      <span className="text-stone-400 text-xs">replaces:</span>
                      <div className="flex gap-1 flex-wrap">
                        {item.preferredOver.map((p, pIdx) => (
                          <span key={pIdx} className="text-stone-500 text-[11px] line-through bg-stone-100 px-1.5 py-0.2 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">{item.reason}</p>
                  </div>
                  <button
                    onClick={() => removeApprovedTerm(idx)}
                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Approved Term */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                Add Approved Term
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Approved Term (e.g. enterprise-grade SLA)"
                  value={newTerm.term}
                  onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Context (e.g. Uptime claims)"
                  value={newTerm.context}
                  onChange={(e) => setNewTerm({ ...newTerm, context: e.target.value })}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Replaces (comma separated, e.g. never crashes, 100% stable)"
                  value={newTerm.preferredOver}
                  onChange={(e) => setNewTerm({ ...newTerm, preferredOver: e.target.value })}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Rationale / Standard explanation"
                value={newTerm.reason}
                onChange={(e) => setNewTerm({ ...newTerm, reason: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={addApprovedTerm}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Save Term
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Voice & Tone */}
        {activeTab === 'tone' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-stone-900">
              Voice & Tone Constraints for {localBrand.name} (1 to 5)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50/60 p-5 rounded-2xl border border-stone-200">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-stone-700">Formality</span>
                  <span className="font-bold text-indigo-600">{localBrand.voiceTone.formality} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={localBrand.voiceTone.formality}
                  onChange={(e) =>
                    setLocalBrand({
                      ...localBrand,
                      voiceTone: { ...localBrand.voiceTone, formality: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                  <span>1: Conversational</span>
                  <span>5: Formal / Corporate</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-stone-700">Enthusiasm</span>
                  <span className="font-bold text-indigo-600">{localBrand.voiceTone.enthusiasm} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={localBrand.voiceTone.enthusiasm}
                  onChange={(e) =>
                    setLocalBrand({
                      ...localBrand,
                      voiceTone: { ...localBrand.voiceTone, enthusiasm: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                  <span>1: Sober / Measured</span>
                  <span>5: High Energy</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-stone-700">Technicality</span>
                  <span className="font-bold text-indigo-600">{localBrand.voiceTone.technicality} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={localBrand.voiceTone.technicality}
                  onChange={(e) =>
                    setLocalBrand({
                      ...localBrand,
                      voiceTone: { ...localBrand.voiceTone, technicality: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                  <span>1: Layman English</span>
                  <span>5: Technical Rigor</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-stone-700">Directness</span>
                  <span className="font-bold text-indigo-600">{localBrand.voiceTone.directness} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={localBrand.voiceTone.directness}
                  onChange={(e) =>
                    setLocalBrand({
                      ...localBrand,
                      voiceTone: { ...localBrand.voiceTone, directness: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                  <span>1: Narrative</span>
                  <span>5: Concise & Direct</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Factual Claim Benchmarks */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Verified Benchmarks for {localBrand.name}
              </h3>
              <p className="text-xs text-stone-500">
                Claims or comparative statistics in copy not supported here will be flagged as "Evidence Not Found".
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localBrand.factualBenchmarks.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 inline-block mb-1.5">
                      {b.category}
                    </span>
                    <h5 className="text-xs font-bold text-stone-900 mb-1">"{b.claim}"</h5>
                    <p className="text-[11px] text-stone-600 bg-white p-2 rounded border border-stone-200">
                      <strong>Evidence:</strong> {b.evidenceText}
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-stone-200 flex justify-between items-center text-[10px] text-stone-400">
                    <span>Source: {b.source}</span>
                    <button
                      onClick={() => removeBenchmark(b.id)}
                      className="p-1 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Benchmark */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                Add Verified Benchmark for {localBrand.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Verified Claim (e.g. 99.9% customer satisfaction)"
                  value={newBenchmark.claim}
                  onChange={(e) => setNewBenchmark({ ...newBenchmark, claim: e.target.value })}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Audit Source (e.g. Q3 Customer Survey 2025)"
                  value={newBenchmark.source}
                  onChange={(e) => setNewBenchmark({ ...newBenchmark, source: e.target.value })}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Evidence measurement quote"
                value={newBenchmark.evidenceText}
                onChange={(e) => setNewBenchmark({ ...newBenchmark, evidenceText: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={addBenchmark}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Save Benchmark
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Disclaimers */}
        {activeTab === 'disclaimers' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Mandatory Disclaimers for {localBrand.name}
              </h3>
              <p className="text-xs text-stone-500">
                Mandatory fine print automatically required whenever copy mentions specific trigger keywords.
              </p>
            </div>

            <div className="space-y-3">
              {localBrand.requiredDisclaimers.map((d) => (
                <div key={d.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-start justify-between gap-3">
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-stone-900 block">{d.governingLawOrPolicy}</span>
                    <span className="text-stone-500 text-[11px] block">
                      Trigger words: {d.triggerKeywords.join(', ')}
                    </span>
                    <p className="italic text-stone-700 bg-white p-2 rounded border border-stone-200">
                      "{d.disclaimerText}"
                    </p>
                  </div>
                  <button
                    onClick={() => removeDisclaimer(d.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Disclaimer */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-purple-600" />
                Add Mandatory Disclaimer
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Governing Policy (e.g. Terms & Warranty Disclosure)"
                  value={newDisclaimer.governingLawOrPolicy}
                  onChange={(e) => setNewDisclaimer({ ...newDisclaimer, governingLawOrPolicy: e.target.value })}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Trigger words (comma separated, e.g. guarantee, warranty, free)"
                  value={newDisclaimer.triggerKeywords}
                  onChange={(e) => setNewDisclaimer({ ...newDisclaimer, triggerKeywords: e.target.value })}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Full disclaimer disclosure text..."
                value={newDisclaimer.disclaimerText}
                onChange={(e) => setNewDisclaimer({ ...newDisclaimer, disclaimerText: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={addDisclaimer}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Save Disclaimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guideline Version History & Rollback Modal */}
      <GuidelineVersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        brand={localBrand}
        onRollbackComplete={(restoredBrand) => {
          setLocalBrand(restoredBrand);
          onSaveBrand(restoredBrand);
        }}
      />
    </div>
  );
};


import React, { useState } from 'react';
import { X, Plus, Sparkles, Building2, Check } from 'lucide-react';
import { BrandPreset } from '../types';

interface CreateBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBrand: (newBrand: BrandPreset) => void;
}

export const CreateBrandModal: React.FC<CreateBrandModalProps> = ({
  isOpen,
  onClose,
  onCreateBrand,
}) => {
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState<'b2b' | 'consumer' | 'fintech' | 'health' | 'blank'>('b2b');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    const brandId = brandName.toLowerCase().replace(/[^a-z0-9]/g, '') || `brand-${Date.now()}`;

    // Starter templates tailored to common industries, or blank
    let starterApprovedTerms: BrandPreset['approvedTerms'] = [];
    let starterProhibited: BrandPreset['prohibitedPhrases'] = [];
    let starterTone = {
      formality: 4,
      enthusiasm: 3,
      technicality: 3,
      directness: 4,
      principles: ['Maintain clarity, brand integrity, and customer trust.', 'Avoid vague hyperbole.'],
      forbiddenTones: ['Sensationalist', 'Misleading'],
    };
    let starterBenchmarks: BrandPreset['factualBenchmarks'] = [];
    let starterDisclaimers: BrandPreset['requiredDisclaimers'] = [];

    if (templateType === 'b2b') {
      starterApprovedTerms = [
        {
          term: 'enterprise-grade reliability',
          context: 'System resilience',
          preferredOver: ['never crashes', 'unbreakable'],
          reason: 'Aligns with contractual SLAs.',
        },
      ];
      starterProhibited = [
        {
          id: `p-${Date.now()}-1`,
          phrase: '100% bug-free',
          severity: 'critical' as const,
          category: 'Legal Risk',
          reason: 'Unsubstantiated absolute claim creating warranty liability.',
          suggestedAlternative: 'rigorously tested with 99.9% reliability',
          policyCitation: `${brandName} Policy § 2.1 (Software Warranties)`,
        },
        {
          id: `p-${Date.now()}-2`,
          phrase: 'cheap',
          severity: 'warning' as const,
          category: 'Brand Value',
          reason: 'Degrades brand positioning.',
          suggestedAlternative: 'cost-efficient / high-ROI',
          policyCitation: `${brandName} Guidelines § 1.3`,
        },
      ];
      starterBenchmarks = [
        {
          id: `bm-${Date.now()}-1`,
          claim: 'Trusted by leading industry enterprises with 99.9% historical uptime',
          category: 'Performance',
          source: 'Annual Reliability Audit',
          evidenceText: 'Measured across production clusters.',
          verifiedDate: new Date().toISOString().split('T')[0],
        },
      ];
    } else if (templateType === 'consumer') {
      starterTone = {
        formality: 2,
        enthusiasm: 4,
        technicality: 2,
        directness: 4,
        principles: ['Warm, conversational, and customer-first.', 'Honest and authentic.'],
        forbiddenTones: ['Stuffy', 'Over-technical', 'Pushy Sales'],
      };
      starterProhibited = [
        {
          id: `p-${Date.now()}-1`,
          phrase: 'best in the world',
          severity: 'warning' as const,
          category: 'Truth in Advertising',
          reason: 'Subjective superlative requires empirical substantiation.',
          suggestedAlternative: 'award-winning and customer-loved',
          policyCitation: `${brandName} Style Guide § 3.2`,
        },
      ];
    } else if (templateType === 'fintech') {
      starterTone = {
        formality: 5,
        enthusiasm: 1,
        technicality: 4,
        directness: 5,
        principles: ['Fiduciary transparency.', 'Accurate financial representations.'],
        forbiddenTones: ['Get-Rich-Quick', 'Speculative', 'Hype'],
      };
      starterProhibited = [
        {
          id: `p-${Date.now()}-1`,
          phrase: 'guaranteed return',
          severity: 'critical' as const,
          category: 'Regulatory',
          reason: 'SEC & banking regulations prohibit representations of guaranteed investment safety.',
          suggestedAlternative: 'competitive variable yield',
          policyCitation: 'Financial Regulatory Compliance Standards',
        },
      ];
      starterDisclaimers = [
        {
          id: `d-${Date.now()}-1`,
          triggerKeywords: ['yield', 'return', 'interest', 'deposit'],
          disclaimerText: `*Terms apply. Subject to market conditions. Consult your financial advisor.`,
          mandateLevel: 'mandatory' as const,
          governingLawOrPolicy: 'Standard Financial Disclosure Requirement',
          placementGuidance: 'Footer',
        },
      ];
    } else if (templateType === 'health') {
      starterProhibited = [
        {
          id: `p-${Date.now()}-1`,
          phrase: 'miracle cure',
          severity: 'critical' as const,
          category: 'Regulatory',
          reason: 'Dietary and wellness products cannot claim to cure medical diseases.',
          suggestedAlternative: 'supports natural vitality and wellness',
          policyCitation: 'FDA / FTC Truth-in-Advertising Standards',
        },
      ];
      starterDisclaimers = [
        {
          id: `d-${Date.now()}-1`,
          triggerKeywords: ['health', 'wellness', 'supplement', 'cure'],
          disclaimerText: `*These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.`,
          mandateLevel: 'mandatory' as const,
          governingLawOrPolicy: 'FDA Dietary Supplement Disclosure (DSHEA)',
          placementGuidance: 'Prominent footnote',
        },
      ];
    }

    const newBrand: BrandPreset = {
      id: brandId,
      name: brandName.trim(),
      industry: industry.trim() || 'General Commerce',
      tagline: tagline.trim() || 'Distinctive brand quality & service',
      description: description.trim() || `${brandName} brand guidelines and editorial policy standards.`,
      accentColor: '#6366f1',
      approvedTerms: starterApprovedTerms,
      prohibitedPhrases: starterProhibited,
      voiceTone: starterTone,
      factualBenchmarks: starterBenchmarks,
      requiredDisclaimers: starterDisclaimers,
    };

    onCreateBrand(newBrand);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                Add Any Brand
              </h3>
              <p className="text-xs text-stone-500">
                Configure guidelines for any company, client, or startup
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

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Brand Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corp, Nike, Stripe, Patagonia, or My Brand"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Industry / Domain
              </label>
              <input
                type="text"
                placeholder="e.g. B2B SaaS, Fashion, Fintech"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                placeholder="e.g. Crafted for excellence"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Brand Description & Positioning
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of what this brand stands for and its core values..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Starter Guideline Template
            </label>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { id: 'b2b', label: 'B2B Enterprise / Tech' },
                { id: 'consumer', label: 'Consumer & Retail' },
                { id: 'fintech', label: 'Fintech & Financial' },
                { id: 'health', label: 'Health & Wellness' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTemplateType(t.id as any)}
                  className={`p-2 rounded-lg border text-left transition-colors flex items-center justify-between ${
                    templateType === t.id
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span>{t.label}</span>
                  {templateType === t.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!brandName.trim()}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Brand & Start Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

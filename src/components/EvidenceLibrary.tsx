import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Sparkles,
  RefreshCw,
  FileText,
  Filter,
} from 'lucide-react';
import { BrandPreset, EvidenceItem, ExtractedClaim } from '../types';
import { useAuth } from '../context/AuthContext';

interface EvidenceLibraryProps {
  currentBrand: BrandPreset;
  draftCopy: string;
  onApplyCorrectionToDraft?: (original: string, correction: string) => void;
}

export const EvidenceLibrary: React.FC<EvidenceLibraryProps> = ({
  currentBrand,
  draftCopy,
  onApplyCorrectionToDraft,
}) => {
  const { authFetch } = useAuth();
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EvidenceItem | null>(null);
  const [formClaim, setFormClaim] = useState('');
  const [formEvidence, setFormEvidence] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState('Performance');

  // Semantic Claim Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedClaims, setExtractedClaims] = useState<ExtractedClaim[]>([]);

  // Fetch evidence for current brand
  const loadEvidence = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/evidence?brandId=${currentBrand.id}`);
      if (res.ok) {
        const data = await res.json();
        setEvidenceList(data);
      }
    } catch (e) {
      console.warn('Failed to load evidence library:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, [currentBrand.id]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormClaim('');
    setFormEvidence('');
    setFormSource('');
    setFormUrl('');
    setFormCategory('Performance');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EvidenceItem) => {
    setEditingItem(item);
    setFormClaim(item.claim);
    setFormEvidence(item.evidenceText);
    setFormSource(item.sourceName);
    setFormUrl(item.sourceUrl || '');
    setFormCategory(item.category || 'Performance');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this verified evidence record?')) return;
    try {
      const res = await authFetch(`/api/evidence/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvidenceList((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Delete evidence error:', err);
    }
  };

  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClaim || !formEvidence || !formSource) return;

    try {
      if (editingItem) {
        // Update
        const res = await authFetch(`/api/evidence/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            claim: formClaim,
            evidenceText: formEvidence,
            sourceName: formSource,
            sourceUrl: formUrl,
            category: formCategory,
          }),
        });
        if (res.ok) {
          setEvidenceList((prev) =>
            prev.map((item) =>
              item.id === editingItem.id
                ? {
                    ...item,
                    claim: formClaim,
                    evidenceText: formEvidence,
                    sourceName: formSource,
                    sourceUrl: formUrl,
                    category: formCategory,
                  }
                : item
            )
          );
          setIsModalOpen(false);
        }
      } else {
        // Create
        const res = await authFetch('/api/evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandId: currentBrand.id,
            claim: formClaim,
            evidenceText: formEvidence,
            sourceName: formSource,
            sourceUrl: formUrl,
            category: formCategory,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const newItem: EvidenceItem = {
            id: data.id,
            brandId: currentBrand.id,
            claim: formClaim,
            evidenceText: formEvidence,
            sourceName: formSource,
            sourceUrl: formUrl,
            category: formCategory,
            createdAt: new Date().toISOString(),
          };
          setEvidenceList((prev) => [newItem, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Save evidence error:', err);
    }
  };

  // Run Semantic Claim Extraction against draft copy
  const handleExtractAndVerify = async () => {
    if (!draftCopy.trim()) return;
    setIsExtracting(true);
    try {
      const res = await authFetch('/api/claims/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          copy: draftCopy,
          brandId: currentBrand.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setExtractedClaims(data.claims || []);
      }
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const categories = Array.from(
    new Set(['Performance', 'Security & Compliance', 'Customer Satisfaction', 'Scale & Reliability', ...evidenceList.map((e) => e.category)])
  );

  const filteredEvidence = evidenceList.filter((item) => {
    const matchesSearch =
      item.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evidenceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h1 className="text-lg font-bold text-stone-900">
              Approved Evidence Library — {currentBrand.name}
            </h1>
          </div>
          <p className="text-xs text-stone-500 max-w-2xl">
            Central repository of FTC-substantiated facts, audited benchmarks, and verified quantitative claims.
            Vyakta AI strictly references this repository before permitting any quantitative statements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadEvidence}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs transition-colors cursor-pointer"
            title="Refresh repository"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Verified Evidence
          </button>
        </div>
      </div>

      {/* Claim Verification Tester Panel */}
      <div className="bg-gradient-to-br from-indigo-50/60 via-white to-stone-50 rounded-2xl border border-indigo-100 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Draft Claim Extraction & Verification
            </h2>
          </div>
          <button
            onClick={handleExtractAndVerify}
            disabled={isExtracting || !draftCopy.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isExtracting ? 'animate-spin' : ''}`} />
            {isExtracting ? 'Auditing Claims...' : 'Verify Claims in Current Draft'}
          </button>
        </div>

        <p className="text-xs text-stone-600">
          Scans the active draft copy for metrics, percentages, SLAs, and comparative claims, cross-referencing them against the {currentBrand.name} evidence library.
        </p>

        {extractedClaims.length > 0 && (
          <div className="mt-3 space-y-2 pt-3 border-t border-indigo-100">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
              Extracted Assertions ({extractedClaims.length})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {extractedClaims.map((claim, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    claim.verificationStatus === 'supported'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : claim.verificationStatus === 'contradicted'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-stone-900 leading-snug">
                      "{claim.claim}"
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        claim.verificationStatus === 'supported'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.verificationStatus === 'contradicted'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {claim.verificationStatus === 'supported' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Supported
                        </>
                      ) : claim.verificationStatus === 'contradicted' ? (
                        <>
                          <XCircle className="w-3 h-3" /> Contradicted
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" /> Unsupported
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 font-mono italic">
                    Context: {claim.originalSentence}
                  </p>

                  {claim.matchedEvidence && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-100/60 p-2 rounded-lg">
                      <span className="font-semibold">Approved Source:</span> {claim.matchedEvidence}
                    </div>
                  )}

                  {claim.suggestedCorrection && (
                    <div className="text-[11px] text-stone-700 bg-white/90 p-2 rounded-lg border border-stone-200 space-y-1">
                      <span className="font-semibold text-indigo-700 block">
                        Safe Qualitative Replacement (No Fabricated Numbers):
                      </span>
                      <p className="text-stone-800">{claim.suggestedCorrection}</p>
                      {onApplyCorrectionToDraft && (
                        <button
                          type="button"
                          onClick={() => onApplyCorrectionToDraft(claim.claim, claim.suggestedCorrection!)}
                          className="mt-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                        >
                          Apply Replacement to Draft
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims, metrics, or source papers..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            All Categories ({evidenceList.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-500">Loading evidence records...</div>
      ) : filteredEvidence.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200/80 space-y-2">
          <ShieldCheck className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="text-sm font-semibold text-stone-800">No matching evidence found</h3>
          <p className="text-xs text-stone-500">
            Add approved factual benchmarks to substantiate your brand's advertising and copy claims.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvidence.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700 uppercase tracking-wide">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                      title="Edit fact"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete fact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-stone-900 leading-snug">
                    "{item.claim}"
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    {item.evidenceText}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="font-medium text-stone-700 truncate max-w-[180px]">
                  Source: {item.sourceName}
                </span>
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Evidence Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900">
                {editingItem ? 'Edit Approved Evidence' : 'Add Approved Evidence Fact'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveEvidence} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Permitted Claim / Quantitative Assertion
                </label>
                <input
                  type="text"
                  required
                  value={formClaim}
                  onChange={(e) => setFormClaim(e.target.value)}
                  placeholder='e.g., "50% lower compute latency than legacy tier"'
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Substantiating Evidence / Audit Details
                </label>
                <textarea
                  rows={3}
                  required
                  value={formEvidence}
                  onChange={(e) => setFormEvidence(e.target.value)}
                  placeholder="Detailed benchmark methodology, testing environment, sample sizes, and audited results..."
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Source / Auditor</label>
                  <input
                    type="text"
                    required
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="e.g., CloudMetrics Benchmark Lab Q4"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="Performance">Performance</option>
                    <option value="Security & Compliance">Security & Compliance</option>
                    <option value="Customer Satisfaction">Customer Satisfaction</option>
                    <option value="Scale & Reliability">Scale & Reliability</option>
                    <option value="Financial & Cost">Financial & Cost</option>
                    <option value="Environmental">Environmental</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Reference Documentation URL (Optional)
                </label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://audit-docs.company.com/report-2026.pdf"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold shadow-xs"
                >
                  {editingItem ? 'Save Changes' : 'Save Approved Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

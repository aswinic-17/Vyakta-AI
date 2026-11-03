import React, { useState, useEffect } from 'react';
import { X, History, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { BrandPreset, GuidelineVersion } from '../types';
import { useAuth } from '../context/AuthContext';

interface GuidelineVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: BrandPreset;
  onRollbackComplete: (restoredBrand: BrandPreset) => void;
}

export const GuidelineVersionModal: React.FC<GuidelineVersionModalProps> = ({
  isOpen,
  onClose,
  brand,
  onRollbackComplete,
}) => {
  const { authFetch } = useAuth();
  const [versions, setVersions] = useState<GuidelineVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<GuidelineVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRollingBack, setIsRollingBack] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchVersions = async () => {
      setIsLoading(true);
      try {
        const res = await authFetch(`/api/brands/${brand.id}/versions`);
        if (res.ok) {
          const list: GuidelineVersion[] = await res.json();
          setVersions(list);
          if (list.length > 0) {
            setSelectedVersion(list[0]);
          }
        }
      } catch (e) {
        console.warn('Failed to load versions:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [isOpen, brand.id]);

  if (!isOpen) return null;

  const handleRollback = async (ver: GuidelineVersion) => {
    if (!confirm(`Restore Version ${ver.versionNumber}? This will create a new current guideline version based on this snapshot.`)) {
      return;
    }

    setIsRollingBack(true);
    try {
      const res = await authFetch(`/api/brands/${brand.id}/versions/${ver.id}/rollback`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        onRollbackComplete(data.snapshot);
        onClose();
      }
    } catch (e) {
      console.error('Rollback failed:', e);
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Guideline Version History — {brand.name}
              </h2>
              <p className="text-xs text-stone-500">
                Compare and restore historical brand standards, voice directives, and regulatory rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-100">
          {/* Left Column: Version List */}
          <div className="p-4 overflow-y-auto space-y-2 max-h-[50vh] md:max-h-[70vh]">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
              Saved Revisions ({versions.length})
            </span>
            {isLoading ? (
              <div className="text-xs text-stone-400 py-6 text-center">Loading versions...</div>
            ) : versions.length === 0 ? (
              <div className="text-xs text-stone-400 py-6 text-center">No previous revisions on record.</div>
            ) : (
              versions.map((ver, idx) => (
                <button
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedVersion?.id === ver.id
                      ? 'bg-indigo-50/70 border-indigo-300 text-stone-900 shadow-xs'
                      : 'bg-white border-stone-200/80 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">
                      Version {ver.versionNumber}.0
                    </span>
                    {idx === 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-700 line-clamp-1 font-medium">
                    {ver.changeSummary}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400">
                    <span>{ver.createdBy}</span>
                    <span>{new Date(ver.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right Column: Version Snapshot Details */}
          <div className="p-5 md:col-span-2 overflow-y-auto max-h-[50vh] md:max-h-[70vh] space-y-4">
            {selectedVersion ? (
              <>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900">
                        Version {selectedVersion.versionNumber}.0 Snapshot
                      </h3>
                      <span className="text-xs text-stone-400">
                        ({new Date(selectedVersion.createdAt).toLocaleString()})
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Summary: <span className="font-medium text-stone-800">{selectedVersion.changeSummary}</span>
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Published by: {selectedVersion.createdBy}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRollback(selectedVersion)}
                    disabled={isRollingBack}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {isRollingBack ? 'Restoring...' : 'Restore This Version'}
                  </button>
                </div>

                {/* Snapshot Breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="font-semibold text-stone-700 block mb-1">Tone Directives</span>
                    <ul className="space-y-1 text-stone-600 text-[11px]">
                      <li>Formality: {selectedVersion.snapshot.voiceTone.formality} / 5</li>
                      <li>Enthusiasm: {selectedVersion.snapshot.voiceTone.enthusiasm} / 5</li>
                      <li>Technicality: {selectedVersion.snapshot.voiceTone.technicality} / 5</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="font-semibold text-stone-700 block mb-1">Governance Counts</span>
                    <ul className="space-y-1 text-stone-600 text-[11px]">
                      <li>Prohibited Phrases: {selectedVersion.snapshot.prohibitedPhrases.length}</li>
                      <li>Approved Terms: {selectedVersion.snapshot.approvedTerms.length}</li>
                      <li>Mandatory Disclaimers: {selectedVersion.snapshot.requiredDisclaimers.length}</li>
                    </ul>
                  </div>
                </div>

                {/* Prohibited Phrases Sample */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                    Prohibited Phrases ({selectedVersion.snapshot.prohibitedPhrases.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVersion.snapshot.prohibitedPhrases.slice(0, 10).map((p, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium"
                      >
                        {p.phrase}
                      </span>
                    ))}
                    {selectedVersion.snapshot.prohibitedPhrases.length > 10 && (
                      <span className="px-2 py-0.5 text-[11px] text-stone-400">
                        +{selectedVersion.snapshot.prohibitedPhrases.length - 10} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Required Disclaimers */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                    Required Regulatory Disclaimers ({selectedVersion.snapshot.requiredDisclaimers.length})
                  </span>
                  <div className="space-y-2">
                    {selectedVersion.snapshot.requiredDisclaimers.map((d, i) => (
                      <div key={i} className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-[11px]">
                        <span className="font-semibold text-stone-800 block mb-0.5">
                          {d.governingLawOrPolicy}
                        </span>
                        <p className="text-stone-600 italic">"{d.disclaimerText}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-xs text-stone-400 py-12 text-center">
                Select a version from the left panel to inspect its parameters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

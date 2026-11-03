import React, { useState, useRef } from 'react';
import {
  FileText,
  Send,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Check,
  Upload,
  Info,
  Plus,
  Image as ImageIcon,
  FileCheck2,
  AlertCircle,
  Eye,
  CheckCircle2,
  Layers,
  Palette,
  Contrast,
  X,
} from 'lucide-react';
import { BrandPreset, ImageAnalysisResult } from '../types';
import { useAuth } from '../context/AuthContext';

interface ContentSubmissionPageProps {
  copy: string;
  onChangeCopy: (copy: string) => void;
  documentTitle: string;
  onChangeDocumentTitle: (title: string) => void;
  brand: BrandPreset;
  brands: BrandPreset[];
  onSelectBrand: (brand: BrandPreset) => void;
  onOpenCreateBrandModal: () => void;
  onSubmitForReview: () => void;
  isValidating: boolean;
  onNavigateToReview?: () => void;
  onNavigateToGuidelines?: () => void;
}

export const ContentSubmissionPage: React.FC<ContentSubmissionPageProps> = ({
  copy,
  onChangeCopy,
  documentTitle,
  onChangeDocumentTitle,
  brand,
  brands,
  onSelectBrand,
  onOpenCreateBrandModal,
  onSubmitForReview,
  isValidating,
  onNavigateToReview,
  onNavigateToGuidelines,
}) => {
  const { authFetch } = useAuth();
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [channel, setChannel] = useState('Marketing Email / Landing Page');

  // Multi-format document upload state
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const [parsedDocMeta, setParsedDocMeta] = useState<{
    fileName: string;
    fileType: string;
    pageCount: number;
    wordCount: number;
  } | null>(null);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);

  // Visual Image Analysis State
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const docInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const wordCount = copy.trim() ? copy.trim().split(/\s+/).length : 0;
  const charCount = copy.length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  const handleClear = () => {
    onChangeCopy('');
    setParsedDocMeta(null);
  };

  // Universal Document Processing: Handles any document format
  const processDocumentFile = async (file: File) => {
    setDocUploadError(null);
    setIsParsingDoc(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await authFetch('/api/documents/parse', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to extract text from document');
      }

      const data = await res.json();
      onChangeCopy(data.text);
      if (!documentTitle || documentTitle.startsWith('ApexCloud') || documentTitle.startsWith('Vyakta') || documentTitle.startsWith('Sample')) {
        onChangeDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      setParsedDocMeta({
        fileName: data.fileName,
        fileType: data.fileType,
        pageCount: data.pageCount,
        wordCount: data.wordCount,
      });
    } catch (err: any) {
      console.error('Document parsing error:', err);
      setDocUploadError(err.message || 'Error processing document');
    } finally {
      setIsParsingDoc(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handleDocumentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processDocumentFile(file);
  };

  // Handle Image Upload (PNG, JPG, JPEG)
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadError(null);
    setIsAnalyzingImage(true);
    setImagePreviewUrl(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('brandName', brand.name);
      formData.append('accentColor', brand.accentColor || '#2563eb');
      formData.append('industry', brand.industry || 'Technology');

      const res = await authFetch('/api/images/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Visual brand analysis failed');
      }

      const data: ImageAnalysisResult = await res.json();
      setImageAnalysis(data);
    } catch (err: any) {
      console.error('Image analysis error:', err);
      setImageUploadError(err.message || 'Error analyzing visual image');
    } finally {
      setIsAnalyzingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleUseOcrText = () => {
    if (!imageAnalysis?.ocrText) return;
    onChangeCopy(imageAnalysis.ocrText);
    onChangeDocumentTitle(`${brand.name} - Ad Creative Copy`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title & Navigation Banner */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Submit Content for Brand Review
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Upload marketing documents (PDF, Word, Text) or creatives (PNG, JPG) to audit against {brand.name}'s verified guidelines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToReview && (
              <button
                onClick={onNavigateToReview}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
              >
                Go to Review Space →
              </button>
            )}

            {onNavigateToGuidelines && (
              <button
                onClick={onNavigateToGuidelines}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
              >
                Brand Guidelines
              </button>
            )}

            <button
              onClick={onOpenCreateBrandModal}
              className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Any Brand</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Submission Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
        {/* Brand & Channel Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Target Brand Guidelines
              </label>
              <button
                type="button"
                onClick={onOpenCreateBrandModal}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Any Brand</span>
              </button>
            </div>
            <select
              value={brand.id}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  onOpenCreateBrandModal();
                } else {
                  const found = brands.find((b) => b.id === e.target.value);
                  if (found) onSelectBrand(found);
                }
              }}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium cursor-pointer"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.industry})
                </option>
              ))}
              <option value="__add_new__">+ Add Custom Brand...</option>
            </select>
            <span className="text-[11px] text-stone-400 mt-1 block">
              Auditing against: {brand.name} • {brand.prohibitedPhrases.length} prohibited rules • {brand.factualBenchmarks.length} verified benchmarks
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Publication Channel / Distribution
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium cursor-pointer"
            >
              <option value="Marketing Email / Landing Page">Marketing Email / Landing Page</option>
              <option value="Social Media Campaign (LinkedIn / X / Instagram)">Social Media Campaign (LinkedIn / X / Instagram)</option>
              <option value="Press Release & Corporate Announcement">Press Release & Corporate Announcement</option>
              <option value="Sales Deck / Executive Pitch">Sales Deck / Executive Pitch</option>
              <option value="Product Documentation / Service Terms">Product Documentation / Service Terms</option>
            </select>
          </div>
        </div>

        {/* Multi-Format Ingestion Actions (Universal Documents & Visual Creatives) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Universal Document Uploader Card (Supports ANY Document) */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingDoc(true);
            }}
            onDragLeave={() => setIsDraggingDoc(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingDoc(false);
              const file = e.dataTransfer.files?.[0];
              if (file) processDocumentFile(file);
            }}
            className={`p-4 rounded-xl border border-dashed transition-all text-xs flex flex-col justify-between ${
              isDraggingDoc
                ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-200'
                : 'border-stone-300 bg-stone-50/70 hover:bg-stone-50 hover:border-indigo-300'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-stone-800 font-semibold">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Upload Any Kind of Document</span>
                <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 text-[10px] font-medium">
                  Universal Parser
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-normal">
                Upload any file format: PDF, Word (.docx/.doc), Text, Markdown, Spreadsheets (.csv/.xlsx), Slides (.pptx), Web/HTML, RTF, Scanned Images & any document.
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
              <input
                ref={docInputRef}
                type="file"
                accept="*/*"
                onChange={handleDocumentFile}
                className="hidden"
                id="doc-upload-input"
              />
              <label
                htmlFor="doc-upload-input"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-lg font-medium text-stone-700 hover:bg-stone-100 cursor-pointer shadow-2xs hover:border-indigo-300 transition-colors shrink-0"
              >
                <Upload className="w-3 h-3 text-stone-500" />
                {isParsingDoc ? 'Extracting Copy...' : 'Browse / Drop Any File'}
              </label>
              {parsedDocMeta && (
                <span className="text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 truncate max-w-[200px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{parsedDocMeta.fileName}</span>
                  <span className="uppercase text-[9px] font-mono px-1 bg-emerald-100 rounded text-emerald-700 shrink-0">
                    {parsedDocMeta.fileType}
                  </span>
                  <span>({parsedDocMeta.wordCount}w)</span>
                </span>
              )}
            </div>

            {docUploadError && (
              <p className="mt-2 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {docUploadError}
              </p>
            )}
          </div>

          {/* Visual Brand Creative Uploader Card */}
          <div className="p-4 rounded-xl border border-dashed border-stone-300 bg-stone-50/70 hover:bg-stone-50 hover:border-indigo-300 transition-all text-xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-stone-800 font-semibold">
                <ImageIcon className="w-4 h-4 text-pink-600" />
                <span>Inspect Visual Marketing Creative (.png, .jpg)</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Multimodal vision analysis for logo clear space, color tokens, WCAG contrast & OCR copy.
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageFile}
                className="hidden"
                id="image-upload-input"
              />
              <label
                htmlFor="image-upload-input"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-lg font-medium text-stone-700 hover:bg-stone-100 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3 h-3 text-stone-500" />
                {isAnalyzingImage ? 'Analyzing Image...' : 'Upload Image'}
              </label>
              {imageAnalysis && (
                <span className="text-[10px] text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Visual Score: {imageAnalysis.score}/100
                </span>
              )}
            </div>

            {imageUploadError && (
              <p className="mt-2 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {imageUploadError}
              </p>
            )}
          </div>
        </div>

        {/* Visual Inspection Result Box if an image was analyzed */}
        {imageAnalysis && (
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 space-y-4 shadow-lg border border-stone-800 text-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {imagePreviewUrl && (
                  <img
                    src={imagePreviewUrl}
                    alt="Uploaded marketing asset"
                    className="w-14 h-14 object-cover rounded-xl border border-stone-700"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Visual Compliance Audit</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Score: {imageAnalysis.score} / 100
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">{imageAnalysis.summary}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setImageAnalysis(null); setImagePreviewUrl(null); }}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/60 space-y-1">
                <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase font-mono">
                  <span>Logo Integrity</span>
                  {imageAnalysis.logoDetected ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                  )}
                </div>
                <p className="text-[11px] text-stone-300 line-clamp-2">{imageAnalysis.logoFeedback}</p>
              </div>

              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/60 space-y-1">
                <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase font-mono">
                  <span>Color Alignment</span>
                  <span className="text-stone-300 font-bold">{imageAnalysis.colorPaletteScore}%</span>
                </div>
                <p className="text-[11px] text-stone-300 line-clamp-2">{imageAnalysis.colorFeedback}</p>
              </div>

              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/60 space-y-1">
                <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase font-mono">
                  <span>WCAG Contrast</span>
                  <span className="text-stone-300 font-bold">{imageAnalysis.contrastScore}%</span>
                </div>
                <p className="text-[11px] text-stone-300 line-clamp-2">{imageAnalysis.contrastFeedback}</p>
              </div>
            </div>

            {/* OCR Extracted Text */}
            {imageAnalysis.ocrText && (
              <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-stone-300">
                    OCR Copy Extracted From Image:
                  </span>
                  <button
                    type="button"
                    onClick={handleUseOcrText}
                    className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                  >
                    Transfer to Draft Copy Editor →
                  </button>
                </div>
                <p className="text-[11px] font-mono text-stone-300 italic bg-stone-900/80 p-2.5 rounded-lg border border-stone-700">
                  "{imageAnalysis.ocrText}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Campaign Title */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Campaign or Asset Title
          </label>
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => onChangeDocumentTitle(e.target.value)}
            placeholder="e.g. Q4 Product Announcement, Summer Promotion Copy, or Website Landing Page..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium"
          />
        </div>

        {/* Content Body Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-stone-700">
              Draft Content Copy
            </label>
            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} characters</span>
              <span>•</span>
              <span>~{readTime} min read</span>
              {copy && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-stone-400 hover:text-rose-600 transition-colors ml-2 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            rows={12}
            value={copy}
            onChange={(e) => onChangeCopy(e.target.value)}
            placeholder={`Type or paste the complete draft copy for ${brand.name} here, or upload a document/graphic above...`}
            className="w-full bg-stone-50/60 border border-stone-200 rounded-2xl p-4 text-sm text-stone-900 font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white resize-y transition-all"
          />
        </div>

        {/* Optional Submission Remarks */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Author Remarks / Context (Optional)
          </label>
          <input
            type="text"
            value={submissionNotes}
            onChange={(e) => setSubmissionNotes(e.target.value)}
            placeholder="Any specific context for reviewers (e.g. 'Targeting enterprise accounts', 'Check pricing disclaimer')..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>

        {/* Brand Guidance Snapshot */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3 text-xs text-stone-600">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-stone-800">Review Expectations for {brand.name}:</strong>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Copy will be evaluated against {brand.name}'s voice/tone targets, {brand.prohibitedPhrases.length} prohibited terminology rules, and factual claim references. Any unsubstantiated comparative statements will be transparently flagged in the Review Space.
            </p>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onSubmitForReview}
            disabled={!copy.trim() || isValidating}
            className="px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            {isValidating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Auditing Content...</span>
              </>
            ) : (
              <>
                <span>Submit Content for Brand Review</span>
                <ArrowRight className="w-4 h-4 text-stone-300" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

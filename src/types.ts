export type FindingType =
  | 'prohibited_phrase'
  | 'evidence_not_found'
  | 'tone_violation'
  | 'terminology_opportunity'
  | 'missing_disclaimer';

export type FindingSeverity = 'critical' | 'warning' | 'advisory';

export interface ApprovedTerm {
  term: string;
  context: string;
  preferredOver: string[];
  reason: string;
}

export interface ProhibitedPhrase {
  id: string;
  phrase: string;
  regexPattern?: string;
  severity: FindingSeverity;
  category: string;
  reason: string;
  suggestedAlternative: string;
  policyCitation: string;
}

export interface VoiceToneConfig {
  formality: number; // 1 to 5
  enthusiasm: number; // 1 to 5
  technicality: number; // 1 to 5
  directness: number; // 1 to 5
  principles: string[];
  forbiddenTones: string[];
}

export interface FactualBenchmark {
  id: string;
  claim: string;
  category: string;
  source: string;
  evidenceText: string;
  verifiedDate: string;
}

export interface RequiredDisclaimer {
  id: string;
  triggerKeywords: string[];
  disclaimerText: string;
  mandateLevel: 'mandatory' | 'recommended';
  governingLawOrPolicy: string;
  placementGuidance: string;
}

export interface BrandPreset {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  accentColor: string;
  description: string;
  approvedTerms: ApprovedTerm[];
  prohibitedPhrases: ProhibitedPhrase[];
  voiceTone: VoiceToneConfig;
  factualBenchmarks: FactualBenchmark[];
  requiredDisclaimers: RequiredDisclaimer[];
}

export interface ValidationFinding {
  id: string;
  type: FindingType;
  severity: FindingSeverity;
  title: string;
  originalText: string;
  startIndex: number;
  endIndex: number;
  explanation: string;
  policyCitation: string;
  suggestedRewrite: string;
  status: 'open' | 'applied' | 'dismissed';
  dismissReason?: string;
  matchedRuleId?: string;
  isEvidenceBacked?: boolean;
  evidenceSource?: string;
  neutralAlternative?: string;
}

export interface ToneAssessment {
  formalityScore: number;
  enthusiasmScore: number;
  technicalityScore: number;
  overallToneScore: number;
  critique: string;
}

export interface ValidationReport {
  id: string;
  brandId: string;
  brandName: string;
  overallScore: number;
  status: 'compliant' | 'needs_revision' | 'critical_violations';
  metrics: {
    totalFindings: number;
    criticalCount: number;
    warningCount: number;
    advisoryCount: number;
    wordCount: number;
    readingTimeMinutes: number;
    readingGradeLevel: string;
  };
  breakdown: {
    prohibitedPhrases: number;
    evidenceNotFound: number;
    toneViolations: number;
    terminologyImprovements: number;
    missingDisclaimers: number;
  };
  toneAssessment: ToneAssessment;
  findings: ValidationFinding[];
  evaluatedAt: string;
  evaluatedBy: 'hybrid' | 'deterministic' | 'gemini';
}

export interface ReviewDecision {
  status: 'pending' | 'approved' | 'rejected';
  reviewerName: string;
  reviewerNotes: string;
  decidedAt?: string;
  reportId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'reviewer' | 'admin' | 'editor';
  createdAt?: string;
}

export interface EvidenceItem {
  id: string;
  brandId: string;
  claim: string;
  evidenceText: string;
  sourceName: string;
  sourceUrl?: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuidelineVersion {
  id: string;
  brandId: string;
  versionNumber: number;
  snapshot: BrandPreset;
  changeSummary: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  userId?: string;
  userEmail?: string;
  brandId?: string;
  submissionId?: string;
  action: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface ImageAnalysisResult {
  score: number;
  ocrText: string;
  logoDetected: boolean;
  logoFeedback: string;
  colorPaletteScore: number;
  colorFeedback: string;
  contrastScore: number;
  contrastFeedback: string;
  findings: Array<{
    title: string;
    severity: 'critical' | 'warning' | 'advisory';
    explanation: string;
    suggestedFix?: string;
  }>;
  summary: string;
}

export interface ExtractedClaim {
  claim: string;
  originalSentence: string;
  verificationStatus: 'supported' | 'unsupported' | 'contradicted' | 'requires_human_verification';
  matchedEvidence?: string;
  confidence: number;
  suggestedCorrection?: string;
}

export interface GovernanceAnalytics {
  totalSubmissions: number;
  approvedCount: number;
  rejectedCount: number;
  revisionCount: number;
  averageScore: number;
  passRate: number;
  violationBreakdown: {
    prohibitedPhrases: number;
    evidenceNotFound: number;
    toneViolations: number;
    terminologyOpportunities: number;
    missingDisclaimers: number;
  };
  topViolatedRules: Array<{
    rule: string;
    count: number;
    category: string;
  }>;
  complianceTrend: Array<{
    date: string;
    score: number;
    submissions: number;
  }>;
  evidenceUtilizationRate: number;
}


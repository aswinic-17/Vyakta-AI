import { BrandPreset } from '../types';

export const DEFAULT_BRANDS: BrandPreset[] = [
  {
    id: 'apexcloud',
    name: 'ApexCloud Enterprise',
    tagline: 'High-Performance Resilient Cloud Infrastructure',
    industry: 'B2B Enterprise SaaS & Cloud',
    accentColor: '#38bdf8',
    description:
      'Mission-critical infrastructure for enterprise scale. Brand voice is authoritative, measured, engineer-led, and uncompromisingly precise. Absolute claims and consumer hyperbole are forbidden.',
    approvedTerms: [
      {
        term: 'enterprise-grade resilience',
        context: 'Reliability descriptions',
        preferredOver: ['unbreakable', 'never crashes', 'bulletproof'],
        reason: 'Maintains technical credibility and aligns with legal service commitments.',
      },
      {
        term: '99.99% availability SLA',
        context: 'Uptime commitments',
        preferredOver: ['100% uptime', 'zero downtime guaranteed', 'always on forever'],
        reason: 'Reflects exact contractual SLA terms without creating unbacked liability.',
      },
      {
        term: 'cost-optimized architecture',
        context: 'Pricing and efficiency discussions',
        preferredOver: ['dirt cheap', 'lowest price in the world', 'budget cloud'],
        reason: 'Reinforces enterprise ROI and high value rather than low-end discount positioning.',
      },
      {
        term: 'hardware-level security isolation',
        context: 'Security protocols',
        preferredOver: ['100% unhackable', 'impenetrable fortress', 'hacker-proof'],
        reason: 'Cybersecurity standards forbid declaring any digital system 100% impenetrable.',
      },
      {
        term: 'multi-region disaster recovery',
        context: 'Continuity planning',
        preferredOver: ['magic backup', 'instant cloud cloning'],
        reason: 'Matches industry NIST and ISO-27001 terminology.',
      },
    ],
    prohibitedPhrases: [
      {
        id: 'p-apex-1',
        phrase: 'unhackable',
        regexPattern: '\\b(unhackable|hacker-proof|impenetrable)\\b',
        severity: 'critical',
        category: 'Legal Risk',
        reason: 'Creates strict legal liability under cybersecurity representations and warranties.',
        suggestedAlternative: 'military-grade hardware isolation with zero-trust architecture',
        policyCitation: 'Brand Policy § 4.1 (Cybersecurity Claims & Representations)',
      },
      {
        id: 'p-apex-2',
        phrase: 'guaranteed zero downtime',
        regexPattern: '\\b(guaranteed zero downtime|never goes down|100% uptime)\\b',
        severity: 'critical',
        category: 'Legal Risk',
        reason: 'Violates enterprise SLA terms; contractual commitments are capped at 99.99% availability.',
        suggestedAlternative: 'built to support service reliability',
        policyCitation: 'Brand Policy § 4.3 (SLA & Operational Commitments)',
      },
      {
        id: 'p-apex-3',
        phrase: 'cheap',
        regexPattern: '\\b(cheap|dirt cheap|lowest price anywhere)\\b',
        severity: 'warning',
        category: 'Brand Value',
        reason: 'Degrades premium enterprise positioning and invites association with unmanaged tier-4 hosts.',
        suggestedAlternative: 'cost-efficient, high-ROI infrastructure',
        policyCitation: 'Brand Policy § 2.2 (Value Proposition & Enterprise Tone)',
      },
      {
        id: 'p-apex-4',
        phrase: 'destroys aws',
        regexPattern: '\\b(destroys aws|crushes aws|kills kubernetes|beats google easily)\\b',
        severity: 'critical',
        category: 'Misleading Claim',
        reason: 'Aggressive disparagement without published, reproducible independent audited benchmarks.',
        suggestedAlternative: 'designed to improve performance and deliver enterprise-grade throughput',
        policyCitation: 'Brand Policy § 5.2 (Comparative & Competitor Advertising)',
      },
      {
        id: 'p-apex-5',
        phrase: 'magic',
        regexPattern: '\\b(magic|magical|like magic)\\b',
        severity: 'advisory',
        category: 'Style Guideline',
        reason: 'Vague sensationalism that detracts from engineering rigor and verifiable architecture.',
        suggestedAlternative: 'automated orchestration engine',
        policyCitation: 'Brand Policy § 3.1 (Technical Precision & Tone)',
      },
    ],
    voiceTone: {
      formality: 5,
      enthusiasm: 2,
      technicality: 4,
      directness: 5,
      principles: [
        'Lead with architectural substance and measurable performance indicators.',
        'Use sober, confident engineering terminology; eschew startup hype.',
        'Always frame efficiency in terms of enterprise TCO and compliance readiness.',
      ],
      forbiddenTones: ['Sensationalist', 'Hyperbolic', 'Informal Slang', 'Vague Marketing Jargon'],
    },
    factualBenchmarks: [
      {
        id: 'b-apex-1',
        claim: '99.99% multi-region availability across 42 global regions',
        category: 'Performance',
        source: 'SOC-2 Type II Audit & CloudWatch Telemetry 2025',
        evidenceText: 'Historical availability recorded at 99.992% across all 42 primary points of presence.',
        verifiedDate: '2025-11-15',
      },
      {
        id: 'b-apex-2',
        claim: 'Under 12ms p99 packet latency for East-West cluster communication',
        category: 'Performance',
        source: 'Third-Party Benchmarking by CloudTech Labs (Report #CL-884)',
        evidenceText: 'Measured across 10 million simulated synthetic microservices transactions in October 2025.',
        verifiedDate: '2025-10-04',
      },
      {
        id: 'b-apex-3',
        claim: 'Over 4,200 enterprise customers including 38% of Fortune 500',
        category: 'Customer Metric',
        source: 'ApexCloud Annual Governance Report 2025',
        evidenceText: 'Verified active paying enterprise contracts as of Q3 fiscal close.',
        verifiedDate: '2025-09-30',
      },
      {
        id: 'b-apex-4',
        claim: 'Full compliance certification for SOC-2 Type II, ISO 27001, FedRAMP High, and HIPAA',
        category: 'Certification',
        source: 'Coalfire Independent Security Audit Certification',
        evidenceText: 'All certificates actively maintained and renewed annually.',
        verifiedDate: '2025-08-20',
      },
    ],
    requiredDisclaimers: [
      {
        id: 'd-apex-1',
        triggerKeywords: ['sla', 'uptime', 'availability', 'guarantee'],
        disclaimerText:
          '*Availability commitments subject to Master Services Agreement Schedule B. Financial credits apply per tiered downtime schedule; excludes scheduled maintenance windows.',
        mandateLevel: 'mandatory',
        governingLawOrPolicy: 'Legal Operations Guideline § 8 (SLA Representations)',
        placementGuidance: 'Footer footnote or immediately adjacent to availability claim.',
      },
      {
        id: 'd-apex-2',
        triggerKeywords: ['latency', 'faster', 'throughput', 'benchmarks', 'performance'],
        disclaimerText:
          '*Performance metrics reflect independent lab testing on standardized c6g.4xlarge compute instances by CloudTech Labs in Oct 2025. Actual workloads may vary.',
        mandateLevel: 'mandatory',
        governingLawOrPolicy: 'FTC Guideline § 255.5 (Objective Testing Disclosures)',
        placementGuidance: 'Inline reference citation or technical footnotes.',
      },
    ],
  },
  {
    id: 'luminahealth',
    name: 'Lumina Health & Wellness',
    tagline: 'Evidence-Backed Clinical Nutraceuticals',
    industry: 'Health & Wellness / Life Sciences',
    accentColor: '#fb7185',
    description:
      'Scientifically formulated nutritional supplements designed with integrative physicians. Brand voice is empathetic, scientifically disciplined, and strictly compliant with FDA dietary supplement regulations.',
    approvedTerms: [
      {
        term: 'supports restorative sleep cycles',
        context: 'Product efficacy claims',
        preferredOver: ['cures insomnia', 'knocks you out', 'ends sleeplessness forever'],
        reason: 'Structure/function claim permitted under DSHEA 1994; medical disease claims are strictly illegal.',
      },
      {
        term: 'helps modulate healthy cortisol response',
        context: 'Stress reduction',
        preferredOver: ['destroys stress', 'miracle anxiety cure', 'eradicates panic'],
        reason: 'Accurately describes botanical adaptogen mechanism without diagnosing pathology.',
      },
      {
        term: 'standardized bioactive botanical extracts',
        context: 'Ingredients formulation',
        preferredOver: ['secret magical herbs', 'ancient potion', 'miracle blend'],
        reason: 'Anchors brand in analytical chemistry and batch-tested quality.',
      },
      {
        term: 'clinically investigated ingredients',
        context: 'Scientific validation',
        preferredOver: ['proven by doctors to 100% work', 'guaranteed healing'],
        reason: 'DSHEA compliance requires rigorous substantiation language.',
      },
    ],
    prohibitedPhrases: [
      {
        id: 'p-lum-1',
        phrase: 'cure',
        regexPattern: '\\b(cure|cures|curing|cured)\\b',
        severity: 'critical',
        category: 'Regulatory',
        reason: 'Classifies dietary supplement as an unapproved new drug under FDA 21 U.S.C. § 321(g)(1).',
        suggestedAlternative: 'helps support natural bodily recovery and wellness',
        policyCitation: 'FDA DSHEA 1994 Compliance Standard & Brand Manual § 1.1',
      },
      {
        id: 'p-lum-2',
        phrase: 'miracle',
        regexPattern: '\\b(miracle|miraculous|magic pill)\\b',
        severity: 'critical',
        category: 'Misleading Claim',
        reason: 'Trigger for deceptive advertising prosecution under FTC Act Section 5.',
        suggestedAlternative: 'physician-formulated nutritional blend',
        policyCitation: 'FTC Health Products Advertising Guidance § 2.4',
      },
      {
        id: 'p-lum-3',
        phrase: 'eliminates insomnia forever',
        regexPattern: '\\b(eliminates insomnia|ends insomnia|cures insomnia|stops sleeplessness forever)\\b',
        severity: 'critical',
        category: 'Regulatory',
        reason: 'Insomnia is a recognized DSM-5 clinical disorder; claiming to eliminate it violates federal drug laws.',
        suggestedAlternative: 'supports the body’s natural melatonin synthesis and sleep latency',
        policyCitation: 'FDA Medical Claims Enforcement Directive 2024',
      },
      {
        id: 'p-lum-4',
        phrase: 'burns 100% fat',
        regexPattern: '\\b(burns 100% fat|instant weight loss|melts fat overnight)\\b',
        severity: 'critical',
        category: 'Misleading Claim',
        reason: 'Unsubstantiated weight loss claim flagged on FTC Red Flag Warning List.',
        suggestedAlternative: 'supports healthy metabolic function alongside diet and exercise',
        policyCitation: 'FTC Red Flag Bogus Weight Loss Claims Directive',
      },
      {
        id: 'p-lum-5',
        phrase: 'instant relief',
        regexPattern: '\\b(instant relief|works in 5 minutes|immediate healing)\\b',
        severity: 'warning',
        category: 'Regulatory',
        reason: 'Supplements act via systemic nutritional modulation and cannot promise pharmaceutical rapid onset.',
        suggestedAlternative: 'designed for gradual, compounding daily nutritional benefits',
        policyCitation: 'Brand Policy § 6.2 (Onset & Efficacy Statements)',
      },
    ],
    voiceTone: {
      formality: 4,
      enthusiasm: 2,
      technicality: 4,
      directness: 3,
      principles: [
        'Communicate warmth and patient empathy, anchored by rigorous clinical citations.',
        'Never position supplements as substitutes for primary medical care.',
        'Always celebrate holistic lifestyle fundamentals (sleep, nutrition, movement).',
      ],
      forbiddenTones: ['Sensationalist', 'Miracle-Mongering', 'Aggressive Hard-Sell', 'Fear-Inducing'],
    },
    factualBenchmarks: [
      {
        id: 'b-lum-1',
        claim: 'Double-blind, placebo-controlled clinical trial showed 28% improvement in restorative sleep score',
        category: 'Performance',
        source: 'Journal of Clinical Sleep Medicine (2024; Vol 20, Issue 4)',
        evidenceText: 'Randomized cohort of n=420 healthy adults aged 25-60 over 8 weeks of daily supplementation.',
        verifiedDate: '2024-08-12',
      },
      {
        id: 'b-lum-2',
        claim: 'Formulated with KSM-66 Organic Ashwagandha standardized to 5% withanolides',
        category: 'Certification',
        source: 'Certificate of Analysis (Lot #KSM-9941B) & NSF Third-Party Testing',
        evidenceText: 'Verified HPLC chromatography confirming 5.12% withanolide content.',
        verifiedDate: '2025-06-18',
      },
      {
        id: 'b-lum-3',
        claim: 'Manufactured in cGMP and NSF International certified facility in Boulder, CO',
        category: 'Certification',
        source: 'NSF Registration #C0492811-01',
        evidenceText: 'Bi-annual audit completed with zero 483 observational findings.',
        verifiedDate: '2025-05-10',
      },
    ],
    requiredDisclaimers: [
      {
        id: 'd-lum-1',
        triggerKeywords: ['supplement', 'health', 'sleep', 'cortisol', 'wellness', 'capsule', 'energy'],
        disclaimerText:
          '*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.',
        mandateLevel: 'mandatory',
        governingLawOrPolicy: 'FDA Dietary Supplement Health and Education Act (DSHEA) § 403(r)(6)',
        placementGuidance: 'Mandatory boxed disclosure on all marketing copy, ads, and landing pages.',
      },
      {
        id: 'd-lum-2',
        triggerKeywords: ['clinical trial', 'study', 'participants', 'investigated', 'results'],
        disclaimerText:
          '*Results may vary based on individual metabolism, lifestyle, and consistent usage. Consult your physician prior to beginning any supplementation regimen.',
        mandateLevel: 'recommended',
        governingLawOrPolicy: 'FTC Substantiation Doctrine',
        placementGuidance: 'Adjacent to clinical trial callouts.',
      },
    ],
  },
  {
    id: 'voltfin',
    name: 'VoltFin Technologies',
    tagline: 'Modern Corporate Treasury & Neobanking',
    industry: 'Fintech & Wealth Infrastructure',
    accentColor: '#06b6d4',
    description:
      'High-yield automated treasury accounts and capital workflows for venture-backed companies. Voice is mathematically transparent, crisp, conservative, and fully aligned with SEC and FDIC disclosure requirements.',
    approvedTerms: [
      {
        term: 'program bank FDIC coverage',
        context: 'Deposit protection disclosures',
        preferredOver: ['we are an FDIC bank', 'VoltFin insurance', 'government guaranteed'],
        reason: 'VoltFin is a technology entity; deposits are swept to chartered partner banks.',
      },
      {
        term: 'annual percentage yield (APY)',
        context: 'Yield descriptions',
        preferredOver: ['interest profits', 'passive cash flow', 'guaranteed returns'],
        reason: 'Financial regulations require quoting standardized variable APY terms.',
      },
      {
        term: 'automated treasury sweeps',
        context: 'Capital movement technology',
        preferredOver: ['magic arbitrage bot', 'money printer', 'free money algorithm'],
        reason: 'Professional fiduciary posture for venture CFOs.',
      },
    ],
    prohibitedPhrases: [
      {
        id: 'p-volt-1',
        phrase: 'free money',
        regexPattern: '\\b(free money|free cash|easy riches)\\b',
        severity: 'critical',
        category: 'Legal Risk',
        reason: 'Misleading inducement prohibited under CFPB unfair and deceptive acts or practices (UDAAP).',
        suggestedAlternative: 'competitive sign-up bonus terms subject to qualification',
        policyCitation: 'CFPB UDAAP Regulations & Financial Advertising Code § 7',
      },
      {
        id: 'p-volt-2',
        phrase: 'guaranteed risk-free return',
        regexPattern: '\\b(guaranteed risk-free|risk-free return|zero risk|can’t lose)\\b',
        severity: 'critical',
        category: 'Legal Risk',
        reason: 'SEC Rule 156 prohibit representations of guaranteed investment safety or risk elimination.',
        suggestedAlternative: 'conservative capital preservation strategy through FDIC-insured sweep accounts',
        policyCitation: 'SEC Rule 156 (Investment Company Sales Literature)',
      },
      {
        id: 'p-volt-3',
        phrase: 'beat the stock market',
        regexPattern: '\\b(beat the stock market|outperform the market|crush wall street)\\b',
        severity: 'warning',
        category: 'Misleading Claim',
        reason: 'Promissory investment marketing without past performance disclaimers.',
        suggestedAlternative: 'optimize cash holdings with competitive yields compared to traditional commercial banks',
        policyCitation: 'FINRA Rule 2210 (Communications with the Public)',
      },
      {
        id: 'p-volt-4',
        phrase: '12% apy',
        regexPattern: '\\b(12%\\s*apy|18%\\s*apy|20%\\s*apy)\\b',
        severity: 'critical',
        category: 'Misleading Claim',
        reason: 'Benchmark rate exceeds current verified federal reserve treasury sweep cap (5.15% APY).',
        suggestedAlternative: 'up to 5.15% APY through participating network sweep banks',
        policyCitation: 'VoltFin Treasury Benchmark Sheet Q4 2025',
      },
    ],
    voiceTone: {
      formality: 5,
      enthusiasm: 1,
      technicality: 5,
      directness: 5,
      principles: [
        'Maintain impeccable fiduciary sobriety. No emojis, exclamation points, or hype.',
        'Always quantify basis points, variable rate conditions, and fee schedules.',
        'Never obscure deposit mechanics or partner bank structures.',
      ],
      forbiddenTones: ['Hype-Beast', 'Speculative Crypto Slang', 'Get-Rich-Quick', 'Flippant'],
    },
    factualBenchmarks: [
      {
        id: 'b-volt-1',
        claim: 'Extended FDIC insurance up to $2,500,000 via participating IntraFi network banks',
        category: 'Security',
        source: 'Deposit Placement Agreement & IntraFi Network Audit 2025',
        evidenceText: 'Deposits distributed across up to 10 partner depository institutions.',
        verifiedDate: '2025-10-01',
      },
      {
        id: 'b-volt-2',
        claim: 'Current variable treasury yield of 5.15% APY as of Q4 2025',
        category: 'Financial',
        source: 'VoltFin Asset Management Rate Schedule (Effective Oct 1, 2025)',
        evidenceText: 'Rate variable based on 30-day SOFR and Fed Funds Target upper bound.',
        verifiedDate: '2025-10-15',
      },
      {
        id: 'b-volt-3',
        claim: 'Over $1.4B in corporate client deposits processed through automated sweep accounts',
        category: 'Customer Metric',
        source: 'Q3 Financial Review audited by BDO LLP',
        evidenceText: 'Aggregated cumulative liquidity managed across 1,120 startup and mid-market accounts.',
        verifiedDate: '2025-09-30',
      },
    ],
    requiredDisclaimers: [
      {
        id: 'd-volt-1',
        triggerKeywords: ['fdic', 'deposit', 'bank', 'interest', 'apy', 'yield', 'treasury', 'cash'],
        disclaimerText:
          '*VoltFin Technologies Inc. is a financial technology company, not a bank. Banking services provided by Evolve Bank & Trust or Coastal Community Bank, Members FDIC. The VoltFin Visa Commercial Card is issued by Celtic Bank.',
        mandateLevel: 'mandatory',
        governingLawOrPolicy: 'FDIC Federal Register 12 CFR Part 328 (False Advertising & FDIC Signage)',
        placementGuidance: 'Mandatory prominent footer disclaimer on all promotional material.',
      },
      {
        id: 'd-volt-2',
        triggerKeywords: ['yield', 'apy', 'treasury', 'rate', 'interest', 'return'],
        disclaimerText:
          '*Annual Percentage Yield (APY) is variable and subject to change at any time without notice. Rates current as of October 2025. Fees may reduce earnings.',
        mandateLevel: 'mandatory',
        governingLawOrPolicy: 'Truth in Savings Act (Regulation DD) § 1030.8',
        placementGuidance: 'Immediately adjacent to the first mention of any percentage yield.',
      },
    ],
  },
];

export const SAMPLE_DRAFTS: Record<string, { title: string; copy: string }> = {
  apexcloud: {
    title: 'ApexCloud Q4 Global Launch Campaign',
    copy: `ApexCloud is the world's most unbeatable cloud platform that is 100% unhackable and destroys AWS by being 10x faster and totally cheap! 

Our magic servers never go down with guaranteed zero downtime for everyone. Whether you are running mission-critical workloads or experimental apps, we deliver bulletproof cloud architecture that eliminates latency permanently. 

Switch away from overpriced legacy hyperscalers today and save 90% instantly with the best infrastructure ever engineered. Our distributed edge network is mathematically impenetrable and provides limitless scale with no compromises.`,
  },
  luminahealth: {
    title: 'Lumina SleepSync Product Launch Email',
    copy: `Experience Lumina SleepSync: the revolutionary miracle cure that eliminates insomnia forever in 5 minutes! 

This physician-formulated supplement completely cures chronic stress and burns 100% fat while you rest. It is clinically proven by doctors to 100% work for anyone struggling with exhaustion. With our secret magical herbs, you will experience instant relief and wake up with infinite mental stamina. 

Stop suffering from sleepless nights and buy the ultimate sleep solution today!`,
  },
  voltfin: {
    title: 'VoltFin Venture Treasury Newsletter',
    copy: `Supercharge your startup's runway with VoltFin Treasury! Deposit your cash today into our automated accounts for a guaranteed risk-free return of 12% APY with zero risk of losing money. 

Beat the stock market and get free money with our exclusive sign-up liquidity bonus. Our money printer algorithm works 24/7 so your idle venture capital compounds effortlessly with total government protection. 

Open an account in 60 seconds and watch your treasury multiply without lifting a finger!`,
  },
};

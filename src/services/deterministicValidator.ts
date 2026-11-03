import { BrandPreset, FactualBenchmark, ValidationFinding, ValidationReport } from '../types';

export function runDeterministicValidation(
  copy: string,
  brand: BrandPreset
): { findings: ValidationFinding[]; metrics: ValidationReport['metrics']; breakdown: ValidationReport['breakdown'] } {
  const findings: ValidationFinding[] = [];
  const text = copy;
  const lowerText = text.toLowerCase();

  // 1. Check Prohibited Phrases & Regex patterns
  for (const item of brand.prohibitedPhrases) {
    let regex: RegExp;
    try {
      regex = item.regexPattern ? new RegExp(item.regexPattern, 'gi') : new RegExp(`\\b${escapeRegExp(item.phrase)}\\b`, 'gi');
    } catch {
      regex = new RegExp(`\\b${escapeRegExp(item.phrase)}\\b`, 'gi');
    }

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      // Avoid duplicate flags on identical span
      const existing = findings.find((f) => f.startIndex === startIndex && f.endIndex === endIndex);
      if (!existing) {
        // Enforce safe, evidence-aware alternative if item's suggestion contains unsupported numbers
        const safeAlt = sanitizeSuggestedAlternative(item.suggestedAlternative, matchText, brand.factualBenchmarks);

        findings.push({
          id: `det-prohibited-${item.id}-${startIndex}`,
          type: 'prohibited_phrase',
          severity: item.severity,
          title: `Prohibited Phrase: "${matchText}"`,
          originalText: matchText,
          startIndex,
          endIndex,
          explanation: item.reason,
          policyCitation: item.policyCitation,
          suggestedRewrite: safeAlt.suggestedRewrite,
          neutralAlternative: safeAlt.neutralAlternative,
          isEvidenceBacked: safeAlt.isEvidenceBacked,
          evidenceSource: safeAlt.evidenceSource,
          status: 'open',
          matchedRuleId: item.id,
        });
      }
    }
  }

  // 2. Check Approved Terminology Opportunities
  for (const termItem of brand.approvedTerms) {
    for (const deprecated of termItem.preferredOver) {
      const regex = new RegExp(`\\b${escapeRegExp(deprecated)}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const matchText = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + matchText.length;

        // Check if span is already covered by a critical prohibited phrase
        const isAlreadyFlagged = findings.some(
          (f) => Math.max(f.startIndex, startIndex) < Math.min(f.endIndex, endIndex)
        );

        if (!isAlreadyFlagged) {
          findings.push({
            id: `det-term-${startIndex}`,
            type: 'terminology_opportunity',
            severity: 'advisory',
            title: `Approved Terminology Opportunity: "${termItem.term}"`,
            originalText: matchText,
            startIndex,
            endIndex,
            explanation: `${termItem.reason} Preferred term "${termItem.term}" replaces deprecated colloquialism "${matchText}".`,
            policyCitation: `Brand Nomenclature Standard § 1.4 (${termItem.context})`,
            suggestedRewrite: termItem.term,
            neutralAlternative: termItem.term,
            isEvidenceBacked: true,
            status: 'open',
          });
        }
      }
    }
  }

  // 3. Strict Evidence-Aware Validation: Detect Comparative Superlatives & Unsupported Numerical Claims
  const comparativePatterns = [
    {
      regex: /\b(99\.99%\s+multi-region\s+availability\s+across\s+\d+\s+global\s+regions|across\s+\d+\s+global\s+regions|\d+\s+global\s+regions)\b/gi,
      category: 'Unsupported Geographical & SLA Claim',
      defaultSafe: 'designed to support reliable operations across distributed environments',
    },
    {
      regex: /\b(save\s+\d+%\s*(?:instantly|today|now)?|\d+%\s*(?:savings|cheaper|discount|off))\b/gi,
      category: 'Unsupported Savings Claim',
      defaultSafe: 'designed to help optimize operational costs',
    },
    {
      regex: /\b(\d+(?:\.\d+)?x\s+(?:faster|cheaper|better|more\s+reliable)|10x\s+faster|\d+(?:\.\d+)?x\b)/gi,
      category: 'Unsupported Multiplier Benchmark',
      defaultSafe: 'designed to improve performance',
    },
    {
      regex: /\b(guaranteed\s+zero\s+downtime|never\s+go(?:es)?\s+down|100%\s+uptime|zero\s+downtime\s+guaranteed)\b/gi,
      category: 'Unsupported Uptime Guarantee',
      defaultSafe: 'built to support service reliability',
    },
    {
      regex: /\b(world'?s\s+most\s+[\w-]+|unbeatable|destroy(?:s|ing)?\s+[\w]+|crush(?:es|ing)?\s+[\w]+|best\s+[\w-]+\s+ever|limitless\s+scale|mathematically\s+impenetrable)\b/gi,
      category: 'Unverified Superlative',
      defaultSafe: 'designed to deliver enterprise-grade performance and reliability',
    },
    {
      regex: /\b(eliminates\s+[\w\s]{3,20}\s+permanently|infinite\s+[\w]+|100%\s+[\w]+|burns\s+100%\s+fat|cures?\s+[\w]+)\b/gi,
      category: 'Absolute Efficacy Claim',
      defaultSafe: 'designed to support consistent operational standards',
    },
    {
      regex: /\b(guaranteed\s+(?:return|profit|yield)\s+of\s+\d+%|\d+%\s*apy|money\s+printer\s+algorithm)\b/gi,
      category: 'Promissory Financial Return',
      defaultSafe: 'designed to prioritize disciplined capital management',
    },
    {
      regex: /\b(\d+(?:\.\d+)?%\s+[\w\s]{2,15}|\b\d+%\b)/gi,
      category: 'Unsupported Percentage Metric',
      defaultSafe: 'designed to deliver measurable operational value',
    },
  ];

  for (const comp of comparativePatterns) {
    let match: RegExpExecArray | null;
    while ((match = comp.regex.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      // Check if text is substantiated in brand.factualBenchmarks
      const verifiedBenchmark = findVerifyingBenchmark(matchText, brand.factualBenchmarks);

      // Check if span is already covered by another finding
      const isCovered = findings.some(
        (f) => Math.max(f.startIndex, startIndex) < Math.min(f.endIndex, endIndex)
      );

      if (!verifiedBenchmark && !isCovered) {
        const safeCorrection = getSafeEvidenceAwareCorrection(matchText, comp.defaultSafe, brand);

        findings.push({
          id: `det-claim-${startIndex}`,
          type: 'evidence_not_found',
          severity: 'warning',
          title: `Evidence Not Found: "${matchText}"`,
          originalText: matchText,
          startIndex,
          endIndex,
          explanation: `Numerical or quantitative claim was made without supporting documentation in the ${brand.name} verified benchmark repository. Plausible numbers cannot substitute for verified evidence. Governed by FTC Section 5 and truth-in-advertising guidelines.`,
          policyCitation: `Brand Claim Substantiation Standard § 2.1 (Empirical Verification Required)`,
          suggestedRewrite: safeCorrection.suggestedRewrite,
          neutralAlternative: safeCorrection.neutralAlternative,
          isEvidenceBacked: safeCorrection.isEvidenceBacked,
          evidenceSource: safeCorrection.evidenceSource,
          status: 'open',
        });
      }
    }
  }

  // 4. Check Required Disclaimers
  for (const disc of brand.requiredDisclaimers) {
    const hasTrigger = disc.triggerKeywords.some((kw) => lowerText.includes(kw.toLowerCase()));
    if (hasTrigger) {
      // Check if disclaimer or key portion of it is already in the copy
      const keyWords = disc.disclaimerText
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .toLowerCase()
        .split(/\s+/)
        .slice(1, 6)
        .join(' ');

      const isDisclaimerPresent = lowerText.includes(keyWords);
      if (!isDisclaimerPresent) {
        findings.push({
          id: `det-disc-${disc.id}`,
          type: 'missing_disclaimer',
          severity: disc.mandateLevel === 'mandatory' ? 'critical' : 'warning',
          title: `Missing Mandatory Disclaimer: ${disc.governingLawOrPolicy}`,
          originalText: `[Document Body - Missing Disclaimer]`,
          startIndex: Math.max(0, text.length - 1),
          endIndex: text.length,
          explanation: `Copy contains trigger terms (${disc.triggerKeywords.slice(0, 3).join(', ')}), but lacks the mandatory regulatory disclosure. Requirement: "${disc.disclaimerText.slice(0, 90)}..."`,
          policyCitation: disc.governingLawOrPolicy,
          suggestedRewrite: `\n\n${disc.disclaimerText}`,
          neutralAlternative: `\n\n${disc.disclaimerText}`,
          isEvidenceBacked: true,
          status: 'open',
          matchedRuleId: disc.id,
        });
      }
    }
  }

  // 5. Calculate Metrics
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(0.1, parseFloat((words / 225).toFixed(1)));
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
  const syllables = countSyllablesApprox(text);
  
  let gradeLevel = 'Grade 8-9 (Standard)';
  if (words > 10) {
    const fk = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    if (fk <= 7) gradeLevel = 'Grade 6-7 (Accessible)';
    else if (fk <= 10) gradeLevel = 'Grade 8-10 (Standard)';
    else if (fk <= 14) gradeLevel = 'Grade 11-12 (Advanced)';
    else gradeLevel = 'College Level (Technical/Dense)';
  }

  const criticalCount = findings.filter((f) => f.severity === 'critical').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  const advisoryCount = findings.filter((f) => f.severity === 'advisory').length;

  const breakdown = {
    prohibitedPhrases: findings.filter((f) => f.type === 'prohibited_phrase').length,
    evidenceNotFound: findings.filter((f) => f.type === 'evidence_not_found').length,
    toneViolations: findings.filter((f) => f.type === 'tone_violation').length,
    terminologyImprovements: findings.filter((f) => f.type === 'terminology_opportunity').length,
    missingDisclaimers: findings.filter((f) => f.type === 'missing_disclaimer').length,
  };

  const metrics = {
    totalFindings: findings.length,
    criticalCount,
    warningCount,
    advisoryCount,
    wordCount: words,
    readingTimeMinutes,
    readingGradeLevel: gradeLevel,
  };

  return { findings, metrics, breakdown };
}

/**
 * Checks if a specific claim is explicitly substantiated in the brand's verified fact repository.
 * Strictly verifies that any numbers in the claim are present in the evidence.
 */
export function findVerifyingBenchmark(claimText: string, benchmarks: FactualBenchmark[]): FactualBenchmark | null {
  const lower = claimText.toLowerCase();
  const numbersInClaim = claimText.match(/\d+(?:\.\d+)?/g);

  for (const b of benchmarks) {
    const bClaimLower = b.claim.toLowerCase();
    const bEvidenceLower = b.evidenceText.toLowerCase();

    // Check if the general statement matches
    const textMatches = bClaimLower.includes(lower) || bEvidenceLower.includes(lower);

    if (textMatches) {
      // If there are numbers, verify that every number is explicitly supported in the benchmark
      if (numbersInClaim && numbersInClaim.length > 0) {
        const allNumbersFound = numbersInClaim.every(
          (num) => b.claim.includes(num) || b.evidenceText.includes(num)
        );
        if (allNumbersFound) {
          return b;
        }
      } else {
        return b;
      }
    }
  }

  return null;
}

/**
 * Generates safe, evidence-aware corrections that strictly avoid fabricating numbers.
 * Enforces rule: When evidence is unavailable, rewrite using neutral, qualitative language without numbers.
 */
export function getSafeEvidenceAwareCorrection(
  matchText: string,
  categoryDefault: string,
  brand: BrandPreset
): { suggestedRewrite: string; neutralAlternative: string; isEvidenceBacked: boolean; evidenceSource?: string } {
  const lower = matchText.toLowerCase();

  // 1. Availability / SLA / Global Regions
  if (lower.includes('global regions') || lower.includes('multi-region availability') || lower.includes('99.99% multi-region')) {
    const neutral = 'designed to support reliable operations across distributed environments';
    return {
      suggestedRewrite: `No evidence-backed correction available: ${neutral}`,
      neutralAlternative: neutral,
      isEvidenceBacked: false,
    };
  }

  // 2. Savings & Cost Claims
  if (lower.includes('save 90%') || lower.includes('save') || lower.includes('cheaper') || lower.includes('discount')) {
    const neutral = 'designed to help optimize operational costs';
    return {
      suggestedRewrite: `No evidence-backed correction available: ${neutral}`,
      neutralAlternative: neutral,
      isEvidenceBacked: false,
    };
  }

  // 3. Multiplier / Speed Claims
  if (lower.includes('10x faster') || lower.includes('10x') || lower.includes('faster') || lower.includes('throughput')) {
    const neutral = 'designed to improve performance';
    return {
      suggestedRewrite: `No evidence-backed correction available: ${neutral}`,
      neutralAlternative: neutral,
      isEvidenceBacked: false,
    };
  }

  // 4. Zero Downtime / Uptime Guarantees
  if (lower.includes('guaranteed zero downtime') || lower.includes('never go down') || lower.includes('100% uptime')) {
    const neutral = 'built to support service reliability';
    return {
      suggestedRewrite: `No evidence-backed correction available: ${neutral}`,
      neutralAlternative: neutral,
      isEvidenceBacked: false,
    };
  }

  // 5. Fallback safe qualitative alternative
  const neutral = categoryDefault || 'designed to deliver dependable operational standards';
  return {
    suggestedRewrite: `No evidence-backed correction available: ${neutral}`,
    neutralAlternative: neutral,
    isEvidenceBacked: false,
  };
}

/**
 * Validates a suggested alternative against benchmarks to ensure it doesn't invent numbers.
 * If unsupported numbers are present, rewrites into safe qualitative language.
 */
export function sanitizeSuggestedAlternative(
  suggested: string,
  originalText: string,
  benchmarks: FactualBenchmark[]
): { suggestedRewrite: string; neutralAlternative: string; isEvidenceBacked: boolean; evidenceSource?: string } {
  const numbersInSuggested = suggested.match(/\d+(?:\.\d+)?/g);

  // If no numbers in suggested alternative, it is already safe
  if (!numbersInSuggested || numbersInSuggested.length === 0) {
    return {
      suggestedRewrite: suggested,
      neutralAlternative: suggested,
      isEvidenceBacked: true,
    };
  }

  // If there are numbers, check if every number is explicitly backed by benchmarks
  const allNumbersBacked = numbersInSuggested.every((num) =>
    benchmarks.some((b) => b.claim.includes(num) || b.evidenceText.includes(num))
  );

  if (allNumbersBacked) {
    const matchedBenchmark = benchmarks.find((b) =>
      numbersInSuggested.some((num) => b.claim.includes(num) || b.evidenceText.includes(num))
    );
    return {
      suggestedRewrite: suggested,
      neutralAlternative: suggested,
      isEvidenceBacked: true,
      evidenceSource: matchedBenchmark?.source,
    };
  }

  // Unsupported number detected in suggested alternative!
  // Rewrite using safe qualitative alternative:
  const lower = (originalText + ' ' + suggested).toLowerCase();
  let safeNeutral = 'designed to deliver dependable operational standards';

  if (lower.includes('uptime') || lower.includes('availability') || lower.includes('downtime')) {
    safeNeutral = 'built to support service reliability';
  } else if (lower.includes('faster') || lower.includes('speed') || lower.includes('latency') || lower.includes('10x')) {
    safeNeutral = 'designed to improve performance';
  } else if (lower.includes('save') || lower.includes('cost') || lower.includes('cheap')) {
    safeNeutral = 'designed to help optimize operational costs';
  } else if (lower.includes('region') || lower.includes('global')) {
    safeNeutral = 'designed to support reliable operations across distributed environments';
  }

  return {
    suggestedRewrite: `No evidence-backed correction available: ${safeNeutral}`,
    neutralAlternative: safeNeutral,
    isEvidenceBacked: false,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countSyllablesApprox(text: string): number {
  const words = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
  let total = 0;
  for (const word of words) {
    const matched = word.match(/[aeiouy]{1,2}/g);
    total += matched ? Math.max(1, matched.length) : 1;
  }
  return total || 1;
}

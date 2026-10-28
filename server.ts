import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { runDeterministicValidation } from './src/services/deterministicValidator.ts';
import { BrandPreset, ValidationFinding, ValidationReport, ToneAssessment } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini client with mandated headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
    service: 'Vyakta AI Hybrid Validation Engine',
  });
});

function sanitizeBackendRewrite(
  suggestedRewrite: string,
  originalText: string,
  benchmarks: any[]
): { suggestedRewrite: string; neutralAlternative: string; isEvidenceBacked: boolean } {
  if (!suggestedRewrite) {
    const neutral = 'designed to deliver dependable operational standards';
    return {
      suggestedRewrite: `No evidence-backed correction available: ${neutral}`,
      neutralAlternative: neutral,
      isEvidenceBacked: false,
    };
  }

  // Extract all numbers (integers, decimals)
  const numbers = suggestedRewrite.match(/\d+(?:\.\d+)?/g);

  // If no numbers in suggested rewrite, check if it's already a "No evidence-backed" notice
  if (!numbers || numbers.length === 0) {
    if (suggestedRewrite.startsWith('No evidence-backed correction available:')) {
      const neutral = suggestedRewrite.replace(/^No evidence-backed correction available:\s*/i, '').trim();
      return {
        suggestedRewrite,
        neutralAlternative: neutral,
        isEvidenceBacked: false,
      };
    }
    return {
      suggestedRewrite,
      neutralAlternative: suggestedRewrite,
      isEvidenceBacked: true,
    };
  }

  // If there are numbers, check if every number is explicitly backed by benchmarks
  const allNumbersVerified = numbers.every((num) =>
    benchmarks.some((b) => b.claim?.includes(num) || b.evidenceText?.includes(num))
  );

  if (allNumbersVerified) {
    return {
      suggestedRewrite,
      neutralAlternative: suggestedRewrite,
      isEvidenceBacked: true,
    };
  }

  // Unsupported or fabricated number detected! Replace with safe, qualitative alternative
  const lower = (originalText + ' ' + suggestedRewrite).toLowerCase();
  let safeNeutral = 'designed to deliver dependable, high-efficiency operations';

  if (lower.includes('99.99%') || lower.includes('global regions') || lower.includes('multi-region') || lower.includes('42 global')) {
    safeNeutral = 'designed to support reliable operations across distributed environments';
  } else if (lower.includes('save') || lower.includes('90%') || lower.includes('cost') || lower.includes('cheap')) {
    safeNeutral = 'designed to help optimize operational costs';
  } else if (lower.includes('10x') || lower.includes('faster') || lower.includes('speed') || lower.includes('latency')) {
    safeNeutral = 'designed to improve performance';
  } else if (lower.includes('zero downtime') || lower.includes('never go down') || lower.includes('uptime') || lower.includes('100%')) {
    safeNeutral = 'built to support service reliability';
  }

  return {
    suggestedRewrite: `No evidence-backed correction available: ${safeNeutral}`,
    neutralAlternative: safeNeutral,
    isEvidenceBacked: false,
  };
}

// Hybrid Content Validation Endpoint
app.post('/api/validate', async (req: Request, res: Response) => {
  try {
    const { copy, brand } = req.body as { copy: string; brand: BrandPreset };

    if (!copy || !brand) {
      res.status(400).json({ error: 'Missing draft copy or brand preset' });
      return;
    }

    // 1. Run Deterministic Engine (Instant Keyword & Regex matching, Disclaimer check)
    const deterministicResult = runDeterministicValidation(copy, brand);
    let combinedFindings: ValidationFinding[] = [...deterministicResult.findings];

    let toneAssessment: ToneAssessment = {
      formalityScore: brand.voiceTone.formality,
      enthusiasmScore: brand.voiceTone.enthusiasm,
      technicalityScore: brand.voiceTone.technicality,
      overallToneScore: 82,
      critique: 'Draft matches baseline structure with some regulatory and brand tone deviations.',
    };

    let evaluatedBy: 'hybrid' | 'deterministic' = 'deterministic';

    // 2. Run Gemini 3.8 Flash Semantic Analysis if API Key available
    if (process.env.GEMINI_API_KEY) {
      try {
        const benchmarksSummary = brand.factualBenchmarks
          .map((b) => `- Claim: "${b.claim}" [Source: ${b.source}; Verified: ${b.evidenceText}]`)
          .join('\n');

        const approvedTermsSummary = brand.approvedTerms
          .map((t) => `- Use "${t.term}" instead of [${t.preferredOver.join(', ')}]. Context: ${t.reason}`)
          .join('\n');

        const systemPrompt = `You are Vyakta AI's senior brand governance, advertising law, and copy review auditor.
Your mission is to evaluate marketing and organizational copy against official brand guidelines.

BRAND PROFILE:
Name: ${brand.name} (${brand.industry})
Tagline: ${brand.tagline}
Description: ${brand.description}

GOVERNING VOICE & TONE TARGETS (Scale 1-5):
- Formality: ${brand.voiceTone.formality} / 5
- Enthusiasm: ${brand.voiceTone.enthusiasm} / 5
- Technicality: ${brand.voiceTone.technicality} / 5
- Directness: ${brand.voiceTone.directness} / 5
Core Principles: ${brand.voiceTone.principles.join('; ')}
Forbidden Tones: ${brand.voiceTone.forbiddenTones.join(', ')}

VERIFIED BENCHMARKS & FACTUAL EVIDENCE REPOSITORY:
${benchmarksSummary}

APPROVED TERMINOLOGY:
${approvedTermsSummary}

CRITICAL DIRECTIVE — PREVENT UNSUPPORTED NUMERICAL CLAIMS IN VYAKTA AI:
1. NEVER INVENT NUMBERS: Do not generate arbitrary percentages, statistics, performance metrics, customer counts, rankings, financial savings, uptime guarantees, geographical coverage figures, or other quantitative claims.
2. USE VERIFIED EVIDENCE ONLY: Every numerical claim in a suggested correction must be supported by explicit evidence from the approved brand guidelines or verified fact repository above.
3. NO REPLACING ONE UNSUPPORTED NUMBER WITH ANOTHER: If a claim such as "save 90% instantly" is flagged, DO NOT replace it with another unsupported claim such as "99.99% availability across 42 global regions."
4. USE SAFE, NON-NUMERIC ALTERNATIVES: When evidence is unavailable, rewrite the statement using neutral, qualitative language without specific numbers, percentages, guarantees, or superlatives.
5. EXAMPLES OF SAFE CORRECTIONS:
   - Instead of "99.99% multi-region availability across 42 global regions," use "designed to support reliable operations across distributed environments."
   - Instead of "save 90% instantly," use "designed to help optimize operational costs."
   - Instead of "10x faster," use "designed to improve performance."
   - Instead of "guaranteed zero downtime," use "built to support service reliability."
6. PRESERVE THE ORIGINAL MEANING: Correct unsupported claims without introducing new factual assertions or changing the intended message unnecessarily.
7. EVIDENCE-AWARE CORRECTION GENERATION: Before suggesting a correction, validate every number against available evidence. If verification fails, remove the unsupported detail or rewrite the sentence without it.
8. DO NOT CONFUSE NUMERICAL VALIDITY WITH EVIDENCE: A plausible number is not a verified number. Never treat generated figures as factual merely because they sound realistic.
9. MAINTAIN TRANSPARENCY: If no verified correction can be generated, prefix the suggestion clearly with: "No evidence-backed correction available: [neutral alternative]".

TASK:
Analyze the draft copy and identify:
1. "evidence_not_found": Any unverified comparative statements, superlatives, unsubstantiated statistics, percentages, metrics, or efficacy claims that lack evidence in the Brand Verified Benchmarks Repository. You MUST transparently mark these as "Evidence Not Found" (governed by FTC substantiation rules).
2. "tone_violation": Portions of copy that conflict with the brand voice principles or use forbidden tones.
3. "prohibited_phrase": Semantic variations of prohibited words or risky legal phrasing not caught by basic regex.
4. Tone assessment metrics (1-5 scale) and a constructive executive critique.
5. Provide actionable, evidence-safe suggested rewrites for each finding following the rules above.

For each finding, specify the EXACT substring (originalText) as it appears in the draft so it can be highlighted.`;

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Evaluate this draft copy:\n\n"""\n${copy}\n"""`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                formalityScore: { type: Type.NUMBER, description: 'Observed formality 1-5' },
                enthusiasmScore: { type: Type.NUMBER, description: 'Observed enthusiasm 1-5' },
                technicalityScore: { type: Type.NUMBER, description: 'Observed technicality 1-5' },
                overallToneScore: { type: Type.NUMBER, description: 'Score between 0 and 100' },
                toneCritique: { type: Type.STRING, description: 'Executive summary critique of voice and tone' },
                findings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: {
                        type: Type.STRING,
                        description: 'One of: evidence_not_found, tone_violation, prohibited_phrase',
                      },
                      severity: {
                        type: Type.STRING,
                        description: 'critical, warning, or advisory',
                      },
                      title: { type: Type.STRING, description: 'Short finding title' },
                      originalText: { type: Type.STRING, description: 'The exact matching excerpt from the draft' },
                      explanation: { type: Type.STRING, description: 'Clear reason why this violates guidelines' },
                      policyCitation: { type: Type.STRING, description: 'Governing guideline policy or legal rule' },
                      suggestedRewrite: { type: Type.STRING, description: 'Evidence-safe replacement text (no invented numbers)' },
                    },
                    required: ['type', 'severity', 'title', 'originalText', 'explanation', 'policyCitation', 'suggestedRewrite'],
                  },
                },
              },
              required: ['formalityScore', 'enthusiasmScore', 'technicalityScore', 'overallToneScore', 'toneCritique', 'findings'],
            },
          },
        });

        const rawText = geminiResponse.text?.trim() || '{}';
        const aiParsed = JSON.parse(rawText);

        if (aiParsed.formalityScore !== undefined) {
          toneAssessment = {
            formalityScore: Math.round(aiParsed.formalityScore || 3),
            enthusiasmScore: Math.round(aiParsed.enthusiasmScore || 3),
            technicalityScore: Math.round(aiParsed.technicalityScore || 3),
            overallToneScore: Math.min(100, Math.max(0, Math.round(aiParsed.overallToneScore || 75))),
            critique: aiParsed.toneCritique || 'AI brand tone assessment completed.',
          };
        }

        if (Array.isArray(aiParsed.findings)) {
          evaluatedBy = 'hybrid';
          for (let i = 0; i < aiParsed.findings.length; i++) {
            const f = aiParsed.findings[i];
            const textToFind = f.originalText?.trim();
            if (!textToFind) continue;

            const idx = copy.toLowerCase().indexOf(textToFind.toLowerCase());
            const startIndex = idx !== -1 ? idx : 0;
            const endIndex = idx !== -1 ? idx + textToFind.length : textToFind.length;

            // Merge if not overlapping with an existing deterministic critical finding
            const overlaps = combinedFindings.some(
              (df) => Math.max(df.startIndex, startIndex) < Math.min(df.endIndex, endIndex)
            );

            if (!overlaps) {
              const sanitized = sanitizeBackendRewrite(f.suggestedRewrite || '', f.originalText || textToFind, brand.factualBenchmarks);
              combinedFindings.push({
                id: `gemini-${i}-${startIndex}`,
                type: f.type || 'evidence_not_found',
                severity: f.severity === 'critical' ? 'critical' : f.severity === 'advisory' ? 'advisory' : 'warning',
                title: f.title || (f.type === 'evidence_not_found' ? 'Evidence Not Found' : 'Tone Violation'),
                originalText: idx !== -1 ? copy.substring(startIndex, endIndex) : textToFind,
                startIndex,
                endIndex,
                explanation: f.explanation,
                policyCitation: f.policyCitation || `${brand.name} Style & Legal Standards`,
                suggestedRewrite: sanitized.suggestedRewrite,
                neutralAlternative: sanitized.neutralAlternative,
                isEvidenceBacked: sanitized.isEvidenceBacked,
                status: 'open',
              });
            }
          }
        }
      } catch (geminiError) {
        console.warn('Gemini analysis failed, falling back to deterministic results:', geminiError);
        evaluatedBy = 'deterministic';
      }
    }

    // Ensure all combined findings adhere to strict evidence-aware numerical restrictions
    combinedFindings.forEach((f) => {
      const sanitized = sanitizeBackendRewrite(f.suggestedRewrite, f.originalText, brand.factualBenchmarks);
      f.suggestedRewrite = sanitized.suggestedRewrite;
      f.neutralAlternative = sanitized.neutralAlternative;
      f.isEvidenceBacked = sanitized.isEvidenceBacked;
    });

    // Sort findings by position in text
    combinedFindings.sort((a, b) => a.startIndex - b.startIndex);

    // Calculate overall compliance score
    const criticals = combinedFindings.filter((f) => f.severity === 'critical' && f.status === 'open').length;
    const warnings = combinedFindings.filter((f) => f.severity === 'warning' && f.status === 'open').length;
    const advisories = combinedFindings.filter((f) => f.severity === 'advisory' && f.status === 'open').length;

    let score = 100 - criticals * 25 - warnings * 10 - advisories * 4;
    score = Math.max(0, Math.min(100, score));

    const status: ValidationReport['status'] =
      criticals > 0 ? 'critical_violations' : warnings > 0 ? 'needs_revision' : 'compliant';

    const report: ValidationReport = {
      id: `rep-${Date.now()}`,
      brandId: brand.id,
      brandName: brand.name,
      overallScore: score,
      status,
      metrics: {
        totalFindings: combinedFindings.length,
        criticalCount: criticals,
        warningCount: warnings,
        advisoryCount: advisories,
        wordCount: deterministicResult.metrics.wordCount,
        readingTimeMinutes: deterministicResult.metrics.readingTimeMinutes,
        readingGradeLevel: deterministicResult.metrics.readingGradeLevel,
      },
      breakdown: {
        prohibitedPhrases: combinedFindings.filter((f) => f.type === 'prohibited_phrase').length,
        evidenceNotFound: combinedFindings.filter((f) => f.type === 'evidence_not_found').length,
        toneViolations: combinedFindings.filter((f) => f.type === 'tone_violation').length,
        terminologyImprovements: combinedFindings.filter((f) => f.type === 'terminology_opportunity').length,
        missingDisclaimers: combinedFindings.filter((f) => f.type === 'missing_disclaimer').length,
      },
      toneAssessment,
      findings: combinedFindings,
      evaluatedAt: new Date().toISOString(),
      evaluatedBy,
    };

    res.json(report);
  } catch (err: any) {
    console.error('Validation error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during validation' });
  }
});

// Generate Alternative Rewrites Endpoint (LLM Assisted)
app.post('/api/rewrite-alternatives', async (req: Request, res: Response) => {
  try {
    const { phrase, explanation, brandName, targetTone } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      res.json({
        alternatives: [
          {
            style: 'Conservative & Compliant',
            text: phrase ? `compliant alternative for "${phrase}"` : 'Audited brand copy',
            rationale: 'Mitigates legal risk while retaining core messaging.',
          },
        ],
      });
      return;
    }

    const prompt = `You are a senior brand copywriter for ${brandName}.
Original flagged text: "${phrase}"
Violation reason: "${explanation}"
Target Tone: ${JSON.stringify(targetTone || {})}

CRITICAL RULE: DO NOT INVENT NUMBERS OR STATISTICAL METRICS.
Never introduce arbitrary percentages, multipliers, SLA numbers, or metrics.
When rewriting without verified benchmark evidence, use safe, neutral, qualitative phrasing (e.g., "designed to help optimize operational costs", "designed to improve performance", "built to support service reliability", "designed to support reliable operations across distributed environments").

Provide 3 distinct brand-approved rewrite variations:
1. Executive & Authoritative (Formal, measured, qualitative)
2. Direct & Impactful (Punchy, clear, compliant)
3. Transparent & Safe (Neutral, qualitative, completely free of unverified numbers)

Return strictly JSON with an array of objects having keys: "style", "text", "rationale".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              style: { type: Type.STRING },
              text: { type: Type.STRING },
              rationale: { type: Type.STRING },
            },
            required: ['style', 'text', 'rationale'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    // Sanitize all alternatives through evidence-aware filter
    const sanitizedAlternatives = parsed.map((item: any) => {
      const sanitized = sanitizeBackendRewrite(item.text, phrase, []);
      return {
        ...item,
        text: sanitized.neutralAlternative,
      };
    });

    res.json({ alternatives: sanitizedAlternatives });
  } catch (err: any) {
    console.error('Rewrite generation error:', err);
    res.status(500).json({ error: 'Failed to generate rewrite alternatives' });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Vyakta AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});

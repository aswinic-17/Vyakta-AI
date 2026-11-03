# Vyakta AI — Enterprise Brand Governance & Verification Engine

Vyakta AI transforms content marketing and corporate communications into brand-compliant, legally substantiated assets. Built for Round 3 evaluators, the platform features a zero-mock, evidence-based verification architecture with full persistence and auditability.

---

## 🔑 Demo Account Credentials

Evaluators can access the system with pre-configured reviewer credentials or use the prominent **"Login as Demo"** button on the interface:

- **Email:** `demo@vyaktaai.com`
- **Password:** `VyaktaDemo@2026`
- **Assigned Role:** `reviewer` (Editorial Reviewer)
- **Workspaces:** Pre-seeded with **ApexCloud Enterprise**, **Lumina Health**, and **Verve FinTech**.

---

## 🏛 Core System Modules

### 1. Persistent Relational Storage (`SQLite / WAL Mode`)
- **Location:** `./data/vyakta.db`
- **Durability:** Survives server restarts and redeployments.
- **Relational Tables:**
  - `users`: Password hashes (`bcryptjs`), roles, and profile metadata.
  - `brands`: Brand definitions, voice & tone metrics, prohibited phrases, and legal mandates.
  - `guideline_versions`: Version-controlled snapshots with changelogs and 1-click rollback.
  - `evidence_items`: FTC-substantiated benchmark repository for verified claims.
  - `content_submissions`: Content drafts, channels, and revision tracking.
  - `validation_reports`: Audit findings, scores, tone evaluations, and evaluator metadata.
  - `review_decisions`: Editorial sign-offs (`Approved`, `Rejected`) with notes.
  - `audit_events`: Immutable security and compliance event logs.

### 2. Evidence-Based Claim Verification & Numerical Safeguards
- **Zero Numerical Hallucination Rule:** Vyakta AI strictly prohibits inventing statistics, percentages, SLAs, or multipliers.
- **Claim Classification:** Classifies statements into `supported`, `unsupported`, `contradicted`, or `requires_human_verification`.
- **Safe Qualitative Alternatives:** Whenever evidence is unavailable, suggested rewrites use neutral, safe, qualitative phrasing (e.g., *"designed to help optimize operational costs"*, *"built to support service reliability"*, *"designed to support reliable operations across distributed environments"*).
- **Interactive Evidence Library:** Add, edit, filter, and test copy against brand benchmarks.

### 3. Multi-Format Document & Visual Inspection
- **Document Text Extraction:** Direct server-side parsing for `.pdf` (`pdf-parse`), Word `.docx` (`mammoth`), and `.txt` files with page counts and metadata.
- **Visual Brand & Image Analysis:** Gemini 3.8 Flash multimodal vision audit for marketing creatives (`.png`, `.jpg`):
  - Logo presence, clear space, and distortion checks.
  - Brand color token alignment.
  - WCAG contrast and accessibility compliance.
  - Full OCR copy extraction with 1-click transfer to draft editor.

### 4. Governance Analytics & Versioned Audit Trail
- **Live Governance Analytics:** Real-time computation of pass rates, average brand score, violation distributions, and ascending compliance trajectory.
- **Guideline Version History:** Complete version ledger with side-by-side comparison and 1-click restore.
- **Regulatory Audit Log:** Traceable event history capturing actors, timestamps, action types, and structured payloads.

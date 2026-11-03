# Vyakta AI — Round 3 Implementation Plan

## 1. Existing Architecture Overview
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS with custom warm corporate palette (`#faf9f6`, indigo/emerald accents).
- **Backend**: Express in `server.ts` mounting Vite in dev mode, running on port 3000.
- **AI Engine**: Google Gemini 3.8 Flash (`@google/genai`) with telemetry headers and deterministic fallback (`runDeterministicValidation`).
- **Current State**: Brands stored in browser `localStorage`; reports and review decisions ephemeral in React state; no authentication or persistent database.

## 2. Dependencies & Database Architecture
- **Installed Dependencies**:
  - `better-sqlite3`: Zero-latency, ACID file-based relational persistence (`./data/vyakta.db`) surviving server restarts.
  - `bcryptjs`: Secure password hashing for users & demo account.
  - `jsonwebtoken`: Bearer token authentication & authorization middleware.
  - `multer`: File upload handling (documents & visual brand assets).
  - `pdf-parse`: Server-side extraction of text, pages, and metadata from PDF files.
  - `mammoth`: Word document (.docx) text, paragraph, and heading extraction.
  - `@google/genai`: Multimodal vision inspection for marketing images (OCR, logo, contrast) & semantic claim verification.

- **SQLite Database Schema (`data/vyakta.db`)**:
  - `users`: `id`, `email`, `password_hash`, `role`, `name`, `created_at`
  - `brands`: `id`, `user_id`, `name`, `tagline`, `industry`, `accent_color`, `description`, `config_json`, `created_at`, `updated_at`
  - `guideline_versions`: `id`, `brand_id`, `version_number`, `snapshot_json`, `change_summary`, `created_by`, `created_at`
  - `evidence_items`: `id`, `brand_id`, `claim`, `evidence_text`, `source_name`, `source_url`, `created_at`, `updated_at`
  - `content_submissions`: `id`, `user_id`, `brand_id`, `title`, `original_copy`, `current_copy`, `file_type`, `file_name`, `status`, `created_at`, `updated_at`
  - `validation_reports`: `id`, `submission_id`, `brand_id`, `overall_score`, `status`, `summary_json`, `findings_json`, `tone_json`, `evaluated_by`, `created_at`
  - `review_decisions`: `id`, `submission_id`, `report_id`, `status`, `reviewer_name`, `reviewer_notes`, `decided_at`
  - `audit_events`: `id`, `user_id`, `brand_id`, `submission_id`, `action`, `details_json`, `created_at`

## 3. Order of Implementation
1. **Database & Auth Foundation (`server/db.ts`)**:
   - Initialize tables, indexes, and automatic demo account seeding (`demo@vyaktaai.com` / `VyaktaDemo@2026`).
   - Seed initial default brands into demo account.
2. **Authentication & API Routes (`server.ts`)**:
   - `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/logout`.
   - JWT authentication middleware protecting brand, evidence, submission, and audit endpoints.
   - CRUD endpoints for brands, guideline versions, evidence library, submissions, review decisions, analytics, and audit log.
3. **Multi-Format Document & Visual Image Validation Routes**:
   - `/api/documents/parse`: Extract text and metadata from PDF, DOCX, TXT.
   - `/api/images/analyze`: Vision inspection via Gemini 3.8 Flash for OCR text, logo compliance, brand color alignment, and contrast.
4. **Frontend State & Navigation**:
   - Authentication context / modal with 1-click "Login as Demo" and persistent auth tokens.
   - Top navigation tabs: Review Workspace, Document/Image Upload, Evidence Library, Guidelines & Versions, Governance Analytics, Audit Trail.
5. **UI Modules**:
   - **Evidence Library**: Interactive manager for verified benchmarks, fact search, and claim linkage.
   - **Guideline Version History**: Side-by-side snapshot comparison & restore.
   - **Governance Analytics Dashboard**: Real-time aggregation of violations, trends, pass rates, and compliance trajectory.
   - **Audit Trail Viewer**: Searchable, filterable security & compliance log with timestamp and diffs.
6. **Verification & Packaging**:
   - Run type checks and `compile_applet`.
   - Test demo login, document ingestion, visual analysis, and report generation.

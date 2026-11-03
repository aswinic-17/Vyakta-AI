import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { DEFAULT_BRANDS, SAMPLE_DRAFTS } from '../src/data/defaultBrands';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'vyakta.db');
export const db = new Database(DB_PATH);

// Pragmas for performance and data integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'reviewer',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      tagline TEXT,
      industry TEXT,
      accent_color TEXT,
      description TEXT,
      config_json TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS guideline_versions (
      id TEXT PRIMARY KEY,
      brand_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      snapshot_json TEXT NOT NULL,
      change_summary TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(brand_id) REFERENCES brands(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evidence_items (
      id TEXT PRIMARY KEY,
      brand_id TEXT NOT NULL,
      claim TEXT NOT NULL,
      evidence_text TEXT NOT NULL,
      source_name TEXT NOT NULL,
      source_url TEXT,
      category TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(brand_id) REFERENCES brands(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS content_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      brand_id TEXT NOT NULL,
      title TEXT NOT NULL,
      original_copy TEXT NOT NULL,
      current_copy TEXT NOT NULL,
      file_type TEXT DEFAULT 'text',
      file_name TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(brand_id) REFERENCES brands(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS validation_reports (
      id TEXT PRIMARY KEY,
      submission_id TEXT,
      brand_id TEXT NOT NULL,
      overall_score INTEGER NOT NULL,
      status TEXT NOT NULL,
      metrics_json TEXT NOT NULL,
      breakdown_json TEXT NOT NULL,
      findings_json TEXT NOT NULL,
      tone_json TEXT NOT NULL,
      evaluated_by TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(submission_id) REFERENCES content_submissions(id) ON DELETE SET NULL,
      FOREIGN KEY(brand_id) REFERENCES brands(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS review_decisions (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL,
      report_id TEXT,
      status TEXT NOT NULL,
      reviewer_name TEXT NOT NULL,
      reviewer_notes TEXT,
      decided_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(submission_id) REFERENCES content_submissions(id) ON DELETE CASCADE,
      FOREIGN KEY(report_id) REFERENCES validation_reports(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      brand_id TEXT,
      submission_id TEXT,
      action TEXT NOT NULL,
      details_json TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDemoAccount();
}

function seedDemoAccount() {
  const DEMO_EMAIL = 'demo@vyaktaai.com';
  const DEMO_PASSWORD = 'VyaktaDemo@2026';
  const DEMO_USER_ID = 'usr_demo_vyakta_2026';

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(DEMO_EMAIL) as { id: string } | undefined;

  let userId = existingUser?.id;

  if (!existingUser) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, salt);

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(DEMO_USER_ID, DEMO_EMAIL, passwordHash, 'Demo Reviewer', 'reviewer');

    userId = DEMO_USER_ID;

    // Log seed event
    recordAudit({
      userId,
      userEmail: DEMO_EMAIL,
      action: 'SYSTEM_INIT_DEMO_ACCOUNT',
      details: { message: 'Demo account provisioned with reviewer credentials' },
    });
  }

  // Seed default brands if user has none
  const brandCount = (db.prepare('SELECT COUNT(*) as count FROM brands WHERE user_id = ?').get(userId) as any).count;
  if (brandCount === 0) {
    const insertBrand = db.prepare(`
      INSERT INTO brands (id, user_id, name, tagline, industry, accent_color, description, config_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertVersion = db.prepare(`
      INSERT INTO guideline_versions (id, brand_id, version_number, snapshot_json, change_summary, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertEvidence = db.prepare(`
      INSERT INTO evidence_items (id, brand_id, claim, evidence_text, source_name, source_url, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertSubmission = db.prepare(`
      INSERT INTO content_submissions (id, user_id, brand_id, title, original_copy, current_copy, file_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const b of DEFAULT_BRANDS) {
      const config = {
        approvedTerms: b.approvedTerms,
        prohibitedPhrases: b.prohibitedPhrases,
        voiceTone: b.voiceTone,
        requiredDisclaimers: b.requiredDisclaimers,
      };

      insertBrand.run(
        b.id,
        userId,
        b.name,
        b.tagline,
        b.industry,
        b.accentColor,
        b.description,
        JSON.stringify(config)
      );

      // Initial version 1.0
      insertVersion.run(
        `v1_${b.id}_init`,
        b.id,
        1,
        JSON.stringify(b),
        'Initial approved brand guidelines publication',
        'Brand Safety Officer'
      );

      // Seed factual benchmarks as evidence items
      for (const f of b.factualBenchmarks) {
        insertEvidence.run(
          `ev_${f.id}`,
          b.id,
          f.claim,
          f.evidenceText,
          f.source,
          'https://internal-docs.vyakta.ai/benchmarks',
          f.category || 'General'
        );
      }

      // Seed sample submission if draft exists
      const sampleDraft = (SAMPLE_DRAFTS as any)[b.id];
      if (sampleDraft) {
        const subId = `sub_${b.id}_sample`;
        insertSubmission.run(
          subId,
          userId,
          b.id,
          sampleDraft.title,
          sampleDraft.copy,
          sampleDraft.copy,
          'text',
          'pending'
        );
      }
    }

    recordAudit({
      userId,
      userEmail: DEMO_EMAIL,
      action: 'SEED_DEFAULT_BRANDS',
      details: { brandsCount: DEFAULT_BRANDS.length },
    });
  }
}

export function recordAudit(params: {
  userId?: string;
  userEmail?: string;
  brandId?: string;
  submissionId?: string;
  action: string;
  details?: Record<string, any>;
}) {
  const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  db.prepare(`
    INSERT INTO audit_events (id, user_id, user_email, brand_id, submission_id, action, details_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    params.userId || null,
    params.userEmail || null,
    params.brandId || null,
    params.submissionId || null,
    params.action,
    params.details ? JSON.stringify(params.details) : null
  );
}

import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

await db.query(`
  CREATE TABLE IF NOT EXISTS analysis (
    id TEXT PRIMARY KEY,
    job_title TEXT,
    company_name TEXT,
    job_url TEXT,
    recruiter_email TEXT,
    risk_score INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    summary TEXT,
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`);

export async function insertAnalysis(record) {
  await db.query(
    `
      INSERT INTO analysis (
        id,
        job_title,
        company_name,
        job_url,
        recruiter_email,
        risk_score,
        risk_level,
        summary,
        analysis_data,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
    [
      record.id,
      record.job_title,
      record.company_name,
      record.job_url,
      record.recruiter_email,
      record.risk_score,
      record.risk_level,
      record.summary,
      record.analysis_data,
      record.created_at,
    ]
  );
}

export async function listAnalyses() {
  const result = await db.query(`
    SELECT
      id,
      job_title,
      company_name,
      job_url,
      risk_score,
      risk_level,
      created_at
    FROM analysis
    ORDER BY created_at DESC
    LIMIT 200
  `);

  return result.rows;
}

export async function countAnalyses() {
  const result = await db.query(`
    SELECT COUNT(*)::int AS count
    FROM analysis
  `);

  return result.rows[0].count;
}

export async function getAnalysisById(id) {
  const result = await db.query(
    `
      SELECT *
      FROM analysis
      WHERE id = $1
    `,
    [id]
  );

  const row = result.rows[0];

  if (!row) return null;

  return {
    ...row,
    analysis_data:
      typeof row.analysis_data === "string"
        ? JSON.parse(row.analysis_data)
        : row.analysis_data,
  };
}
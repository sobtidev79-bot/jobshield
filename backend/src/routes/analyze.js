import { Router } from "express";
import { nanoid } from "nanoid";
import { analyzeJob } from "../risk-engine/index.js";
import {
  insertAnalysis,
  listAnalyses,
  getAnalysisById,
} from "../db/index.js";

export const router = Router();

const MAX_DESCRIPTION_LENGTH = 8000;
const MAX_URL_LENGTH = 2048;

function isSafeUrl(url) {
  if (!url) return true;
  if (url.length > MAX_URL_LENGTH) return false;

  try {
    const withProtocol = /^https?:\/\//i.test(url)
      ? url
      : `https://${url}`;

    const u = new URL(withProtocol);

    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/analyze", async (req, res) => {
  try {
    const {
      job_description,
      job_url,
      company_name,
      recruiter_email,
    } = req.body || {};

    if (!job_description?.trim() && !job_url?.trim()) {
      return res.status(400).json({
        error: "Please paste a job description or provide a job posting link.",
      });
    }

    if (job_description && job_description.length > MAX_DESCRIPTION_LENGTH) {
      return res.status(400).json({
        error: "Job description is too long.",
      });
    }

    if (job_url && !isSafeUrl(job_url)) {
      return res.status(400).json({
        error: "That doesn't look like a valid web address.",
      });
    }

    if (recruiter_email && !isValidEmail(recruiter_email)) {
      return res.status(400).json({
        error: "That doesn't look like a valid email address.",
      });
    }

    const result = analyzeJob({
      jobDescription: job_description,
      jobUrl: job_url,
      companyName: company_name,
      recruiterEmail: recruiter_email,
    });

    const id = nanoid(10);
    const roleGuess = guessRoleTitle(job_description);

    const record = {
      id,
      job_title: roleGuess,
      company_name: company_name?.trim() || null,
      job_url: job_url?.trim() || null,
      recruiter_email: recruiter_email?.trim() || null,
      risk_score: result.score,
      risk_level: result.riskLevel,
      summary: result.summary,
      analysis_data: result,
      created_at: new Date().toISOString(),
    };

    await insertAnalysis(record);

    return res.json({
      id,
      job_title: record.job_title,
      company_name: record.company_name,
      ...result,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    return res.status(500).json({
      error: "We couldn't complete that request. Please try again.",
    });
  }
});

router.get("/history", async (_req, res) => {
  try {
    const rows = await listAnalyses();

    const history = rows.map((r) => ({
      id: r.id,
      jobTitle: r.job_title,
      companyName: r.company_name,
      jobUrl: r.job_url,
      score: r.risk_score,
      riskLevel: r.risk_level,
      createdAt: r.created_at,
    }));

    res.json(history);
  } catch (error) {
    console.error("History error:", error);

    res.status(500).json({
      error: "Unable to load analysis history.",
    });
  }
});

router.get("/analysis/:id", async (req, res) => {
  try {
    const row = await getAnalysisById(req.params.id);

    if (!row) {
      return res.status(404).json({
        error: "Analysis not found.",
      });
    }

    res.json({
      id: row.id,
      jobTitle: row.job_title,
      companyName: row.company_name,
      jobUrl: row.job_url,
      recruiterEmail: row.recruiter_email,
      createdAt: row.created_at,
      ...row.analysis_data,
    });
  } catch (error) {
    console.error("Get analysis error:", error);

    res.status(500).json({
      error: "Unable to load this analysis.",
    });
  }
});

function guessRoleTitle(description) {
  if (!description) return "Untitled role";

  const firstLine = description.split("\n")[0].trim();

  if (firstLine.length > 3 && firstLine.length < 80) {
    return firstLine;
  }

  return "Job posting";
}
import { nanoid } from "nanoid";
import { analyzeJob } from "../risk-engine/index.js";
import { insertAnalysis, countAnalyses } from "../db/index.js";

const DEMO_JOBS = [
  {
    job_title: "Frontend Developer Intern",
    company_name: "Acme Technologies",
    recruiter_email: "careers@acmetech.com",
    job_url: "https://acmetech.com/careers/frontend-developer-intern",
    job_description:
      "Acme Technologies is looking for a Frontend Developer Intern to join our product team for a 6-month internship based out of our Pune office (hybrid). You'll work closely with our design and engineering teams to:\n" +
      "- Build and maintain UI components in React and TypeScript\n" +
      "- Collaborate with designers to translate Figma mockups into responsive layouts\n" +
      "- Write unit tests for new components\n" +
      "- Participate in code reviews and sprint planning\n\n" +
      "Requirements: familiarity with JavaScript, HTML/CSS, and Git. Final-year students or recent graduates encouraged to apply. Stipend: Rs 15,000/month. Interviews will include a short technical discussion and a portfolio review.",
    daysAgo: 2,
  },
  {
    job_title: "Work From Home Data Entry",
    company_name: "Global Career Solutions",
    recruiter_email: "hr.globalcareers@gmail.com",
    job_url: "http://bit.ly/gcs-data-entry-job",
    job_description:
      "URGENT HIRING! Work From Home Data Entry Operator needed immediately. Earn up to Rs 80,000/week working just 2 hours a day from home. 100% guaranteed job, no interview required, no experience needed. Only a few seats left — apply within 24 hours to confirm your slot. " +
      "To begin, candidates must pay a one-time registration fee of Rs 999 for the training kit and account activation. Selection is confirmed for all applicants who complete the payment today. Contact us on WhatsApp for immediate onboarding.",
    daysAgo: 6,
  },
];

export async function seedIfEmpty() {
  const count = await countAnalyses();

  if (count > 0) return;

  for (const job of DEMO_JOBS) {
    const result = analyzeJob({
      jobDescription: job.job_description,
      jobUrl: job.job_url,
      companyName: job.company_name,
      recruiterEmail: job.recruiter_email,
    });

    const createdAt = new Date(
      Date.now() - job.daysAgo * 24 * 60 * 60 * 1000
    ).toISOString();

    await insertAnalysis({
      id: nanoid(10),
      job_title: job.job_title,
      company_name: job.company_name,
      job_url: job.job_url,
      recruiter_email: job.recruiter_email,
      risk_score: result.score,
      risk_level: result.riskLevel,
      summary: result.summary,
      analysis_data: result,
      created_at: createdAt,
    });
  }

  console.log(
    "Seeded 2 demo analyses (Acme Technologies, Global Career Solutions)."
  );
}
import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { router as apiRouter } from "./routes/analyze.js";
import { seedIfEmpty } from "./db/seed.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "200kb" }));

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please wait a moment and try again.",
  },
});

app.use("/api/analyze", analyzeLimiter);
app.use("/api", apiRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    error: "Something went wrong on our end. Please try again.",
  });
});

async function startServer() {
  try {
    await seedIfEmpty();

    app.listen(PORT, () => {
      console.log(
        `JobShield backend listening on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start JobShield backend:", error);
    process.exit(1);
  }
}

startServer();
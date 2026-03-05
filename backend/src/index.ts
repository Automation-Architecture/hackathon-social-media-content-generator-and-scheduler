import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import topicsRouter from "./routes/topics";
import contentRouter from "./routes/content";
import { startCron } from "./cron/dailyGenerate";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve generated images as static files
app.use("/images", express.static(path.join(__dirname, "..", "data", "images")));

// Routes
app.use("/api/topics", topicsRouter);
app.use("/api/content", contentRouter);

// Generate endpoint at root level too
app.post("/api/generate", async (_req, res) => {
  const { generateForAllTopics } = await import("./services/generator");
  try {
    const result = await generateForAllTopics();
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Scriptora backend running on http://localhost:${PORT}`);
});

// Start daily cron
const cronSchedule = process.env.CRON_SCHEDULE || "0 6 * * *";
startCron(cronSchedule);

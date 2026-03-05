import { Router, Request, Response } from "express";
import { getContent, saveContent } from "../lib/storage";
import { generateForAllTopics, publishContent } from "../services/generator";

const router = Router();

// GET /api/content?status=pending
router.get("/", (req: Request, res: Response) => {
  const content = getContent();
  const status = req.query.status as string | undefined;

  if (status) {
    res.json(content.filter((c) => c.status === status));
  } else {
    res.json(content);
  }
});

// POST /api/content/publish/:id
router.post("/publish/:id", async (req: Request, res: Response) => {
  try {
    const result = await publishContent(req.params.id as string);
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: msg });
  }
});

// DELETE /api/content/:id
router.delete("/:id", (req: Request, res: Response) => {
  const content = getContent();
  const filtered = content.filter((c) => c.id !== req.params.id as string);

  if (filtered.length === content.length) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  saveContent(filtered);
  res.json({ ok: true });
});

// POST /api/generate — manually trigger generation for all active topics
router.post("/generate", async (_req: Request, res: Response) => {
  try {
    const result = await generateForAllTopics();
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

export default router;

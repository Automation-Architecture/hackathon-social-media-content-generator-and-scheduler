import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getTopics, saveTopics, type Topic } from "../lib/storage";

const router = Router();

// GET /api/topics
router.get("/", (_req: Request, res: Response) => {
  const topics = getTopics();
  res.json(topics);
});

// POST /api/topics
router.post("/", (req: Request, res: Response) => {
  const { topicName, systemPrompt, masterPrompt, channelIds, postingTime } = req.body;

  if (!topicName) {
    res.status(400).json({ error: "topicName is required" });
    return;
  }

  const topic: Topic = {
    id: uuidv4(),
    topicName,
    systemPrompt: systemPrompt || "",
    masterPrompt: masterPrompt || "",
    channelIds: channelIds || [],
    postingTime: postingTime || "09:00",
    status: "active",
    createdAt: new Date().toISOString(),
  };

  const topics = getTopics();
  topics.push(topic);
  saveTopics(topics);

  res.status(201).json(topic);
});

// PUT /api/topics/:id
router.put("/:id", (req: Request, res: Response) => {
  const topics = getTopics();
  const index = topics.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: "Topic not found" });
    return;
  }

  const updated = { ...topics[index], ...req.body, id: topics[index].id };
  topics[index] = updated;
  saveTopics(topics);

  res.json(updated);
});

// DELETE /api/topics/:id
router.delete("/:id", (req: Request, res: Response) => {
  const topics = getTopics();
  const filtered = topics.filter((t) => t.id !== req.params.id);

  if (filtered.length === topics.length) {
    res.status(404).json({ error: "Topic not found" });
    return;
  }

  saveTopics(filtered);
  res.json({ ok: true });
});

export default router;

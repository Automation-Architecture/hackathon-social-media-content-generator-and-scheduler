import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "..", "..", "data");

export interface Topic {
  id: string;
  topicName: string;
  systemPrompt: string;
  masterPrompt: string;
  channelIds: string[];
  postingTime: string;
  status: "active" | "paused";
  createdAt: string;
}

export interface Content {
  id: string;
  topicId: string;
  script: string;
  caption: string;
  imageUrl: string;
  status: "pending" | "scheduled" | "posted" | "failed";
  errorMessage?: string;
  createdAt: string;
}

function readJSON<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function writeJSON<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Topics
export function getTopics(): Topic[] {
  return readJSON<Topic>("topics.json");
}

export function getTopicById(id: string): Topic | undefined {
  return getTopics().find((t) => t.id === id);
}

export function saveTopics(topics: Topic[]): void {
  writeJSON("topics.json", topics);
}

// Content
export function getContent(): Content[] {
  return readJSON<Content>("content.json");
}

export function saveContent(content: Content[]): void {
  writeJSON("content.json", content);
}

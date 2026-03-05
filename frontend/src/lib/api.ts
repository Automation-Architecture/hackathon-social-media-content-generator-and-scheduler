const BASE_URL = "/api";

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

// Topics
export async function fetchTopics(): Promise<Topic[]> {
  const res = await fetch(`${BASE_URL}/topics`);
  return res.json();
}

export async function createTopic(topic: Omit<Topic, "id" | "createdAt" | "status">): Promise<Topic> {
  const res = await fetch(`${BASE_URL}/topics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(topic),
  });
  return res.json();
}

export async function updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
  const res = await fetch(`${BASE_URL}/topics/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteTopic(id: string): Promise<void> {
  await fetch(`${BASE_URL}/topics/${id}`, { method: "DELETE" });
}

// Content
export async function fetchContent(status?: string): Promise<Content[]> {
  const url = status ? `${BASE_URL}/content?status=${status}` : `${BASE_URL}/content`;
  const res = await fetch(url);
  return res.json();
}

export async function publishContent(id: string): Promise<{ postId: string }> {
  const res = await fetch(`${BASE_URL}/content/publish/${id}`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to publish");
  }
  return res.json();
}

export async function discardContent(id: string): Promise<void> {
  await fetch(`${BASE_URL}/content/${id}`, { method: "DELETE" });
}

// Generate
export async function triggerGenerate(): Promise<{ success: number; failed: number; errors: string[] }> {
  const res = await fetch(`${BASE_URL}/generate`, { method: "POST" });
  return res.json();
}

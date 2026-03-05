import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getTopics, getContent, saveContent, type Topic, type Content } from "../lib/storage";

const EXECUTION_DIR = path.join(__dirname, "..", "..", "..", "execution");
const DATA_DIR = path.join(__dirname, "..", "..", "data");

function runPython(script: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(EXECUTION_DIR, script);
    execFile("python3", [scriptPath, ...args], { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
      if (stderr) console.log(`[${script}]`, stderr.trim());
      if (error) {
        reject(new Error(`${script} failed: ${error.message}\n${stdout}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

function writeTempInput(data: Record<string, string>): string {
  const tmpPath = path.join(DATA_DIR, `tmp_${uuidv4()}.json`);
  fs.writeFileSync(tmpPath, JSON.stringify(data));
  return tmpPath;
}

function cleanupTemp(tmpPath: string): void {
  try { fs.unlinkSync(tmpPath); } catch {}
}

export async function generateForTopic(topic: Topic): Promise<Content> {
  // Step 1: Generate script + caption via OpenAI
  // Pass long prompts via temp file to avoid CLI arg issues
  const inputPath = writeTempInput({
    title: topic.topicName,
    systemPrompt: topic.systemPrompt,
    masterPrompt: topic.masterPrompt,
  });

  try {
    const scriptResult = await runPython("generate_script.py", ["--input-file", inputPath]);
    const { script, caption, error: scriptError } = JSON.parse(scriptResult);
    if (scriptError) throw new Error(`Script generation failed: ${scriptError}`);

    // Step 2: Generate image via Nano Banana
    const imageInputPath = writeTempInput({ script });
    try {
      const imageResult = await runPython("generate_image.py", ["--input-file", imageInputPath]);
      const { imageUrl, error: imageError } = JSON.parse(imageResult);
      if (imageError) throw new Error(`Image generation failed: ${imageError}`);

      const content: Content = {
        id: uuidv4(),
        topicId: topic.id,
        script,
        caption,
        imageUrl,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      return content;
    } finally {
      cleanupTemp(imageInputPath);
    }
  } finally {
    cleanupTemp(inputPath);
  }
}

export async function generateForAllTopics(): Promise<{ success: number; failed: number; errors: string[] }> {
  const topics = getTopics().filter((t) => t.status === "active");
  const existingContent = getContent();
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const topic of topics) {
    try {
      console.log(`Generating content for: ${topic.topicName}`);
      const content = await generateForTopic(topic);
      existingContent.push(content);
      success++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Failed for ${topic.topicName}: ${msg}`);
      errors.push(`${topic.topicName}: ${msg}`);

      existingContent.push({
        id: uuidv4(),
        topicId: topic.id,
        script: "",
        caption: "",
        imageUrl: "",
        status: "failed",
        errorMessage: msg.slice(0, 200),
        createdAt: new Date().toISOString(),
      });
      failed++;
    }
  }

  saveContent(existingContent);
  return { success, failed, errors };
}

export async function publishContent(contentId: string): Promise<{ postId: string }> {
  const allContent = getContent();
  const content = allContent.find((c) => c.id === contentId);
  if (!content) throw new Error("Content not found");
  if (content.status !== "pending") throw new Error(`Content is ${content.status}, not pending`);

  const topics = getTopics();
  const topic = topics.find((t) => t.id === content.topicId);
  if (!topic) throw new Error("Topic not found for this content");
  if (!topic.channelIds || topic.channelIds.length === 0) throw new Error("No channels configured for this topic. Edit the topic and add Postiz channel IDs first.");

  // Extract local file path from imageUrl (http://localhost:3001/images/filename.jpg)
  const imageFilename = content.imageUrl.split("/images/").pop() || "";
  const imageFilePath = path.join(DATA_DIR, "images", imageFilename);

  const inputPath = writeTempInput({
    imageFile: imageFilePath,
    imageUrl: content.imageUrl,
    caption: content.caption,
    channelIds: JSON.stringify(topic.channelIds),
    postingTime: topic.postingTime,
  });

  try {
    const result = await runPython("publish_post.py", ["--input-file", inputPath]);
    const { postId, error } = JSON.parse(result);
    if (error) throw new Error(`Publishing failed: ${error}`);

    content.status = "scheduled";
    saveContent(allContent);

    return { postId };
  } finally {
    cleanupTemp(inputPath);
  }
}

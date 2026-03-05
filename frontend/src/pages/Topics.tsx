import { useState, useEffect } from "react";
import { fetchTopics, createTopic, updateTopic, deleteTopic, type Topic } from "../lib/api";
import TopicCard from "../components/TopicCard";
import TopicForm from "../components/TopicForm";

// Default prompts loaded from directives/topic_prompts.md pattern
const DEFAULT_SYSTEM_PROMPT = `You are an expert creative director specializing in professional LinkedIn infographic design for {{ title }} content. Your role is to generate unique, complex, and visually interesting infographic concepts that have never been created before.

YOUR CORE FUNCTION:
Generate completely NEW {{ title }} infographic concepts with detailed image generation prompts AND engaging LinkedIn post captions. Each concept must be:
- Unique and original (not a variation of previous concepts)
- Complex enough to be visually interesting (multi-layered, sophisticated layouts)
- Professional and suitable for LinkedIn
- Actionable for AI image generation tools

OUTPUT FORMAT:
Always provide your response in this exact structure:

---
## NEW {{ title }} INFOGRAPHIC CONCEPT

**Concept Name:** [Creative, descriptive title]
**Core Idea:** [2-3 sentence explanation]
**Layout Type:** [e.g., "Multi-dimensional network graph"]
**Visual Complexity:** [e.g., "5-layer structure with 8 primary elements"]

---

## DETAILED IMAGE GENERATION PROMPT

[Complete, detailed prompt for image generation]

---

## LINKEDIN POST CAPTION

[Professional caption 150-250 words with hashtags]

CRITICAL RULES:
- Never repeat previous concepts
- Always generate something completely new
- Make it production-ready for image generation
- Caption must be original and not generic
- DO NOT INCLUDE HEX COLOURS IN THE INFOGRAPHICS`;

const DEFAULT_MASTER_PROMPT = `Now generate a completely NEW {{ title }} infographic concept that is:
1. Uses a unique layout structure
2. Covers a different {{ title }} topic/angle
3. Is complex and visually interesting (multi-layered design)
4. Includes a complete, detailed image generation prompt
5. Includes an engaging LinkedIn post caption (150-250 words)

Follow this structure for the image generation prompt:
A professional 1:1 square infographic for LinkedIn titled "[TITLE]."
COMPOSITION: [Describe the overall layout structure]
LAYOUT STRUCTURE: [Detailed breakdown of each layer/element]
TYPOGRAPHY HIERARCHY: [Font specifications]
GRAPHIC ELEMENTS SPECIFICATIONS: [Shapes, icons, connections]
TEXT CONTENT: [All text elements]
STYLE SPECIFICATIONS: [Design style, quality requirements]
SPACING & ALIGNMENT: [Spacing rules]
CRITICAL CONSTRAINTS:
- NO footer text, copyright notices, URLs, watermarks
- NO text overlapping
- NO elements beyond 1:1 square canvas
- All text readable with adequate contrast
ASPECT RATIO: Strict 1:1 (Square) - 4096x4096 pixels

For the LinkedIn Post Caption:
- 150-250 words, compelling hook, professional tone, 3-5 hashtags, no emojis

Generate the new concept now.`;

export default function Topics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>();

  const load = async () => {
    const data = await fetchTopics();
    setTopics(data);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data: {
    topicName: string;
    systemPrompt: string;
    masterPrompt: string;
    channelIds: string[];
    postingTime: string;
  }) => {
    if (editingTopic) {
      await updateTopic(editingTopic.id, data);
    } else {
      await createTopic(data);
    }
    setShowForm(false);
    setEditingTopic(undefined);
    load();
  };

  const handleToggle = async (topic: Topic) => {
    await updateTopic(topic.id, {
      status: topic.status === "active" ? "paused" : "active",
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this topic?")) {
      await deleteTopic(id);
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Topics</h2>
        <button
          onClick={() => { setEditingTopic(undefined); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
        >
          + Add Topic
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <TopicForm
            topic={editingTopic}
            defaultSystemPrompt={DEFAULT_SYSTEM_PROMPT}
            defaultMasterPrompt={DEFAULT_MASTER_PROMPT}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingTopic(undefined); }}
          />
        </div>
      )}

      {topics.length === 0 && !showForm && (
        <p className="text-gray-500 text-center py-12">No topics yet. Add one to get started.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            onEdit={() => { setEditingTopic(topic); setShowForm(true); }}
            onDelete={() => handleDelete(topic.id)}
            onToggleStatus={() => handleToggle(topic)}
          />
        ))}
      </div>
    </div>
  );
}

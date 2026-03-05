import { useState, useEffect } from "react";
import { fetchContent, fetchTopics, publishContent, discardContent, triggerGenerate, type Content, type Topic } from "../lib/api";
import ContentCard from "../components/ContentCard";

export default function Feed() {
  const [content, setContent] = useState<Content[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [generating, setGenerating] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const load = async () => {
    const [contentData, topicsData] = await Promise.all([fetchContent(), fetchTopics()]);
    setContent(contentData);
    setTopics(topicsData);
  };

  useEffect(() => { load(); }, []);

  const topicNameMap = Object.fromEntries(topics.map((t) => [t.id, t.topicName]));

  const filtered = filter === "all" ? content : content.filter((c) => c.status === filter);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await triggerGenerate();
      alert(`Generated: ${result.success} success, ${result.failed} failed`);
      load();
    } catch {
      alert("Generation failed");
    }
    setGenerating(false);
  };

  const handlePublish = async (id: string) => {
    setPublishingId(id);
    try {
      await publishContent(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Publish failed");
    }
    setPublishingId(null);
  };

  const handleDiscard = async (id: string) => {
    if (confirm("Discard this content?")) {
      await discardContent(id);
      load();
    }
  };

  const counts = {
    all: content.length,
    pending: content.filter((c) => c.status === "pending").length,
    scheduled: content.filter((c) => c.status === "scheduled").length,
    posted: content.filter((c) => c.status === "posted").length,
    failed: content.filter((c) => c.status === "failed").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Content Feed</h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition"
        >
          {generating ? "Generating..." : "Generate Now"}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "scheduled", "posted", "failed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              filter === status
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status]})
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-center py-12">
          {filter === "all"
            ? "No content yet. Add topics and click Generate."
            : `No ${filter} content.`}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <ContentCard
            key={item.id}
            content={item}
            topicName={topicNameMap[item.topicId] || "Unknown Topic"}
            onPublish={() => handlePublish(item.id)}
            onDiscard={() => handleDiscard(item.id)}
            publishing={publishingId === item.id}
          />
        ))}
      </div>
    </div>
  );
}

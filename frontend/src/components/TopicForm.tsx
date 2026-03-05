import { useState } from "react";
import type { Topic } from "../lib/api";

interface Props {
  topic?: Topic;
  defaultSystemPrompt: string;
  defaultMasterPrompt: string;
  onSave: (data: {
    topicName: string;
    systemPrompt: string;
    masterPrompt: string;
    channelIds: string[];
    postingTime: string;
  }) => void;
  onCancel: () => void;
}

export default function TopicForm({ topic, defaultSystemPrompt, defaultMasterPrompt, onSave, onCancel }: Props) {
  const [topicName, setTopicName] = useState(topic?.topicName || "");
  const [systemPrompt, setSystemPrompt] = useState(topic?.systemPrompt || defaultSystemPrompt);
  const [masterPrompt, setMasterPrompt] = useState(topic?.masterPrompt || defaultMasterPrompt);
  const [channelIds, setChannelIds] = useState(topic?.channelIds.join(", ") || "");
  const [postingTime, setPostingTime] = useState(topic?.postingTime || "09:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      topicName,
      systemPrompt,
      masterPrompt,
      channelIds: channelIds.split(",").map((s) => s.trim()).filter(Boolean),
      postingTime,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">{topic ? "Edit Topic" : "New Topic"}</h2>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Topic Name</label>
        <input
          type="text"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          placeholder="e.g. Transformational Leadership Strategies"
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={6}
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">{"{{ title }}"} will be replaced with the topic name</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Master Prompt</label>
        <textarea
          value={masterPrompt}
          onChange={(e) => setMasterPrompt(e.target.value)}
          rows={6}
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Postiz Channel IDs</label>
          <input
            type="text"
            value={channelIds}
            onChange={(e) => setChannelIds(e.target.value)}
            placeholder="channel_id_1, channel_id_2"
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Posting Time</label>
          <input
            type="time"
            value={postingTime}
            onChange={(e) => setPostingTime(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
        >
          {topic ? "Save Changes" : "Create Topic"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-sm font-medium transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

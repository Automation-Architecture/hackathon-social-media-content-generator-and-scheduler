import type { Topic } from "../lib/api";

interface Props {
  topic: Topic;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export default function TopicCard({ topic, onEdit, onDelete, onToggleStatus }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold">{topic.topicName}</h3>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
            <span>{topic.postingTime}</span>
            <span>{topic.channelIds.length} channel(s)</span>
          </div>
        </div>
        <button
          onClick={onToggleStatus}
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
            topic.status === "active"
              ? "bg-green-900/50 text-green-400 hover:bg-green-900"
              : "bg-gray-800 text-gray-500 hover:bg-gray-700"
          }`}
        >
          {topic.status}
        </button>
      </div>

      {topic.channelIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {topic.channelIds.map((ch) => (
            <span key={ch} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
              {ch}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-800">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs font-medium transition"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 rounded-md text-xs font-medium transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

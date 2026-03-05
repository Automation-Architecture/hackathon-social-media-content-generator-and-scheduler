import type { Content } from "../lib/api";

interface Props {
  content: Content;
  topicName: string;
  onPublish: () => void;
  onDiscard: () => void;
  publishing?: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-900/50 text-yellow-400",
  scheduled: "bg-blue-900/50 text-blue-400",
  posted: "bg-green-900/50 text-green-400",
  failed: "bg-red-900/50 text-red-400",
};

export default function ContentCard({ content, topicName, onPublish, onDiscard, publishing }: Props) {
  const isFailed = content.status === "failed";

  if (isFailed) {
    return (
      <div className="bg-gray-900 border border-red-900/50 rounded-lg overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">{topicName}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400">
              failed
            </span>
          </div>
          <p className="text-sm text-red-300 font-medium">Generation failed</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(content.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-800">
            <button
              onClick={onDiscard}
              className="px-3 py-1.5 bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 rounded-md text-xs font-medium transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {content.imageUrl && (
        <div className="aspect-square bg-gray-800">
          <img
            src={content.imageUrl}
            alt="Generated infographic"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-400">{topicName}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[content.status] || ""}`}>
            {content.status}
          </span>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">{content.caption}</p>

        <p className="text-xs text-gray-500 mt-3">
          {new Date(content.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {content.status === "pending" && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-800">
            <button
              onClick={onPublish}
              disabled={publishing}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition"
            >
              {publishing ? "Publishing..." : "Publish"}
            </button>
            <button
              onClick={onDiscard}
              className="px-3 py-2 bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 rounded-md text-sm font-medium transition"
            >
              Discard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

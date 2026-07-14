import { useState } from "react";
import { discussionAPI } from "../services/api";

const DiscussionCard = ({ discussion, currentUserId, onUpdate, onDelete }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [vote, setVote] = useState(null);

  const fetchReplies = async () => {
    if (!showReplies) {
      setLoadingReplies(true);
      try {
        const response = await discussionAPI.getReplies(discussion._id);
        setReplies(response.data.data);
      } catch (error) {
        console.error("Error fetching replies:", error);
      } finally {
        setLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const handleVote = async (voteType) => {
    try {
      await discussionAPI.voteDiscussion(discussion._id, { vote: voteType });
      setVote(voteType);
      onUpdate();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handlePin = async () => {
    try {
      await discussionAPI.pinDiscussion(discussion._id, { isPinned: !discussion.isPinned });
      onUpdate();
    } catch (error) {
      console.error("Error pinning discussion:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this discussion?")) {
      try {
        await discussionAPI.deleteDiscussion(discussion._id);
        onDelete();
      } catch (error) {
        console.error("Error deleting discussion:", error);
      }
    }
  };

  const isOwner = discussion.userId._id === currentUserId;

  return (
    <div className="bg-[#1A1F2E] rounded-lg p-6 mb-4 border border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {discussion.isPinned && (
              <span className="bg-yellow-600 text-xs px-2 py-1 rounded">Pinned</span>
            )}
            <h3 className="text-xl font-semibold text-white">{discussion.title}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
            <span>By {discussion.userId.name}</span>
            <span>•</span>
            <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{discussion.views} views</span>
            <span>•</span>
            <span>{discussion.replies} replies</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {discussion.tags?.map((tag) => (
              <span key={tag} className="bg-blue-600 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={handlePin}
              className="text-gray-400 hover:text-yellow-400 p-1"
              title={discussion.isPinned ? "Unpin" : "Pin"}
            >
              📌
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-400 p-1"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-300 mb-4">{discussion.content}</p>

      {discussion.code && discussion.code.length > 0 && (
        <div className="bg-[#0A0F1C] rounded p-3 mb-4">
          <h4 className="text-sm font-semibold mb-2">Code:</h4>
          {discussion.code.map((codeBlock, index) => (
            <div key={index} className="mb-2">
              <span className="text-blue-400 text-sm">{codeBlock.language}:</span>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                {codeBlock.code}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 border-t border-gray-700 pt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote("upvote")}
            className={`p-1 ${vote === "upvote" ? "text-green-400" : "text-gray-400 hover:text-green-400"}`}
          >
            👍
          </button>
          <span className="text-sm">{discussion.upvotes}</span>
          <button
            onClick={() => handleVote("downvote")}
            className={`p-1 ${vote === "downvote" ? "text-red-400" : "text-gray-400 hover:text-red-400"}`}
          >
            👎
          </button>
          <span className="text-sm">{discussion.downvotes}</span>
        </div>
        <button
          onClick={fetchReplies}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          {showReplies ? "Hide Replies" : `Show Replies (${discussion.replies})`}
        </button>
      </div>

      {showReplies && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          {loadingReplies ? (
            <p className="text-gray-400">Loading replies...</p>
          ) : replies.length > 0 ? (
            <div className="space-y-3">
              {replies.map((reply) => (
                <ReplyCard
                  key={reply._id}
                  reply={reply}
                  currentUserId={currentUserId}
                  discussionId={discussion._id}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No replies yet</p>
          )}
        </div>
      )}
    </div>
  );
};

const ReplyCard = ({ reply, currentUserId, discussionId, onUpdate }) => {
  const [vote, setVote] = useState(null);

  const handleVote = async (voteType) => {
    try {
      await discussionAPI.voteReply(discussionId, reply._id, { vote: voteType });
      setVote(voteType);
      onUpdate();
    } catch (error) {
      console.error("Error voting on reply:", error);
    }
  };

  const isOwner = reply.userId._id === currentUserId;

  return (
    <div className="bg-[#0A0F1C] rounded-lg p-4 border border-gray-700">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {reply.isAccepted && (
            <span className="bg-green-600 text-xs px-2 py-1 rounded">✓ Accepted</span>
          )}
          <span className="text-sm font-semibold">{reply.userId.name}</span>
          <span className="text-xs text-gray-400">
            {new Date(reply.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      <p className="text-gray-300 text-sm mb-2">{reply.content}</p>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVote("upvote")}
            className={`text-gray-400 hover:text-green-400 ${vote === "upvote" ? "text-green-400" : ""}`}
          >
            👍
          </button>
          <span className="text-gray-400">{reply.upvotes}</span>
          <button
            onClick={() => handleVote("downvote")}
            className={`text-gray-400 hover:text-red-400 ${vote === "downvote" ? "text-red-400" : ""}`}
          >
            👎
          </button>
          <span className="text-gray-400">{reply.downvotes}</span>
        </div>
      </div>
    </div>
  );
};

export default DiscussionCard;

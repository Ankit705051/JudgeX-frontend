import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { discussionAPI } from "../services/api";
import DiscussionForm from "../components/DiscussionForm";
import DiscussionCard from "../components/DiscussionCard";

const Discuss = () => {
  const { problemId } = useParams();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchDiscussions();
    fetchCurrentUser();
  }, [problemId, filter, searchQuery, tagFilter]);

  const fetchCurrentUser = async () => {
    try {
      const response = await discussionAPI.getAllDiscussions();
      setCurrentUserId(response.data.user?._id);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      let response;
      const params = { search: searchQuery, tag: tagFilter };

      if (problemId) {
        response = await discussionAPI.getProblemDiscussions(problemId, params);
      } else if (filter === "my") {
        response = await discussionAPI.getMyDiscussions(params);
      } else {
        response = await discussionAPI.getAllDiscussions(params);
      }

      setDiscussions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching discussions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowForm(false);
    fetchDiscussions();
  };

  const handleDelete = () => {
    fetchDiscussions();
  };

  const handleUpdate = () => {
    fetchDiscussions();
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {problemId ? "Problem Discussions" : "Community Discussions"}
            </h1>
            <p className="text-gray-400">
              {problemId
                ? "Discuss solutions and ask questions about this problem"
                : "Join discussions with the community"}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
          >
            {showForm ? "Cancel" : "New Discussion"}
          </button>
        </div>

        {!problemId && (
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "all" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                All Discussions
              </button>
              <button
                onClick={() => setFilter("my")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "my" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                My Discussions
              </button>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-[#1A1F2E] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Filter by tag..."
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-48 bg-[#1A1F2E] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {showForm && problemId && (
          <DiscussionForm
            problemId={problemId}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading discussions...</div>
          </div>
        ) : discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <DiscussionCard
                key={discussion._id}
                discussion={discussion}
                currentUserId={currentUserId}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400">
              {searchQuery || tagFilter
                ? "No discussions match your search"
                : "No discussions yet. Be the first to start a conversation!"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discuss;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contestAPI, contestProblemAPI, problemAPI } from "../services/api";

const AdminContests = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showProblemSelector, setShowProblemSelector] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [contestProblems, setContestProblems] = useState([]);
  const [editingContest, setEditingContest] = useState(null);
  const [problemScores, setProblemScores] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    visibility: "public",
  });

  useEffect(() => {
    fetchContests();
    fetchProblems();
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const response = await contestAPI.getAllContests({ limit: 100 });
      setContests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching contests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      const response = await problemAPI.getAllProblems({ limit: 100 });
      setProblems(response.data.data?.problems || response.data.data || []);
    } catch (error) {
      console.error("Error fetching problems:", error);
    }
  };

  const fetchContestProblems = async (contestId) => {
    try {
      const response = await contestProblemAPI.getContestProblems(contestId);
      setContestProblems(response.data.data || []);
    } catch (error) {
      console.error("Error fetching contest problems:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert datetime-local input to proper ISO format (IST)
      const submissionData = {
        ...formData,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : "",
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : "",
      };

      if (editingContest) {
        await contestAPI.updateContest(editingContest._id, submissionData);
        alert("Contest updated successfully!");
      } else {
        await contestAPI.createContest(submissionData);
        alert("Contest created successfully!");
      }
      setShowForm(false);
      setEditingContest(null);
      resetForm();
      fetchContests();
    } catch (error) {
      console.error("Error saving contest:", error);
      alert("Failed to save contest");
    }
  };

  const handleEdit = (contest) => {
    setEditingContest(contest);
    setFormData({
      title: contest.title || "",
      description: contest.description || "",
      startTime: contest.startTime ? new Date(contest.startTime).toLocaleString('en-CA', { hour12: false }).slice(0, 16) : "",
      endTime: contest.endTime ? new Date(contest.endTime).toLocaleString('en-CA', { hour12: false }).slice(0, 16) : "",
      visibility: contest.visibility || "public",
    });
    setShowForm(true);
  };

  const handleDelete = async (contestId) => {
    if (!window.confirm("Are you sure you want to delete this contest?")) return;
    try {
      await contestAPI.deleteContest(contestId);
      alert("Contest deleted successfully!");
      fetchContests();
    } catch (error) {
      console.error("Error deleting contest:", error);
      alert("Failed to delete contest");
    }
  };

  const handleManageProblems = async (contest) => {
    setSelectedContest(contest);
    await fetchContestProblems(contest._id);
    setShowProblemSelector(true);
  };

const handleAddProblemToContest = async (problemId) => {
  try {
    const points = Number(problemScores[problemId]) || 10;

    await contestProblemAPI.addProblemToContest(
      selectedContest._id,
      {
        problemId,
        points,
      }
    );

    alert("Problem added to contest successfully!");

    setProblemScores((prev) => ({
      ...prev,
      [problemId]: "",
    }));

    await fetchContestProblems(selectedContest._id);
  } catch (error) {
    console.error(error);
    alert("Failed to add problem to contest");
  }
};

  const handleRemoveProblemFromContest = async (problemId) => {
    if (!window.confirm("Are you sure you want to remove this problem from the contest?")) return;
    try {
      await contestProblemAPI.removeProblemFromContest(selectedContest._id, problemId);
      alert("Problem removed from contest successfully!");
      await fetchContestProblems(selectedContest._id);
    } catch (error) {
      console.error("Error removing problem from contest:", error);
      alert("Failed to remove problem from contest");
    }
  };

  const handleCloseProblemSelector = () => {
    setShowProblemSelector(false);
    setSelectedContest(null);
    setContestProblems([]);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      visibility: "public",
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContest(null);
    resetForm();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "upcoming":
        return "bg-blue-600";
      case "running":
        return "bg-green-600";
      case "ended":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };

  if (showForm) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] text-zinc-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {editingContest ? "Edit Contest" : "Create New Contest"}
            </h1>
            <button
              onClick={handleCancel}
              className="rounded border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Visibility</label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleInputChange}
                className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded border border-zinc-700 px-6 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                {editingContest ? "Update Contest" : "Create Contest"}
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="text-zinc-400 hover:text-white mb-2 inline-block"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold">Contest Management</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            + Create Contest
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-zinc-500">Loading contests...</div>
          </div>
        ) : contests.length > 0 ? (
          <div className="overflow-hidden rounded border border-zinc-800 bg-[#171717]">
            <table className="w-full">
              <thead className="bg-[#111111]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {contests.map((contest) => (
                  <tr key={contest._id} className="hover:bg-[#1f1f1f]">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-200">{contest.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          contest.status
                        )}`}
                      >
                        {contest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-300">{formatDate(contest.startTime)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-300">{formatDate(contest.endTime)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
                          contest.visibility === "private"
                            ? "bg-purple-600"
                            : "bg-zinc-600"
                        }`}
                      >
                        {contest.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(contest)}
                          className="text-blue-400 text-sm hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleManageProblems(contest)}
                          className="text-green-400 text-sm hover:text-green-300"
                        >
                          Problems
                        </button>
                        <button
                          onClick={() => handleDelete(contest._id)}
                          className="text-red-400 text-sm hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-zinc-500">No contests found</div>
          </div>
        )}

        {showProblemSelector && selectedContest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[#171717] rounded-lg border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h2 className="text-xl font-bold">
                  Manage Problems - {selectedContest.title}
                </h2>
                <button
                  onClick={handleCloseProblemSelector}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <h3 className="text-lg font-semibold mb-4">Problems in Contest</h3>
                {contestProblems.length > 0 ? (
                  <div className="space-y-2 mb-6">
                    {contestProblems.map((cp) => (
                      <div
                        key={cp._id}
                        className="flex items-center justify-between p-3 rounded bg-[#111111] border border-zinc-800"
                      >
                        <div>
                          <div className="text-sm font-medium text-zinc-200">
                            {cp.problemId?.title || cp.title || "Unknown"}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {cp.problemId?.difficulty || cp.difficulty || ""}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveProblemFromContest(cp.problemId?._id || cp._id)}
                          className="text-red-400 text-sm hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-zinc-500 mb-6">No problems added to this contest yet.</div>
                )}

                <h3 className="text-lg font-semibold mb-4">Available Problems</h3>
                <div className="space-y-2">
                  {problems
                    .filter((p) => !contestProblems.some((cp) => (cp.problemId?._id || cp._id) === p._id))
                    .map((problem) => (
                      <div
                        key={problem._id}
                        className="flex items-center justify-between p-3 rounded bg-[#111111] border border-zinc-800 hover:border-zinc-700"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-zinc-200">{problem.title}</div>
                          <div className="text-xs text-zinc-500 flex gap-2">
                            <span>{problem.difficulty}</span>
                            {problem.visibility === "contest" && (
                              <span className="text-purple-400">Contest Only</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-zinc-400">Points:</label>
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              value={problemScores[problem._id] || ""}
                              onChange={(e) => setProblemScores({ ...problemScores, [problem._id]: e.target.value })}
                              placeholder="10"
                              className="w-16 rounded border border-zinc-700 bg-[#171717] px-2 py-1 text-xs text-zinc-200 outline-none focus:border-zinc-500"
                            />
                          </div>
                          <button
                            onClick={() => handleAddProblemToContest(problem._id)}
                            className="text-green-400 text-sm hover:text-green-300"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminContests;

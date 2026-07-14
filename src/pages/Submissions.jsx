import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submissionAPI } from "../services/api";

const Submissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage, statusFilter, languageFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20,
      };
      const response = await submissionAPI.getMySubmissions(params);
      setSubmissions(response.data.data.submissions || []);
      setTotalPages(response.data.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "wrong_answer":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "time_limit_exceeded":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "memory_limit_exceeded":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "runtime_error":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "compile_error":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "pending":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "judging":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "Accepted";
      case "wrong_answer":
        return "Wrong Answer";
      case "time_limit_exceeded":
        return "Time Limit Exceeded";
      case "memory_limit_exceeded":
        return "Memory Limit Exceeded";
      case "runtime_error":
        return "Runtime Error";
      case "compile_error":
        return "Compile Error";
      case "pending":
        return "Pending";
      case "judging":
        return "Judging";
      default:
        return status || "Unknown";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter && sub.status !== statusFilter) return false;
    if (languageFilter && sub.language !== languageFilter) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold mb-6">Submissions</h1>

        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-sm text-zinc-200 outline-none"
          >
            <option value="">All Status</option>
            <option value="accepted">Accepted</option>
            <option value="wrong_answer">Wrong Answer</option>
            <option value="time_limit_exceeded">Time Limit Exceeded</option>
            <option value="runtime_error">Runtime Error</option>
            <option value="compile_error">Compile Error</option>
          </select>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-sm text-zinc-200 outline-none"
          >
            <option value="">All Languages</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-zinc-500">Loading submissions...</div>
          </div>
        ) : filteredSubmissions.length > 0 ? (
          <>
            <div className="overflow-hidden rounded border border-zinc-800 bg-[#171717]">
              <table className="w-full">
                <thead className="bg-[#111111]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Problem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Runtime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Memory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredSubmissions.map((submission) => (
                    <tr
                      key={submission._id}
                      className="hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                      onClick={() => navigate(`/problem/${submission.problemId?.slug || submission.problemId}`)}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            submission.status
                          )}`}
                        >
                          {getStatusText(submission.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-zinc-200">
                          {submission.problemId?.title || "Unknown Problem"}
                        </div>
                        {submission.problemId?.difficulty && (
                          <div className="text-xs text-zinc-500 mt-1">
                            {submission.problemId.difficulty}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-300 capitalize">
                          {submission.language}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-300">
                          {submission.runtime ? `${submission.runtime}ms` : "--"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-300">
                          {submission.memory ? `${submission.memory}MB` : "--"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-400">
                          {formatDate(submission.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-zinc-500">No submissions found</div>
            <button
              onClick={() => navigate("/problems")}
              className="mt-4 rounded bg-zinc-800 px-6 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Browse Problems
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Submissions;

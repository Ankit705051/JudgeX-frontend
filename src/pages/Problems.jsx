import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { problemAPI } from "../services/api";

const difficultyStyles = {
  easy: "text-emerald-400 bg-emerald-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  hard: "text-red-400 bg-red-500/10",
};

const Problems = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          page: currentPage,
          limit: 100,
        };

        if (searchQuery.trim()) {
          params.title = searchQuery.trim();
        }
        if (difficultyFilter) {
          params.difficulty = difficultyFilter;
        }
        if (tagFilter.trim()) {
          params.tags = tagFilter.trim();
        }

        const response = await problemAPI.getAllProblems(params);
        const payload = response.data.data || {};
        setProblems(payload.problems || payload || []);
        setTotalPages(payload.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load problems.");
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [currentPage, searchQuery, difficultyFilter, tagFilter]);

  const stats = useMemo(() => {
    const total = problems.length;
    const easy = problems.filter((problem) => problem.difficulty === "easy").length;
    const medium = problems.filter((problem) => problem.difficulty === "medium").length;
    const hard = problems.filter((problem) => problem.difficulty === "hard").length;
    return { total, easy, medium, hard };
  }, [problems]);

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-zinc-100">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-yellow-400">Practice</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Problem Set</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Browse backend problems, filter by difficulty and open a coding workspace.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded border border-zinc-800 bg-[#171717] p-2 text-center sm:min-w-80">
            <div className="rounded bg-[#101010] px-3 py-2">
              <p className="text-lg font-semibold">{stats.easy}</p>
              <p className="text-xs text-emerald-400">Easy</p>
            </div>
            <div className="rounded bg-[#101010] px-3 py-2">
              <p className="text-lg font-semibold">{stats.medium}</p>
              <p className="text-xs text-yellow-400">Medium</p>
            </div>
            <div className="rounded bg-[#101010] px-3 py-2">
              <p className="text-lg font-semibold">{stats.hard}</p>
              <p className="text-xs text-red-400">Hard</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <section className="overflow-hidden rounded border border-zinc-800 bg-[#171717]">
            <div className="grid gap-3 border-b border-zinc-800 p-4 md:grid-cols-[1fr_180px_180px]">
              <input
                type="text"
                placeholder="Search questions"
                value={searchQuery}
                onChange={(event) => {
                  setCurrentPage(1);
                  setSearchQuery(event.target.value);
                }}
                className="rounded border border-zinc-800 bg-[#101010] px-3 py-2 text-sm outline-none transition focus:border-yellow-500"
              />
              <select
                value={difficultyFilter}
                onChange={(event) => {
                  setCurrentPage(1);
                  setDifficultyFilter(event.target.value);
                }}
                className="rounded border border-zinc-800 bg-[#101010] px-3 py-2 text-sm outline-none transition focus:border-yellow-500"
              >
                <option value="">Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tag"
                  value={tagFilter}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setTagFilter(event.target.value);
                  }}
                  className="min-w-0 flex-1 rounded border border-zinc-800 bg-[#101010] px-3 py-2 text-sm outline-none transition focus:border-yellow-500"
                />
                {(searchQuery || difficultyFilter || tagFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setDifficultyFilter("");
                      setTagFilter("");
                      setCurrentPage(1);
                    }}
                    className="rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-500"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm text-zinc-500">Loading problems...</div>
            ) : error ? (
              <div className="p-10 text-center">
                <p className="font-medium text-zinc-200">Problems could not be loaded</p>
                <p className="mt-2 text-sm text-zinc-500">{error}</p>
              </div>
            ) : problems.length === 0 ? (
              <div className="p-10 text-center text-sm text-zinc-500">No problems found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="border-b border-zinc-800 text-left text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="w-20 px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="w-32 px-4 py-3 font-medium">Difficulty</th>
                      <th className="px-4 py-3 font-medium">Tags</th>
                      <th className="w-32 px-4 py-3 font-medium">Limits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {problems.map((problem, index) => (
                      <tr
                        key={problem._id}
                        onClick={() => navigate(`/problem/${problem.slug}`)}
                        className="cursor-pointer transition hover:bg-[#222222]"
                      >
                        <td className="px-4 py-4 text-zinc-600">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 text-xs">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-zinc-100">{problem.title}</p>
                          <p className="mt-1 text-xs text-zinc-500">{problem.functionName}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded px-2 py-1 text-xs font-medium ${difficultyStyles[problem.difficulty] || "bg-zinc-800 text-zinc-300"}`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {problem.tags?.slice(0, 4).map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setTagFilter(tag);
                                  setCurrentPage(1);
                                }}
                                className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-200"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-zinc-500">
                          {problem.timeLimit}s / {problem.memoryLimit}MB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3 text-sm">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded border border-zinc-700 px-3 py-2 text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-zinc-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded border border-zinc-700 px-3 py-2 text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded border border-zinc-800 bg-[#171717] p-4">
              <h2 className="font-semibold">Study Plan</h2>
              <div className="mt-4 space-y-3 text-sm">
                {["Arrays & Hashing", "Two Pointers", "Dynamic Programming"].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded bg-[#101010] px-3 py-3">
                    <span className="text-zinc-300">{item}</span>
                    <span className="text-xs text-zinc-500">Practice</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-zinc-800 bg-[#171717] p-4">
              <h2 className="font-semibold">Backend Connected</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                This page reads from `/api/v1/problem/all` and is available to all users.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Problems;

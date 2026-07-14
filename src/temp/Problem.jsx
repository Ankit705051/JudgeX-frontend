import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { problemAPI, submissionAPI, testCaseAPI, discussionAPI, contestAPI, contestProblemAPI, contestSubmissionAPI } from "../services/api";
import { Trophy, Clock, ExternalLink, Lock, FileCode, CheckCircle2, ChevronRight } from "lucide-react";

const languageLabels = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
};

const defaultTemplates = {
  javascript: "function solution() {\n  // Write your code here\n}\n",
  python: "def solution():\n    # Write your code here\n    pass\n",
  java: "class Solution {\n    public void solution() {\n        // Write your code here\n    }\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n",
};

const difficultyStyles = {
  easy: "text-emerald-400 bg-emerald-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  hard: "text-red-400 bg-red-500/10",
};

const terminalStatuses = [
  "accepted",
  "wrong_answer",
  "time_limit_exceeded",
  "memory_limit_exceeded",
  "runtime_error",
  "compile_error",
];

const statusStyles = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  judging: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  accepted: "border-green-500/30 bg-green-500/10 text-green-200",
  wrong_answer: "border-red-500/30 bg-red-500/10 text-red-200",
  time_limit_exceeded: "border-red-500/30 bg-red-500/10 text-red-200",
  memory_limit_exceeded: "border-red-500/30 bg-red-500/10 text-red-200",
  runtime_error: "border-red-500/30 bg-red-500/10 text-red-200",
  compile_error: "border-red-500/30 bg-red-500/10 text-red-200",
};

const formatStatus = (status) =>
  status?.split("_").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ") || "Pending";

const Problem = () => {
  const { contestId, slug } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(defaultTemplates.javascript);
  const [submission, setSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [testCaseNotice, setTestCaseNotice] = useState("");
  const [activeConsoleTab, setActiveConsoleTab] = useState("testcase");
  const [discussions, setDiscussions] = useState([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  // Contest Mode States
  const [contest, setContest] = useState(null);
  const [contestProblems, setContestProblems] = useState([]);
  const [historicalSubmissions, setHistoricalSubmissions] = useState([]);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [ticks, setTicks] = useState(0);

  // Contest timer tick
  useEffect(() => {
    if (!contest) return;
    const interval = setInterval(() => {
      setTicks((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await problemAPI.getProblemBySlug(slug);
        const payload = response.data.data?.problem || response.data.data;
        setProblem(payload);
      } catch (err) {
        setError(err.response?.data?.message || "Problem not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [slug]);

  // Fetch Contest info if in contest mode
  useEffect(() => {
    if (!contestId) {
      setContest(null);
      setContestProblems([]);
      return;
    }

    const fetchContestDetails = async () => {
      try {
        const contestRes = await contestAPI.getContestById(contestId);
        setContest(contestRes.data.data);

        const problemsRes = await contestProblemAPI.getContestProblems(contestId, { limit: 100 });
        setContestProblems(problemsRes.data.data || []);
      } catch (err) {
        console.error("Error loading contest details in workspace:", err);
      }
    };

    fetchContestDetails();
  }, [contestId]);

  const templates = useMemo(() => {
    const map = { ...defaultTemplates };
    problem?.codeTemplate?.forEach((template) => {
      map[template.language] = template.starterCode;
    });
    return map;
  }, [problem]);

  useEffect(() => {
    setCode(templates[language] || defaultTemplates[language] || "");
  }, [language, templates]);

  const examples = problem?.examples || [];
  const visibleCases = testCases.length > 0 ? testCases : examples;

  useEffect(() => {
    if (!problem?._id) return;

    const fetchTestCases = async () => {
      setTestCaseNotice("");
      try {
        const response = await testCaseAPI.getProblemTestCases(problem._id);
        const cases = response.data.data || [];
        setTestCases(cases.filter((testCase) => !testCase.isHidden));
      } catch (err) {
        setTestCases([]);
        if (examples.length > 0) {
          setTestCaseNotice("Showing sample examples. Backend test cases are admin-only right now.");
        } else {
          setTestCaseNotice(err.response?.data?.message || "No visible test cases are available.");
        }
      }
    };

    fetchTestCases();
  }, [problem?._id, examples.length]);

  // Poll for submission updates
  useEffect(() => {
    if (!submission?.submissionId || terminalStatuses.includes(submission.status)) return;

    const timer = setInterval(async () => {
      try {
        const response = await submissionAPI.getSubmissionById(submission.submissionId);
        const latest = response.data.data;
        setSubmission((current) => ({
          ...current,
          ...latest,
          submissionId: current.submissionId,
        }));
        if (terminalStatuses.includes(latest.status)) {
          clearInterval(timer);
          // Refetch historical submissions list
          fetchHistoricalSubmissions();
        }
      } catch (err) {
        clearInterval(timer);
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [submission?.submissionId, submission?.status]);

  useEffect(() => {
    if (!problem?._id || activeTab !== "discussions") return;

    const fetchDiscussions = async () => {
      setDiscussionsLoading(true);
      try {
        const response = await discussionAPI.getProblemDiscussions(problem._id, { page: 1, limit: 10 });
        setDiscussions(response.data.data || []);
      } catch (err) {
        console.error("Error fetching discussions:", err);
        setDiscussions([]);
      } finally {
        setDiscussionsLoading(false);
      }
    };

    fetchDiscussions();
  }, [problem?._id, activeTab]);

  // Fetch submissions history
  useEffect(() => {
    if (problem?._id && activeTab === "submissions") {
      fetchHistoricalSubmissions();
    }
  }, [problem?._id, activeTab]);

  const fetchHistoricalSubmissions = async () => {
    if (!problem?._id) return;
    setHistoricalLoading(true);
    try {
      let list = [];
      if (contestId) {
        const response = await contestSubmissionAPI.getMyContestSubmissions(contestId, { limit: 100 });
        const allSubs = response.data.data?.submissions || [];
        list = allSubs.filter(sub => (sub.problemId?._id || sub.problemId) === problem._id);
      } else {
        const response = await submissionAPI.getMySubmissions({ limit: 100 });
        const allSubs = response.data.data?.submissions || [];
        list = allSubs.filter(sub => (sub.problemId?._id || sub.problemId) === problem._id);
      }
      setHistoricalSubmissions(list);
    } catch (err) {
      console.error("Error fetching submissions history:", err);
    } finally {
      setHistoricalLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem?._id) return;
    setSubmitting(true);
    setSubmitError("");
    setSubmission(null);

    try {
      let response;
      if (contestId) {
        response = await contestSubmissionAPI.submitContestProblem(contestId, problem._id, {
          language,
          code,
        });
      } else {
        response = await submissionAPI.submitCode({
          problemId: problem._id,
          language,
          code,
        });
      }
      const created = response.data.data;
      setSubmission({
        status: created.status,
        submissionId: created.submissionId || created._id,
        message: response.data.message,
      });
      setActiveConsoleTab("result");
      setActiveTab("submissions");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewSubmissionCode = async (submissionId) => {
    try {
      let details;
      if (contestId) {
        const response = await contestSubmissionAPI.getContestSubmissionDetails(submissionId);
        details = response.data.data;
      } else {
        const response = await submissionAPI.getSubmissionById(submissionId);
        details = response.data.data;
      }
      setSelectedSubmission(details);
      setShowCodeModal(true);
    } catch (err) {
      console.error("Error fetching submission details:", err);
    }
  };

  const getContestTimeLeft = () => {
    if (!contest) return "";
    const now = new Date();
    const end = new Date(contest.endTime);
    const diff = end - now;
    if (diff <= 0) return "Finished";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Determine allowed workspace tabs (cheat-prevention during live contests)
  const tabs = useMemo(() => {
    if (contest && contest.status === "running") {
      return ["description", "submissions"];
    }
    return ["description", "discussions", "submissions", "solutions"];
  }, [contest]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070913] text-zinc-400 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-3" />
          <span>Loading workspace environment...</span>
        </div>
      </main>
    );
  }

  if (error || !problem) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070913] px-4 text-zinc-100">
        <div className="max-w-md rounded-2xl border border-zinc-800 bg-[#0f111e] p-6 text-center shadow-2xl">
          <h1 className="text-xl font-bold">Unable to open workspace</h1>
          <p className="mt-2 text-sm text-zinc-500">{error || "Problem configuration is unavailable."}</p>
          <button
            onClick={() => navigate(contestId ? `/contest/${contestId}` : "/problems")}
            className="mt-6 w-full rounded-xl bg-yellow-500 py-2.5 font-bold text-black hover:bg-yellow-400 transition"
          >
            {contestId ? "Back to Contest" : "Back to Problems"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col font-sans">
      
      {/* Contest header bar */}
      {contest && (
        <div className="bg-[#0b0e17]/95 border-b border-zinc-850 px-4 py-3 flex flex-wrap items-center justify-between gap-4 backdrop-blur relative z-10">
          <div className="flex items-center gap-3">
            <Trophy className="h-4.5 w-4.5 text-yellow-500" />
            <div>
              <h2 className="text-xs font-bold text-white leading-tight">{contest.title}</h2>
              <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Contest Mode Arena</span>
            </div>
          </div>

          {/* Quick nav buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mr-1">Problems:</span>
            {contestProblems.map((cp, idx) => {
              const letter = cp.problemCode || String.fromCharCode(65 + idx);
              const p = cp.problemId || cp;
              const isActive = p.slug === slug;
              return (
                <button
                  key={cp._id}
                  onClick={() => navigate(`/contest/${contestId}/problem/${p.slug}`)}
                  className={`h-7 w-7 rounded-lg text-xs font-extrabold font-mono transition flex items-center justify-center border ${
                    isActive
                      ? "bg-yellow-500 text-black border-yellow-500"
                      : "bg-[#0f111e] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-[#05060b] border border-zinc-800 rounded-lg px-3 py-1 font-mono text-xs text-yellow-500 font-bold">
              <Clock className="h-3.5 w-3.5 animate-pulse" />
              <span>{getContestTimeLeft()}</span>
            </div>
            <button
              onClick={() => navigate(`/contest/${contestId}`)}
              className="text-xs font-bold text-zinc-400 hover:text-white transition flex items-center gap-1"
            >
              <span>Dashboard</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace split panel */}
      <div className="grid flex-1 min-h-[calc(100vh-56px)] grid-cols-1 gap-2 p-2 lg:grid-cols-[minmax(420px,46%)_1fr]">
        
        {/* Left Info Panel */}
        <section className="overflow-hidden rounded-xl border border-zinc-800 bg-[#0f111e]/75 backdrop-blur flex flex-col">
          <div className="flex items-center gap-1 border-b border-zinc-800 bg-[#0b0c14] px-3 py-1.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === tab ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                }`}
              >
                {tab}
              </button>
            ))}
            {activeTab === "discussions" && (
              <Link
                to={`/discuss/problem/${problem._id}`}
                className="ml-auto text-xs font-semibold text-yellow-500 hover:text-yellow-400 transition"
              >
                View Forum
              </Link>
            )}
          </div>

          {/* Left panel scroll viewport */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "description" && (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-extrabold tracking-tight text-white">{problem.title}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border border-transparent ${difficultyStyles[problem.difficulty] || "bg-zinc-800 text-zinc-300"}`}>
                      {problem.difficulty}
                    </span>
                    <span className="rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-[10px] text-zinc-400 font-medium">
                      Limit: {problem.timeLimit}s
                    </span>
                    <span className="rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-[10px] text-zinc-400 font-medium">
                      Mem: {problem.memoryLimit}MB
                    </span>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </div>

                {examples.length > 0 && (
                  <div className="mt-8 space-y-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sample Examples</h3>
                    {examples.map((example, index) => (
                      <div key={example._id || index} className="rounded-xl border border-zinc-800 bg-[#080a15]">
                        <div className="border-b border-zinc-800 px-4 py-2 bg-zinc-900/10">
                          <p className="text-xs font-bold text-zinc-400">Example {index + 1}</p>
                        </div>
                        <div className="space-y-3 p-4 text-xs font-mono">
                          <div>
                            <p className="mb-1 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Input</p>
                            <pre className="whitespace-pre-wrap rounded-lg bg-[#0f111e] p-2.5 text-zinc-300 border border-zinc-850">
                              {example.input}
                            </pre>
                          </div>
                          <div>
                            <p className="mb-1 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Output</p>
                            <pre className="whitespace-pre-wrap rounded-lg bg-[#0f111e] p-2.5 text-zinc-300 border border-zinc-850">
                              {example.output}
                            </pre>
                          </div>
                          {example.explanation && (
                            <div>
                              <p className="mb-1 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider font-sans">Explanation</p>
                              <p className="text-zinc-400 font-sans leading-relaxed pl-1">{example.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* HISTORICAL SUBMISSIONS LIST */}
            {activeTab === "submissions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">My Submissions</h3>
                  {contest && contest.status === "running" && (
                    <span className="text-[10px] text-yellow-500 bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10">
                      Contest Live Standings Active
                    </span>
                  )}
                </div>

                {/* Single current pending submission display */}
                {submission && (
                  <div className={`rounded-xl border p-4 shadow-lg ${statusStyles[submission.status] || statusStyles.pending}`}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-white uppercase tracking-wide">Current Submission: {formatStatus(submission.status)}</p>
                        <p className="mt-1 font-mono text-[10px] opacity-70">ID: {submission.submissionId}</p>
                      </div>
                      <button
                        onClick={() => handleViewSubmissionCode(submission.submissionId)}
                        className="rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 px-3 py-1 font-semibold text-[11px] text-zinc-200 transition"
                      >
                        View Code
                      </button>
                    </div>
                  </div>
                )}

                {/* Submissions table history */}
                {historicalLoading ? (
                  <div className="text-center py-6 text-xs text-zinc-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b border-yellow-500 mx-auto mb-2" />
                    Loading submission history...
                  </div>
                ) : historicalSubmissions.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#080a15]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/20 text-zinc-500 font-semibold uppercase text-[10px]">
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Language</th>
                          <th className="px-4 py-2.5">Passed Cases</th>
                          <th className="px-4 py-2.5">Submitted At</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {historicalSubmissions.map((sub) => (
                          <tr key={sub._id} className="hover:bg-zinc-800/10">
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                sub.status === "accepted" ? "text-green-400 bg-green-500/5 border border-green-500/20" : "text-red-400 bg-red-500/5 border border-red-500/20"
                              }`}>
                                {formatStatus(sub.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-zinc-400 capitalize">
                              {sub.language}
                            </td>
                            <td className="px-4 py-3 text-zinc-300 font-semibold">
                              {sub.passedTestCases ?? 0} / {sub.totalTestCases || visibleCases.length}
                            </td>
                            <td className="px-4 py-3 text-zinc-500 font-mono text-[10px]">
                              {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleViewSubmissionCode(sub._id)}
                                className="text-yellow-500 hover:text-yellow-400 font-bold"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-500 border border-zinc-800 bg-[#080a15] rounded-xl">
                    No previous submissions logged for this problem yet.
                  </div>
                )}
              </div>
            )}

            {/* DISCUSSIONS TAB */}
            {activeTab === "discussions" && (
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Community Discussions</h3>
                {discussionsLoading ? (
                  <p className="text-xs text-zinc-500">Loading forum threads...</p>
                ) : discussions.length > 0 ? (
                  <div className="space-y-3">
                    {discussions.map((discussion) => (
                      <div
                        key={discussion._id}
                        className="rounded-xl border border-zinc-850 bg-[#080a15] p-4 hover:border-zinc-700 transition cursor-pointer"
                        onClick={() => navigate(`/discuss/problem/${problem._id}`)}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h4 className="font-bold text-zinc-200 text-sm line-clamp-1">{discussion.title}</h4>
                          {discussion.isPinned && (
                            <span className="rounded bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">Pinned</span>
                          )}
                        </div>
                        <p className="mb-3 line-clamp-2 text-xs text-zinc-500 leading-relaxed">{discussion.content}</p>
                        <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono">
                          <span>👍 {discussion.upvotes || 0}</span>
                          <span>💬 {discussion.replies || 0} replies</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    <p className="text-xs">No discussions yet. Be the first to start a conversation!</p>
                    <button
                      onClick={() => navigate(`/discuss`)}
                      className="mt-3 rounded-lg bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                      Start Thread
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SOLUTIONS TAB */}
            {activeTab === "solutions" && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Solutions & Editorial</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Editorial solutions are locked during competition events to prevent cheating. Standard guidelines apply.
                </p>
                {problem.solutionDetails ? (
                  <div className="rounded-xl border border-zinc-800 bg-[#080a15] p-4 text-xs font-mono text-zinc-300">
                    <pre className="whitespace-pre-wrap leading-relaxed">{problem.solutionDetails}</pre>
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-800 bg-[#080a15] p-5 text-center text-xs text-zinc-500">
                    No solutions or editorial uploaded for this problem yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Coding Editor Panel */}
        <section className="grid min-h-[640px] grid-rows-[auto_1fr_auto_auto] overflow-hidden rounded-xl border border-zinc-800 bg-[#0f111e]/75 backdrop-blur">
          
          {/* Language Selector Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-[#0b0c14] px-3 py-1.5">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-lg border border-zinc-800 bg-[#0f111e] px-2.5 py-1.5 text-xs text-zinc-200 font-semibold outline-none transition focus:border-yellow-500 cursor-pointer"
            >
              {Object.keys(languageLabels).map((key) => (
                <option key={key} value={key}>
                  {languageLabels[key]}
                </option>
              ))}
            </select>
            <div className="text-[10px] text-zinc-500 font-mono">
              Func: <span className="text-zinc-300 font-semibold">{problem.functionName || "solution"}</span>
            </div>
          </div>

          {/* Monaco Editor container */}
          <div className="relative flex-1 overflow-hidden min-h-[250px]">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === "cpp" ? "cpp" : language === "javascript" ? "javascript" : language === "python" ? "python" : "java"}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                tabSize: 2,
                fontFamily: "Fira Code, Menlo, Monaco, Consolas, Courier New, monospace",
              }}
            />
          </div>

          {/* Testcases & Console Tabs */}
          <div className="overflow-hidden border-t border-zinc-850 bg-[#0b0c14]">
            <div className="flex items-center gap-1 border-b border-zinc-850 px-3 py-1">
              <button
                type="button"
                onClick={() => setActiveConsoleTab("testcase")}
                className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  activeConsoleTab === "testcase" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"
                }`}
              >
                Testcases
              </button>
              <button
                type="button"
                onClick={() => setActiveConsoleTab("result")}
                className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  activeConsoleTab === "result" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"
                }`}
              >
                Judge Standings
              </button>
            </div>

            {/* Testcase/Result scroll viewport */}
            <div className="h-[200px] overflow-y-auto p-3.5">
              {activeConsoleTab === "testcase" && (
                <div className="space-y-3">
                  {testCaseNotice && (
                    <div className="rounded-lg border border-zinc-800 bg-[#080a15] px-3 py-2 text-[10px] text-zinc-500 leading-normal">
                      {testCaseNotice}
                    </div>
                  )}
                  {visibleCases.length > 0 ? (
                    visibleCases.map((testCase, index) => (
                      <div key={testCase._id || index} className="rounded-lg border border-zinc-800 bg-[#080a15] p-3 text-xs font-mono">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-zinc-400 font-bold font-sans">Sample Case {index + 1}</span>
                          {testCase.isHidden && (
                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[9px] text-zinc-500 font-semibold">Hidden Case</span>
                          )}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="mb-1 text-[9px] text-zinc-600 font-semibold uppercase">Input</p>
                            <pre className="whitespace-pre-wrap rounded bg-[#0f111e] p-2 text-zinc-300 leading-relaxed border border-zinc-850">
                              {testCase.input}
                            </pre>
                          </div>
                          <div>
                            <p className="mb-1 text-[9px] text-zinc-600 font-semibold uppercase">Expected Output</p>
                            <pre className="whitespace-pre-wrap rounded bg-[#0f111e] p-2 text-zinc-300 leading-relaxed border border-zinc-850">
                              {testCase.output}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500">No test cases have been set up for this problem.</p>
                  )}
                </div>
              )}

              {activeConsoleTab === "result" && (
                <div className="text-xs font-mono">
                  {!submission && !submitError && (
                    <p className="text-zinc-500">Solve the code challenges and hit Submit to run code against the official judge.</p>
                  )}
                  {submitError && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-red-400 leading-normal">
                      {submitError}
                    </div>
                  )}
                  {submission && (
                    <div className={`rounded-xl border p-4 ${statusStyles[submission.status] || "border-zinc-800 bg-[#080a15] text-zinc-300"}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wide">{formatStatus(submission.status)}</h4>
                          <p className="mt-0.5 text-[10px] opacity-75">ID: {submission.submissionId}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-black/15 p-2">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold font-sans">Passed Cases</p>
                          <p className="mt-0.5 font-bold text-white">
                            {submission.passedTestCases ?? 0} / {submission.totalTestCases ?? visibleCases.length}
                          </p>
                        </div>
                        <div className="rounded-lg bg-black/15 p-2">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold font-sans">Runtime</p>
                          <p className="mt-0.5 font-bold text-white">{submission.runtime ?? submission.executionTime ?? "--"} ms</p>
                        </div>
                        <div className="rounded-lg bg-black/15 p-2">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold font-sans">Memory</p>
                          <p className="mt-0.5 font-bold text-white">{submission.memory ?? "--"} MB</p>
                        </div>
                      </div>
                      {(submission.compileOutput || submission.errorOutput || submission.executionOutput) && (
                        <pre className="mt-3 max-h-24 overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/30 p-3 leading-relaxed text-[11px] text-red-300">
                          {submission.compileOutput || submission.errorOutput || submission.executionOutput}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="border-t border-zinc-800 bg-[#0b0c14] p-3 flex justify-end gap-3 items-center">
            <div className="flex justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => setCode(templates[language] || defaultTemplates[language])}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition hover:border-zinc-700 font-sans cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-green-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60 font-sans cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit Code"}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Code Details Modal (Historical Viewer) */}
      {showCodeModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-w-3xl w-full max-h-[85vh] overflow-hidden rounded-2xl border border-zinc-800 bg-[#0f111e]">
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/40 px-5 py-4">
              <div>
                <h3 className="font-bold text-white text-base">Submission Code Details</h3>
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">{selectedSubmission._id}</p>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition font-bold"
              >
                Close
              </button>
            </div>
            
            <div className="h-[calc(85vh-140px)] overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Status</p>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    selectedSubmission.status === "accepted" ? "text-green-400 bg-green-500/5 border border-green-500/20" : "text-red-400 bg-red-500/5 border border-red-500/20"
                  }`}>
                    {formatStatus(selectedSubmission.status)}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Language</p>
                  <p className="text-sm font-bold text-zinc-200 capitalize">{selectedSubmission.language}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Submitted Code</p>
                <div className="rounded-xl border border-zinc-800 bg-[#080a15] p-4 relative">
                  <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-mono overflow-x-auto leading-relaxed">
                    {selectedSubmission.code}
                  </pre>
                </div>
              </div>

              {(selectedSubmission.compileOutput || selectedSubmission.errorOutput || selectedSubmission.executionOutput) && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Compiler / Error Log</p>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <pre className="whitespace-pre-wrap text-xs text-red-400 font-mono leading-relaxed">
                      {selectedSubmission.compileOutput || selectedSubmission.errorOutput || selectedSubmission.executionOutput}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Problem;

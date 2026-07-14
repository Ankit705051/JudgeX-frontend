import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contestAPI, contestParticipantAPI, contestProblemAPI, contestSubmissionAPI } from "../services/api";
import Leaderboard from "../components/Leaderboard";
import { Calendar, Clock, Trophy, Users, BookOpen, ChevronRight, Lock, ExternalLink, ShieldAlert, Award, FileCode, Search } from "lucide-react";

const Contest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRegistered, setIsRegistered] = useState(false);
  const [myParticipation, setMyParticipation] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [contestProblems, setContestProblems] = useState([]);
  const [problemsLoading, setProblemsLoading] = useState(false);
  
  // Contest Submissions state
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsTotalPages, setSubmissionsTotalPages] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);

  // Participants state
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsPage, setParticipantsPage] = useState(1);
  const [participantsTotalPages, setParticipantsTotalPages] = useState(1);

  // Live Timer tick
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicks((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchContest();
    checkRegistration();
    fetchContestProblems();
  }, [id]);

  useEffect(() => {
    if (activeTab === "leaderboard" && isRegistered) {
      fetchMyRank();
    } else if (activeTab === "submissions" && isRegistered) {
      fetchMySubmissions();
    } else if (activeTab === "participants") {
      fetchParticipants();
    }
  }, [activeTab, isRegistered, submissionsPage, participantsPage]);

  const fetchContest = async () => {
    setLoading(true);
    try {
      const response = await contestAPI.getContestById(id);
      setContest(response.data.data);
    } catch (error) {
      console.error("Error fetching contest:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContestProblems = async () => {
    setProblemsLoading(true);
    try {
      const response = await contestProblemAPI.getContestProblems(id, { limit: 100 });
      setContestProblems(response.data.data || []);
    } catch (error) {
      console.error("Error fetching contest problems:", error);
      setContestProblems([]);
    } finally {
      setProblemsLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const response = await contestParticipantAPI.getMyParticipation(id);
      setMyParticipation(response.data.data);
      setIsRegistered(true);
    } catch (error) {
      setIsRegistered(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await contestParticipantAPI.registerForContest(id);
      setIsRegistered(true);
      checkRegistration();
      alert("Successfully registered for the contest!");
    } catch (error) {
      console.error("Error registering:", error);
      alert("Failed to register for the contest");
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm("Are you sure you want to unregister from this contest?")) return;
    try {
      await contestParticipantAPI.unregisterFromContest(id);
      setIsRegistered(false);
      setMyParticipation(null);
      alert("Successfully unregistered from the contest");
    } catch (error) {
      console.error("Error unregistering:", error);
      alert("Failed to unregister from the contest");
    }
  };

  const fetchMySubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const response = await contestSubmissionAPI.getMyContestSubmissions(id, {
        page: submissionsPage,
        limit: 10
      });
      const data = response.data.data || response.data || {};
      setSubmissions(data.submissions || []);
      setSubmissionsTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching my submissions:", error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchParticipants = async () => {
    setParticipantsLoading(true);
    try {
      const response = await contestParticipantAPI.getContestParticipants(id, {
        page: participantsPage,
        limit: 10
      });
      const data = response.data.data || response.data || {};
      setParticipants(data.participants || []);
      setParticipantsTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleViewSubmission = async (submissionId) => {
    try {
      const response = await contestSubmissionAPI.getContestSubmissionDetails(submissionId);
      setSelectedSubmission(response.data.data);
      setShowCodeModal(true);
    } catch (error) {
      console.error("Error fetching submission details:", error);
      alert("Unable to load submission code details.");
    }
  };

  const fetchMyRank = async () => {
    try {
      const response = await contestParticipantAPI.getMyRank(id);
      setMyRank(response.data.data.rank);
    } catch (error) {
      console.error("Error fetching rank:", error);
    }
  };

  const getContestCountdown = () => {
    if (!contest) return null;
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) {
      const diff = start - now;
      return { label: "Contest starts in", time: formatDiff(diff), status: "upcoming" };
    } else if (now >= start && now < end) {
      const diff = end - now;
      return { label: "Contest ends in", time: formatDiff(diff), status: "running" };
    } else {
      return { label: "Contest has ended", time: "Finished", status: "ended" };
    }
  };

  const formatDiff = (diff) => {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60) % 60));
    const seconds = Math.floor((diff / 1000) % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(" ");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "upcoming":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "running":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "ended":
        return "bg-zinc-800 text-zinc-400 border border-zinc-700/50";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "upcoming":
        return "Upcoming";
      case "running":
        return "Live Now";
      case "ended":
        return "Ended";
      default:
        return status;
    }
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

  const formatStatus = (status) =>
    status?.split("_").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ") || "Pending";

  const statusStyles = {
    pending: "text-yellow-400 bg-yellow-400/5 border border-yellow-400/20",
    judging: "text-blue-400 bg-blue-400/5 border border-blue-400/20",
    accepted: "text-green-400 bg-green-400/5 border border-green-400/20",
    wrong_answer: "text-red-400 bg-red-400/5 border border-red-400/20",
    time_limit_exceeded: "text-orange-400 bg-orange-400/5 border border-orange-400/20",
    compile_error: "text-purple-400 bg-purple-400/5 border border-purple-400/20",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070913] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mx-auto mb-4" />
          <div className="text-zinc-400 text-sm">Retrieving contest dashboard...</div>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-[#070913] text-white flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-[#0f111e]/90 p-8 text-center backdrop-blur shadow-2xl">
          <ShieldAlert className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold">Contest Not Found</h1>
          <p className="mt-2 text-sm text-zinc-500">The contest you are trying to access does not exist or has been deleted.</p>
          <button
            onClick={() => navigate("/contests")}
            className="mt-6 w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2 rounded-lg font-semibold transition"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  const countdown = getContestCountdown();

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 font-sans relative selection:bg-yellow-500/30">
      {/* Background Glows */}
      <div className="absolute top-0 right-10 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 h-[400px] w-[400px] rounded-full bg-yellow-500/3 blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6">
        
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate("/contests")}
          className="mb-6 text-zinc-500 hover:text-white flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <span>← Back to Contests</span>
        </button>

        {/* Contest Header Banner */}
        <header className="mb-8 rounded-2xl border border-zinc-800 bg-[#0f111e]/60 p-6 shadow-xl backdrop-blur relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Trophy className="h-32 w-32 text-yellow-500" />
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(contest.status)}`}>
                  {getStatusText(contest.status)}
                </span>
                {contest.visibility === "private" && (
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-0.5 rounded-full text-xs font-semibold">
                    Private Arena
                  </span>
                )}
                {isRegistered && (
                  <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-0.5 rounded-full text-xs font-semibold">
                    Registered
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{contest.title}</h1>
              
              <div className="flex flex-wrap gap-5 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-zinc-600" />
                  <span>Start: {formatDate(contest.startTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-zinc-600" />
                  <span>Duration: {contest.duration} Hours</span>
                </div>
              </div>
            </div>

            {/* Banner Timer / Register Button */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-4 min-w-[260px]">
              {countdown && (
                <div className="rounded-xl bg-[#080a15] border border-zinc-800 px-4 py-3 text-center sm:text-left flex-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">{countdown.label}</p>
                  <p className="mt-0.5 text-lg font-mono font-bold text-yellow-500">{countdown.time || "Ended"}</p>
                </div>
              )}

              {/* Registration Actions */}
              <div className="flex-1 flex flex-col justify-center">
                {contest.status === "ended" ? (
                  <div className="w-full text-center text-xs font-bold text-zinc-500 uppercase tracking-wider py-2 bg-zinc-800/10 rounded-lg border border-zinc-800">
                    Contest Ended
                  </div>
                ) : isRegistered ? (
                  contest.status === "upcoming" ? (
                    <button
                      onClick={handleUnregister}
                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                    >
                      Unregister
                    </button>
                  ) : (
                    <div className="w-full text-center text-xs font-bold text-green-400 uppercase tracking-wider py-2.5 bg-green-500/10 rounded-xl border border-green-500/20">
                      Successfully Joined
                    </div>
                  )
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
                  >
                    {registering ? "Registering..." : "Register Now"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 mb-6 overflow-x-auto gap-2">
          {["overview", "problems", "leaderboard", "submissions", "participants"].map((tab) => {
            const isTabDisabled = (tab === "problems" || tab === "leaderboard" || tab === "submissions") && !isRegistered && contest.status !== "ended";
            return (
              <button
                key={tab}
                onClick={() => {
                  if (isTabDisabled) {
                    alert("Please register to access contest problems, submissions, and live leaderboard standings!");
                    return;
                  }
                  setActiveTab(tab);
                }}
                disabled={isTabDisabled}
                className={`px-5 py-3 text-sm font-semibold uppercase tracking-wider transition-all border-b-2 outline-none relative whitespace-nowrap ${
                  activeTab === tab
                    ? "border-yellow-500 text-yellow-500 font-bold"
                    : "border-transparent text-zinc-400 hover:text-white"
                } ${isTabDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-1.5">
                  {tab === "overview" && <BookOpen className="h-4 w-4" />}
                  {tab === "problems" && <FileCode className="h-4 w-4" />}
                  {tab === "leaderboard" && <Trophy className="h-4 w-4" />}
                  {tab === "submissions" && <Users className="h-4 w-4" />}
                  {tab === "participants" && <Users className="h-4 w-4" />}
                  <span>{tab}</span>
                  {isTabDisabled && <Lock className="h-3 w-3 inline text-zinc-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="bg-[#0f111e]/40 rounded-2xl border border-zinc-800 p-6 shadow-xl backdrop-blur">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-3">About this Contest</h2>
                  <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {contest.description || "No description provided for this contest. Get ready to test your coding expertise against top programmers."}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#080a15] rounded-xl p-4 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Total Duration</p>
                    <p className="mt-1 text-lg font-bold text-zinc-200">{contest.duration || 0} hours</p>
                  </div>
                  <div className="bg-[#080a15] rounded-xl p-4 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Visibility</p>
                    <p className="mt-1 text-lg font-bold text-zinc-200 capitalize">{contest.visibility || "public"}</p>
                  </div>
                  <div className="bg-[#080a15] rounded-xl p-4 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Status</p>
                    <p className="mt-1 text-lg font-bold text-zinc-200">{getStatusText(contest.status)}</p>
                  </div>
                </div>
              </div>

              {/* Overview Sidebar Stats / Instructions */}
              <aside className="space-y-6">
                {isRegistered && myRank && myRank.rank !== null && (
                  <div className="bg-[#080a15] rounded-xl p-5 border border-yellow-500/20 shadow-lg">
                    <h3 className="font-bold text-yellow-500 text-sm mb-3 flex items-center gap-2">
                      <Award className="h-4.5 w-4.5" />
                      <span>My Placement</span>
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-400">Current Rank</span>
                      <span className="text-xl font-extrabold font-mono text-white">#{myRank.rank || myRank}</span>
                    </div>
                  </div>
                )}

                <div className="bg-[#080a15] rounded-xl p-5 border border-zinc-800">
                  <h3 className="font-bold text-white text-sm mb-3">Arena Rules</h3>
                  <ul className="text-xs text-zinc-400 list-disc list-inside space-y-2 leading-relaxed">
                    <li>Submission queues are active during the competition timer.</li>
                    <li>Solutions will be judged against hidden automated test cases.</li>
                    <li>Final scores are determined by correctness and run performance.</li>
                  </ul>
                </div>
              </aside>
            </div>
          )}

          {/* PROBLEMS TAB */}
          {activeTab === "problems" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Contest Problem List</h2>
              {contest.status === "upcoming" ? (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-12 text-center">
                  <Lock className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-blue-400 mb-2">Problems Hidden</h3>
                  <p className="text-sm text-zinc-400">
                    Contest problems will be available when the contest starts. Check back at {formatDate(contest.startTime)}!
                  </p>
                </div>
              ) : problemsLoading ? (
                <div className="text-center py-8 text-sm text-zinc-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4" />
                  Loading contest problems...
                </div>
              ) : contestProblems.length ? (
                <div className="grid gap-3">
                  {contestProblems.map((contestProblem, idx) => {
                    const problem = contestProblem.problemId || contestProblem;
                    const letterCode = contestProblem.problemCode || String.fromCharCode(65 + idx);
                    return (
                      <button
                        key={contestProblem._id}
                        onClick={() => navigate(`/contest/${id}/problem/${problem.slug}`)}
                        className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-[#080a15] p-5 text-left transition hover:border-yellow-500/30 hover:bg-[#0c0e20] shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 rounded-lg bg-zinc-800 text-zinc-300 font-bold font-mono text-sm flex items-center justify-center border border-zinc-700/30 group-hover:bg-yellow-500/10 group-hover:text-yellow-500 group-hover:border-yellow-500/20 transition-colors">
                            {letterCode}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-200 group-hover:text-white transition-colors">{problem.title}</p>
                            <p className="mt-1 text-xs capitalize text-zinc-500 font-semibold">{problem.difficulty}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-yellow-500 font-bold bg-yellow-500/5 border border-yellow-500/10 px-3 py-1 rounded-full">
                            {contestProblem.points || 10} pts
                          </span>
                          <ChevronRight className="h-4.5 w-4.5 text-zinc-600 group-hover:text-yellow-500 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">
                  No problems have been added to this contest yet.
                </div>
              )}
            </div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === "leaderboard" && (
            <Leaderboard contestId={id} isEnded={contest.status === "ended"} />
          )}

          {/* SUBMISSIONS TAB */}
          {activeTab === "submissions" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">My Contest Submissions</h2>
              
              {submissionsLoading ? (
                <div className="text-center py-8 text-sm text-zinc-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4" />
                  Loading submission history...
                </div>
              ) : submissions.length ? (
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#080a15]">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/20 text-zinc-400 font-semibold text-xs uppercase">
                        <th className="px-4 py-3">Problem</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Language</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Submitted At</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {submissions.map((sub) => (
                        <tr key={sub._id} className="hover:bg-zinc-800/10">
                          <td className="px-4 py-3.5 font-bold text-zinc-200">
                            {sub.problemId?.title || "Problem"}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[sub.status?.toLowerCase()] || "text-zinc-300"}`}>
                              {formatStatus(sub.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-zinc-400 text-xs">
                            {sub.language}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-300 font-semibold">
                            {sub.accepted ? contestProblems.find(cp => cp.problemId?._id?.toString() === sub.problemId?._id?.toString())?.points || 10 : 0}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-500 text-xs font-mono">
                            {new Date(sub.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => handleViewSubmission(sub._id)}
                              className="text-xs text-yellow-500 hover:text-yellow-400 font-semibold border border-yellow-500/20 hover:border-yellow-500/50 bg-yellow-500/5 px-3 py-1 rounded-lg transition"
                            >
                              View Code
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">
                  You haven't submitted any solutions for this contest yet.
                </div>
              )}

              {/* Submissions Pagination */}
              {!submissionsLoading && submissionsTotalPages > 1 && (
                <div className="mt-6 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSubmissionsPage((prev) => Math.max(1, prev - 1))}
                    disabled={submissionsPage === 1}
                    className="rounded-lg border border-zinc-800 bg-[#0f111e] px-3 py-2 text-zinc-300 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 font-bold"
                  >
                    Prev
                  </button>
                  <span className="text-zinc-500 font-mono">
                    Page {submissionsPage} of {submissionsTotalPages}
                  </span>
                  <button
                    onClick={() => setSubmissionsPage((prev) => Math.min(submissionsTotalPages, prev + 1))}
                    disabled={submissionsPage === submissionsTotalPages}
                    className="rounded-lg border border-zinc-800 bg-[#0f111e] px-3 py-2 text-zinc-300 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 font-bold"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Participants Tab */}
          {activeTab === "participants" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-zinc-400" />
                  <h3 className="text-lg font-bold text-white">Contest Participants</h3>
                  <span className="text-xs text-zinc-500 font-medium">
                    ({participants.length} participants)
                  </span>
                </div>
              </div>

              {participantsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-zinc-500">Loading participants...</div>
                </div>
              ) : participants.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#080a15]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/30 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                        <th className="px-6 py-3.5">#</th>
                        <th className="px-6 py-3.5">User</th>
                        <th className="px-6 py-3.5 text-center">Score</th>
                        <th className="px-6 py-3.5 text-center">Solved</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {participants.map((participant, index) => (
                        <tr key={participant._id || index} className="hover:bg-zinc-800/10">
                          <td className="px-6 py-4 text-zinc-400 font-mono">
                            {(participantsPage - 1) * 10 + index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 border border-zinc-600">
                                {(participant.userId?.userName || participant.userId?.email || `User ${participant.userId}`).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-zinc-200">
                                  {participant.userId?.userName || participant.userId?.email || `User ${participant.userId}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-bold text-green-400">
                              {participant.score || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-zinc-400">
                              {participant.solvedProblem?.length || 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">
                  No participants registered for this contest yet.
                </div>
              )}

              {/* Participants Pagination */}
              {!participantsLoading && participantsTotalPages > 1 && (
                <div className="mt-6 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setParticipantsPage((prev) => Math.max(1, prev - 1))}
                    disabled={participantsPage === 1}
                    className="rounded-lg border border-zinc-800 bg-[#0f111e] px-3 py-2 text-zinc-300 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 font-bold"
                  >
                    Prev
                  </button>
                  <span className="text-zinc-500 font-mono">
                    Page {participantsPage} of {participantsTotalPages}
                  </span>
                  <button
                    onClick={() => setParticipantsPage((prev) => Math.min(participantsTotalPages, prev + 1))}
                    disabled={participantsPage === participantsTotalPages}
                    className="rounded-lg border border-zinc-800 bg-[#0f111e] px-3 py-2 text-zinc-300 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 font-bold"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Code Details Modal */}
      {showCodeModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-w-3xl w-full max-h-[85vh] overflow-hidden rounded-2xl border border-zinc-800 bg-[#0f111e]">
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/40 px-5 py-4">
              <div>
                <h3 className="font-bold text-white text-base">
                  Submission Code Details
                </h3>
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
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[selectedSubmission.status] || "text-zinc-300"}`}>
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
    </div>
  );
};

export default Contest;

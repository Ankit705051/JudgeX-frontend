import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { contestAPI } from "../services/api";
import { Trophy, Clock, Search, Award, TrendingUp, Users, ArrowRight, Calendar, Sparkles } from "lucide-react";

const Contests = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ticks, setTicks] = useState(0);

  // Live countdown tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTicks((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await contestAPI.getAllContests({
          page: currentPage,
          limit: 20,
          title: searchQuery,
        });
        const payload = response.data.data || {};
        const list = Array.isArray(payload) ? payload : payload.contests || [];
        setContests(list);
        setTotalPages(response.data.pagination?.totalPages || payload.pagination?.totalPages || 1);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Unable to load contests.");
          setContests([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [currentPage, searchQuery, navigate]);

  const getCountdownString = (targetDate) => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return "Running";
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

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Find active or next upcoming contest for the Hero section
  const heroContest = contests.find(c => c.status === "running") || contests.find(c => c.status === "upcoming");

  const filteredContests = statusFilter
    ? contests.filter((contest) => contest.status === statusFilter)
    : contests;

  const runningOrUpcoming = filteredContests.filter(c => c.status === "running" || c.status === "upcoming");
  const endedContests = filteredContests.filter(c => c.status === "ended");

  return (
    <main className="min-h-screen bg-[#070913] text-zinc-100 font-sans selection:bg-yellow-500/30">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-yellow-500/5 blur-[120px]" />
      <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]" />

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-yellow-500 text-sm font-semibold tracking-wider uppercase">
              <Sparkles className="h-4 w-4" />
              <span>JudgeX Arena</span>
            </div>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Contests
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl">
              Challenge yourself, compete with programmers worldwide, raise your rating, and show your coding prowess.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search contests..."
                value={searchQuery}
                onChange={(event) => {
                  setCurrentPage(1);
                  setSearchQuery(event.target.value);
                }}
                className="w-full md:w-[260px] rounded-lg border border-zinc-800 bg-[#0f111e]/80 pl-9 pr-4 py-2 text-sm outline-none transition focus:border-yellow-500 focus:bg-[#121629]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-zinc-800 bg-[#0f111e]/80 px-3 py-2 text-sm outline-none transition focus:border-yellow-500 focus:bg-[#121629] text-zinc-300"
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="running">Running</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>

        {/* Hero Featured Contest Card */}
        {heroContest && !loading && (
          <section className="mb-10 overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-[#12162b]/80 via-[#0e1123]/90 to-[#080a15] p-6 shadow-2xl backdrop-blur relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy className="h-48 w-48 text-yellow-500" />
            </div>
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center relative z-10">
              <div className="space-y-4 max-w-3xl">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  heroContest.status === "running" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${heroContest.status === "running" ? "bg-emerald-500 animate-ping" : "bg-blue-500"}`} />
                  {heroContest.status === "running" ? "Live Now" : "Upcoming Contest"}
                </span>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{heroContest.title}</h2>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed line-clamp-3">
                  {heroContest.description || "Compete with peers in solving multiple problems in limited time! Register now to test your logic skills."}
                </p>
                
                <div className="flex flex-wrap gap-6 text-sm text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-yellow-500" />
                    <span>Starts: {formatDate(heroContest.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span>Duration: {heroContest.duration || 2} Hours</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end justify-center min-w-[240px] space-y-4">
                <div className="rounded-xl bg-[#070914] border border-zinc-800 p-4 w-full text-center lg:text-right">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">
                    {heroContest.status === "running" ? "Contest Ends In" : "Starts In"}
                  </p>
                  <p className="mt-1 text-2xl font-mono font-bold text-yellow-500">
                    {getCountdownString(heroContest.status === "running" ? heroContest.endTime : heroContest.startTime)}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/contest/${heroContest._id}`)}
                  className="w-full py-3 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 transition shadow-lg hover:shadow-yellow-500/25 flex items-center justify-center gap-2"
                >
                  <span>Enter Arena</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Content Layout: Main + Sidebar */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          
          {/* Main Contest Grid */}
          <div className="space-y-8">
            {loading ? (
              <div className="rounded-xl border border-zinc-800 bg-[#0f111e]/50 p-12 text-center text-sm text-zinc-400 backdrop-blur">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4" />
                Retrieving active contests...
              </div>
            ) : error ? (
              <div className="rounded-xl border border-zinc-800 bg-[#0f111e]/50 p-10 text-center backdrop-blur">
                <p className="font-semibold text-red-400">Contests could not be loaded</p>
                <p className="mt-2 text-sm text-zinc-500">{error}</p>
              </div>
            ) : filteredContests.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-[#0f111e]/50 p-12 text-center text-sm text-zinc-500 backdrop-blur">
                No contests match your query or filters.
              </div>
            ) : (
              <>
                {/* Active and Upcoming contests list */}
                {runningOrUpcoming.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <span>Active & Upcoming Contests</span>
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {runningOrUpcoming.map((contest) => (
                        <article
                          key={contest._id}
                          onClick={() => navigate(`/contest/${contest._id}`)}
                          className="group cursor-pointer rounded-xl border border-zinc-800 bg-[#0f111e]/60 p-5 transition-all hover:border-zinc-700 hover:bg-[#12162c] shadow-lg backdrop-blur flex flex-col justify-between"
                        >
                          <div>
                            <div className="mb-3 flex items-center justify-between">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                                contest.status === "running" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                              }`}>
                                {contest.status}
                              </span>
                              <span className="text-xs font-mono text-yellow-500 font-medium">
                                {getCountdownString(contest.status === "running" ? contest.endTime : contest.startTime)}
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">{contest.title}</h4>
                            <p className="mt-2 line-clamp-2 text-xs text-zinc-500 leading-normal">
                              {contest.description || "Join this contest to test your competitive programming skills."}
                            </p>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                            <div className="rounded bg-[#080a15] p-2">
                              <p className="text-zinc-600 font-semibold uppercase">Starts</p>
                              <p className="mt-1 font-mono">{formatDate(contest.startTime)}</p>
                            </div>
                            <div className="rounded bg-[#080a15] p-2">
                              <p className="text-zinc-600 font-semibold uppercase">Duration</p>
                              <p className="mt-1 font-mono">{contest.duration || 2} hrs</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Contests Section */}
                <div>
                  <h3 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span>Past Contests</span>
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {endedContests.length > 0 ? (
                      endedContests.map((contest) => (
                        <article
                          key={contest._id}
                          onClick={() => navigate(`/contest/${contest._id}`)}
                          className="group cursor-pointer rounded-xl border border-zinc-800 bg-[#0f111e]/40 p-5 transition hover:border-zinc-700 hover:bg-[#12162c]/50 backdrop-blur"
                        >
                          <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">{contest.title}</h4>
                              <p className="mt-1 line-clamp-2 text-xs text-zinc-500 leading-normal">
                                {contest.description}
                              </p>
                            </div>
                            <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-400 font-medium">
                              Ended
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-900 pt-3">
                            <span>Ended: {formatDate(contest.endTime)}</span>
                            <span className="text-yellow-500 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Results</span>
                              <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="col-span-full rounded-xl border border-zinc-800 p-8 text-center text-xs text-zinc-500">
                        No past contests found.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between text-sm">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-zinc-800 bg-[#0f111e] px-4 py-2 text-zinc-300 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-zinc-500 font-mono">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-zinc-800 bg-[#0f111e] px-4 py-2 text-zinc-300 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Contest Profile Widget */}
            <section className="rounded-xl border border-zinc-800 bg-[#0f111e]/80 p-5 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                <div className="h-10 w-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-lg border border-yellow-500/10">
                  JX
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">My Contest Stats</h4>
                  <p className="text-[10px] text-zinc-500">Global contest rating</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <TrendingUp className="h-4.5 w-4.5 text-yellow-500" />
                    <span>Contest Rating</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-white">1500</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Award className="h-4.5 w-4.5 text-yellow-500" />
                    <span>Global Rank</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-zinc-300">--</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Users className="h-4.5 w-4.5 text-yellow-500" />
                    <span>Contests Attended</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-zinc-300">0</span>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-center text-xs text-yellow-400/90 leading-normal">
                Compete in a rated contest to activate rating updates, unlock contest achievements, and climb up the leaderboard!
              </div>
            </section>

            {/* Rules Widget */}
            <section className="rounded-xl border border-zinc-800 bg-[#0f111e]/40 p-5 backdrop-blur">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <span>Contest Rules & Info</span>
              </h4>
              <ul className="space-y-3 text-xs text-zinc-400 list-disc list-inside leading-relaxed">
                <li>Make sure to register before the contest begins to compete.</li>
                <li>Penalty of 5 minutes is added for every wrong submission.</li>
                <li>Cheat-prevention triggers are active. Accessing editorial during contest is locked.</li>
                <li>Standings are updated dynamically based on points and solve time.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Contests;

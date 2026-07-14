import { useEffect, useState } from "react";
import { contestParticipantAPI } from "../services/api";
import { Trophy, Clock, Award, Users, ChevronLeft, ChevronRight } from "lucide-react";

const Leaderboard = ({ contestId, isEnded }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    if (!contestId) return;
    fetchStandings();
  }, [contestId, currentPage]);

  const fetchStandings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await contestParticipantAPI.getLeaderboard(contestId, {
        page: currentPage,
        limit: 10,
      });
      const payload = response.data.data || {};
      const list = payload.leaderboard || [];
      setLeaderboard(list);
      setTotalParticipants(payload.pagination?.totalParticipants || 0);
      setTotalPages(payload.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leaderboard standings.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-[#080a15] p-12 text-center text-sm text-zinc-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4" />
        Retrieving rankings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <p className="text-sm text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-[#080a15] p-10 text-center text-sm text-zinc-500">
        {isEnded ? "No participants in this contest." : "No participants have earned points yet. Standings will populate as solutions are submitted!"}
      </div>
    );
  }

  const getRankColor = (rank) => {
    if (rank === 1) return "text-yellow-400 font-extrabold";
    if (rank === 2) return "text-zinc-300 font-bold";
    if (rank === 3) return "text-amber-600 font-bold";
    return "text-zinc-400 font-medium";
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getRankBackground = (rank) => {
    if (rank === 1) return "bg-yellow-500/10 border-yellow-500/20";
    if (rank === 2) return "bg-zinc-500/10 border-zinc-500/20";
    if (rank === 3) return "bg-amber-500/10 border-amber-500/20";
    return "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-white">Contest Leaderboard</h3>
          <span className="text-xs text-zinc-500 font-medium">
            ({totalParticipants} participants)
          </span>
        </div>
        {!isEnded && (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-[#080a15] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/30 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-3.5 text-center w-20">Rank</th>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5 text-center">Score</th>
                <th className="px-6 py-3.5 text-center">Solved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {leaderboard.map((entry, index) => {
                const rankNum = entry.rank || (currentPage - 1) * 10 + index + 1;
                return (
                  <tr
                    key={entry.userId || index}
                    className={`hover:bg-zinc-800/10 ${getRankBackground(rankNum)}`}
                  >
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg font-bold ${getRankColor(rankNum)}`}>
                        {getRankBadge(rankNum)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 border border-zinc-600">
                          {(entry.username || entry.email || `User ${entry.userId}`).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-200">
                            {entry.username || entry.email || `User ${entry.userId}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-green-400">
                        {entry.score || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-zinc-400">
                        {entry.solvedProblems || 0}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs pt-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-zinc-800 bg-[#0f111e] px-3 py-2 text-zinc-300 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 font-bold flex items-center gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </button>
          <span className="text-zinc-500 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-zinc-800 bg-[#0f111e] px-3 py-2 text-zinc-300 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 font-bold flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

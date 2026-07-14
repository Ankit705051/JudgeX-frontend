import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.context.jsx";

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
    setLoading(false);
  }, [user, navigate]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] text-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-12">
            <div className="text-zinc-500">Loading...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="min-h-screen bg-[#0f0f0f] text-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-12">
            <div className="text-zinc-500">Access Denied</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-zinc-400 mb-8">Manage problems, test cases, and platform content.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/admin/problems")}
            className="bg-[#171717] rounded-lg p-6 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-600">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold">Problem Management</h3>
            </div>
            <p className="text-zinc-400 text-sm">
              Create, update, and delete coding problems. Manage problem details, examples, and constraints.
            </p>
          </div>

          <div
            onClick={() => navigate("/admin/testcases")}
            className="bg-[#171717] rounded-lg p-6 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-green-600">
                <span className="text-2xl">🧪</span>
              </div>
              <h3 className="text-xl font-semibold">Test Case Management</h3>
            </div>
            <p className="text-zinc-400 text-sm">
              Add and manage test cases for problems. Create hidden and visible test cases for judging.
            </p>
          </div>

          <div
            onClick={() => navigate("/admin/contests")}
            className="bg-[#171717] rounded-lg p-6 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-purple-600">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold">Contest Management</h3>
            </div>
            <p className="text-zinc-400 text-sm">
              Create and manage coding contests. Set start/end times and visibility settings.
            </p>
          </div>

          <div
            onClick={() => navigate("/admin/create")}
            className="bg-[#171717] rounded-lg p-6 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-yellow-600">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-semibold">Create Admin</h3>
            </div>
            <p className="text-zinc-400 text-sm">
              Create new administrator accounts with full system access. Only for trusted personnel.
            </p>
          </div>

          <div
            onClick={() => navigate("/admin/users")}
            className="bg-[#171717] rounded-lg p-6 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-indigo-600">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold">User Management</h3>
            </div>
            <p className="text-zinc-400 text-sm">
              Manage all users and admins. Activate/deactivate accounts and oversee platform access.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Admin;

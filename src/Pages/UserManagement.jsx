import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuthApi } from "../services/api";
import { useAuth } from "../context/auth.context.jsx";
import { Shield, User, CheckCircle, XCircle, ArrowLeft, Search } from "lucide-react";

const UserManagement = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAuthApi.getAllUsers();
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    setActionLoading(userId);
    try {
      await adminAuthApi.deactivateUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error("Error deactivating user:", error);
      alert("Failed to deactivate user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (userId) => {
    setActionLoading(userId);
    try {
      await adminAuthApi.activateUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error("Error activating user:", error);
      alert("Failed to activate user");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] text-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-12">
            <div className="text-zinc-500">Loading users...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>

        <p className="text-zinc-400 mb-8">
          Manage user accounts, activate/deactivate users, and oversee platform access.
        </p>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#171717] pl-10 pr-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-[#171717] rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1a1a1a] border-b border-zinc-800">
              <tr className="text-left text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 border border-zinc-600">
                        {(user.name || user.userName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-200">{user.name || user.userName}</div>
                        <div className="text-sm text-zinc-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                          <User className="h-3 w-3" />
                          User
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {user._id !== currentUser?._id && (
                      <div className="flex items-center gap-2">
                        {user.isActive ? (
                          <button
                            onClick={() => handleDeactivate(user._id)}
                            disabled={actionLoading === user._id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === user._id ? '...' : 'Deactivate'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user._id)}
                            disabled={actionLoading === user._id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === user._id ? '...' : 'Activate'}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              No users found matching your search.
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-xs text-blue-400">
            <strong>Note:</strong> You cannot deactivate your own account. Admin accounts have full system access and should be managed carefully.
          </p>
        </div>
      </div>
    </main>
  );
};

export default UserManagement;

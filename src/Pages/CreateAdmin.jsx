import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuthApi } from "../services/api";
import { User, Mail, Lock, Shield, ArrowLeft } from "lucide-react";

const CreateAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await adminAuthApi.createAdmin(formData);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create admin. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full mx-6">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-black" />
          </div>
          <h1 className="text-2xl font-bold">Create New Admin</h1>
        </div>

        <p className="text-gray-400 mb-8">
          Create a new administrator account with full system access
        </p>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                className="w-full rounded-lg border border-gray-700 bg-[#0A0F1C] pl-10 pr-4 py-3 text-white outline-none transition focus:border-yellow-500"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                id="userName"
                name="userName"
                type="text"
                value={formData.userName}
                onChange={handleChange}
                required
                autoComplete="username"
                className="w-full rounded-lg border border-gray-700 bg-[#0A0F1C] pl-10 pr-4 py-3 text-white outline-none transition focus:border-yellow-500"
                placeholder="johndoe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-gray-700 bg-[#0A0F1C] pl-10 pr-4 py-3 text-white outline-none transition focus:border-yellow-500"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-700 bg-[#0A0F1C] pl-10 pr-4 py-3 text-white outline-none transition focus:border-yellow-500"
                placeholder="••••••••"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Must be at least 8 characters with uppercase, lowercase, number and special character
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-yellow-500 px-4 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating Admin..." : "Create Admin"}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-xs text-yellow-400">
            <strong>Note:</strong> The new admin will have full access to all administrative functions. 
            Only create admin accounts for trusted personnel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;

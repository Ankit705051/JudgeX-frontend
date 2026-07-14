import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.context.jsx";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/problems");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full mx-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>
        <p className="text-gray-400 text-center mb-8">Join JudgeX and start solving problems</p>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              className="w-full rounded-lg border border-gray-700 bg-[#0A0F1C] px-4 py-3 text-white outline-none transition focus:border-yellow-500"
              placeholder="Ankit Kumar"
            />
          </div>

          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              value={formData.userName}
              onChange={handleChange}
              required
              autoComplete="username"
              className="w-full rounded-lg border border-gray-700 bg-[#0A0F1C] px-4 py-3 text-white outline-none transition focus:border-yellow-500"
              placeholder="ankit_01"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-700 bg-[#0A0F1C] px-4 py-3 text-white outline-none transition focus:border-yellow-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-700 bg-[#0A0F1C] px-4 py-3 pr-12 text-white outline-none transition focus:border-yellow-500"
                placeholder="Use uppercase, number and special character"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-yellow-500 px-4 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-yellow-400 hover:text-yellow-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

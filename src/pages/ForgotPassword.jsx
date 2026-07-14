import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [emailSent, setEmailSent] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await authAPI.forgotPassword({ email });
      setEmailSent(true);
      showMessage("success", "Password reset link has been sent to your email");
    } catch (error) {
      console.error("Error sending reset email:", error);
      showMessage("error", error.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full mx-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-zinc-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2 text-center">Forgot Password</h1>
        <p className="text-gray-400 text-center mb-8">
          {emailSent 
            ? "Check your email for the reset link"
            : "Enter your email to receive a password reset link"
          }
        </p>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 rounded-lg p-4 ${
            message.type === "success" 
              ? "bg-green-500/10 border border-green-500/20 text-green-400" 
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}>
            <div className="flex items-center gap-2">
              {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-700 bg-[#0A0F1C] pl-10 pr-4 py-3 text-white outline-none transition focus:border-yellow-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-yellow-500 px-4 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Email Sent!</h3>
            <p className="text-gray-400 text-sm mb-6">
              We've sent a password reset link to <span className="text-yellow-400 font-medium">{email}</span>. 
              The link will expire in 10 minutes.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setEmailSent(false)}
                className="w-full rounded-lg border border-gray-700 px-4 py-3 font-medium text-gray-300 transition hover:border-gray-600 hover:text-white"
              >
                Try Different Email
              </button>
              <Link
                to="/login"
                className="block w-full rounded-lg bg-yellow-500 px-4 py-3 font-semibold text-black transition hover:bg-yellow-400 text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-400">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-yellow-400 hover:text-yellow-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

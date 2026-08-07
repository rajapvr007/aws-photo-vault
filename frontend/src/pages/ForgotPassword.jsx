import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPassword } from "../api/authApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await forgotPassword({ email });
      toast.success("OTP sent to your email.");
     navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121009] px-4">
      <div className="bg-[#1C1812] border border-[#2A2418] rounded-xl p-6 sm:p-8 w-full max-w-md">

        {/* Logo mark */}
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-lg bg-[#121009] border border-[#3A3222] flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <polygon
                  key={deg}
                  points="16,4 22,16 16,16"
                  fill="#E8A94A"
                  opacity="0.85"
                  transform={`rotate(${deg} 16 16)`}
                />
              ))}
              <circle cx="16" cy="16" r="4" fill="#121009" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#F3ECDD] tracking-wide">
          Forgot password
        </h1>
        <p className="text-sm font-mono text-[#9C9284] text-center mt-2 mb-8">
          Enter your registered email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono tracking-widest text-[#9C9284] uppercase mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-[#121009] border border-[#3A3222] text-[#F3ECDD] placeholder-[#5C5648] rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-[#E8A94A] focus:ring-1 focus:ring-[#E8A94A]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full bg-[#E8A94A] text-[#121009] font-semibold py-3 rounded-lg transition-colors hover:bg-[#C98A2C] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-[#E8A94A] hover:text-[#F3ECDD] transition-colors"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
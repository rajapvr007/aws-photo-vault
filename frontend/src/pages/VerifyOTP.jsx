import { useState } from "react";
import { useLocation, useNavigate, Link ,useSearchParams } from "react-router-dom";
import { confirmSignup } from "../api/authApi";
import toast from "react-hot-toast";
export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await confirmSignup({
        email,
        code: otp,
      });

      toast.success("Account verified successfully!");

      navigate("/");

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121009] flex justify-center items-center px-4">

      <div className="w-full max-w-md bg-[#1C1812] border border-[#2A2418] rounded-xl p-6 sm:p-8">

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
          Verify OTP
        </h1>

        <p className="text-sm font-mono text-[#9C9284] text-center mt-2 mb-1">
          Verification code sent to
        </p>

        <p className="text-center font-semibold text-[#E8A94A] mb-8 truncate">
          {email}
        </p>

        <form onSubmit={handleVerify} className="space-y-5">

          <div>
            <label className="block text-xs font-mono tracking-widest text-[#9C9284] uppercase mb-2 text-center">
              6-digit code
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-[#121009] border border-[#3A3222] text-[#F3ECDD] placeholder-[#3A3222] rounded-lg px-4 py-3.5 mt-1 outline-none transition-colors focus:border-[#E8A94A] focus:ring-1 focus:ring-[#E8A94A] text-center font-mono text-2xl tracking-[0.5em]"
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
            {loading ? "Verifying..." : "Verify Account"}
          </button>

        </form>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-[#E8A94A] hover:text-[#F3ECDD] transition-colors"
          >
            ← Back to Login
          </Link>
        </div>

      </div>

    </div>
  );
}
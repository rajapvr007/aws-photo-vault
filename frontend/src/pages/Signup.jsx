import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/authApi";
import toast from "react-hot-toast";
export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await signup({
        email: form.email,
        password: form.password,
      });

      toast.success("Signup successful! Check your email for OTP.");

    navigate(`/verify?email=${encodeURIComponent(form.email)}`);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed"
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

        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#F3ECDD] tracking-wide mb-1">
          Photo Vault
        </h1>

        <p className="text-sm font-mono text-[#9C9284] text-center mb-8">
          Create your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-xs font-mono tracking-widest text-[#9C9284] uppercase mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full bg-[#121009] border border-[#3A3222] text-[#F3ECDD] placeholder-[#5C5648] rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-[#E8A94A] focus:ring-1 focus:ring-[#E8A94A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-widest text-[#9C9284] uppercase mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-[#121009] border border-[#3A3222] text-[#F3ECDD] placeholder-[#5C5648] rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-[#E8A94A] focus:ring-1 focus:ring-[#E8A94A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-widest text-[#9C9284] uppercase mb-1.5">
              Confirm password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-[#121009] border border-[#3A3222] text-[#F3ECDD] placeholder-[#5C5648] rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-[#E8A94A] focus:ring-1 focus:ring-[#E8A94A]"
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
            {loading ? "Creating..." : "Create Account"}
          </button>

        </form>

        <p className="text-center mt-6 text-sm text-[#9C9284]">
          Already have an account?
          <Link
            to="/"
            className="text-[#E8A94A] ml-2 font-medium hover:text-[#F3ECDD] transition-colors"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}
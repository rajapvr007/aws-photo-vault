// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// import { login as loginApi, getMe } from "../api/authApi";
// import { useAuth } from "../context/AuthContext";
// import toast from "react-hot-toast";
// export default function Login() {
//   const navigate = useNavigate();

//   const { login, setUser } = useAuth();

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);

//       // Login
//       const response = await loginApi(form);
//       console.log("Login Response:", response.data);
//       const {
//         accessToken,
//         idToken,
//         refreshToken,
//       } = response.data;

//       // Save tokens in AuthContext
//       login({
//         accessToken,
//         idToken,
//         refreshToken,
//       });
// console.log("Calling /auth/me...");
//       // Fetch logged-in user
//       const me = await getMe(accessToken);
// console.log("Me Response:", me.data);

//       setUser(me.data.user);

//       toast.success("Login successful");
// console.log("User stored in context");
//       navigate("/dashboard");

//     } catch (error) {
//       toast.error(
//         error.response?.data?.message || "Login Failed"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#121009] flex items-center justify-center px-4">

//       <div className="bg-[#1C1812] border border-[#2A2418] rounded-xl p-6 sm:p-8 w-full max-w-md">

//         {/* Logo mark */}
//         <div className="flex justify-center mb-5">
//           <div className="w-12 h-12 rounded-lg bg-[#121009] border border-[#3A3222] flex items-center justify-center">
//             <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
//               {[0, 60, 120, 180, 240, 300].map((deg) => (
//                 <polygon
//                   key={deg}
//                   points="16,4 22,16 16,16"
//                   fill="#E8A94A"
//                   opacity="0.85"
//                   transform={`rotate(${deg} 16 16)`}
//                 />
//               ))}
//               <circle cx="16" cy="16" r="4" fill="#121009" />
//             </svg>
//           </div>
//         </div>

//         <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#F3ECDD] tracking-wide">
//           Photo Vault
//         </h1>

//         <p className="text-center text-sm font-mono text-[#9C9284] mb-8 mt-1">
//           Login to your account
//         </p>

//         <form onSubmit={handleSubmit} className="space-y-5">

//           <div>
//             <label className="block text-xs font-mono tracking-widest text-[#9C9284] uppercase mb-1.5">
//               Email
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               placeholder="name@example.com"
//               className="w-full bg-[#121009] border border-[#3A3222] text-[#F3ECDD] placeholder-[#5C5648] rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-[#E8A94A] focus:ring-1 focus:ring-[#E8A94A]"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-mono tracking-widest text-[#9C9284] uppercase mb-1.5">
//               Password
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={form.password}
//               onChange={handleChange}
//               placeholder="••••••••"
//               className="w-full bg-[#121009] border border-[#3A3222] text-[#F3ECDD] placeholder-[#5C5648] rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-[#E8A94A] focus:ring-1 focus:ring-[#E8A94A]"
//               required
//             />
//           </div>

//           <button
//             disabled={loading}
//             className="w-full bg-[#E8A94A] text-[#121009] font-semibold py-3 rounded-lg transition-colors hover:bg-[#C98A2C] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           >
//             {loading && (
//               <svg
//                 className="w-4 h-4 animate-spin"
//                 viewBox="0 0 24 24"
//                 fill="none"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 />
//                 <path
//                   className="opacity-90"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                 />
//               </svg>
//             )}
//             {loading ? "Logging in..." : "Login"}
//           </button>

//         </form>

//         <p className="text-center mt-6 text-sm text-[#9C9284]">
//           Don't have an account?
//           <Link
//             to="/signup"
//             className="text-[#E8A94A] ml-2 font-medium hover:text-[#F3ECDD] transition-colors"
//           >
//             Sign Up
//           </Link>
//         </p>

//       </div>

//     </div>
//   );
// }
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login as loginApi, getMe } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
export default function Login() {
  const navigate = useNavigate();

  const { login, setUser } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
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

    try {
      setLoading(true);

      // Login
      const response = await loginApi(form);
      console.log("Login Response:", response.data);
      const {
        accessToken,
        idToken,
        refreshToken,
      } = response.data;

      // Save tokens in AuthContext
      login({
        accessToken,
        idToken,
        refreshToken,
      });
console.log("Calling /auth/me...");
      // Fetch logged-in user
      const me = await getMe(accessToken);
console.log("Me Response:", me.data);

      setUser(me.data.user);

      toast.success("Login successful");
console.log("User stored in context");
      navigate("/dashboard");

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121009] flex items-center justify-center px-4">

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
          Photo Vault
        </h1>

        <p className="text-center text-sm font-mono text-[#9C9284] mb-8 mt-1">
          Login to your account
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono tracking-widest text-[#9C9284] uppercase">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#E8A94A] hover:text-[#F3ECDD] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
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

          <button
            disabled={loading}
            className="w-full bg-[#E8A94A] text-[#121009] font-semibold py-3 rounded-lg transition-colors hover:bg-[#C98A2C] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
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
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center mt-6 text-sm text-[#9C9284]">
          Don't have an account?
          <Link
            to="/signup"
            className="text-[#E8A94A] ml-2 font-medium hover:text-[#F3ECDD] transition-colors"
          >
            Sign Up
          </Link>
        </p>

      </div>

    </div>
  );
}
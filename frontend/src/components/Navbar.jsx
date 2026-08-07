import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initial = user?.email?.charAt(0)?.toUpperCase() || "?";

  return (
    <nav className="sticky top-0 z-50 bg-[#121009]/90 backdrop-blur-md border-b border-[#2A2418]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3">

        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Aperture / vault-dial mark */}
          <div className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#1C1812] border border-[#3A3222] flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-6 sm:h-6" fill="none">
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

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold tracking-[0.15em] uppercase text-[#F3ECDD] truncate">
              Photo Vault
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#9C9284] uppercase">
                Secured
              </span>
            </div>
          </div>
        </div>

        {/* User + actions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

          {/* User pill */}
          <div className="hidden sm:flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-[#1C1812] border border-[#2A2418] max-w-[220px]">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E8A94A] text-[#121009] text-xs font-bold flex items-center justify-center">
              {initial}
            </span>
            <span className="text-xs font-mono text-[#C9BFA8] truncate">
              {user?.email}
            </span>
          </div>

          {/* Mobile avatar only */}
          <span className="sm:hidden flex-shrink-0 w-8 h-8 rounded-full bg-[#E8A94A] text-[#121009] text-sm font-bold flex items-center justify-center">
            {initial}
          </span>

          <button
            onClick={handleLogout}
            className="group flex items-center gap-1.5 border border-[#3A3222] text-[#F3ECDD] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#E8A94A] hover:text-[#121009] hover:border-[#E8A94A]"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>

      </div>
    </nav>
  );
}
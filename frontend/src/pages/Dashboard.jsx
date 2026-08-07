import { useState } from "react";

import Navbar from "../components/Navbar";
import UploadCard from "../components/UploadCard";
import Gallery from "../components/Gallery";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [refreshGallery, setRefreshGallery] = useState(false);

  const handleUploadSuccess = () => {
    setRefreshGallery((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#121009]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Welcome header */}
        <div className="mb-8 sm:mb-10">
          <span className="text-[10px] font-mono tracking-widest text-[#9C9284] uppercase">
            Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3ECDD] mt-1">
            Welcome back <span className="inline-block">👋</span>
          </h1>
          <p className="text-sm font-mono text-[#9C9284] mt-1.5 truncate">
            {user?.email}
          </p>
        </div>

        {/* Upload panel */}
        <section className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-4 bg-[#E8A94A] rounded-full"></span>
            <h2 className="text-xs font-mono tracking-widest text-[#9C9284] uppercase">
              Upload New Image
            </h2>
          </div>
          <div className="rounded-xl border border-[#2A2418] bg-[#1C1812] p-4 sm:p-6">
            <UploadCard onUploadSuccess={handleUploadSuccess} />
          </div>
        </section>

        {/* Gallery panel */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-4 bg-[#E8A94A] rounded-full"></span>
            <h2 className="text-xs font-mono tracking-widest text-[#9C9284] uppercase">
              My Gallery
            </h2>
          </div>
          <div className="rounded-xl border border-[#2A2418] bg-[#1C1812] p-4 sm:p-6">
            <Gallery refresh={refreshGallery} />
          </div>
        </section>

      </div>
    </div>
  );
}
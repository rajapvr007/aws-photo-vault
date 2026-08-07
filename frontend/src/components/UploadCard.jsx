import { useState } from "react";
import { uploadImage } from "../api/imageApi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
export default function UploadCard({ onUploadSuccess }) {
  const { accessToken } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setLoading(true);

      await uploadImage(formData, accessToken);

      toast.success("Image uploaded successfully!");

      setSelectedFile(null);

      // Clear file input
      document.getElementById("imageInput").value = "";

      // Notify Dashboard/Gallery
      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <label
        htmlFor="imageInput"
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#3A3222] rounded-lg py-10 px-4 cursor-pointer transition-colors hover:border-[#5C5648]"
      >
        <svg
          className="w-8 h-8 text-[#9C9284]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-sm text-[#F3ECDD] font-medium">
          Choose a file to upload
        </p>
        <p className="text-xs font-mono text-[#9C9284]">
          PNG, JPG, or other image formats
        </p>

        <input
          id="imageInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {selectedFile && (
        <div className="flex items-center gap-3 mt-4 bg-[#121009] border border-[#2A2418] rounded-lg px-4 py-3">
          <svg
            className="w-5 h-5 text-[#E8A94A] flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" />
            <path d="M13 3v5h5" />
          </svg>
          <p className="text-sm text-[#F3ECDD] truncate">
            {selectedFile.name}
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-5 bg-[#E8A94A] text-[#121009] font-semibold px-6 py-2.5 rounded-lg transition-colors hover:bg-[#C98A2C] disabled:bg-[#3A3222] disabled:text-[#9C9284] disabled:cursor-not-allowed flex items-center gap-2"
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
        {loading ? "Uploading..." : "Upload"}
      </button>

    </div>
  );
}
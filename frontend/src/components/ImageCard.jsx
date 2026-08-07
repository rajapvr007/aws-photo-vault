import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { deleteImage } from "../api/imageApi";

export default function ImageCard({ image, onDelete }) {
  const { accessToken } = useAuth();

  const [deleting, setDeleting] = useState(false);

  const performDelete = async () => {
    try {
      setDeleting(true);

      await deleteImage(image.id, accessToken);

      toast.success("Image deleted successfully.");

      if (onDelete) {
        onDelete();
      }

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete image."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();

    toast.custom(
      (t) => (
        <div
          className={`bg-[#1C1812] border border-[#2A2418] rounded-lg px-4 py-3 shadow-lg transition-opacity ${
            t.visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-sm text-[#F3ECDD]">
            Delete <span className="font-medium">{image.originalName || "this image"}</span>?
          </p>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-[#3A3222] text-[#9C9284] hover:text-[#F3ECDD] hover:border-[#5C5648] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                performDelete();
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-[#E24B4A] text-white hover:bg-[#C93E3D] transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  };

  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden border border-[#2A2418] bg-[#121009]">

      <img
        src={image.imageUrl}
        alt={image.originalName}
        className="w-full h-full object-cover transition-transform duration-300 sm:group-hover:scale-105"
      />

      <button
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`Delete ${image.originalName}`}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 border border-white/10 text-[#F3ECDD] flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:bg-[#E24B4A] hover:border-[#E24B4A] disabled:opacity-100 disabled:cursor-not-allowed"
      >
        {deleting ? (
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
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
        ) : (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        )}
      </button>

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 pointer-events-none">

        <p className="text-xs text-[#F3ECDD] font-medium break-all line-clamp-1">
          {image.originalName}
        </p>

        <p className="text-[10px] font-mono text-[#C9BFA8] mt-1">
          {new Date(image.uploadedAt).toLocaleString()}
        </p>

      </div>

    </div>
  );
}
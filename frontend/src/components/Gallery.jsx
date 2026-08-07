import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getImages } from "../api/imageApi";
import ImageCard from "./ImageCard";

export default function Gallery({ refresh }) {
  const { accessToken } = useAuth();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      const response = await getImages(accessToken);
      setImages(response.data.images);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchImages();
    }
  }, [refresh, accessToken]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-[#121009] border border-[#2A2418] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {images.length === 0 ? (
        <div className="border border-dashed border-[#3A3222] rounded-lg py-14 px-6 text-center">
          <svg
            className="w-10 h-10 text-[#5C5648] mx-auto mb-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="text-sm text-[#9C9284] font-mono">
            No images uploaded yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onDelete={fetchImages}
            />
          ))}
        </div>
      )}
    </div>
  );
}
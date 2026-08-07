import api from "./axios";

export const uploadImage = (formData, token) =>
  api.post("/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

export const getImages = (token) =>
  api.get("/images", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  export const deleteImage = (id, token) =>
  api.delete(`/images/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
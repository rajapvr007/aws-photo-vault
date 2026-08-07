import api from "./axios";

export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);

export const confirmSignup = (data) =>
  api.post("/auth/confirm", data);



export const getMe = (token) =>
  api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });export const forgotPassword = (data) =>
  api.post("/auth/forgot-password", data);

export const resetPassword = (data) =>
  api.post("/auth/reset-password", data);
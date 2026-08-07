import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
function App() {
  return (
    <BrowserRouter>
     <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1C1812",
            color: "#F3ECDD",
            border: "1px solid #2A2418",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#E8A94A", secondary: "#121009" } },
          error: { iconTheme: { primary: "#E24B4A", secondary: "#121009" } },
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={ <ProtectedRoute><Dashboard /></ProtectedRoute>   } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
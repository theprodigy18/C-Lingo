import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import CreateAccount from "./pages/CreateAccount";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import ResendVerificationEmail from "./pages/ResendVerificationEmail";
import VerifyEmail from "./pages/VerifyEmail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — auth pages */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/resend-verification-email"
          element={<ResendVerificationEmail />}
        />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected — ProtectedRoute is embedded inside Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

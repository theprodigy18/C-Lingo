import React from "react";
import { useRequireAuth } from "../../hooks/useRequireAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wrap any protected route with this component.
 * Redirects to /sign-in if token is missing or invalid.
 * Renders nothing while verifying to prevent UI flash.
 *
 * Usage in App.tsx:
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { checking } = useRequireAuth();

  if (checking) return null;

  return <>{children}</>;
}

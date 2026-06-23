import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Usage: <ProtectedRoute role="ADMIN"> ... </ProtectedRoute>
export function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ alignItems: "center", display: "flex", height: "100vh",
      justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Authenticating...</div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { token, role, studentId, rollNo, teacherId }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Rehydrate from localStorage on refresh
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch (_) {}
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res  = await api.post("/auth/login", { username, password });
    const data = res.data; // { token, role, studentId?, rollNo?, teacherId? }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);

    // Route by role
    switch (data.role) {
      case "ADMIN":   navigate("/admin/dashboard");  break;
      case "TEACHER": navigate("/teacher/attendance"); break;
      case "STUDENT": navigate("/student/profile");  break;
      default:        navigate("/login");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}

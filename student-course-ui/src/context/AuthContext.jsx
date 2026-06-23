import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthCtx = createContext(null);

function normalizeRole(role) {
  if (!role) return "";
  return role.startsWith("ROLE_") ? role.slice(5) : role;
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.role = normalizeRole(parsed.role);
        setUser(parsed);
      }
    } catch (_) {}
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // POST /auth/login -> { token, role, studentId?, teacherId? }
    const res  = await api.post("/auth/login", { username, password });
    const data = res.data;
    data.role  = normalizeRole(data.role);

    // Store token immediately so subsequent calls are authenticated
    localStorage.setItem("token", data.token);

    // Enrich with extra info based on role
    if (data.role === "STUDENT" && data.studentId) {
      // Fetch student details to get rollNo, name, department
      try {
        const s = await api.get(`/students/${data.studentId}`);
        data.rollNo     = s.data.rollNo;
        data.name       = s.data.name;
        data.department = s.data.department;
        data.email      = s.data.email;
      } catch (_) {}
    }

    if (data.role === "TEACHER" && data.teacherId) {
      // Fetch teacher details to get name, employeeCode
      try {
        const t = await api.get(`/teachers/${data.teacherId}`);
        data.name         = t.data.name;
        data.employeeCode = t.data.employeeCode;
      } catch (_) {}
    }

    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);

    switch (data.role) {
      case "ADMIN":   navigate("/admin/dashboard");   break;
      case "TEACHER": navigate("/teacher/attendance"); break;
      case "STUDENT": navigate("/student/profile");   break;
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
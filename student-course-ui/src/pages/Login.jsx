import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ROLE_HINTS = [
  { role: "ADMIN",   username: "admin",   hint: "Full system access"          },
  { role: "TEACHER", username: "TCH1001", hint: "Grades & attendance"         },
  { role: "STUDENT", username: "WHM1001", hint: "View your profile & results" },
];

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { setError("Enter username and password"); return; }
    setLoading(true); setError("");
    try {
      await login(username.trim(), password.trim());
    } catch (e) {
      const msg = e?.response?.data?.message ?? e?.response?.data ?? "";
      if (e?.response?.status === 401) setError("Invalid username or password");
      else if (e?.response?.status === 403) setError("Access denied");
      else setError(msg || "Login failed. Check the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const fill = (u) => { setUsername(u); setPassword(""); setError(""); };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <span style={{ fontSize: "2.5rem" }}>{"\uD83C\uDF93"}</span>
          <h1 style={styles.title}>EduTrack</h1>
          <p style={styles.subtitle}>Academy Course Management</p>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">Username / Roll No</label>
            <input
              className="form-input"
              placeholder="e.g. WHM1001 or admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <div style={{ background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: "var(--radius-sm)", color: "var(--red)", fontSize: "0.85rem", padding: "10px 14px" }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-full"
            onClick={handleLogin}
            disabled={loading}
            style={{ marginTop: 4, padding: "12px" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {/* Role hints */}
        <div style={styles.hintsLabel}>Quick fill by role</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ROLE_HINTS.map(({ role, username: u, hint }) => (
            <button key={role} onClick={() => fill(u)} style={styles.hintBtn}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "var(--text-soft)", fontSize: "0.82rem" }}>{role}</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--accent)" }}>{u}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{hint}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    alignItems: "center", background: "var(--bg)", display: "flex",
    justifyContent: "center", minHeight: "100vh", padding: 24,
  },
  card: {
    background: "var(--bg-card)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow)",
    padding: "36px 32px", width: "100%", maxWidth: 400,
  },
  header: { textAlign: "center", marginBottom: 28 },
  title: { fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", margin: "8px 0 4px" },
  subtitle: { color: "var(--text-muted)", fontSize: "0.85rem" },
  hintsLabel: { color: "var(--text-muted)", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" },
  hintBtn: {
    background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
    cursor: "pointer", fontFamily: "var(--font-body)", padding: "10px 12px",
    textAlign: "left", transition: "border-color 0.15s", width: "100%",
  },
};

export default Login;

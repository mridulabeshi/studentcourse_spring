import { useEffect, useState } from "react";
import api from "../services/api";

const statConfig = [
  { key: "students",    label: "Students",    icon: "👤", color: "#6c63ff" },
  { key: "courses",     label: "Courses",     icon: "📚", color: "#22c55e" },
  { key: "enrollments", label: "Enrollments", icon: "🔗", color: "#3b82f6" },
];

function Dashboard() {
  const [stats, setStats]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/reports/dashboard")
      .then((res) => setStats(res.data))
      .catch(() => setStats({ students: "—", courses: "—", enrollments: "—" }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Overview of your institution at a glance</p>

      {/* Stats */}
      <div className="stat-grid">
        {statConfig.map(({ key, label, icon, color }) => (
          <div
            className="stat-card"
            key={key}
            style={{ "--accent-color": color }}
          >
            <span className="stat-icon">{icon}</span>
            <div className="stat-value">
              {loading ? "..." : (stats[key] ?? 0)}
            </div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="card">
        <p className="section-title">Quick Actions</p>
        <div className="flex gap-12" style={{ flexWrap: "wrap" }}>
          {[
            { href: "/students",    label: "Add Student",  icon: "👤" },
            { href: "/courses",     label: "Add Course",   icon: "📚" },
            { href: "/enrollments", label: "Enroll",       icon: "🔗" },
            { href: "/grades",      label: "Post Grade",   icon: "🏅" },
            { href: "/attendance",  label: "Attendance",   icon: "📋" },
            { href: "/reports",     label: "View Reports", icon: "📊" },
          ].map(({ href, label, icon }) => (
            <a
              key={href}
              href={href}
              style={{
                alignItems: "center",
                background: "var(--bg)",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-soft)",
                display: "flex",
                fontSize: "0.875rem",
                fontWeight: 500,
                gap: 8,
                padding: "10px 16px",
                textDecoration: "none",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-light)";
                e.currentTarget.style.color = "var(--text-soft)";
              }}
            >
              {icon} {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

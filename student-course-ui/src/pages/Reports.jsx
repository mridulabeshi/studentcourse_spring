import { useEffect, useState } from "react";
import api from "../services/api";

function Reports() {
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    api.get("/reports/top-courses")
      .then((res) => setTopCourses(res.data))
      .finally(() => setLoading(false));
  }, []);

  const max = topCourses.length > 0
    ? Math.max(...topCourses.map((c) => c.totalEnrollments))
    : 1;

  const rankBadge = (i) => {
    if (i === 0) return { bg: "#f59e0b18", color: "#f59e0b", label: "🥇 #1" };
    if (i === 1) return { bg: "#94a3b818", color: "#94a3b8", label: "🥈 #2" };
    if (i === 2) return { bg: "#cd7f3218", color: "#cd7f32", label: "🥉 #3" };
    return { bg: "var(--accent-dim)", color: "var(--accent)", label: `#${i + 1}` };
  };

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p className="page-subtitle">Top courses by enrollment count</p>

      <div className="card">
        <div className="flex items-center justify-between mb-24">
          <p className="section-title" style={{ marginBottom: 0 }}>Most Popular Courses</p>
          <span className="badge badge-amber">{topCourses.length} courses</span>
        </div>

        {loading ? (
          <div className="empty-state"><p>Loading report…</p></div>
        ) : topCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>No enrollment data available yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {topCourses.map((course, i) => {
              const badge = rankBadge(i);
              const pct   = Math.round((course.totalEnrollments / max) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-12">
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          padding: "3px 10px",
                          minWidth: 52,
                          textAlign: "center",
                        }}
                      >
                        {badge.label}
                      </span>
                      <span style={{ fontWeight: 500, color: "var(--text)" }}>
                        {course.courseTitle}
                      </span>
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {course.totalEnrollments} enrolled
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: i === 0
                          ? "var(--amber)"
                          : i === 1
                          ? "var(--text-soft)"
                          : "var(--accent)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;

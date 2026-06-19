import { useEffect, useState } from "react";
import api from "../services/api";
import { DeptBadge } from "./Students";

const gradeColor = (g) => ({ S:"badge-purple", A:"badge-green", B:"badge-blue", C:"badge-amber", D:"badge-red", E:"badge-red" }[g?.toUpperCase()] ?? "badge-blue");
const gradeScore = { S:10, A:9, B:8, C:7, D:6, E:5 };
const scoreColor = (s) => s >= 8 ? "var(--green)" : s >= 6 ? "var(--amber)" : "var(--red)";

function TopCourses() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/reports/top-courses").then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const max = data.length ? Math.max(...data.map((c) => c.totalEnrollments)) : 1;
  const rankStyle = (i) => [
    { bg: "#f59e0b18", color: "#f59e0b", label: "🥇 #1" },
    { bg: "#94a3b818", color: "#94a3b8", label: "🥈 #2" },
    { bg: "#cd7f3218", color: "#cd7f32", label: "🥉 #3" },
  ][i] ?? { bg: "var(--accent-dim)", color: "var(--accent)", label: `#${i+1}` };

  if (loading) return <div className="empty-state"><p>Loading…</p></div>;
  if (!data.length) return <div className="empty-state"><div className="empty-icon">📊</div><p>No enrollment data yet.</p></div>;

  return (
    <div className="flex flex-col gap-16">
      {data.map((c, i) => {
        const r = rankStyle(i);
        const pct = Math.round((c.totalEnrollments / max) * 100);
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-12">
                <span style={{ background: r.bg, color: r.color, borderRadius: "var(--radius-sm)", fontSize: "0.8rem", fontWeight: 700, padding: "3px 10px", minWidth: 52, textAlign: "center" }}>{r.label}</span>
                <span style={{ fontWeight: 500, color: "var(--text)" }}>{c.courseTitle}</span>
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{c.totalEnrollments} enrolled</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${pct}%`, background: i===0?"var(--amber)":i===1?"var(--text-soft)":"var(--accent)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// GET /reports/performance/{studentId} → StudentPerformance { studentId, averageScore }
// GET /grades/student/{studentId}      → List<Grade>
function StudentPerformance() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [result, setResult]     = useState(null);
  const [grades, setGrades]     = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { api.get("/students").then((r) => setStudents(r.data)).catch(() => {}); }, []);

  const generate = () => {
    if (!studentId) return;
    setLoading(true); setResult(null); setGrades([]);
    Promise.all([
      api.get(`/reports/performance/${studentId}`),
      api.get(`/grades/student/${studentId}`).catch(() => ({ data: [] })),
    ])
      .then(([perf, g]) => { setResult(perf.data); setGrades(g.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const selectedStudent = students.find((s) => String(s.id) === String(studentId));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-end" }}>
        <div className="form-group" style={{ flex: 1, maxWidth: 380 }}>
          <label className="form-label">Student</label>
          <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Select student…</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.rollNo ?? `#${s.id}`} — {s.name} [{s.department}]</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={generate} disabled={!studentId || loading}>
          {loading ? "Loading…" : "Generate Report"}
        </button>
      </div>

      {result && (
        <div>
          {/* Student identity header */}
          {selectedStudent && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, padding: "12px 16px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
              <DeptBadge dept={selectedStudent.department} />
              <div>
                <div style={{ fontWeight: 600, color: "var(--text)" }}>{selectedStudent.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{selectedStudent.rollNo} · {selectedStudent.email}</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <div className="stat-card" style={{ "--accent-color": scoreColor(result.averageScore), flex: 1, minWidth: 150 }}>
              <span className="stat-icon">📊</span>
              <div className="stat-value">{result.averageScore?.toFixed(1)}</div>
              <div className="stat-label">Avg Score / 10</div>
            </div>
            <div className="stat-card" style={{ "--accent-color": "var(--blue)", flex: 1, minWidth: 150 }}>
              <span className="stat-icon">🏅</span>
              <div className="stat-value">{grades.length}</div>
              <div className="stat-label">Grades Recorded</div>
            </div>
            <div className="stat-card" style={{ "--accent-color": "var(--green)", flex: 1, minWidth: 150 }}>
              <span className="stat-icon">✓</span>
              <div className="stat-value">{grades.filter((g) => (gradeScore[g.grade?.toUpperCase()] ?? 0) >= 7).length}</div>
              <div className="stat-label">Passing Grades</div>
            </div>
          </div>

          {grades.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Course Code</th><th>Course</th><th>Semester</th><th>Grade</th><th>Score</th></tr></thead>
                <tbody>
                  {grades.map((g) => {
                    const score = gradeScore[g.grade?.toUpperCase()] ?? "—";
                    return (
                      <tr key={g.id}>
                        <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600, fontSize: "0.82rem" }}>{g.enrollment?.course?.courseCode ?? "—"}</span></td>
                        <td className="primary-col">{g.enrollment?.course?.title ?? "—"}</td>
                        <td style={{ color: "var(--text-muted)" }}>{g.semester}</td>
                        <td><span className={`badge ${gradeColor(g.grade)}`}>{g.grade}</span></td>
                        <td style={{ fontWeight: 700, color: scoreColor(score) }}>{score}/10</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="empty-state"><div className="empty-icon">📈</div><p>Select a student to generate their performance report.</p></div>
      )}
    </div>
  );
}

const TABS = [
  { key: "top-courses", label: "Top Courses",         icon: "📊" },
  { key: "performance", label: "Student Performance", icon: "📈" },
];

function Reports() {
  const [activeTab, setActiveTab] = useState("top-courses");
  const tabStyle = { display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)" };
  const tab      = { alignItems: "center", background: "transparent", border: "none", borderBottom: "2px solid transparent", borderRadius: 0, color: "var(--text-muted)", cursor: "pointer", display: "flex", fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 500, gap: 7, marginBottom: "-1px", padding: "10px 20px", transition: "color 0.15s, border-color 0.15s" };
  const activeT  = { borderBottomColor: "var(--accent)", color: "var(--accent)" };

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p className="page-subtitle">Analytics and performance insights</p>
      <div style={tabStyle}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ ...tab, ...(activeTab === t.key ? activeT : {}) }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      <div className="card">
        {activeTab === "top-courses" && <TopCourses />}
        {activeTab === "performance" && <StudentPerformance />}
      </div>
    </div>
  );
}

export default Reports;
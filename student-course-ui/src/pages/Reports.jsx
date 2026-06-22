import { useEffect, useState } from "react";
import api from "../services/api";
import { DeptBadge } from "../components/DeptBadge";

// Grade.kt: { id, enrollment: { id, student: {...}, course: {...} }, grade, semester }
// Grade uses @OneToOne on enrollment — one grade per enrollment max

const gradeColor = (g) => ({ S:"badge-purple", A:"badge-green", B:"badge-blue", C:"badge-amber", D:"badge-red", E:"badge-red" }[g?.toUpperCase()] ?? "badge-blue");
const gradeScore = { S:10, A:9, B:8, C:7, D:6, E:5 };
const scoreColor = (s) => Number(s) >= 8 ? "var(--green)" : Number(s) >= 6 ? "var(--amber)" : "var(--red)";

/* ── Top Courses ─────────────────────────────────────────────── */
function TopCourses() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    api.get("/reports/top-courses")
      .then((r) => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;
  if (error)   return <div className="empty-state"><p style={{ color: "var(--red)" }}>Failed to load top courses.</p></div>;
  if (!data.length) return <div className="empty-state"><div className="empty-icon">&#x1F4CA;</div><p>No enrollment data yet.</p></div>;

  const max = Math.max(...data.map((c) => c.totalEnrollments));
  const rankStyle = (i) => [
    { bg: "#f59e0b18", color: "#f59e0b", label: "#1" },
    { bg: "#94a3b818", color: "#94a3b8", label: "#2" },
    { bg: "#cd7f3218", color: "#cd7f32", label: "#3" },
  ][i] ?? { bg: "var(--accent-dim)", color: "var(--accent)", label: `#${i+1}` };

  return (
    <div className="flex flex-col gap-16">
      {data.map((c, i) => {
        const r = rankStyle(i);
        const pct = Math.round((c.totalEnrollments / max) * 100);
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-12">
                <span style={{ background: r.bg, color: r.color, borderRadius: "var(--radius-sm)", fontSize: "0.8rem", fontWeight: 700, padding: "3px 10px", minWidth: 36, textAlign: "center" }}>{r.label}</span>
                <span style={{ fontWeight: 500, color: "var(--text)" }}>{c.courseTitle}</span>
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{c.totalEnrollments} enrolled</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${pct}%`, background: i===0 ? "var(--amber)" : i===1 ? "var(--text-soft)" : "var(--accent)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Student Performance ─────────────────────────────────────── */
// GET /reports/performance/{studentId} -> StudentPerformance { studentId, averageScore }
// GET /grades/student/{studentId}      -> List<Grade>
//   Grade shape: { id, enrollment: { id, student, course }, grade, semester }
function StudentPerformance() {
  const [students, setStudents]   = useState([]);
  const [studentId, setStudentId] = useState("");
  const [result, setResult]       = useState(null);
  const [grades, setGrades]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    api.get("/students")
      .then((r) => setStudents(r.data))
      .catch(() => {});
  }, []);

  const generate = () => {
    if (!studentId) return;
    setLoading(true); setResult(null); setGrades([]); setError(null);

    Promise.all([
      // GET /reports/performance/{studentId}
      api.get(`/reports/performance/${studentId}`),
      // GET /grades/student/{studentId}
      api.get(`/grades/student/${studentId}`).catch(() => ({ data: [] })),
    ])
      .then(([perf, g]) => {
        setResult(perf.data);
        // Grade.kt has enrollment as @OneToOne
        // Response: [{ id, enrollment: { id, student:{...}, course:{...} }, grade, semester }]
        setGrades(Array.isArray(g.data) ? g.data : []);
      })
      .catch((e) => setError(e?.response?.status ?? "error"))
      .finally(() => setLoading(false));
  };

  const selectedStudent = students.find((s) => String(s.id) === String(studentId));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 24, alignItems: "flex-end" }}>
        <div className="form-group" style={{ flex: 1, maxWidth: 400 }}>
          <label className="form-label">Student</label>
          <select className="form-select" value={studentId} onChange={(e) => { setStudentId(e.target.value); setResult(null); setGrades([]); setError(null); }}>
            <option value="">Select student...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.rollNo} — {s.name} [{s.department}]</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={generate} disabled={!studentId || loading}>
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </div>

      {error && (
        <div className="empty-state">
          <p style={{ color: "var(--red)" }}>Failed to load performance data ({error}). Check backend is running.</p>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">&#x1F4C8;</div>
          <p>Select a student and click Generate Report.</p>
        </div>
      )}

      {loading && <div className="empty-state"><p>Generating report...</p></div>}

      {result && !loading && (
        <div>
          {/* Student identity */}
          {selectedStudent && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, padding: "14px 18px", background: "var(--bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              <DeptBadge dept={selectedStudent.department} />
              <div>
                <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "1rem" }}>{selectedStudent.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{selectedStudent.rollNo} &nbsp;·&nbsp; {selectedStudent.email}</div>
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <div className="stat-card" style={{ "--accent-color": scoreColor(result.averageScore), flex: 1, minWidth: 140 }}>
              <span className="stat-icon">&#x1F4CA;</span>
              <div className="stat-value">{Number(result.averageScore).toFixed(1)}</div>
              <div className="stat-label">Avg Score / 10</div>
            </div>
            <div className="stat-card" style={{ "--accent-color": "var(--blue)", flex: 1, minWidth: 140 }}>
              <span className="stat-icon">&#x1F3C5;</span>
              <div className="stat-value">{grades.length}</div>
              <div className="stat-label">Grades Recorded</div>
            </div>
            <div className="stat-card" style={{ "--accent-color": "var(--green)", flex: 1, minWidth: 140 }}>
              <span className="stat-icon">&#x2713;</span>
              <div className="stat-value">{grades.filter((g) => (gradeScore[g.grade?.toUpperCase()] ?? 0) >= 7).length}</div>
              <div className="stat-label">Passing (C or above)</div>
            </div>
          </div>

          {grades.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">&#x1F3C5;</div>
              <p>No grades recorded for this student yet.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Course Code</th><th>Course</th><th>Semester</th><th>Grade</th><th>Score</th></tr>
                </thead>
                <tbody>
                  {grades.map((g) => {
                    // Grade.kt: enrollment is @OneToOne -> enrollment.course, enrollment.student
                    const course = g.enrollment?.course;
                    const score  = gradeScore[g.grade?.toUpperCase()] ?? 0;
                    return (
                      <tr key={g.id}>
                        <td>
                          <span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600, fontSize: "0.82rem" }}>
                            {course?.courseCode ?? "—"}
                          </span>
                        </td>
                        <td className="primary-col">{course?.title ?? "—"}</td>
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
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
const TABS = [
  { key: "top-courses", label: "Top Courses",         icon: "&#x1F4CA;" },
  { key: "performance", label: "Student Performance", icon: "&#x1F4C8;" },
];

function Reports() {
  const [activeTab, setActiveTab] = useState("top-courses");

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p className="page-subtitle">Analytics and performance insights</p>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)" }}>
        {[
          { key: "top-courses", label: "Top Courses" },
          { key: "performance", label: "Student Performance" },
        ].map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            alignItems: "center", background: "transparent", border: "none",
            borderBottom: `2px solid ${activeTab === t.key ? "var(--accent)" : "transparent"}`,
            borderRadius: 0, color: activeTab === t.key ? "var(--accent)" : "var(--text-muted)",
            cursor: "pointer", display: "flex", fontFamily: "var(--font-body)",
            fontSize: "0.9rem", fontWeight: 500, gap: 7, marginBottom: "-1px",
            padding: "10px 20px", transition: "color 0.15s, border-color 0.15s",
          }}>{t.label}</button>
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
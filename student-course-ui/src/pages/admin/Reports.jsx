import { useEffect, useState } from "react";
import api from "../../services/api";
import { DeptBadge } from "../../components/DeptBadge";

const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5 };
const gradeColor  = (g) => ({ S:"badge-purple", A:"badge-green", B:"badge-blue", C:"badge-amber", D:"badge-red", E:"badge-red" }[g?.toUpperCase()] ?? "badge-blue");
const scoreColor  = (s) => s >= 8.5 ? "var(--green)" : s >= 7 ? "var(--accent)" : s >= 5 ? "var(--amber)" : "var(--red)";

function calcCGPA(grades) {
  let tw = 0, tc = 0;
  grades.forEach((g) => {
    const pts = gradePoints[g.grade?.toUpperCase()];
    const cr  = g.enrollment?.course?.credits;
    if (pts != null && cr) { tw += pts * cr; tc += cr; }
  });
  return tc === 0 ? null : tw / tc;
}

const cgpaRemark = (c) =>
  c >= 9 ? "Outstanding" : c >= 8 ? "Excellent" : c >= 7 ? "Good" :
  c >= 6 ? "Average" : c >= 5 ? "Below Average" : "Fail";

/* ── Top Courses ─────────────────────────────────────────────── */
function TopCourses() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/reports/top-courses").then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;
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
              <div className="progress-bar-fill" style={{ width: `${pct}%`, background: i===0?"var(--amber)":i===1?"var(--text-soft)":"var(--accent)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Student Performance (CGPA) ──────────────────────────────── */
function StudentPerformance() {
  const [students, setStudents]   = useState([]);
  const [studentId, setStudentId] = useState("");
  const [grades, setGrades]       = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => { api.get("/students").then((r) => setStudents(r.data)).catch(() => {}); }, []);

  const generate = () => {
    if (!studentId) return;
    setLoading(true); setGrades([]); setAttendance(null); setError(null);
    api.get(`/grades/student/${studentId}`)
      .then((r) => setGrades(Array.isArray(r.data) ? r.data : []))
      .catch((e) => setError(e?.response?.status ?? "error"))
      .finally(() => setLoading(false));
  };

  const selectedStudent = students.find((s) => String(s.id) === String(studentId));
  const cgpa         = calcCGPA(grades);
  const totalCredits = grades.reduce((s, g) => s + (g.enrollment?.course?.credits ?? 0), 0);
  const passing      = grades.filter((g) => (gradePoints[g.grade?.toUpperCase()] ?? 0) >= 7).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 24, alignItems: "flex-end" }}>
        <div className="form-group" style={{ flex: 1, maxWidth: 400 }}>
          <label className="form-label">Student</label>
          <select className="form-select" value={studentId} onChange={(e) => { setStudentId(e.target.value); setGrades([]); setError(null); }}>
            <option value="">Select student...</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.rollNo} — {s.name} [{s.department}]</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={generate} disabled={!studentId || loading}>
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </div>

      {error && <div className="empty-state"><p style={{ color: "var(--red)" }}>Failed to load grades ({error}).</p></div>}
      {!grades.length && !loading && !error && <div className="empty-state"><div className="empty-icon">&#x1F4C8;</div><p>Select a student and generate report.</p></div>}
      {loading && <div className="empty-state"><p>Generating...</p></div>}

      {grades.length > 0 && !loading && (
        <div>
          {/* Identity */}
          {selectedStudent && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, padding: "14px 18px", background: "var(--bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              <DeptBadge dept={selectedStudent.department} />
              <div>
                <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "1rem" }}>{selectedStudent.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{selectedStudent.rollNo} &middot; {selectedStudent.email}</div>
              </div>
              {cgpa != null && (
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: scoreColor(cgpa), lineHeight: 1 }}>{cgpa.toFixed(2)}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>CGPA / 10.0</div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <div className="stat-card" style={{ "--accent-color": scoreColor(cgpa ?? 0), flex: 1, minWidth: 130 }}>
              <span className="stat-icon">&#x1F4CA;</span>
              <div className="stat-value">{cgpa?.toFixed(2) ?? "—"}</div>
              <div className="stat-label">CGPA / 10.0</div>
            </div>
            <div className="stat-card" style={{ "--accent-color": "var(--blue)", flex: 1, minWidth: 130 }}>
              <span className="stat-icon">&#x1F4DA;</span>
              <div className="stat-value">{totalCredits}</div>
              <div className="stat-label">Total Credits</div>
            </div>
            <div className="stat-card" style={{ "--accent-color": "var(--green)", flex: 1, minWidth: 130 }}>
              <span className="stat-icon">&#x2713;</span>
              <div className="stat-value">{passing}</div>
              <div className="stat-label">Passing (C+)</div>
            </div>
          </div>

          {/* CGPA remark bar */}
          {cgpa != null && (
            <div style={{ marginBottom: 20, padding: "14px 18px", background: "var(--bg)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: 16 }}>
              <span className={`badge ${cgpa >= 9 ? "badge-purple" : cgpa >= 8 ? "badge-green" : cgpa >= 7 ? "badge-blue" : cgpa >= 5 ? "badge-amber" : "badge-red"}`} style={{ fontSize: "0.85rem", padding: "4px 14px" }}>
                {cgpaRemark(cgpa)}
              </span>
              <div style={{ flex: 1 }}>
                <div className="progress-bar-track" style={{ height: 8 }}>
                  <div className="progress-bar-fill" style={{ width: `${(cgpa / 10) * 100}%`, background: scoreColor(cgpa), height: 8 }} />
                </div>
              </div>
              <span style={{ fontFamily: "monospace", fontWeight: 700, color: scoreColor(cgpa) }}>{cgpa.toFixed(2)} / 10</span>
            </div>
          )}

          {/* Grade table */}
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Code</th><th>Course</th><th>Credits</th><th>Semester</th><th>Grade</th><th>Points</th><th>Weighted</th></tr></thead>
              <tbody>
                {grades.map((g) => {
                  const pts = gradePoints[g.grade?.toUpperCase()] ?? 0;
                  const cr  = g.enrollment?.course?.credits ?? 0;
                  return (
                    <tr key={g.id}>
                      <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600, fontSize: "0.82rem" }}>{g.enrollment?.course?.courseCode ?? "—"}</span></td>
                      <td className="primary-col">{g.enrollment?.course?.title ?? "—"}</td>
                      <td><span className="badge badge-blue">{cr} cr</span></td>
                      <td style={{ color: "var(--text-muted)" }}>{g.semester}</td>
                      <td><span className={`badge ${gradeColor(g.grade)}`}>{g.grade}</span></td>
                      <td style={{ fontWeight: 700, color: scoreColor(pts) }}>{pts}</td>
                      <td style={{ color: "var(--text-soft)", fontFamily: "monospace", fontSize: "0.85rem" }}>{pts}×{cr} = <strong style={{ color: "var(--text)" }}>{pts * cr}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--border-light)" }}>
                  <td colSpan={2} style={{ color: "var(--text-muted)", fontSize: "0.78rem", padding: "12px 16px" }}>Credit-weighted CGPA</td>
                  <td style={{ fontWeight: 700, color: "var(--text)", padding: "12px 16px" }}>{totalCredits} cr</td>
                  <td colSpan={3}></td>
                  <td style={{ fontWeight: 700, color: scoreColor(cgpa ?? 0), fontFamily: "monospace", padding: "12px 16px" }}>{cgpa?.toFixed(2) ?? "—"}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
function Reports() {
  const [activeTab, setActiveTab] = useState("top-courses");
  const tabStyle = { display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)" };
  const tab      = { background: "transparent", border: "none", borderBottom: "2px solid transparent", borderRadius: 0, color: "var(--text-muted)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 500, marginBottom: "-1px", padding: "10px 20px", transition: "color 0.15s, border-color 0.15s" };
  const activeT  = { borderBottomColor: "var(--accent)", color: "var(--accent)" };

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p className="page-subtitle">Analytics and CGPA performance insights</p>
      <div style={tabStyle}>
        {[{ key: "top-courses", label: "Top Courses" }, { key: "performance", label: "Student CGPA" }].map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ ...tab, ...(activeTab === t.key ? activeT : {}) }}>{t.label}</button>
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
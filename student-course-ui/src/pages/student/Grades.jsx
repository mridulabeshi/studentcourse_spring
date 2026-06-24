import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5 };

const gradeColor = (g) => ({
  S:"badge-purple", A:"badge-green", B:"badge-blue",
  C:"badge-amber",  D:"badge-red",   E:"badge-red"
}[g?.toUpperCase()] ?? "badge-blue");

const scoreColor = (s) =>
  s >= 8.5 ? "var(--green)" :
  s >= 7   ? "var(--accent)" :
  s >= 5   ? "var(--amber)" : "var(--red)";

const cgpaRemark = (c) =>
  c >= 9   ? "Outstanding"  :
  c >= 8   ? "Excellent"    :
  c >= 7   ? "Good"         :
  c >= 6   ? "Average"      :
  c >= 5   ? "Below Average": "Fail";

// Credit-weighted CGPA = Σ(gradePoints × credits) / Σ(credits)
function calcCGPA(grades) {
  let totalWeighted = 0;
  let totalCredits  = 0;
  grades.forEach((g) => {
    const pts     = gradePoints[g.grade?.toUpperCase()];
    const credits = g.enrollment?.course?.credits;
    if (pts != null && credits != null && credits > 0) {
      totalWeighted += pts * credits;
      totalCredits  += credits;
    }
  });
  if (totalCredits === 0) return null;
  return totalWeighted / totalCredits;
}

function StudentGrades() {
  const { user }  = useAuth();
  const [grades, setGrades]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (!user?.studentId) return;
    api.get(`/grades/student/${user.studentId}`)
      .then((r) => setGrades(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user]);

  const cgpa         = calcCGPA(grades);
  const totalCredits = grades.reduce((s, g) => s + (g.enrollment?.course?.credits ?? 0), 0);
  const passing      = grades.filter((g) => (gradePoints[g.grade?.toUpperCase()] ?? 0) >= 7).length;
  const remark       = cgpa != null ? cgpaRemark(cgpa) : null;

  if (loading) return <div className="empty-state"><p>Loading grades...</p></div>;

  return (
    <div>
      <h1 className="page-title">My Grades</h1>
      <p className="page-subtitle">Credit-weighted academic performance</p>

      {error ? (
        <div className="card"><div className="empty-state"><p style={{ color: "var(--red)" }}>Could not load grades.</p></div></div>
      ) : grades.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">&#x1F3C5;</div><p>No grades recorded yet.</p></div></div>
      ) : (
        <>
          {/* CGPA hero card */}
          {cgpa != null && (
            <div className="card mb-24" style={{
              borderTop: `3px solid ${scoreColor(cgpa)}`,
              display: "flex", alignItems: "center", gap: 28, padding: "24px 28px",
            }}>
              <div style={{ textAlign: "center", minWidth: 100 }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: "3rem",
                  fontWeight: 700, lineHeight: 1, color: scoreColor(cgpa),
                }}>{cgpa.toFixed(2)}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: 4, letterSpacing: "0.05em" }}>
                  CGPA / 10.0
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, color: "var(--text)" }}>
                    {remark}
                  </span>
                  <span className={`badge ${
                    cgpa >= 9 ? "badge-purple" : cgpa >= 8 ? "badge-green" :
                    cgpa >= 7 ? "badge-blue"   : cgpa >= 5 ? "badge-amber" : "badge-red"
                  }`}>{remark}</span>
                </div>
                {/* CGPA bar */}
                <div className="progress-bar-track" style={{ marginBottom: 10, height: 8 }}>
                  <div className="progress-bar-fill" style={{
                    width: `${(cgpa / 10) * 100}%`,
                    background: scoreColor(cgpa),
                    height: 8,
                  }} />
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Formula: &Sigma;(grade points &times; credits) / &Sigma;(credits) &nbsp;&middot;&nbsp;
                  Total credits: <strong style={{ color: "var(--text-soft)" }}>{totalCredits}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Stat row */}
          <div className="stat-grid mb-24">
            <div className="stat-card" style={{ "--accent-color": scoreColor(cgpa ?? 0) }}>
              <span className="stat-icon">&#x1F4CA;</span>
              <div className="stat-value">{cgpa?.toFixed(2) ?? "—"}</div>
              <div className="stat-label">CGPA</div>
            </div>
            <div className="stat-card" style={{ "--accent-color": "var(--blue)" }}>
              <span className="stat-icon">&#x1F4DA;</span>
              <div className="stat-value">{totalCredits}</div>
              <div className="stat-label">Credits Earned</div>
            </div>
            <div className="stat-card" style={{ "--accent-color": "var(--green)" }}>
              <span className="stat-icon">&#x2713;</span>
              <div className="stat-value">{passing}</div>
              <div className="stat-label">Passing (C+)</div>
            </div>
            <div className="stat-card" style={{ "--accent-color": "var(--amber)" }}>
              <span className="stat-icon">&#x1F3C5;</span>
              <div className="stat-value">{grades.length}</div>
              <div className="stat-label">Courses Graded</div>
            </div>
          </div>

          {/* Grade table */}
          <div className="card">
            <p className="section-title">Grade Breakdown</p>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course</th>
                    <th>Credits</th>
                    <th>Semester</th>
                    <th>Grade</th>
                    <th>Points</th>
                    <th>Weighted</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => {
                    const pts     = gradePoints[g.grade?.toUpperCase()] ?? 0;
                    const credits = g.enrollment?.course?.credits ?? 0;
                    const weighted = pts * credits;
                    return (
                      <tr key={g.id}>
                        <td>
                          <span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600, fontSize: "0.82rem" }}>
                            {g.enrollment?.course?.courseCode ?? "—"}
                          </span>
                        </td>
                        <td className="primary-col">{g.enrollment?.course?.title ?? "—"}</td>
                        <td>
                          <span className="badge badge-blue">{credits} cr</span>
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>{g.semester}</td>
                        <td>
                          <span className={`badge ${gradeColor(g.grade)}`}>{g.grade}</span>
                        </td>
                        <td style={{ fontWeight: 700, color: scoreColor(pts) }}>{pts}</td>
                        <td style={{ color: "var(--text-soft)", fontFamily: "monospace", fontSize: "0.85rem" }}>
                          {pts} × {credits} = <strong style={{ color: "var(--text)" }}>{weighted}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Footer totals */}
                <tfoot>
                  <tr style={{ borderTop: "2px solid var(--border-light)" }}>
                    <td colSpan={2} style={{ color: "var(--text-muted)", fontSize: "0.8rem", padding: "12px 16px" }}>
                      CGPA = {grades.filter(g => gradePoints[g.grade?.toUpperCase()] != null && g.enrollment?.course?.credits).map(g => `${gradePoints[g.grade.toUpperCase()]}×${g.enrollment.course.credits}`).join(" + ")} / {totalCredits}
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--text)", padding: "12px 16px" }}>{totalCredits} cr</td>
                    <td colSpan={3}></td>
                    <td style={{ fontWeight: 700, color: scoreColor(cgpa ?? 0), fontFamily: "monospace", padding: "12px 16px" }}>
                      = {cgpa?.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentGrades;
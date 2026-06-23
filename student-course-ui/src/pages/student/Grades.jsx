import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const gradeColor = (g) => ({ S:"badge-purple", A:"badge-green", B:"badge-blue", C:"badge-amber", D:"badge-red", E:"badge-red" }[g?.toUpperCase()] ?? "badge-blue");
const gradeScore = { S:10, A:9, B:8, C:7, D:6, E:5 };
const scoreColor = (s) => s >= 8 ? "var(--green)" : s >= 6 ? "var(--amber)" : "var(--red)";

// GET /grades/student/{studentId}
function StudentGrades() {
  const { user } = useAuth();
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

  const avg = grades.length
    ? (grades.reduce((sum, g) => sum + (gradeScore[g.grade?.toUpperCase()] ?? 0), 0) / grades.length).toFixed(1)
    : null;

  const passing = grades.filter((g) => (gradeScore[g.grade?.toUpperCase()] ?? 0) >= 7).length;

  if (loading) return <div className="empty-state"><p>Loading grades...</p></div>;

  return (
    <div>
      <h1 className="page-title">My Grades</h1>
      <p className="page-subtitle">Your academic performance across all courses</p>

      {error ? (
        <div className="card"><div className="empty-state"><p style={{ color: "var(--red)" }}>Could not load grades.</p></div></div>
      ) : grades.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">&#x1F3C5;</div><p>No grades recorded yet.</p></div></div>
      ) : (
        <>
          {/* Summary */}
          <div className="stat-grid mb-24">
            <div className="stat-card" style={{ "--accent-color": scoreColor(Number(avg)) }}>
              <span className="stat-icon">&#x1F4CA;</span>
              <div className="stat-value">{avg}</div>
              <div className="stat-label">Avg Score / 10</div>
            </div>
            <div className="stat-card" style={{ "--accent-color": "var(--green)" }}>
              <span className="stat-icon">&#x2713;</span>
              <div className="stat-value">{passing}</div>
              <div className="stat-label">Passing Grades</div>
            </div>
            <div className="stat-card" style={{ "--accent-color": "var(--blue)" }}>
              <span className="stat-icon">&#x1F3C5;</span>
              <div className="stat-value">{grades.length}</div>
              <div className="stat-label">Total Grades</div>
            </div>
          </div>

          <div className="card">
            <p className="section-title">Grade Breakdown</p>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Course Code</th><th>Course</th><th>Semester</th><th>Grade</th><th>Score</th></tr></thead>
                <tbody>
                  {grades.map((g) => {
                    const score = gradeScore[g.grade?.toUpperCase()] ?? 0;
                    return (
                      <tr key={g.id}>
                        <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600, fontSize: "0.82rem" }}>{g.enrollment?.course?.courseCode ?? "—"}</span></td>
                        <td className="primary-col">{g.enrollment?.course?.title ?? "—"}</td>
                        <td style={{ color: "var(--text-muted)" }}>{g.semester}</td>
                        <td><span className={`badge ${gradeColor(g.grade)}`}>{g.grade}</span></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="progress-bar-track" style={{ width: 80 }}>
                              <div className="progress-bar-fill" style={{ width: `${score * 10}%`, background: scoreColor(score) }} />
                            </div>
                            <span style={{ fontWeight: 700, color: scoreColor(score), fontSize: "0.85rem" }}>{score}/10</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentGrades;

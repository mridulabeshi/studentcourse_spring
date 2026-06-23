import { useEffect, useState } from "react";
import api from "../../services/api";
import { DeptBadge } from "../../components/DeptBadge";

const gradeColor = (g) => ({ S:"badge-purple", A:"badge-green", B:"badge-blue", C:"badge-amber", D:"badge-red", E:"badge-red" }[g?.toUpperCase()] ?? "badge-blue");
const gradeScore = { S:10, A:9, B:8, C:7, D:6, E:5 };
const scoreColor = (s) => Number(s) >= 8 ? "var(--green)" : Number(s) >= 6 ? "var(--amber)" : "var(--red)";

// GET /teacher/courses -> List<Course>
// GET /enrollments/course/{courseId} -> List<Enrollment>
// GET /reports/performance/{studentId} -> { studentId, averageScore }
// GET /grades/student/{studentId} -> List<Grade>
// GET /reports/attendance/{enrollmentId} -> { enrollmentId, percentage }
function TeacherReports() {
  const [courses, setCourses]             = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrollments, setEnrollments]     = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [performance, setPerformance]     = useState(null);
  const [grades, setGrades]               = useState([]);
  const [attendance, setAttendance]       = useState(null);
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    api.get("/teacher/courses").then((r) => setCourses(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCourse) { setEnrollments([]); setSelectedStudent(null); return; }
    api.get(`/enrollments/course/${selectedCourse}`)
      .then((r) => setEnrollments(r.data))
      .catch(() => {});
  }, [selectedCourse]);

  const loadStudentReport = async (enrollment) => {
    setSelectedStudent(enrollment);
    setLoading(true); setPerformance(null); setGrades([]); setAttendance(null);
    const sid = enrollment.student?.id;
    const eid = enrollment.id;
    try {
      const [perf, g, att] = await Promise.all([
        api.get(`/reports/performance/${sid}`),
        api.get(`/grades/student/${sid}`).catch(() => ({ data: [] })),
        api.get(`/reports/attendance/${eid}`).catch(() => ({ data: null })),
      ]);
      setPerformance(perf.data);
      setGrades(Array.isArray(g.data) ? g.data : []);
      setAttendance(att.data);
    } catch (_) {}
    setLoading(false);
  };

  const pct = attendance?.percentage ?? 0;

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p className="page-subtitle">Student performance and attendance in your courses</p>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* Left: course + student picker */}
        <div className="flex flex-col gap-16">
          <div className="card">
            <p className="section-title">Select Course</p>
            <div className="flex flex-col gap-8">
              {courses.map((c) => (
                <button key={c.id} onClick={() => setSelectedCourse(String(c.id))} style={{
                  background: String(c.id) === selectedCourse ? "var(--accent-dim)" : "transparent",
                  border: `1px solid ${String(c.id) === selectedCourse ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "var(--radius-sm)", color: String(c.id) === selectedCourse ? "var(--accent)" : "var(--text-muted)",
                  cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.85rem",
                  padding: "9px 12px", textAlign: "left", transition: "all 0.15s", width: "100%",
                }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.75rem", display: "block" }}>{c.courseCode}</span>
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          {enrollments.length > 0 && (
            <div className="card">
              <p className="section-title">Select Student</p>
              <div className="flex flex-col gap-8">
                {enrollments.map((e) => (
                  <button key={e.id} onClick={() => loadStudentReport(e)} style={{
                    background: selectedStudent?.id === e.id ? "var(--bg-hover)" : "transparent",
                    border: `1px solid ${selectedStudent?.id === e.id ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-body)",
                    padding: "9px 12px", textAlign: "left", transition: "all 0.15s", width: "100%",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <DeptBadge dept={e.student?.department} />
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text)" }}>{e.student?.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{e.student?.rollNo}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: report panel */}
        <div>
          {!selectedStudent && (
            <div className="card" style={{ height: "100%" }}>
              <div className="empty-state">
                <div className="empty-icon">&#x1F4C8;</div>
                <p>Select a course, then a student to view their report.</p>
              </div>
            </div>
          )}

          {loading && <div className="card"><div className="empty-state"><p>Generating report...</p></div></div>}

          {selectedStudent && !loading && performance && (
            <div className="flex flex-col gap-16">
              {/* Identity */}
              <div className="card">
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <DeptBadge dept={selectedStudent.student?.department} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)" }}>{selectedStudent.student?.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{selectedStudent.student?.rollNo} &nbsp;·&nbsp; {selectedStudent.student?.email}</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div className="stat-card" style={{ "--accent-color": scoreColor(performance.averageScore), flex: 1, minWidth: 130 }}>
                  <span className="stat-icon">&#x1F4CA;</span>
                  <div className="stat-value">{Number(performance.averageScore).toFixed(1)}</div>
                  <div className="stat-label">Avg Score / 10</div>
                </div>
                <div className="stat-card" style={{ "--accent-color": pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)", flex: 1, minWidth: 130 }}>
                  <span className="stat-icon">&#x1F4CB;</span>
                  <div className="stat-value">{pct.toFixed(0)}%</div>
                  <div className="stat-label">Attendance</div>
                </div>
                <div className="stat-card" style={{ "--accent-color": "var(--blue)", flex: 1, minWidth: 130 }}>
                  <span className="stat-icon">&#x1F3C5;</span>
                  <div className="stat-value">{grades.length}</div>
                  <div className="stat-label">Grades</div>
                </div>
              </div>

              {/* Grades table */}
              {grades.length > 0 && (
                <div className="card">
                  <p className="section-title">Grade History</p>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Course</th><th>Semester</th><th>Grade</th><th>Score</th></tr></thead>
                      <tbody>
                        {grades.map((g) => {
                          const score = gradeScore[g.grade?.toUpperCase()] ?? 0;
                          return (
                            <tr key={g.id}>
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherReports;

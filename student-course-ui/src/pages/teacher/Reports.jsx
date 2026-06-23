import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { DeptBadge } from "../../components/DeptBadge";

const gradeColor = (g) => ({ S:"badge-purple", A:"badge-green", B:"badge-blue", C:"badge-amber", D:"badge-red", E:"badge-red" }[g?.toUpperCase()] ?? "badge-blue");
const gradeScore = { S:10, A:9, B:8, C:7, D:6, E:5 };
const scoreColor = (s) => Number(s) >= 8 ? "var(--green)" : Number(s) >= 6 ? "var(--amber)" : "var(--red)";

function TeacherReports() {
  const { user } = useAuth();

  const [teacherCourses, setTeacherCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrollments, setEnrollments]     = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [performance, setPerformance]     = useState(null);
  const [grades, setGrades]               = useState([]);
  const [attendance, setAttendance]       = useState(null);
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    if (!user?.teacherId) return;
    api.get(`/teacher-courses/teacher/${user.teacherId}`)
      .then((r) => setTeacherCourses(r.data))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!selectedCourseId) { setEnrollments([]); setSelectedEnrollment(null); return; }
    api.get(`/enrollments/course/${selectedCourseId}`)
      .then((r) => setEnrollments(r.data))
      .catch(() => {});
  }, [selectedCourseId]);

  const loadStudentReport = async (enrollment) => {
    setSelectedEnrollment(enrollment);
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
  const activeCourse = teacherCourses.find((tc) => String(tc.course?.id) === String(selectedCourseId));

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p className="page-subtitle">Student performance in your courses</p>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        {/* Left panel */}
        <div className="flex flex-col gap-16">
          <div className="card">
            <p className="section-title">Your Courses</p>
            <div className="flex flex-col gap-8">
              {teacherCourses.length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No courses assigned.</p>
              )}
              {teacherCourses.map((tc) => (
                <button key={tc.id} onClick={() => setSelectedCourseId(String(tc.course?.id))} style={{
                  background: String(tc.course?.id) === selectedCourseId ? "var(--accent-dim)" : "transparent",
                  border: `1px solid ${String(tc.course?.id) === selectedCourseId ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-body)",
                  padding: "9px 12px", textAlign: "left", transition: "all 0.15s", width: "100%",
                  color: String(tc.course?.id) === selectedCourseId ? "var(--accent)" : "var(--text-muted)",
                }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.72rem", display: "block" }}>{tc.course?.courseCode}</span>
                  <span style={{ fontSize: "0.85rem" }}>{tc.course?.title}</span>
                </button>
              ))}
            </div>
          </div>

          {enrollments.length > 0 && (
            <div className="card">
              <p className="section-title">Students</p>
              <div className="flex flex-col gap-8">
                {enrollments.map((e) => (
                  <button key={e.id} onClick={() => loadStudentReport(e)} style={{
                    background: selectedEnrollment?.id === e.id ? "var(--bg-hover)" : "transparent",
                    border: `1px solid ${selectedEnrollment?.id === e.id ? "var(--accent)" : "var(--border)"}`,
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

        {/* Right: report */}
        <div>
          {!selectedEnrollment && (
            <div className="card" style={{ minHeight: 300 }}>
              <div className="empty-state">
                <div className="empty-icon">&#x1F4C8;</div>
                <p>Select a course then a student to view their report.</p>
              </div>
            </div>
          )}

          {loading && <div className="card"><div className="empty-state"><p>Generating report...</p></div></div>}

          {selectedEnrollment && !loading && performance && (
            <div className="flex flex-col gap-16">
              {/* Identity */}
              <div className="card">
                <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <DeptBadge dept={selectedEnrollment.student?.department} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)" }}>{selectedEnrollment.student?.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{selectedEnrollment.student?.rollNo} · {selectedEnrollment.student?.email}</div>
                    </div>
                  </div>
                  {activeCourse && (
                    <span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600, fontSize: "0.82rem" }}>
                      {activeCourse.course?.courseCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div className="stat-card" style={{ "--accent-color": scoreColor(performance.averageScore), flex: 1, minWidth: 120 }}>
                  <span className="stat-icon">&#x1F4CA;</span>
                  <div className="stat-value">{Number(performance.averageScore).toFixed(1)}</div>
                  <div className="stat-label">Avg Score / 10</div>
                </div>
                <div className="stat-card" style={{ "--accent-color": pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)", flex: 1, minWidth: 120 }}>
                  <span className="stat-icon">&#x1F4CB;</span>
                  <div className="stat-value">{pct.toFixed(0)}%</div>
                  <div className="stat-label">Attendance</div>
                </div>
                <div className="stat-card" style={{ "--accent-color": "var(--blue)", flex: 1, minWidth: 120 }}>
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
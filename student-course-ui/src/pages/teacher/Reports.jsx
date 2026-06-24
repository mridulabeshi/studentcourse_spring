import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { DeptBadge } from "../../components/DeptBadge";

const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5 };
const gradeColor  = (g) => ({ S:"badge-purple", A:"badge-green", B:"badge-blue", C:"badge-amber", D:"badge-red", E:"badge-red" }[g?.toUpperCase()] ?? "badge-blue");
const scoreColor  = (s) => s >= 8.5 ? "var(--green)" : s >= 7 ? "var(--accent)" : s >= 5 ? "var(--amber)" : "var(--red)";
const cgpaRemark  = (c) => c >= 9 ? "Outstanding" : c >= 8 ? "Excellent" : c >= 7 ? "Good" : c >= 6 ? "Average" : c >= 5 ? "Below Average" : "Fail";

function calcCGPA(grades) {
  let tw = 0, tc = 0;
  grades.forEach((g) => {
    const pts = gradePoints[g.grade?.toUpperCase()];
    const cr  = g.enrollment?.course?.credits;
    if (pts != null && cr) { tw += pts * cr; tc += cr; }
  });
  return tc === 0 ? null : tw / tc;
}

function TeacherReports() {
  const { user } = useAuth();

  const [teacherCourses, setTeacherCourses]         = useState([]);
  const [selectedCourseId, setSelectedCourseId]     = useState("");
  const [enrollments, setEnrollments]               = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [grades, setGrades]                         = useState([]);
  const [attendance, setAttendance]                 = useState(null);
  const [loading, setLoading]                       = useState(false);

  useEffect(() => {
    if (!user?.teacherId) return;
    api.get(`/teacher-courses/teacher/${user.teacherId}`).then((r) => setTeacherCourses(r.data)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!selectedCourseId) { setEnrollments([]); setSelectedEnrollment(null); return; }
    api.get(`/enrollments/course/${selectedCourseId}`).then((r) => setEnrollments(r.data)).catch(() => {});
  }, [selectedCourseId]);

  const loadStudentReport = async (enrollment) => {
    setSelectedEnrollment(enrollment);
    setLoading(true); setGrades([]); setAttendance(null);
    const sid = enrollment.student?.id;
    const eid = enrollment.id;
    try {
      const [g, att] = await Promise.all([
        api.get(`/grades/student/${sid}`).catch(() => ({ data: [] })),
        api.get(`/reports/attendance/${eid}`).catch(() => ({ data: null })),
      ]);
      setGrades(Array.isArray(g.data) ? g.data : []);
      setAttendance(att.data);
    } catch (_) {}
    setLoading(false);
  };

  const cgpa         = calcCGPA(grades);
  const totalCredits = grades.reduce((s, g) => s + (g.enrollment?.course?.credits ?? 0), 0);
  const pct          = attendance?.percentage ?? 0;
  const activeCourse = teacherCourses.find((tc) => String(tc.course?.id) === String(selectedCourseId));

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p className="page-subtitle">Student CGPA and attendance in your courses</p>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        {/* Left panel */}
        <div className="flex flex-col gap-16">
          <div className="card">
            <p className="section-title">Your Courses</p>
            <div className="flex flex-col gap-8">
              {teacherCourses.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No courses assigned.</p>}
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

        {/* Right panel */}
        <div>
          {!selectedEnrollment && (
            <div className="card" style={{ minHeight: 300 }}>
              <div className="empty-state"><div className="empty-icon">&#x1F4C8;</div><p>Select a course then a student to view their CGPA report.</p></div>
            </div>
          )}

          {loading && <div className="card"><div className="empty-state"><p>Generating report...</p></div></div>}

          {selectedEnrollment && !loading && (
            <div className="flex flex-col gap-16">
              {/* Identity + CGPA hero */}
              <div className="card" style={{ borderTop: `3px solid ${scoreColor(cgpa ?? 0)}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <DeptBadge dept={selectedEnrollment.student?.department} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)" }}>{selectedEnrollment.student?.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{selectedEnrollment.student?.rollNo} &middot; {selectedEnrollment.student?.email}</div>
                  </div>
                  {cgpa != null && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 700, color: scoreColor(cgpa), lineHeight: 1 }}>{cgpa.toFixed(2)}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>CGPA / 10.0</div>
                      <span className={`badge ${cgpa >= 9 ? "badge-purple" : cgpa >= 8 ? "badge-green" : cgpa >= 7 ? "badge-blue" : cgpa >= 5 ? "badge-amber" : "badge-red"}`} style={{ marginTop: 4, display: "inline-block" }}>
                        {cgpaRemark(cgpa)}
                      </span>
                    </div>
                  )}
                  {cgpa === null && grades.length === 0 && (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No grades yet</span>
                  )}
                </div>
                {cgpa != null && (
                  <div className="progress-bar-track" style={{ marginTop: 14, height: 6 }}>
                    <div className="progress-bar-fill" style={{ width: `${(cgpa / 10) * 100}%`, background: scoreColor(cgpa), height: 6 }} />
                  </div>
                )}
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div className="stat-card" style={{ "--accent-color": scoreColor(cgpa ?? 0), flex: 1, minWidth: 120 }}>
                  <span className="stat-icon">&#x1F4CA;</span>
                  <div className="stat-value">{cgpa?.toFixed(2) ?? "—"}</div>
                  <div className="stat-label">CGPA</div>
                </div>
                <div className="stat-card" style={{ "--accent-color": "var(--blue)", flex: 1, minWidth: 120 }}>
                  <span className="stat-icon">&#x1F4DA;</span>
                  <div className="stat-value">{totalCredits}</div>
                  <div className="stat-label">Credits</div>
                </div>
                <div className="stat-card" style={{ "--accent-color": pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)", flex: 1, minWidth: 120 }}>
                  <span className="stat-icon">&#x1F4CB;</span>
                  <div className="stat-value">{pct.toFixed(0)}%</div>
                  <div className="stat-label">Attendance</div>
                </div>
              </div>

              {/* Grade table */}
              {grades.length > 0 && (
                <div className="card">
                  <p className="section-title">Grade Breakdown</p>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Course</th><th>Credits</th><th>Semester</th><th>Grade</th><th>Points</th><th>Weighted</th></tr></thead>
                      <tbody>
                        {grades.map((g) => {
                          const pts = gradePoints[g.grade?.toUpperCase()] ?? 0;
                          const cr  = g.enrollment?.course?.credits ?? 0;
                          return (
                            <tr key={g.id}>
                              <td className="primary-col">{g.enrollment?.course?.title ?? "—"}</td>
                              <td><span className="badge badge-blue">{cr} cr</span></td>
                              <td style={{ color: "var(--text-muted)" }}>{g.semester}</td>
                              <td><span className={`badge ${gradeColor(g.grade)}`}>{g.grade}</span></td>
                              <td style={{ fontWeight: 700, color: scoreColor(pts) }}>{pts}</td>
                              <td style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--text-soft)" }}>
                                {pts}×{cr} = <strong style={{ color: "var(--text)" }}>{pts * cr}</strong>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: "2px solid var(--border-light)" }}>
                          <td style={{ color: "var(--text-muted)", fontSize: "0.78rem", padding: "12px 16px" }}>CGPA</td>
                          <td style={{ fontWeight: 700, padding: "12px 16px" }}>{totalCredits} cr</td>
                          <td colSpan={3}></td>
                          <td style={{ fontWeight: 700, color: scoreColor(cgpa ?? 0), fontFamily: "monospace", padding: "12px 16px" }}>{cgpa?.toFixed(2) ?? "—"}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
              {grades.length === 0 && <div className="card"><div className="empty-state"><div className="empty-icon">&#x1F3C5;</div><p>No grades recorded yet.</p></div></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherReports;
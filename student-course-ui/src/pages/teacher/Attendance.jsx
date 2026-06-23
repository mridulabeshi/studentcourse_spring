import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { DeptBadge } from "../../components/DeptBadge";

// Real endpoints (from TeacherCourseController + existing controllers):
// GET  /teacher-courses/teacher/{teacherId}  -> List<TeacherCourse> { id, teacher, course }
// GET  /enrollments/course/{courseId}        -> List<Enrollment>
// POST /attendance                           -> mark attendance (any authenticated user)
// GET  /reports/attendance/{enrollmentId}    -> { enrollmentId, percentage }

function TeacherAttendance() {
  const { user } = useAuth();
  const toast = useToast();

  const [teacherCourses, setTeacherCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrollments, setEnrollments]   = useState([]);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [present, setPresent]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);

  const [reportEnrollmentId, setReportEnrollmentId] = useState("");
  const [report, setReport]             = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // GET /teacher-courses/teacher/{teacherId}
  useEffect(() => {
    if (!user?.teacherId) return;
    api.get(`/teacher-courses/teacher/${user.teacherId}`)
      .then((r) => setTeacherCourses(r.data))
      .catch(() => toast("Failed to load your courses", "error"));
  }, [user]);

  // GET /enrollments/course/{courseId}
  useEffect(() => {
    if (!selectedCourseId) { setEnrollments([]); setEnrollmentId(""); return; }
    api.get(`/enrollments/course/${selectedCourseId}`)
      .then((r) => setEnrollments(r.data))
      .catch(() => toast("Failed to load enrollments", "error"));
  }, [selectedCourseId]);

  // POST /attendance
  const markAttendance = () => {
    if (!enrollmentId) { toast("Select a student enrollment", "warn"); return; }
    setSubmitting(true);
    api.post("/attendance", { enrollmentId: Number(enrollmentId), present })
      .then(() => { toast(present ? "Marked Present" : "Marked Absent"); setEnrollmentId(""); })
      .catch((e) => toast(e?.response?.data?.message ?? "Failed to save", "error"))
      .finally(() => setSubmitting(false));
  };

  // GET /reports/attendance/{enrollmentId}
  const fetchReport = () => {
    if (!reportEnrollmentId) return;
    setReportLoading(true); setReport(null);
    api.get(`/reports/attendance/${reportEnrollmentId}`)
      .then((r) => setReport(r.data))
      .catch(() => toast("Could not fetch attendance report", "error"))
      .finally(() => setReportLoading(false));
  };

  const selectedEnrollment = enrollments.find((e) => String(e.id) === String(enrollmentId));
  const pct = report?.percentage ?? 0;

  return (
    <div>
      <h1 className="page-title">Attendance</h1>
      <p className="page-subtitle">Mark attendance for students in your courses</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Mark attendance */}
        <div className="card">
          <p className="section-title">Mark Attendance</p>
          <div className="flex flex-col gap-16 mb-16">

            <div className="form-group">
              <label className="form-label">Your Course</label>
              <select className="form-select" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                <option value="">Select course...</option>
                {teacherCourses.map((tc) => (
                  <option key={tc.id} value={tc.course?.id}>
                    {tc.course?.courseCode} — {tc.course?.title}
                  </option>
                ))}
              </select>
            </div>

            {enrollments.length > 0 && (
              <div className="form-group">
                <label className="form-label">Student</label>
                <select className="form-select" value={enrollmentId} onChange={(e) => setEnrollmentId(e.target.value)}>
                  <option value="">Select student...</option>
                  {enrollments.map((e) => (
                    <option key={e.id} value={e.id}>
                      #{e.id} — {e.student?.rollNo} {e.student?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedEnrollment && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "10px 12px", fontSize: "0.82rem" }}>
                <DeptBadge dept={selectedEnrollment.student?.department} />
                <span style={{ color: "var(--text)", fontWeight: 600 }}>{selectedEnrollment.student?.name}</span>
                <span style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>{selectedEnrollment.student?.rollNo}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Status</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[{ val: true, label: "Present" }, { val: false, label: "Absent" }].map(({ val, label }) => (
                  <button key={String(val)} onClick={() => setPresent(val)} style={{
                    flex: 1, cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600,
                    fontSize: "0.9rem", padding: "12px", borderRadius: "var(--radius-sm)",
                    transition: "all 0.15s", border: `2px solid ${present === val ? (val ? "var(--green)" : "var(--red)") : "var(--border-light)"}`,
                    background: present === val ? "var(--bg-hover)" : "transparent",
                    color: present === val ? (val ? "var(--green)" : "var(--red)") : "var(--text-muted)",
                  }}>{label}</button>
                ))}
              </div>
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={markAttendance} disabled={submitting || !enrollmentId}>
            {submitting ? "Saving..." : "Save Attendance"}
          </button>
        </div>

        {/* Attendance % report */}
        <div className="card">
          <p className="section-title">Check Attendance %</p>
          <div className="flex flex-col gap-12 mb-16">
            <div className="form-group">
              <label className="form-label">Enrollment</label>
              <select className="form-select" value={reportEnrollmentId} onChange={(e) => setReportEnrollmentId(e.target.value)}>
                <option value="">Select enrollment...</option>
                {enrollments.map((e) => (
                  <option key={e.id} value={e.id}>#{e.id} — {e.student?.rollNo} {e.student?.name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-ghost" onClick={fetchReport} disabled={!reportEnrollmentId || reportLoading}>
              {reportLoading ? "Loading..." : "Get Report"}
            </button>
          </div>

          {report ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Attendance rate</span>
                <span style={{ fontWeight: 700, fontSize: "1.5rem", color: pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)" }}>
                  {pct.toFixed(1)}%
                </span>
              </div>
              <div className="progress-bar-track" style={{ marginBottom: 10 }}>
                <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)" }} />
              </div>
              <span className={`badge ${pct >= 75 ? "badge-green" : pct >= 50 ? "badge-amber" : "badge-red"}`}>
                {pct >= 75 ? "Good Standing" : pct >= 50 ? "At Risk" : "Below Minimum"}
              </span>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "16px 0" }}>
              <p>Select an enrollment to check their attendance %.</p>
            </div>
          )}
        </div>
      </div>

      {teacherCourses.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">&#x1F4DA;</div>
            <p>No courses assigned to you yet. Ask an admin to assign courses via Teacher-Course mapping.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherAttendance;
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { DeptBadge } from "../../components/DeptBadge";

// Teacher sees only enrollments in their assigned courses
// POST /teacher/attendance  { enrollmentId, present }
// GET  /teacher/courses     -> List<Course>  (courses assigned to this teacher)
// GET  /enrollments/course/{courseId}  -> List<Enrollment>

function TeacherAttendance() {
  const { user } = useAuth();
  const toast = useToast();

  const [courses, setCourses]           = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrollments, setEnrollments]   = useState([]);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [present, setPresent]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);

  // Attendance % lookup
  const [reportId, setReportId]         = useState("");
  const [report, setReport]             = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Load teacher's courses
  useEffect(() => {
    api.get("/teacher/courses")
      .then((r) => setCourses(r.data))
      .catch(() => toast("Failed to load your courses", "error"));
  }, []);

  // Load enrollments when course selected
  useEffect(() => {
    if (!selectedCourse) { setEnrollments([]); setEnrollmentId(""); return; }
    api.get(`/enrollments/course/${selectedCourse}`)
      .then((r) => setEnrollments(r.data))
      .catch(() => toast("Failed to load enrollments", "error"));
  }, [selectedCourse]);

  const markAttendance = () => {
    if (!enrollmentId) { toast("Select an enrollment", "warn"); return; }
    setSubmitting(true);
    api.post("/teacher/attendance", { enrollmentId: Number(enrollmentId), present })
      .then(() => { toast(present ? "Marked Present" : "Marked Absent"); setEnrollmentId(""); })
      .catch((e) => toast(e?.response?.data?.message ?? "Failed to save", "error"))
      .finally(() => setSubmitting(false));
  };

  const fetchReport = () => {
    if (!reportId) return;
    setReportLoading(true); setReport(null);
    api.get(`/reports/attendance/${reportId}`)
      .then((r) => setReport(r.data))
      .catch(() => toast("Could not fetch report", "error"))
      .finally(() => setReportLoading(false));
  };

  const selectedEnrollment = enrollments.find((e) => String(e.id) === String(enrollmentId));
  const pct = report?.percentage ?? 0;

  return (
    <div>
      <h1 className="page-title">Attendance</h1>
      <p className="page-subtitle">Mark attendance for your course enrollments</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Mark form */}
        <div className="card">
          <p className="section-title">Mark Attendance</p>
          <div className="flex flex-col gap-16 mb-16">
            <div className="form-group">
              <label className="form-label">Your Course</label>
              <select className="form-select" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                <option value="">Select course...</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.courseCode} — {c.title}</option>)}
              </select>
            </div>

            {enrollments.length > 0 && (
              <div className="form-group">
                <label className="form-label">Student Enrollment</label>
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
                <span style={{ color: "var(--text-muted)" }}>{selectedEnrollment.student?.rollNo}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Status</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[{ val: true, label: "Present", icon: "+" }, { val: false, label: "Absent", icon: "x" }].map(({ val, label, icon }) => (
                  <button key={String(val)} onClick={() => setPresent(val)} style={{
                    flex: 1, cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600,
                    fontSize: "0.9rem", padding: "12px", borderRadius: "var(--radius-sm)",
                    transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    background: present === val ? "var(--bg-hover)" : "transparent",
                    border: `2px solid ${present === val ? (val ? "var(--green)" : "var(--red)") : "var(--border-light)"}`,
                    color: present === val ? (val ? "var(--green)" : "var(--red)") : "var(--text-muted)",
                  }}>{icon} {label}</button>
                ))}
              </div>
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={markAttendance} disabled={submitting || !enrollmentId}>
            {submitting ? "Saving..." : "Save Attendance"}
          </button>
        </div>

        {/* Attendance % */}
        <div className="card">
          <p className="section-title">Check Attendance %</p>
          <div className="flex flex-col gap-12 mb-16">
            <div className="form-group">
              <label className="form-label">Enrollment</label>
              <select className="form-select" value={reportId} onChange={(e) => setReportId(e.target.value)}>
                <option value="">Select enrollment...</option>
                {enrollments.map((e) => (
                  <option key={e.id} value={e.id}>#{e.id} — {e.student?.rollNo} {e.student?.name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-ghost" onClick={fetchReport} disabled={!reportId || reportLoading}>
              {reportLoading ? "Loading..." : "Get Report"}
            </button>
          </div>
          {report ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Attendance rate</span>
                <span style={{ fontWeight: 700, fontSize: "1.5rem", color: pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)" }}>{pct.toFixed(1)}%</span>
              </div>
              <div className="progress-bar-track" style={{ marginBottom: 10 }}>
                <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)" }} />
              </div>
              <span className={`badge ${pct >= 75 ? "badge-green" : pct >= 50 ? "badge-amber" : "badge-red"}`}>
                {pct >= 75 ? "Good Standing" : pct >= 50 ? "At Risk" : "Below Minimum"}
              </span>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "16px 0" }}><p>Select an enrollment to check %.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherAttendance;

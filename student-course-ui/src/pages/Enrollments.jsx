import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";
import { DeptBadge } from "./Students";

function Enrollments() {
  const [students, setStudents]       = useState([]);
  const [courses, setCourses]         = useState([]);
  const [studentId, setStudentId]     = useState("");
  const [courseId, setCourseId]       = useState("");
  const [submitting, setSubmitting]   = useState(false);

  const [lookupStudentId, setLookupStudentId] = useState("");
  const [lookupResult, setLookupResult]       = useState(null);
  const [lookupLoading, setLookupLoading]     = useState(false);

  const toast = useToast();

  useEffect(() => {
    api.get("/students").then((r) => setStudents(r.data)).catch(() => {});
    api.get("/courses").then((r) => setCourses(r.data)).catch(() => {});
  }, []);

  const enroll = () => {
    if (!studentId || !courseId) { toast("Select both a student and a course", "warn"); return; }
    setSubmitting(true);
    api.post("/enrollments", { studentId: Number(studentId), courseId: Number(courseId) })
      .then(() => { toast("Enrollment successful 🎉"); setStudentId(""); setCourseId(""); })
      .catch((e) => toast(e?.response?.data?.message ?? "Enrollment failed", "error"))
      .finally(() => setSubmitting(false));
  };

  const lookup = () => {
    if (!lookupStudentId) return;
    setLookupLoading(true); setLookupResult(null);
    api.get(`/enrollments/student/${lookupStudentId}`)
      .then((r) => setLookupResult(r.data))
      .catch(() => toast("Could not find enrollments", "error"))
      .finally(() => setLookupLoading(false));
  };

  const dropCourse = (id) => {
    if (!window.confirm("Drop this course enrollment?")) return;
    api.delete(`/enrollments/${id}`)
      .then(() => { toast("Enrollment dropped"); setLookupResult((prev) => prev?.filter((e) => e.id !== id)); })
      .catch(() => toast("Failed to drop enrollment", "error"));
  };

  // selected student preview
  const selectedStudent = students.find((s) => String(s.id) === String(studentId));
  const selectedCourse  = courses.find((c) => String(c.id) === String(courseId));

  return (
    <div>
      <h1 className="page-title">Enrollments</h1>
      <p className="page-subtitle">Assign students to courses and manage course drops</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Enroll card */}
        <div className="card">
          <p className="section-title">Enroll a Student</p>
          <div className="flex flex-col gap-16 mb-16">
            <div className="form-group">
              <label className="form-label">Student</label>
              <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">Select student…</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.rollNo ?? `#${s.id}`} — {s.name} [{s.department}]
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Course</label>
              <select className="form-select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">Select course…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseCode ?? `#${c.id}`} — {c.title} ({c.credits} cr)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          {selectedStudent && selectedCourse && (
            <div style={{
              background: "var(--bg)", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-light)", padding: "12px 14px",
              marginBottom: 16, fontSize: "0.85rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <DeptBadge dept={selectedStudent.department} />
                <span style={{ color: "var(--text)", fontWeight: 600 }}>{selectedStudent.name}</span>
                <span style={{ color: "var(--text-muted)" }}>{selectedStudent.rollNo}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "monospace", color: "var(--accent)", fontSize: "0.8rem" }}>{selectedCourse.courseCode}</span>
                <span style={{ color: "var(--text-soft)" }}>→</span>
                <span style={{ color: "var(--text)" }}>{selectedCourse.title}</span>
                <span className="badge badge-blue">{selectedCourse.credits} cr</span>
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-full" onClick={enroll} disabled={submitting}>
            {submitting ? "Enrolling…" : "🔗 Confirm Enrollment"}
          </button>
        </div>

        {/* Info card */}
        <div className="card" style={{ borderColor: "var(--blue)", background: "var(--blue-dim)" }}>
          <p className="section-title" style={{ color: "var(--blue)" }}>Enrollment rules</p>
          <div className="flex flex-col gap-12" style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>
            <p>🔒 A student can only enroll in a course <strong>once</strong>.</p>
            <p>🪑 Enrollment fails if the course has reached its <strong>max seats</strong>.</p>
            <p>🔑 Each enrollment gets a unique <strong>Enrollment ID</strong> — used when recording grades and attendance.</p>
            <p>🗑️ Dropping a course removes the enrollment and all linked grades/attendance.</p>
          </div>
        </div>
      </div>

      {/* Lookup by student */}
      <div className="card">
        <p className="section-title">View Enrollments by Student</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, maxWidth: 360 }}>
            <label className="form-label">Student</label>
            <select className="form-select" value={lookupStudentId} onChange={(e) => setLookupStudentId(e.target.value)}>
              <option value="">Select student…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.rollNo ?? `#${s.id}`} — {s.name} [{s.department}]</option>
              ))}
            </select>
          </div>
          <button className="btn btn-ghost" onClick={lookup} disabled={!lookupStudentId || lookupLoading}>
            {lookupLoading ? "Loading…" : "🔍 Look Up"}
          </button>
        </div>

        {lookupResult === null && !lookupLoading && (
          <div className="empty-state"><div className="empty-icon">🔍</div><p>Select a student to see their enrolled courses.</p></div>
        )}
        {lookupLoading && <div className="empty-state"><p>Loading…</p></div>}
        {lookupResult && lookupResult.length === 0 && (
          <div className="empty-state"><div className="empty-icon">🔗</div><p>This student has no active enrollments.</p></div>
        )}
        {lookupResult && lookupResult.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Enrollment ID</th><th>Course Code</th><th>Course</th><th>Credits</th><th></th></tr></thead>
              <tbody>
                {lookupResult.map((e) => (
                  <tr key={e.id}>
                    <td><span className="id-chip">#{e.id}</span></td>
                    <td>
                      <span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600, fontSize: "0.82rem" }}>
                        {e.course?.courseCode ?? "—"}
                      </span>
                    </td>
                    <td className="primary-col">{e.course?.title ?? "—"}</td>
                    <td><span className="badge badge-blue">{e.course?.credits ?? "—"} cr</span></td>
                    <td className="text-right">
                      <button className="btn btn-danger btn-sm" onClick={() => dropCourse(e.id)}>Drop</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Enrollments;
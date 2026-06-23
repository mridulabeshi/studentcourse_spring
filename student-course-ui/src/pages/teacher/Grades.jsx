import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast";
import { DeptBadge } from "../../components/DeptBadge";

const GRADE_OPTIONS = [
  { value: "S", label: "S — Outstanding", score: 10, color: "badge-purple" },
  { value: "A", label: "A — Excellent",   score: 9,  color: "badge-green"  },
  { value: "B", label: "B — Good",        score: 8,  color: "badge-blue"   },
  { value: "C", label: "C — Average",     score: 7,  color: "badge-amber"  },
  { value: "D", label: "D — Below Avg",   score: 6,  color: "badge-red"    },
  { value: "E", label: "E — Fail",        score: 5,  color: "badge-red"    },
];
const gradeMap   = Object.fromEntries(GRADE_OPTIONS.map((g) => [g.value, g]));
const gradeColor = (g) => ({ S:"badge-purple", A:"badge-green", B:"badge-blue", C:"badge-amber", D:"badge-red", E:"badge-red" }[g?.toUpperCase()] ?? "badge-blue");

// POST /teacher/grades { enrollmentId, grade, semester }
function TeacherGrades() {
  const toast = useToast();
  const [courses, setCourses]         = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [grade, setGrade]             = useState("");
  const [semester, setSemester]       = useState("");
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => {
    api.get("/teacher/courses").then((r) => setCourses(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCourse) { setEnrollments([]); setEnrollmentId(""); return; }
    api.get(`/enrollments/course/${selectedCourse}`)
      .then((r) => setEnrollments(r.data))
      .catch(() => toast("Failed to load enrollments", "error"));
  }, [selectedCourse]);

  const saveGrade = () => {
    if (!enrollmentId || !grade || !semester.trim()) { toast("All fields required", "warn"); return; }
    setSubmitting(true);
    api.post("/teacher/grades", { enrollmentId: Number(enrollmentId), grade, semester })
      .then(() => { toast("Grade saved"); setEnrollmentId(""); setGrade(""); setSemester(""); })
      .catch((e) => toast(e?.response?.data?.message ?? "Failed to save grade", "error"))
      .finally(() => setSubmitting(false));
  };

  const selectedEnrollment = enrollments.find((e) => String(e.id) === String(enrollmentId));
  const selectedGrade = gradeMap[grade];

  return (
    <div>
      <h1 className="page-title">Grades</h1>
      <p className="page-subtitle">Post grades for students in your courses</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <p className="section-title">Post a Grade</p>
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
                <label className="form-label">Student</label>
                <select className="form-select" value={enrollmentId} onChange={(e) => setEnrollmentId(e.target.value)}>
                  <option value="">Select student...</option>
                  {enrollments.map((e) => (
                    <option key={e.id} value={e.id}>#{e.id} — {e.student?.rollNo} {e.student?.name}</option>
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Grade</label>
                <select className="form-select" value={grade} onChange={(e) => setGrade(e.target.value)}>
                  <option value="">Select grade...</option>
                  {GRADE_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label} ({g.score}/10)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Semester</label>
                <input className="form-input" placeholder="e.g. Fall 2024" value={semester} onChange={(e) => setSemester(e.target.value)} />
              </div>
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={saveGrade} disabled={submitting || !enrollmentId}>
            {submitting ? "Saving..." : "Save Grade"}
          </button>
        </div>

        {/* Preview + scale */}
        <div className="flex flex-col gap-16">
          <div className="card">
            <p className="section-title">Preview</p>
            {grade && selectedEnrollment ? (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span className={`badge ${selectedGrade?.color}`} style={{ fontSize: "1.5rem", padding: "8px 20px" }}>{grade}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text)" }}>{selectedGrade?.label}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Score: {selectedGrade?.score}/10</div>
                  {semester && <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Semester: {semester}</div>}
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "12px 0" }}><p>Select student and grade to preview.</p></div>
            )}
          </div>
          <div className="card">
            <p className="section-title">Grade Scale</p>
            <div className="flex flex-col gap-8">
              {GRADE_OPTIONS.map((g) => (
                <div key={g.value} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className={`badge ${g.color}`} style={{ minWidth: 32, textAlign: "center" }}>{g.value}</span>
                  <div className="progress-bar-track" style={{ flex: 1 }}>
                    <div className="progress-bar-fill" style={{ width: `${g.score * 10}%`, background: g.score >= 8 ? "var(--green)" : g.score >= 6 ? "var(--amber)" : "var(--red)" }} />
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", minWidth: 42 }}>{g.score}/10</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherGrades;

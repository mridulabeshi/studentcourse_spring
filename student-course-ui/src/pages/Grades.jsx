import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";
import { DeptBadge } from "../components/DeptBadge";

const GRADE_OPTIONS = [
  { value: "S", label: "S — Outstanding", score: 10, color: "badge-purple" },
  { value: "A", label: "A — Excellent",   score: 9,  color: "badge-green"  },
  { value: "B", label: "B — Good",        score: 8,  color: "badge-blue"   },
  { value: "C", label: "C — Average",     score: 7,  color: "badge-amber"  },
  { value: "D", label: "D — Below Avg",   score: 6,  color: "badge-red"    },
  { value: "E", label: "E — Fail",        score: 5,  color: "badge-red"    },
];

const gradeMap = Object.fromEntries(GRADE_OPTIONS.map((g) => [g.value, g]));

function Grades() {
  const [enrollments, setEnrollments]   = useState([]);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [grade, setGrade]               = useState("");
  const [semester, setSemester]         = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get("/enrollments").then((r) => setEnrollments(r.data)).catch(() => {});
  }, []);

  const saveGrade = () => {
    if (!enrollmentId || !grade || !semester.trim()) {
      toast("All fields are required", "warn"); return;
    }
    setSubmitting(true);
    api.post("/grades", { enrollmentId: Number(enrollmentId), grade, semester })
      .then(() => {
        toast("Grade saved successfully 🏅");
        setEnrollmentId(""); setGrade(""); setSemester("");
      })
      .catch((e) => toast(e?.response?.data?.message ?? "Failed to save grade", "error"))
      .finally(() => setSubmitting(false));
  };

  const selectedEnrollment = enrollments.find((e) => String(e.id) === String(enrollmentId));
  const selectedGrade = gradeMap[grade];

  return (
    <div>
      <h1 className="page-title">Grades</h1>
      <p className="page-subtitle">Record grades per enrollment</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Form */}
        <div className="card">
          <p className="section-title">Post a Grade</p>
          <div className="flex flex-col gap-16 mb-16">
            <div className="form-group">
              <label className="form-label">Enrollment</label>
              <select className="form-select" value={enrollmentId} onChange={(e) => setEnrollmentId(e.target.value)}>
                <option value="">Select enrollment…</option>
                {enrollments.map((e) => (
                  <option key={e.id} value={e.id}>
                    #{e.id} — {e.student?.rollNo ?? e.student?.name ?? "Student"} → {e.course?.courseCode ?? e.course?.title ?? "Course"}
                  </option>
                ))}
              </select>
            </div>

            {/* Student info preview */}
            {selectedEnrollment && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "10px 12px", fontSize: "0.82rem" }}>
                <DeptBadge dept={selectedEnrollment.student?.department} />
                <span style={{ color: "var(--text)", fontWeight: 600 }}>{selectedEnrollment.student?.name}</span>
                <span style={{ color: "var(--text-muted)" }}>{selectedEnrollment.student?.rollNo}</span>
                <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>{selectedEnrollment.course?.courseCode}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Grade</label>
                <select className="form-select" value={grade} onChange={(e) => setGrade(e.target.value)}>
                  <option value="">Select grade…</option>
                  {GRADE_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label} ({g.score}/10)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Semester</label>
                <input className="form-input" placeholder="e.g. Fall 2024" value={semester} onChange={(e) => setSemester(e.target.value)} />
              </div>
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={saveGrade} disabled={submitting}>
            {submitting ? "Saving…" : "🏅 Save Grade"}
          </button>
        </div>

        {/* Preview + scale */}
        <div className="flex flex-col gap-16">
          {/* Live preview */}
          {selectedEnrollment && grade ? (
            <div className="card" style={{ borderColor: selectedGrade?.score >= 8 ? "var(--green)" : selectedGrade?.score >= 6 ? "var(--amber)" : "var(--red)" }}>
              <p className="section-title">Grade Preview</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span className={`badge ${selectedGrade?.color}`} style={{ fontSize: "1.5rem", padding: "8px 20px" }}>{grade}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "1rem" }}>{selectedGrade?.label}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Score: {selectedGrade?.score} / 10</div>
                  {semester && <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Semester: {semester}</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <p className="section-title">Grade Preview</p>
              <div className="empty-state" style={{ padding: "16px 0" }}><p>Select an enrollment and grade to preview.</p></div>
            </div>
          )}

          {/* Grade scale */}
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

export default Grades;
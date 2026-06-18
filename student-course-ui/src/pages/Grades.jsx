import { useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";

// Must match backend: S=10, A=9, B=8, C=7, D=6, E=5
const GRADE_OPTIONS = [
  { value: "S", label: "S — Outstanding (10)", color: "badge-purple" },
  { value: "A", label: "A — Excellent (9)",    color: "badge-green"  },
  { value: "B", label: "B — Good (8)",          color: "badge-blue"   },
  { value: "C", label: "C — Average (7)",       color: "badge-amber"  },
  { value: "D", label: "D — Below Avg (6)",     color: "badge-red"    },
  { value: "E", label: "E — Fail (5)",          color: "badge-red"    },
];

const gradeColor = (g) => {
  switch (g?.toUpperCase()) {
    case "S": return "badge-purple";
    case "A": return "badge-green";
    case "B": return "badge-blue";
    case "C": return "badge-amber";
    case "D":
    case "E": return "badge-red";
    default:  return "badge-blue";
  }
};

const gradeScore = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5 };

function Grades() {
  const [enrollmentId, setEnrollmentId] = useState("");
  const [grade, setGrade]               = useState("");
  const [semester, setSemester]         = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const toast = useToast();

  const saveGrade = () => {
    if (!enrollmentId || !grade || !semester.trim()) {
      toast("All fields are required", "warn");
      return;
    }
    setSubmitting(true);
    api.post("/grades", {
      enrollmentId: Number(enrollmentId),
      grade,
      semester,
    })
      .then(() => {
        toast("Grade saved successfully");
        setEnrollmentId(""); setGrade(""); setSemester("");
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to save grade. Check enrollment ID.";
        toast(msg, "error");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div>
      <h1 className="page-title">Grades</h1>
      <p className="page-subtitle">Record student grades per enrollment</p>

      <div className="card" style={{ maxWidth: 560 }}>
        <p className="section-title">Post a Grade</p>

        <div className="flex flex-col gap-16 mb-24">
          <div className="form-group">
            <label className="form-label">Enrollment ID</label>
            <input
              className="form-input"
              placeholder="Enter enrollment ID"
              type="number"
              value={enrollmentId}
              onChange={(e) => setEnrollmentId(e.target.value)}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Find enrollment IDs in View Records → Enrollments
            </span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Grade</label>
              <select
                className="form-select"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="">Select grade…</option>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Semester</label>
              <input
                className="form-input"
                placeholder="e.g. Fall 2024"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              />
            </div>
          </div>

          {/* Grade preview */}
          {grade && (
            <div style={{
              alignItems: "center",
              background: "var(--bg)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              gap: 16,
              padding: "12px 16px",
            }}>
              <span className={`badge ${gradeColor(grade)}`} style={{ fontSize: "1rem", padding: "4px 16px" }}>
                {grade}
              </span>
              <div>
                <div style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 600 }}>
                  Score: {gradeScore[grade]} / 10
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {GRADE_OPTIONS.find(o => o.value === grade)?.label.split("—")[1]?.trim()}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={saveGrade}
          disabled={submitting}
        >
          {submitting ? "Saving..." : "🏅 Save Grade"}
        </button>
      </div>

      {/* Grade scale reference */}
      <div className="card mt-16" style={{ maxWidth: 560 }}>
        <p className="section-title">Grade Scale Reference</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {GRADE_OPTIONS.map((g) => (
            <div key={g.value} style={{
              alignItems: "center",
              background: "var(--bg)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              gap: 8,
              padding: "8px 12px",
            }}>
              <span className={`badge ${g.color}`}>{g.value}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {g.label.split("—")[1]?.trim()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Grades;
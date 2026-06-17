import { useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";

const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

const gradeColor = (g) => {
  if (!g) return "badge-blue";
  if (g.startsWith("A")) return "badge-green";
  if (g.startsWith("B")) return "badge-blue";
  if (g.startsWith("C")) return "badge-amber";
  return "badge-red";
};

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
      .catch(() => toast("Failed to save grade", "error"))
      .finally(() => setSubmitting(false));
  };

  return (
    <div>
      <h1 className="page-title">Grades</h1>
      <p className="page-subtitle">Record student grades per enrollment</p>

      <div className="card" style={{ maxWidth: 540 }}>
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
                  <option key={g} value={g}>{g}</option>
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

          {/* Grade Preview */}
          {grade && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Preview:</span>
              <span className={`badge ${gradeColor(grade)}`} style={{ fontSize: "0.9rem", padding: "4px 14px" }}>
                {grade}
              </span>
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
    </div>
  );
}

export default Grades;

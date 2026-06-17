import { useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";

function Enrollments() {
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const enroll = () => {
    if (!studentId || !courseId) {
      toast("Please enter both Student ID and Course ID", "warn");
      return;
    }
    setSubmitting(true);
    api.post("/enrollments", {
      studentId: Number(studentId),
      courseId: Number(courseId),
    })
      .then(() => {
        toast("Student enrolled successfully 🎉");
        setStudentId(""); setCourseId("");
      })
      .catch(() => toast("Enrollment failed. Check the IDs.", "error"))
      .finally(() => setSubmitting(false));
  };

  return (
    <div>
      <h1 className="page-title">Enrollments</h1>
      <p className="page-subtitle">Assign students to courses</p>

      <div className="card" style={{ maxWidth: 520 }}>
        <p className="section-title">Enroll a Student</p>

        <div className="flex flex-col gap-16 mb-24">
          <div className="form-group">
            <label className="form-label">Student ID</label>
            <input
              className="form-input"
              placeholder="Enter student ID"
              type="number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Find IDs in the Students page
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Course ID</label>
            <input
              className="form-input"
              placeholder="Enter course ID"
              type="number"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Find IDs in the Courses page
            </span>
          </div>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={enroll}
          disabled={submitting}
        >
          {submitting ? "Enrolling..." : "🔗 Enroll Student"}
        </button>
      </div>

      {/* Info card */}
      <div
        className="card mt-16"
        style={{
          maxWidth: 520,
          borderColor: "var(--blue)",
          background: "var(--blue-dim)",
        }}
      >
        <p style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>
          <strong style={{ color: "var(--blue)" }}>💡 Tip:</strong> A student can
          be enrolled in multiple courses. Each enrollment gets a unique enrollment
          ID used in Grades and Attendance.
        </p>
      </div>
    </div>
  );
}

export default Enrollments;

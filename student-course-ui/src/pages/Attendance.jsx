import { useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";

function Attendance() {
  const [enrollmentId, setEnrollmentId] = useState("");
  const [present, setPresent]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const toast = useToast();

  const markAttendance = () => {
    if (!enrollmentId) {
      toast("Please enter an enrollment ID", "warn");
      return;
    }
    setSubmitting(true);
    api.post("/attendance", {
      enrollmentId: Number(enrollmentId),
      present,
    })
      .then(() => {
        toast(present ? "Marked as Present ✓" : "Marked as Absent");
        setEnrollmentId("");
      })
      .catch(() => toast("Failed to save attendance", "error"))
      .finally(() => setSubmitting(false));
  };

  return (
    <div>
      <h1 className="page-title">Attendance</h1>
      <p className="page-subtitle">Record attendance for an enrollment</p>

      <div className="card" style={{ maxWidth: 460 }}>
        <p className="section-title">Mark Attendance</p>

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

          {/* Toggle */}
          <div className="form-group">
            <label className="form-label">Status</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { val: true,  label: "Present", icon: "✓", cls: "badge-green" },
                { val: false, label: "Absent",  icon: "✕", cls: "badge-red"   },
              ].map(({ val, label, icon, cls }) => (
                <button
                  key={String(val)}
                  onClick={() => setPresent(val)}
                  style={{
                    background: present === val ? "var(--bg-hover)" : "transparent",
                    border: `2px solid ${present === val
                      ? (val ? "var(--green)" : "var(--red)")
                      : "var(--border-light)"}`,
                    borderRadius: "var(--radius-sm)",
                    color: present === val
                      ? (val ? "var(--green)" : "var(--red)")
                      : "var(--text-muted)",
                    cursor: "pointer",
                    flex: 1,
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    padding: "12px",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Will be recorded as:</span>
            <span className={`badge ${present ? "badge-green" : "badge-red"}`}>
              {present ? "Present" : "Absent"}
            </span>
          </div>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={markAttendance}
          disabled={submitting}
        >
          {submitting ? "Saving..." : "📋 Save Attendance"}
        </button>
      </div>
    </div>
  );
}

export default Attendance;

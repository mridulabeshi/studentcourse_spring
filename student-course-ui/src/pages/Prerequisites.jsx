import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";

function Prerequisites() {
  const [courses, setCourses]         = useState([]);
  const [all, setAll]                 = useState([]);
  const [courseId, setCourseId]       = useState("");
  const [prereqId, setPrereqId]       = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [loading, setLoading]         = useState(true);
  const toast = useToast();

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.get("/courses"),
      api.get("/prerequisites"),
    ])
      .then(([c, p]) => { setCourses(c.data); setAll(p.data); })
      .catch(() => toast("Failed to load data", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const addPrerequisite = () => {
    if (!courseId || !prereqId) { toast("Select both fields", "warn"); return; }
    if (courseId === prereqId) { toast("A course cannot be its own prerequisite", "warn"); return; }
    setSubmitting(true);
    api.post("/prerequisites", { courseId: Number(courseId), prerequisiteCourseId: Number(prereqId) })
      .then(() => { toast("Prerequisite added"); setCourseId(""); setPrereqId(""); loadAll(); })
      .catch((e) => toast(e?.response?.data?.message ?? "Failed to add prerequisite", "error"))
      .finally(() => setSubmitting(false));
  };

  // Group prerequisites by course for display
  const grouped = all.reduce((acc, p) => {
    const key = p.course?.title ?? p.courseId ?? "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p.prerequisiteCourse?.title ?? p.prerequisiteCourseId ?? "Unknown");
    return acc;
  }, {});

  return (
    <div>
      <h1 className="page-title">Prerequisites</h1>
      <p className="page-subtitle">Define which courses must be completed before enrolling in another</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Add form */}
        <div className="card">
          <p className="section-title">Add Prerequisite</p>
          <div className="flex flex-col gap-16 mb-24">
            <div className="form-group">
              <label className="form-label">Course</label>
              <select className="form-select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">Select course…</option>
                {courses.map((c) => <option key={c.id} value={c.id}>#{c.id} — {c.title}</option>)}
              </select>
            </div>
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              requires completion of ↓
            </div>
            <div className="form-group">
              <label className="form-label">Prerequisite Course</label>
              <select className="form-select" value={prereqId} onChange={(e) => setPrereqId(e.target.value)}>
                <option value="">Select prerequisite…</option>
                {courses.filter((c) => String(c.id) !== courseId).map((c) => (
                  <option key={c.id} value={c.id}>#{c.id} — {c.title}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={addPrerequisite} disabled={submitting}>
            {submitting ? "Adding…" : "+ Add Prerequisite"}
          </button>
        </div>

        {/* Info */}
        <div className="card" style={{ borderColor: "var(--amber)", background: "var(--amber-dim)" }}>
          <p className="section-title" style={{ color: "var(--amber)" }}>About prerequisites</p>
          <div className="flex flex-col gap-12" style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>
            <p>📚 A prerequisite means students must pass <strong>Course A</strong> before enrolling in <strong>Course B</strong>.</p>
            <p>🔗 Example: <em>Data Structures</em> → prerequisite of → <em>Algorithm Design</em>.</p>
            <p>⚙️ Prerequisite checks happen at enrollment time in the backend.</p>
          </div>
        </div>
      </div>

      {/* All prerequisites */}
      <div className="card">
        <div className="flex items-center justify-between mb-16">
          <p className="section-title" style={{ marginBottom: 0 }}>All Prerequisites</p>
          <span className="badge badge-amber">{all.length} rules</span>
        </div>

        {loading ? (
          <div className="empty-state"><p>Loading…</p></div>
        ) : all.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔗</div>
            <p>No prerequisites defined yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {Object.entries(grouped).map(([course, prereqs]) => (
              <div key={course} style={{
                background: "var(--bg)",
                borderRadius: "var(--radius-sm)",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{course}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>requires:</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {prereqs.map((p, i) => (
                    <span key={i} className="badge badge-amber">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Prerequisites;

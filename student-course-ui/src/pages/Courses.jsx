import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";

function Courses() {
  const [courses, setCourses]       = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [search, setSearch]         = useState("");

  // form
  const [title, setTitle]           = useState("");
  const [credits, setCredits]       = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [maxSeats, setMaxSeats]     = useState("");

  // edit
  const [editing, setEditing]       = useState(null);
  const [editTitle, setEditTitle]   = useState("");
  const [editCredits, setEditCredits] = useState("");

  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const loadCourses = () => {
    setLoading(true);
    api.get("/courses")
      .then((res) => { setCourses(res.data); setFiltered(res.data); })
      .catch(() => toast("Failed to load courses", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCourses(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(courses.filter((c) =>
      !q || c.title?.toLowerCase().includes(q) || c.courseCode?.toLowerCase().includes(q)
    ));
  }, [search, courses]);

  const addCourse = () => {
    if (!title.trim() || !credits || !courseCode.trim()) {
      toast("Title, course code, and credits are required", "warn"); return;
    }
    setSubmitting(true);
    api.post("/courses", { title, credits: Number(credits), courseCode, maxSeats: maxSeats ? Number(maxSeats) : 30 })
      .then(() => { setTitle(""); setCredits(""); setCourseCode(""); setMaxSeats(""); loadCourses(); toast("Course created"); })
      .catch((e) => toast(e?.response?.data?.message ?? "Failed to add course", "error"))
      .finally(() => setSubmitting(false));
  };

  const openEdit = (c) => { setEditing(c); setEditTitle(c.title); setEditCredits(String(c.credits)); };

  const saveEdit = () => {
    if (!editTitle.trim() || !editCredits) { toast("Title and credits required", "warn"); return; }
    api.put(`/courses/${editing.id}`, { ...editing, title: editTitle, credits: Number(editCredits) })
      .then(() => { setEditing(null); loadCourses(); toast("Course updated"); })
      .catch(() => toast("Failed to update", "error"));
  };

  const deleteCourse = (id) => {
    if (!window.confirm("Delete this course?")) return;
    api.delete(`/courses/${id}`)
      .then(() => { loadCourses(); toast("Course deleted"); })
      .catch(() => toast("Failed to delete", "error"));
  };

  const creditBadge = (c) => {
    const n = Number(c);
    if (n >= 4) return "badge-purple";
    if (n === 3) return "badge-blue";
    return "badge-green";
  };

  return (
    <div>
      <h1 className="page-title">Courses</h1>
      <p className="page-subtitle">The academy course catalog</p>

      {/* Add form */}
      <div className="card mb-24">
        <p className="section-title">Add New Course</p>
        <div className="form-row mb-16">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Course Title</label>
            <input className="form-input" placeholder="e.g. Advanced Runic Scripting" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Course Code</label>
            <input className="form-input" placeholder="e.g. WHM301" value={courseCode} onChange={(e) => setCourseCode(e.target.value.toUpperCase())} style={{ fontFamily: "monospace" }} />
          </div>
          <div className="form-group" style={{ maxWidth: 110 }}>
            <label className="form-label">Credits</label>
            <input className="form-input" type="number" min="1" max="6" placeholder="3" value={credits} onChange={(e) => setCredits(e.target.value)} />
          </div>
          <div className="form-group" style={{ maxWidth: 120 }}>
            <label className="form-label">Max Seats</label>
            <input className="form-input" type="number" min="1" placeholder="30" value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={addCourse} disabled={submitting}>
          {submitting ? "Creating…" : "+ Add Course"}
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-12">
            <p className="section-title" style={{ marginBottom: 0 }}>All Courses</p>
            <span className="badge badge-green">{courses.length} total</span>
          </div>
          <input className="form-input" placeholder="Search title or code…" value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        </div>
        <div className="table-wrap">
          {loading ? (
            <div className="empty-state"><p>Loading…</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📚</div><p>{search ? "No courses match." : "No courses yet."}</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>ID</th><th>Code</th><th>Title</th><th>Credits</th><th>Max Seats</th><th></th></tr></thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td><span className="id-chip">#{c.id}</span></td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--accent)", fontSize: "0.82rem", letterSpacing: "0.05em" }}>
                        {c.courseCode ?? "—"}
                      </span>
                    </td>
                    <td className="primary-col">{c.title}</td>
                    <td><span className={`badge ${creditBadge(c.credits)}`}>{c.credits} cr</span></td>
                    <td style={{ color: "var(--text-muted)" }}>{c.maxSeats ?? "—"}</td>
                    <td className="text-right">
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteCourse(c.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={modalStyles.overlay} onClick={() => setEditing(null)}>
          <div style={modalStyles.box} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--text)" }}>
                Edit — <span style={{ fontFamily: "monospace", color: "var(--accent)" }}>{editing.courseCode}</span>
              </h2>
              <button onClick={() => setEditing(null)} style={modalStyles.close}>✕</button>
            </div>
            <div className="flex flex-col gap-16 mb-24">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Credits</label>
                <input className="form-input" type="number" min="1" max="6" value={editCredits} onChange={(e) => setEditCredits(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Course Code</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600 }}>{editing.courseCode}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Code cannot be changed after creation</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit}>Save Changes</button>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const modalStyles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" },
  box: { background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)", maxWidth: 440, padding: 28, width: "90%", boxShadow: "var(--shadow)" },
  close: { background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem", padding: 4 },
};

export default Courses;
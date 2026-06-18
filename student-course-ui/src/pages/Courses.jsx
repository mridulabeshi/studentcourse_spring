import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle]     = useState("");
  const [credits, setCredits] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const loadCourses = () => {
    setLoading(true);
    api.get("/courses")
      .then((res) => setCourses(res.data))
      .catch(() => toast("Failed to load courses", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCourses(); }, []);

  const addCourse = () => {
    if (!title.trim() || !credits) {
      toast("Please fill in all fields", "warn");
      return;
    }
    setSubmitting(true);
    api.post("/courses", { title, credits: Number(credits) })
      .then(() => {
        setTitle(""); setCredits("");
        loadCourses();
        toast("Course added successfully");
      })
      .catch(() => toast("Failed to add course", "error"))
      .finally(() => setSubmitting(false));
  };

  const creditBadge = (c) => {
    const n = Number(c);
    if (n == 4) return "badge-red";
    if (n === 3) return "badge-blue";
    if (n === 2) return "badge-amber";
    return "badge-green";
  };

  return (
    <div>
      <h1 className="page-title">Courses</h1>
      <p className="page-subtitle">Manage the course catalog</p>

      {/* Add Form */}
      <div className="card mb-24">
        <p className="section-title">Add New Course</p>
        <div className="form-row mb-16">
          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input
              className="form-input"
              placeholder="e.g. Data Structures & Algorithms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ maxWidth: 180 }}>
            <label className="form-label">Credits</label>
            <input
              className="form-input"
              placeholder="e.g. 3"
              type="number"
              min="1"
              max="6"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
            />
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={addCourse}
          disabled={submitting}
        >
          {submitting ? "Adding..." : "+ Add Course"}
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-16">
          <p className="section-title" style={{ marginBottom: 0 }}>All Courses</p>
          <span className="badge badge-green">{courses.length} total</span>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div className="empty-state"><p>Loading courses…</p></div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p>No courses yet. Add one above.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td><span className="id-chip">#{c.id}</span></td>
                    <td className="primary-col">{c.title}</td>
                    <td>
                      <span className={`badge ${creditBadge(c.credits)}`}>
                        {c.credits} cr
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Courses;

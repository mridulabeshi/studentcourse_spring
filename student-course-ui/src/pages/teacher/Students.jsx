import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast";
import { DeptBadge } from "../../components/DeptBadge";

// GET /teacher/courses  -> List<Course>
// GET /enrollments/course/{courseId} -> List<Enrollment>
function TeacherStudents() {
  const toast = useToast();
  const [courses, setCourses]       = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");

  useEffect(() => {
    api.get("/teacher/courses").then((r) => setCourses(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCourse) { setEnrollments([]); return; }
    setLoading(true);
    api.get(`/enrollments/course/${selectedCourse}`)
      .then((r) => setEnrollments(r.data))
      .catch(() => toast("Failed to load students", "error"))
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const filtered = enrollments.filter((e) => {
    const q = search.toLowerCase();
    return !q || e.student?.name?.toLowerCase().includes(q) || e.student?.rollNo?.toLowerCase().includes(q);
  });

  const selectedCourseName = courses.find((c) => String(c.id) === String(selectedCourse));

  return (
    <div>
      <h1 className="page-title">My Students</h1>
      <p className="page-subtitle">Students enrolled in your assigned courses</p>

      {/* Course cards */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {courses.map((c) => (
          <button key={c.id} onClick={() => setSelectedCourse(String(c.id))} style={{
            alignItems: "flex-start", background: String(c.id) === selectedCourse ? "var(--accent-dim)" : "var(--bg-card)",
            border: `1px solid ${String(c.id) === selectedCourse ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "var(--radius-sm)", cursor: "pointer", display: "flex",
            flexDirection: "column", fontFamily: "var(--font-body)", gap: 4,
            minWidth: 160, padding: "12px 14px", transition: "all 0.15s", textAlign: "left",
          }}>
            <span style={{ fontFamily: "monospace", color: String(c.id) === selectedCourse ? "var(--accent)" : "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700 }}>{c.courseCode}</span>
            <span style={{ color: String(c.id) === selectedCourse ? "var(--accent)" : "var(--text)", fontSize: "0.85rem", fontWeight: 500 }}>{c.title}</span>
            <span className="badge badge-blue" style={{ marginTop: 4 }}>{c.credits} cr</span>
          </button>
        ))}
        {courses.length === 0 && (
          <div className="empty-state"><div className="empty-icon">&#x1F4DA;</div><p>No courses assigned yet.</p></div>
        )}
      </div>

      {selectedCourse && (
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-12">
              <p className="section-title" style={{ marginBottom: 0 }}>
                {selectedCourseName ? `${selectedCourseName.courseCode} — ${selectedCourseName.title}` : "Students"}
              </p>
              <span className="badge badge-purple">{filtered.length} students</span>
            </div>
            <input className="form-input" placeholder="Search name or roll no..." value={search}
              onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
          </div>

          {loading ? (
            <div className="empty-state"><p>Loading students...</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">&#x1F464;</div><p>No students found.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Enrollment ID</th><th>Roll No</th><th>Name</th><th>Department</th><th>Email</th></tr></thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id}>
                      <td><span className="id-chip">#{e.id}</span></td>
                      <td><span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--text-soft)" }}>{e.student?.rollNo}</span></td>
                      <td className="primary-col">{e.student?.name}</td>
                      <td><DeptBadge dept={e.student?.department} /></td>
                      <td style={{ color: "var(--text-muted)" }}>{e.student?.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!selectedCourse && courses.length > 0 && (
        <div className="empty-state"><div className="empty-icon">&#x1F4CB;</div><p>Select a course above to view its students.</p></div>
      )}
    </div>
  );
}

export default TeacherStudents;

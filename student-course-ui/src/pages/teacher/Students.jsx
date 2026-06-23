import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { DeptBadge } from "../../components/DeptBadge";

// GET /teacher-courses/teacher/{teacherId} -> List<TeacherCourse { id, teacher, course }>
// GET /enrollments/course/{courseId}        -> List<Enrollment>
function TeacherStudents() {
  const { user } = useAuth();
  const toast = useToast();

  const [teacherCourses, setTeacherCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrollments, setEnrollments]   = useState([]);
  const [loading, setLoading]           = useState(false);
  const [search, setSearch]             = useState("");

  useEffect(() => {
    if (!user?.teacherId) return;
    api.get(`/teacher-courses/teacher/${user.teacherId}`)
      .then((r) => setTeacherCourses(r.data))
      .catch(() => toast("Failed to load your courses", "error"));
  }, [user]);

  useEffect(() => {
    if (!selectedCourseId) { setEnrollments([]); return; }
    setLoading(true);
    api.get(`/enrollments/course/${selectedCourseId}`)
      .then((r) => setEnrollments(r.data))
      .catch(() => toast("Failed to load students", "error"))
      .finally(() => setLoading(false));
  }, [selectedCourseId]);

  const filtered = enrollments.filter((e) => {
    const q = search.toLowerCase();
    return !q || e.student?.name?.toLowerCase().includes(q) || e.student?.rollNo?.toLowerCase().includes(q);
  });

  const activeCourse = teacherCourses.find((tc) => String(tc.course?.id) === String(selectedCourseId));

  return (
    <div>
      <h1 className="page-title">My Students</h1>
      <p className="page-subtitle">Students enrolled in your assigned courses</p>

      {/* Course cards */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {teacherCourses.map((tc) => (
          <button key={tc.id} onClick={() => setSelectedCourseId(String(tc.course?.id))} style={{
            alignItems: "flex-start", textAlign: "left", display: "flex", flexDirection: "column", gap: 4,
            minWidth: 160, padding: "12px 16px", cursor: "pointer", fontFamily: "var(--font-body)",
            borderRadius: "var(--radius-sm)", transition: "all 0.15s",
            background: String(tc.course?.id) === selectedCourseId ? "var(--accent-dim)" : "var(--bg-card)",
            border: `1px solid ${String(tc.course?.id) === selectedCourseId ? "var(--accent)" : "var(--border)"}`,
            color: String(tc.course?.id) === selectedCourseId ? "var(--accent)" : "var(--text-muted)",
          }}>
            <span style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700 }}>{tc.course?.courseCode}</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{tc.course?.title}</span>
            <span className="badge badge-blue" style={{ marginTop: 4 }}>{tc.course?.credits} cr</span>
          </button>
        ))}
        {teacherCourses.length === 0 && (
          <div className="empty-state"><div className="empty-icon">&#x1F4DA;</div><p>No courses assigned yet.</p></div>
        )}
      </div>

      {selectedCourseId && (
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-12">
              <p className="section-title" style={{ marginBottom: 0 }}>
                {activeCourse ? `${activeCourse.course?.courseCode} — ${activeCourse.course?.title}` : "Students"}
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

      {!selectedCourseId && teacherCourses.length > 0 && (
        <div className="empty-state"><div className="empty-icon">&#x1F4CB;</div><p>Select a course above to view its students.</p></div>
      )}
    </div>
  );
}

export default TeacherStudents;
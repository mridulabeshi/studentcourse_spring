import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

// GET  /teachers                          -> List<Teacher>
// POST /teachers                          -> create Teacher { employeeCode, name, user? }
// GET  /teacher-courses                   -> List<TeacherCourse>
// POST /teacher-courses                   -> { teacherId, courseId }
// GET  /teacher-courses/teacher/{id}      -> List<TeacherCourse>
// DELETE /teacher-courses/{id}            -> remove assignment
// GET  /courses                           -> List<Course>

function AdminTeachers() {
  const toast = useToast();
  const [teachers, setTeachers]           = useState([]);
  const [courses, setCourses]             = useState([]);
  const [assignments, setAssignments]     = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherAssignments, setTeacherAssignments] = useState([]);

  // New teacher form
  const [newName, setNewName]             = useState("");
  const [newEmpCode, setNewEmpCode]       = useState("");
  const [submitting, setSubmitting]       = useState(false);

  // Assign course form
  const [assignCourseId, setAssignCourseId] = useState("");
  const [assigning, setAssigning]         = useState(false);

  const load = () => {
    Promise.all([
      api.get("/teachers"),
      api.get("/courses"),
      api.get("/teacher-courses"),
    ]).then(([t, c, a]) => {
      setTeachers(t.data);
      setCourses(c.data);
      setAssignments(a.data);
    }).catch(() => toast("Failed to load data", "error"));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedTeacher) { setTeacherAssignments([]); return; }
    api.get(`/teacher-courses/teacher/${selectedTeacher.id}`)
      .then((r) => setTeacherAssignments(r.data))
      .catch(() => {});
  }, [selectedTeacher, assignments]);

  const addTeacher = () => {
    if (!newName.trim() || !newEmpCode.trim()) { toast("Name and employee code required", "warn"); return; }
    setSubmitting(true);
    api.post("/teachers", { name: newName, employeeCode: newEmpCode })
      .then(() => { setNewName(""); setNewEmpCode(""); load(); toast("Teacher added"); })
      .catch((e) => toast(e?.response?.data?.message ?? "Failed to add teacher", "error"))
      .finally(() => setSubmitting(false));
  };

  const assignCourse = () => {
    if (!selectedTeacher || !assignCourseId) { toast("Select a teacher and course", "warn"); return; }
    setAssigning(true);
    api.post("/teacher-courses", { teacherId: selectedTeacher.id, courseId: Number(assignCourseId) })
      .then(() => { setAssignCourseId(""); load(); toast("Course assigned"); })
      .catch((e) => toast(e?.response?.data?.message ?? "Failed to assign", "error"))
      .finally(() => setAssigning(false));
  };

  const removeAssignment = (id) => {
    if (!window.confirm("Remove this course assignment?")) return;
    api.delete(`/teacher-courses/${id}`)
      .then(() => { load(); toast("Assignment removed"); })
      .catch(() => toast("Failed to remove", "error"));
  };

  const deleteTeacher = (id) => {
    if (!window.confirm("Delete this teacher?")) return;
    api.delete(`/teachers/${id}`)
      .then(() => { if (selectedTeacher?.id === id) setSelectedTeacher(null); load(); toast("Teacher deleted"); })
      .catch(() => toast("Failed to delete", "error"));
  };

  // Courses not yet assigned to selected teacher
  const assignedCourseIds = new Set(teacherAssignments.map((ta) => ta.course?.id));
  const availableCourses = courses.filter((c) => !assignedCourseIds.has(c.id));

  return (
    <div>
      <h1 className="page-title">Teachers</h1>
      <p className="page-subtitle">Manage teachers and their course assignments</p>

      {/* Add teacher */}
      <div className="card mb-24">
        <p className="section-title">Add New Teacher</p>
        <div className="form-row mb-16">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="e.g. Prof. Eldric Voss" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Employee Code</label>
            <input className="form-input" placeholder="e.g. TCH1001" value={newEmpCode}
              onChange={(e) => setNewEmpCode(e.target.value.toUpperCase())}
              style={{ fontFamily: "monospace" }} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={addTeacher} disabled={submitting}>
          {submitting ? "Adding..." : "+ Add Teacher"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Teacher list */}
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <p className="section-title" style={{ marginBottom: 0 }}>All Teachers</p>
            <span className="badge badge-green">{teachers.length} total</span>
          </div>
          {teachers.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">&#x270D;</div><p>No teachers yet.</p></div>
          ) : (
            <div className="flex flex-col gap-8">
              {teachers.map((t) => {
                const courseCount = assignments.filter((a) => a.teacher?.id === t.id).length;
                const isSelected  = selectedTeacher?.id === t.id;
                return (
                  <div key={t.id} onClick={() => setSelectedTeacher(isSelected ? null : t)} style={{
                    alignItems: "center", background: isSelected ? "var(--accent-dim)" : "var(--bg)",
                    border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius-sm)", cursor: "pointer", display: "flex",
                    gap: 12, padding: "12px 14px", transition: "all 0.15s",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.9rem" }}>{t.name}</div>
                      <div style={{ fontFamily: "monospace", color: "var(--accent)", fontSize: "0.75rem" }}>{t.employeeCode}</div>
                    </div>
                    <span className="badge badge-blue">{courseCount} course{courseCount !== 1 ? "s" : ""}</span>
                    <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); deleteTeacher(t.id); }}>
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Assignment panel */}
        <div className="card">
          {!selectedTeacher ? (
            <div className="empty-state">
              <div className="empty-icon">&#x1F4CB;</div>
              <p>Select a teacher on the left to manage their course assignments.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text)" }}>{selectedTeacher.name}</div>
                  <div style={{ fontFamily: "monospace", color: "var(--accent)", fontSize: "0.78rem" }}>{selectedTeacher.employeeCode}</div>
                </div>
              </div>

              {/* Assign course */}
              {availableCourses.length > 0 && (
                <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-end" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Assign Course</label>
                    <select className="form-select" value={assignCourseId} onChange={(e) => setAssignCourseId(e.target.value)}>
                      <option value="">Select course...</option>
                      {availableCourses.map((c) => (
                        <option key={c.id} value={c.id}>{c.courseCode} — {c.title}</option>
                      ))}
                    </select>
                  </div>
                  <button className="btn btn-primary" onClick={assignCourse} disabled={assigning || !assignCourseId}>
                    {assigning ? "Assigning..." : "Assign"}
                  </button>
                </div>
              )}

              {/* Current assignments */}
              <p className="section-title">Assigned Courses</p>
              {teacherAssignments.length === 0 ? (
                <div className="empty-state" style={{ padding: "16px 0" }}>
                  <p>No courses assigned yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {teacherAssignments.map((ta) => (
                    <div key={ta.id} style={{
                      alignItems: "center", background: "var(--bg)", borderRadius: "var(--radius-sm)",
                      display: "flex", gap: 12, padding: "10px 14px",
                    }}>
                      <span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600, fontSize: "0.82rem", minWidth: 70 }}>
                        {ta.course?.courseCode}
                      </span>
                      <span style={{ flex: 1, color: "var(--text-soft)", fontSize: "0.85rem" }}>{ta.course?.title}</span>
                      <span className="badge badge-blue">{ta.course?.credits} cr</span>
                      <button className="btn btn-danger btn-sm" onClick={() => removeAssignment(ta.id)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTeachers;

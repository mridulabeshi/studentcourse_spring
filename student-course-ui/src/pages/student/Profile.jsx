import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { DeptBadge, DEPT_OPTIONS, DEPT_ICONS } from "../../components/DeptBadge";

const deptMap = Object.fromEntries(DEPT_OPTIONS.map((d) => [d.value, d]));

function StudentProfile() {
  const { user } = useAuth();
  const [student, setStudent]         = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!user?.studentId) return;
    Promise.all([
      api.get(`/students/${user.studentId}`),
      api.get(`/enrollments/student/${user.studentId}`),
    ])
      .then(([s, e]) => { setStudent(s.data); setEnrollments(e.data); })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="empty-state"><p>Loading profile...</p></div>;
  if (!student) return <div className="empty-state"><p>Could not load profile.</p></div>;

  const dept = deptMap[student.department?.toUpperCase()];

  return (
    <div>
      <h1 className="page-title">My Profile</h1>
      <p className="page-subtitle">Your academy record</p>

      {/* Identity card */}
      <div className="card mb-24" style={{ borderTop: `3px solid ${dept ? "var(--accent)" : "var(--accent)"}` }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {/* Avatar */}
          <div style={{
            alignItems: "center", background: "var(--accent-dim)", borderRadius: "50%",
            display: "flex", flexShrink: 0, fontSize: "2rem", height: 64,
            justifyContent: "center", width: 64,
          }}>
            {dept ? DEPT_ICONS[dept.value] : "\uD83C\uDF93"}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{student.name}</h2>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600 }}>{student.rollNo}</span>
              <DeptBadge dept={student.department} />
              {dept && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{dept.label}</span>}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 6 }}>{student.email}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-24">
        <div className="stat-card" style={{ "--accent-color": "var(--accent)" }}>
          <span className="stat-icon">&#x1F517;</span>
          <div className="stat-value">{enrollments.length}</div>
          <div className="stat-label">Enrolled Courses</div>
        </div>
        <div className="stat-card" style={{ "--accent-color": "var(--green)" }}>
          <span className="stat-icon">&#x1F4DA;</span>
          <div className="stat-value">{enrollments.reduce((sum, e) => sum + (e.course?.credits ?? 0), 0)}</div>
          <div className="stat-label">Total Credits</div>
        </div>
      </div>

      {/* Enrolled courses */}
      <div className="card">
        <p className="section-title">Enrolled Courses</p>
        {enrollments.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">&#x1F4DA;</div><p>Not enrolled in any courses yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Enrollment ID</th><th>Code</th><th>Course</th><th>Credits</th></tr></thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td><span className="id-chip">#{e.id}</span></td>
                    <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600, fontSize: "0.82rem" }}>{e.course?.courseCode}</span></td>
                    <td className="primary-col">{e.course?.title}</td>
                    <td><span className="badge badge-blue">{e.course?.credits} cr</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentProfile;

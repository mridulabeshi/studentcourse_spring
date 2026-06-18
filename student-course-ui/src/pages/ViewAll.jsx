import { useEffect, useState } from "react";
import api from "../services/api";

const TABS = [
  { key: "enrollments", label: "Enrollments", icon: "🔗" },
  { key: "grades",      label: "Grades",      icon: "🏅" },
  { key: "attendance",  label: "Attendance",  icon: "📋" },
];

/* ── helpers ─────────────────────────────────────────────────── */

// Your backend returns nested objects: enrollment.student.name, enrollment.course.title
const studentName = (e) =>
  e?.student?.name ?? e?.studentName ?? e?.studentId ?? "—";

const courseName = (e) =>
  e?.course?.title ?? e?.courseTitle ?? e?.courseId ?? "—";

const gradeColor = (g) => {
  switch (g?.toUpperCase()) {
    case "S": return "badge-purple";
    case "A": return "badge-green";
    case "B": return "badge-blue";
    case "C": return "badge-amber";
    case "D":
    case "E": return "badge-red";
    default:  return "badge-blue";
  }
};

/* ── Enrollments ─────────────────────────────────────────────── */
function EnrollmentsTable() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    api.get("/enrollments")
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.status ?? "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState entity="enrollments" status={error} />;
  if (!data.length) return <EmptyState icon="🔗" label="No enrollments found" />;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Enrollment ID</th>
            <th>Student</th>
            <th>Course</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e) => (
            <tr key={e.id}>
              <td><span className="id-chip">#{e.id}</span></td>
              <td className="primary-col">{studentName(e)}</td>
              <td>{courseName(e)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Grades ──────────────────────────────────────────────────── */
function GradesTable() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    api.get("/grades")
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.status ?? "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState entity="grades" status={error} />;
  if (!data.length) return <EmptyState icon="🏅" label="No grades recorded yet" />;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Grade ID</th>
            <th>Enrollment ID</th>
            <th>Student</th>
            <th>Course</th>
            <th>Semester</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {data.map((g) => {
            // grade.enrollment.student.name  OR  grade.studentName
            const enroll = g?.enrollment ?? {};
            const sName  = enroll?.student?.name ?? g?.studentName ?? "—";
            const cName  = enroll?.course?.title  ?? g?.courseTitle  ?? "—";
            const eId    = g?.enrollmentId ?? enroll?.id ?? "—";
            return (
              <tr key={g.id}>
                <td><span className="id-chip">#{g.id}</span></td>
                <td><span className="id-chip">#{eId}</span></td>
                <td className="primary-col">{sName}</td>
                <td>{cName}</td>
                <td style={{ color: "var(--text-muted)" }}>{g.semester}</td>
                <td>
                  <span className={`badge ${gradeColor(g.grade)}`}>{g.grade}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Attendance ──────────────────────────────────────────────── */
function AttendanceTable() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    api.get("/attendance")
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.status ?? "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState entity="attendance" status={error} />;
  if (!data.length) return <EmptyState icon="📋" label="No attendance records yet" />;

  const presentCount = data.filter((r) => r.present).length;
  const pct = Math.round((presentCount / data.length) * 100);

  return (
    <>
      {/* Summary bar */}
      <div style={styles.attendanceSummary}>
        <div style={styles.summaryItem}>
          <span style={{ color: "var(--green)", fontWeight: 700, fontSize: "1.25rem" }}>
            {presentCount}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Present</span>
        </div>
        <div style={styles.summaryItem}>
          <span style={{ color: "var(--red)", fontWeight: 700, fontSize: "1.25rem" }}>
            {data.length - presentCount}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Absent</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Overall attendance rate</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>{pct}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{
                width: `${pct}%`,
                background: pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Enrollment ID</th>
              <th>Student</th>
              <th>Course</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => {
              const enroll = a?.enrollment ?? {};
              const sName  = enroll?.student?.name ?? a?.studentName ?? "—";
              const cName  = enroll?.course?.title  ?? a?.courseTitle  ?? "—";
              const eId    = a?.enrollmentId ?? enroll?.id ?? "—";
              return (
                <tr key={a.id}>
                  <td><span className="id-chip">#{a.id}</span></td>
                  <td><span className="id-chip">#{eId}</span></td>
                  <td className="primary-col">{sName}</td>
                  <td>{cName}</td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {a.date ? new Date(a.date).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td>
                    <span className={`badge ${a.present ? "badge-green" : "badge-red"}`}>
                      {a.present ? "✓ Present" : "✕ Absent"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Shared helpers ──────────────────────────────────────────── */
function LoadingState() {
  return (
    <div className="empty-state">
      <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>⏳</div>
      <p>Loading…</p>
    </div>
  );
}

function ErrorState({ entity, status }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: "1.5rem", marginBottom: 8, color: "var(--red)" }}>⚠</div>
      <p style={{ color: "var(--red)", marginBottom: 6 }}>
        Could not load {entity}
        {status === 404 ? " — endpoint not found (404)." : status === 405 ? " — method not allowed (405). Backend may not expose a GET /"+entity+" endpoint." : "."}
      </p>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
        Make sure Spring Boot is running on <code>localhost:8080</code> with CORS enabled.
      </p>
    </div>
  );
}

function EmptyState({ icon, label }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{label}</p>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
function ViewAll() {
  const [activeTab, setActiveTab] = useState("enrollments");

  const renderTable = () => {
    switch (activeTab) {
      case "enrollments": return <EnrollmentsTable />;
      case "grades":      return <GradesTable />;
      case "attendance":  return <AttendanceTable />;
      default:            return null;
    }
  };

  return (
    <div>
      <h1 className="page-title">View Records</h1>
      <p className="page-subtitle">Browse all enrollments, grades, and attendance</p>

      {/* Tabs */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">{renderTable()}</div>
    </div>
  );
}

const styles = {
  tabBar: {
    display: "flex",
    gap: 4,
    marginBottom: 20,
    borderBottom: "1px solid var(--border)",
  },
  tab: {
    alignItems: "center",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    borderRadius: 0,
    color: "var(--text-muted)",
    cursor: "pointer",
    display: "flex",
    fontFamily: "var(--font-body)",
    fontSize: "0.9rem",
    fontWeight: 500,
    gap: 7,
    marginBottom: "-1px",
    padding: "10px 20px",
    transition: "color 0.15s, border-color 0.15s",
  },
  tabActive: {
    borderBottomColor: "var(--accent)",
    color: "var(--accent)",
  },
  attendanceSummary: {
    alignItems: "center",
    background: "var(--bg)",
    borderRadius: "var(--radius-sm)",
    display: "flex",
    gap: 24,
    marginBottom: 20,
    padding: "14px 20px",
  },
  summaryItem: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 58,
  },
};

export default ViewAll;
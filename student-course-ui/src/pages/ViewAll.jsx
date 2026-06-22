import { useEffect, useState } from "react";
import api from "../services/api";
import { DeptBadge } from "../components/DeptBadge";

const TABS = [
  { key: "enrollments", label: "Enrollments", icon: "🔗" },
  { key: "grades",      label: "Grades",      icon: "🏅" },
  { key: "attendance",  label: "Attendance",  icon: "📋" },
];

const gradeColor = (g) => ({ S:"badge-purple", A:"badge-green", B:"badge-blue", C:"badge-amber", D:"badge-red", E:"badge-red" }[g?.toUpperCase()] ?? "badge-blue");
const gradeScore = { S:10, A:9, B:8, C:7, D:6, E:5 };

/* ── Enrollments ─────────────────────────────────────────────── */
function EnrollmentsTable() {
  const [all, setAll]           = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    // GET /enrollments  → List<Enrollment>  with nested student & course
    api.get("/enrollments")
      .then((r) => { setAll(r.data); setFiltered(r.data); })
      .catch((e) => setError(e?.response?.status ?? "err"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(all.filter((e) =>
      !q ||
      e.student?.name?.toLowerCase().includes(q) ||
      e.student?.rollNo?.toLowerCase().includes(q) ||
      e.course?.title?.toLowerCase().includes(q) ||
      e.course?.courseCode?.toLowerCase().includes(q)
    ));
  }, [search, all]);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState entity="enrollments" status={error} />;
  if (!all.length) return <EmptyState icon="🔗" label="No enrollments yet" />;

  return (
    <>
      <SearchBar value={search} onChange={setSearch} placeholder="Search student, roll no, course or code…" count={filtered.length} total={all.length} />
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Enrollment ID</th><th>Roll No</th><th>Student</th><th>Dept</th><th>Course Code</th><th>Course</th><th>Credits</th></tr></thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td><span className="id-chip">#{e.id}</span></td>
                <td><span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-soft)" }}>{e.student?.rollNo ?? "—"}</span></td>
                <td className="primary-col">{e.student?.name ?? "—"}</td>
                <td><DeptBadge dept={e.student?.department} /></td>
                <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600, fontSize: "0.82rem" }}>{e.course?.courseCode ?? "—"}</span></td>
                <td style={{ color: "var(--text-soft)" }}>{e.course?.title ?? "—"}</td>
                <td><span className="badge badge-blue">{e.course?.credits ?? "—"} cr</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Grades ──────────────────────────────────────────────────── */
function GradesTable() {
  const [all, setAll]           = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    api.get("/grades")
      .then((r) => { setAll(r.data); setFiltered(r.data); })
      .catch((e) => setError(e?.response?.status ?? "err"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(all.filter((g) => {
      const s = g.enrollment?.student?.name ?? "";
      const c = g.enrollment?.course?.title ?? "";
      const code = g.enrollment?.course?.courseCode ?? "";
      return !q || s.toLowerCase().includes(q) || c.toLowerCase().includes(q) || code.toLowerCase().includes(q) || g.grade?.toLowerCase() === q;
    }));
  }, [search, all]);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState entity="grades" status={error} />;
  if (!all.length) return <EmptyState icon="🏅" label="No grades recorded yet" />;

  return (
    <>
      <SearchBar value={search} onChange={setSearch} placeholder="Search student, course, or grade…" count={filtered.length} total={all.length} />
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Grade ID</th><th>Enrollment</th><th>Roll No</th><th>Student</th><th>Course</th><th>Semester</th><th>Grade</th><th>Score</th></tr>
          </thead>
          <tbody>
            {filtered.map((g) => {
              const enroll = g.enrollment ?? {};
              const sName  = enroll.student?.name ?? "—";
              const cTitle = enroll.course?.title ?? "—";
              const cCode  = enroll.course?.courseCode ?? "—";
              const roll   = enroll.student?.rollNo ?? "—";
              const eId    = g.enrollmentId ?? enroll.id ?? "—";
              const score  = gradeScore[g.grade?.toUpperCase()] ?? "—";
              return (
                <tr key={g.id}>
                  <td><span className="id-chip">#{g.id}</span></td>
                  <td><span className="id-chip">#{eId}</span></td>
                  <td><span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-soft)" }}>{roll}</span></td>
                  <td className="primary-col">{sName}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontFamily: "monospace", color: "var(--accent)", fontSize: "0.78rem" }}>{cCode}</span>
                      <span style={{ color: "var(--text-soft)", fontSize: "0.82rem" }}>{cTitle}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{g.semester}</td>
                  <td><span className={`badge ${gradeColor(g.grade)}`}>{g.grade}</span></td>
                  <td style={{ fontWeight: 700, color: score >= 8 ? "var(--green)" : score >= 6 ? "var(--amber)" : "var(--red)" }}>{score}/10</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Attendance ──────────────────────────────────────────────── */
// GET /attendance/{enrollmentId}  — no global list endpoint
function AttendanceTable() {
  const [enrollments, setEnrollments]       = useState([]);
  const [enrollmentId, setEnrollmentId]     = useState("");
  const [data, setData]                     = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);

  useEffect(() => {
    api.get("/enrollments").then((r) => setEnrollments(r.data)).catch(() => {});
  }, []);

  const lookup = () => {
    if (!enrollmentId) return;
    setLoading(true); setError(null); setData(null);
    api.get(`/attendance/${enrollmentId}`)
      .then((r) => setData(Array.isArray(r.data) ? r.data : [r.data]))
      .catch((e) => setError(e?.response?.status ?? "err"))
      .finally(() => setLoading(false));
  };

  const presentCount = data ? data.filter((r) => r.present).length : 0;
  const pct = data?.length ? Math.round((presentCount / data.length) * 100) : 0;

  // selected enrollment details
  const selectedEnrollment = enrollments.find((e) => String(e.id) === String(enrollmentId));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-end" }}>
        <div className="form-group" style={{ flex: 1, maxWidth: 400 }}>
          <label className="form-label">Enrollment</label>
          <select className="form-select" value={enrollmentId} onChange={(e) => setEnrollmentId(e.target.value)}>
            <option value="">Select enrollment…</option>
            {enrollments.map((e) => (
              <option key={e.id} value={e.id}>
                #{e.id} — {e.student?.rollNo ?? e.student?.name ?? "Student"} → {e.course?.courseCode ?? e.course?.title ?? "Course"}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={lookup} disabled={!enrollmentId || loading}>
          {loading ? "Loading…" : "🔍 Load Records"}
        </button>
      </div>

      {/* Selected student info */}
      {selectedEnrollment && (
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, padding: "10px 14px", background: "var(--bg)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem" }}>
          <DeptBadge dept={selectedEnrollment.student?.department} />
          <span style={{ color: "var(--text)", fontWeight: 600 }}>{selectedEnrollment.student?.name}</span>
          <span style={{ color: "var(--text-muted)" }}>{selectedEnrollment.student?.rollNo}</span>
          <span style={{ color: "var(--text-muted)" }}>→</span>
          <span style={{ fontFamily: "monospace", color: "var(--accent)" }}>{selectedEnrollment.course?.courseCode}</span>
          <span style={{ color: "var(--text-soft)" }}>{selectedEnrollment.course?.title}</span>
        </div>
      )}

      {error && <ErrorState entity={`attendance #${enrollmentId}`} status={error} />}
      {loading && <LoadingState />}

      {data && !loading && (
        <>
          <div style={styles.attendanceSummary}>
            <SummaryPill label="Present" value={presentCount} color="var(--green)" />
            <SummaryPill label="Absent"  value={data.length - presentCount} color="var(--red)" />
            <SummaryPill label="Total"   value={data.length} color="var(--text-soft)" />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Attendance rate</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)" }}>{pct}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)" }} />
              </div>
            </div>
          </div>
          {data.length === 0
            ? <EmptyState icon="📋" label="No attendance records for this enrollment" />
            : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Record ID</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.map((a) => (
                      <tr key={a.id}>
                        <td><span className="id-chip">#{a.id}</span></td>
                        <td style={{ color: "var(--text-muted)" }}>{a.date ? new Date(a.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                        <td><span className={`badge ${a.present ? "badge-green" : "badge-red"}`}>{a.present ? "✓ Present" : "✕ Absent"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}

      {!data && !loading && !error && (
        <div className="empty-state"><div className="empty-icon">📋</div><p>Select an enrollment above to view attendance records.</p></div>
      )}
    </div>
  );
}

/* ── Shared ──────────────────────────────────────────────────── */
function SearchBar({ value, onChange, placeholder, count, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <input className="form-input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} style={{ maxWidth: 360 }} />
      {value && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{count} of {total}</span>}
    </div>
  );
}

function SummaryPill({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 52 }}>
      <span style={{ color, fontWeight: 700, fontSize: "1.2rem" }}>{value}</span>
      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{label}</span>
    </div>
  );
}

function LoadingState() {
  return <div className="empty-state"><div style={{ fontSize: "1.5rem", marginBottom: 8 }}>⏳</div><p>Loading…</p></div>;
}

function ErrorState({ entity, status }) {
  const hint = status === 404 ? " (404 — not found)" : status === 405 ? " (405 — method not allowed)" : ` (${status})`;
  return (
    <div className="empty-state">
      <div style={{ fontSize: "1.5rem", marginBottom: 8, color: "var(--red)" }}>⚠</div>
      <p style={{ color: "var(--red)", marginBottom: 4 }}>Could not load {entity}{hint}</p>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Check that Spring Boot is running on <code>localhost:8080</code> with CORS enabled.</p>
    </div>
  );
}

function EmptyState({ icon, label }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><p>{label}</p></div>;
}

/* ── Main ────────────────────────────────────────────────────── */
function ViewAll() {
  const [activeTab, setActiveTab] = useState("enrollments");

  return (
    <div>
      <h1 className="page-title">View Records</h1>
      <p className="page-subtitle">Browse all enrollments, grades, and attendance</p>

      <div style={styles.tabBar}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === "enrollments" && <EnrollmentsTable />}
        {activeTab === "grades"      && <GradesTable />}
        {activeTab === "attendance"  && <AttendanceTable />}
      </div>
    </div>
  );
}

const styles = {
  tabBar: { display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)" },
  tab: { alignItems: "center", background: "transparent", border: "none", borderBottom: "2px solid transparent", borderRadius: 0, color: "var(--text-muted)", cursor: "pointer", display: "flex", fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 500, gap: 7, marginBottom: "-1px", padding: "10px 20px", transition: "color 0.15s, border-color 0.15s" },
  tabActive: { borderBottomColor: "var(--accent)", color: "var(--accent)" },
  attendanceSummary: { alignItems: "center", background: "var(--bg)", borderRadius: "var(--radius-sm)", display: "flex", gap: 20, marginBottom: 16, padding: "12px 18px" },
};

export default ViewAll;
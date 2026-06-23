import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// GET /enrollments/student/{studentId} -> List<Enrollment>
// GET /reports/attendance/{enrollmentId} -> { enrollmentId, percentage }
// GET /attendance/{enrollmentId} -> List<Attendance>
function StudentAttendance() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [reports, setReports]         = useState({}); // { enrollmentId: percentage }
  const [records, setRecords]         = useState({}); // { enrollmentId: List<Attendance> }
  const [expanded, setExpanded]       = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!user?.studentId) return;
    api.get(`/enrollments/student/${user.studentId}`)
      .then(async (r) => {
        const enrs = r.data;
        setEnrollments(enrs);
        // Fetch attendance % for each enrollment in parallel
        const results = await Promise.allSettled(
          enrs.map((e) => api.get(`/reports/attendance/${e.id}`))
        );
        const pcts = {};
        results.forEach((res, i) => {
          if (res.status === "fulfilled") pcts[enrs[i].id] = res.value.data.percentage ?? 0;
        });
        setReports(pcts);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const toggleExpand = async (enrollmentId) => {
    if (expanded === enrollmentId) { setExpanded(null); return; }
    setExpanded(enrollmentId);
    if (records[enrollmentId]) return; // already fetched
    api.get(`/attendance/${enrollmentId}`)
      .then((r) => setRecords((prev) => ({ ...prev, [enrollmentId]: Array.isArray(r.data) ? r.data : [] })))
      .catch(() => setRecords((prev) => ({ ...prev, [enrollmentId]: [] })));
  };

  if (loading) return <div className="empty-state"><p>Loading attendance...</p></div>;

  const overallPct = enrollments.length
    ? (Object.values(reports).reduce((a, b) => a + b, 0) / enrollments.length).toFixed(1)
    : null;

  return (
    <div>
      <h1 className="page-title">My Attendance</h1>
      <p className="page-subtitle">Attendance records across all your courses</p>

      {overallPct && (
        <div className="stat-grid mb-24">
          <div className="stat-card" style={{ "--accent-color": Number(overallPct) >= 75 ? "var(--green)" : Number(overallPct) >= 50 ? "var(--amber)" : "var(--red)" }}>
            <span className="stat-icon">&#x1F4CB;</span>
            <div className="stat-value">{overallPct}%</div>
            <div className="stat-label">Overall Attendance</div>
          </div>
          <div className="stat-card" style={{ "--accent-color": "var(--blue)" }}>
            <span className="stat-icon">&#x1F4DA;</span>
            <div className="stat-value">{enrollments.length}</div>
            <div className="stat-label">Active Courses</div>
          </div>
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">&#x1F4CB;</div><p>No enrollments found.</p></div></div>
      ) : (
        <div className="flex flex-col gap-12">
          {enrollments.map((e) => {
            const pct       = reports[e.id] ?? null;
            const isExpanded = expanded === e.id;
            const recs      = records[e.id];
            const pctColor  = pct == null ? "var(--text-muted)" : pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)";

            return (
              <div key={e.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Course row */}
                <button onClick={() => toggleExpand(e.id)} style={{
                  alignItems: "center", background: "transparent", border: "none",
                  cursor: "pointer", display: "flex", gap: 16, padding: "16px 20px",
                  textAlign: "left", width: "100%", transition: "background 0.15s",
                }}
                  onMouseEnter={(el) => el.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={(el) => el.currentTarget.style.background = "transparent"}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 600, fontSize: "0.82rem" }}>{e.course?.courseCode}</span>
                      <span style={{ color: "var(--text)", fontWeight: 500 }}>{e.course?.title}</span>
                      <span className="badge badge-blue">{e.course?.credits} cr</span>
                    </div>
                    {pct != null && (
                      <div className="progress-bar-track" style={{ maxWidth: 300 }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pctColor }} />
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", minWidth: 80 }}>
                    {pct != null ? (
                      <>
                        <div style={{ fontWeight: 700, fontSize: "1.2rem", color: pctColor }}>{pct.toFixed(1)}%</div>
                        <span className={`badge ${pct >= 75 ? "badge-green" : pct >= 50 ? "badge-amber" : "badge-red"}`} style={{ fontSize: "0.65rem" }}>
                          {pct >= 75 ? "Good" : pct >= 50 ? "At Risk" : "Low"}
                        </span>
                      </>
                    ) : <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No data</span>}
                  </div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{isExpanded ? "▲" : "▼"}</span>
                </button>

                {/* Expanded records */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "0 20px 16px" }}>
                    {!recs ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "12px 0" }}>Loading records...</p>
                    ) : recs.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "12px 0" }}>No attendance records for this course.</p>
                    ) : (
                      <table className="data-table" style={{ marginTop: 12 }}>
                        <thead><tr><th>Record</th><th>Date</th><th>Status</th></tr></thead>
                        <tbody>
                          {recs.map((a) => (
                            <tr key={a.id}>
                              <td><span className="id-chip">#{a.id}</span></td>
                              <td style={{ color: "var(--text-muted)" }}>{a.date ? new Date(a.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                              <td><span className={`badge ${a.present ? "badge-green" : "badge-red"}`}>{a.present ? "+ Present" : "x Absent"}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentAttendance;

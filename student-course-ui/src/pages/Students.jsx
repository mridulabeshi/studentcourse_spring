import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";
import { DEPT_OPTIONS, DEPT_ICONS, DeptBadge } from "../components/DeptBadge";

const deptMap = Object.fromEntries(DEPT_OPTIONS.map((d) => [d.value, d]));

function Students() {
  const [students, setStudents]     = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [search, setSearch]         = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [department, setDepartment] = useState("");

  const [editing, setEditing]       = useState(null);
  const [editName, setEditName]     = useState("");
  const [editEmail, setEditEmail]   = useState("");

  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const loadStudents = () => {
    setLoading(true);
    api.get("/students")
      .then((res) => { setStudents(res.data); setFiltered(res.data); })
      .catch(() => toast("Failed to load students", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStudents(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(students.filter((s) => {
      const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.rollNo?.toLowerCase().includes(q);
      const matchDept   = !deptFilter || s.department?.toUpperCase() === deptFilter;
      return matchSearch && matchDept;
    }));
  }, [search, deptFilter, students]);

  const addStudent = () => {
    if (!name.trim() || !email.trim() || !department) {
      toast("All fields including department are required", "warn"); return;
    }
    setSubmitting(true);
    api.post("/students", { name, email, department })
      .then(() => { setName(""); setEmail(""); setDepartment(""); loadStudents(); toast("Student enrolled"); })
      .catch((e) => toast(e?.response?.data?.message ?? "Failed to add student", "error"))
      .finally(() => setSubmitting(false));
  };

  const openEdit = (s) => { setEditing(s); setEditName(s.name); setEditEmail(s.email); };

  const saveEdit = () => {
    if (!editName.trim() || !editEmail.trim()) { toast("Name and email required", "warn"); return; }
    // PUT /students/{id} — StudentController.update uses student.copy(name, email)
    api.put(`/students/${editing.id}`, { ...editing, name: editName, email: editEmail })
      .then(() => { setEditing(null); loadStudents(); toast("Student updated"); })
      .catch(() => toast("Failed to update", "error"));
  };

  const deleteStudent = (id) => {
    if (!window.confirm("Remove this student from the academy?")) return;
    api.delete(`/students/${id}`)
      .then(() => { loadStudents(); toast("Student removed"); })
      .catch(() => toast("Failed to delete", "error"));
  };

  const deptCounts = DEPT_OPTIONS.map((d) => ({
    ...d, count: students.filter((s) => s.department?.toUpperCase() === d.value).length,
  }));

  return (
    <div>
      <h1 className="page-title">Students</h1>
      <p className="page-subtitle">Academy roster — all enrolled scholars</p>

      {students.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {deptCounts.map((d) => (
            <button key={d.value} onClick={() => setDeptFilter(deptFilter === d.value ? "" : d.value)} style={{
              alignItems: "center", background: deptFilter === d.value ? "var(--bg-hover)" : "var(--bg-card)",
              border: `1px solid ${deptFilter === d.value ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "var(--radius-sm)", cursor: "pointer", display: "flex",
              fontFamily: "var(--font-body)", fontSize: "0.8rem", gap: 7, padding: "7px 12px",
              color: deptFilter === d.value ? "var(--accent)" : "var(--text-muted)", transition: "all 0.15s",
            }}>
              <span>{DEPT_ICONS[d.value]}</span>
              <span style={{ fontWeight: 600 }}>{d.value}</span>
              <span style={{ background: "var(--bg)", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 700, padding: "1px 7px" }}>{d.count}</span>
            </button>
          ))}
          {deptFilter && (
            <button onClick={() => setDeptFilter("")} style={{ background: "transparent", border: "1px dashed var(--border-light)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem", padding: "7px 12px", fontFamily: "var(--font-body)" }}>
              x Clear filter
            </button>
          )}
        </div>
      )}

      <div className="card mb-24">
        <p className="section-title">Enroll New Student</p>
        <div className="form-row mb-16">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="e.g. Lyra Ashveil" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="e.g. lyra@academy.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">Select department...</option>
              {DEPT_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{DEPT_ICONS[d.value]} {d.label} ({d.value})</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-primary" onClick={addStudent} disabled={submitting}>
            {submitting ? "Enrolling..." : "+ Enroll Student"}
          </button>
          {department && (
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Roll No auto-assigned: {department.toUpperCase()}{1000 + students.length + 1}
            </span>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-12">
            <p className="section-title" style={{ marginBottom: 0 }}>All Students</p>
            <span className="badge badge-purple">{filtered.length}{filtered.length !== students.length ? ` / ${students.length}` : ""}</span>
          </div>
          <input className="form-input" placeholder="Search name, email, roll no..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        </div>
        <div className="table-wrap">
          {loading ? (
            <div className="empty-state"><p>Loading roster...</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">&#x1F393;</div><p>{search || deptFilter ? "No students match your filters." : "No students enrolled yet."}</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>ID</th><th>Roll No</th><th>Name</th><th>Department</th><th>Email</th><th></th></tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td><span className="id-chip">#{s.id}</span></td>
                    <td><span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--text-soft)", letterSpacing: "0.05em" }}>{s.rollNo}</span></td>
                    <td className="primary-col">{s.name}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <DeptBadge dept={s.department} />
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{deptMap[s.department?.toUpperCase()]?.label ?? s.department}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{s.email}</td>
                    <td className="text-right">
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteStudent(s.id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editing && (
        <div style={modalStyles.overlay} onClick={() => setEditing(null)}>
          <div style={modalStyles.box} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--text)" }}>Edit — {editing.rollNo}</h2>
              <button onClick={() => setEditing(null)} style={modalStyles.close}>x</button>
            </div>
            <div className="flex flex-col gap-16 mb-24">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <DeptBadge dept={editing.department} />
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Cannot change — roll no is tied to department</span>
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
  box: { background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)", maxWidth: 460, padding: 28, width: "90%", boxShadow: "var(--shadow)" },
  close: { background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem", padding: 4 },
};

export default Students;
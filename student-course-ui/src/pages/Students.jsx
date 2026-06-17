import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";

function Students() {
  const [students, setStudents] = useState([]);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const loadStudents = () => {
    setLoading(true);
    api.get("/students")
      .then((res) => setStudents(res.data))
      .catch(() => toast("Failed to load students", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStudents(); }, []);

  const addStudent = () => {
    if (!name.trim() || !email.trim()) {
      toast("Please fill in all fields", "warn");
      return;
    }
    setSubmitting(true);
    api.post("/students", { name, email })
      .then(() => {
        setName(""); setEmail("");
        loadStudents();
        toast("Student added successfully");
      })
      .catch(() => toast("Failed to add student", "error"))
      .finally(() => setSubmitting(false));
  };

  return (
    <div>
      <h1 className="page-title">Students</h1>
      <p className="page-subtitle">Manage enrolled students</p>

      {/* Add Form */}
      <div className="card mb-24">
        <p className="section-title">Add New Student</p>
        <div className="form-row mb-16">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              placeholder="e.g. priya@university.edu"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={addStudent}
          disabled={submitting}
        >
          {submitting ? "Adding..." : "+ Add Student"}
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-16">
          <p className="section-title" style={{ marginBottom: 0 }}>All Students</p>
          <span className="badge badge-purple">{students.length} total</span>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div className="empty-state"><p>Loading students…</p></div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <p>No students yet. Add one above.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td><span className="id-chip">#{s.id}</span></td>
                    <td className="primary-col">{s.name}</td>
                    <td>{s.email}</td>
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

export default Students;

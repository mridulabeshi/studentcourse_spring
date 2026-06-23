import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = {
  ADMIN: [
    { to: "/admin/dashboard",     label: "Dashboard"     },
    { to: "/admin/students",      label: "Students"      },
    { to: "/admin/courses",       label: "Courses"       },
    { to: "/admin/enrollments",   label: "Enrollments"   },
    { to: "/admin/prerequisites", label: "Prerequisites" },
    { to: "/admin/view-all",      label: "View Records"  },
    { to: "/admin/reports",       label: "Reports"       },
  ],
  TEACHER: [
    { to: "/teacher/attendance", label: "Attendance" },
    { to: "/teacher/grades",     label: "Grades"     },
    { to: "/teacher/students",   label: "My Students" },
    { to: "/teacher/reports",    label: "Reports"    },
  ],
  STUDENT: [
    { to: "/student/profile",    label: "My Profile"    },
    { to: "/student/grades",     label: "My Grades"     },
    { to: "/student/attendance", label: "My Attendance" },
  ],
};

const ROLE_META = {
  ADMIN:   { label: "Admin",   color: "var(--accent)", icon: "\u2737" },
  TEACHER: { label: "Teacher", color: "var(--green)",  icon: "\u270D" },
  STUDENT: { label: "Student", color: "var(--amber)",  icon: "\uD83C\uDF93" },
};

function Navbar() {
  const { user, logout } = useAuth();
  const role  = user?.role ?? "ADMIN";
  const meta  = ROLE_META[role] ?? ROLE_META.ADMIN;
  const links = NAV[role] ?? [];

  return (
    <aside style={styles.sidebar}>
      {/* Brand */}
      <div style={styles.brand}>
        <span style={{ fontSize: "1.6rem" }}>{"\uD83C\uDF93"}</span>
        <div>
          <div style={styles.brandName}>EduTrack</div>
          <div style={styles.brandSub}>Course Manager</div>
        </div>
      </div>

      {/* Role chip */}
      <div style={{ ...styles.roleChip, borderColor: meta.color, color: meta.color }}>
        <span>{meta.icon}</span>
        <span style={{ fontWeight: 600 }}>{meta.label}</span>
        {user?.rollNo && <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)" }}>{user.rollNo}</span>}
        {user?.employeeCode && <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)" }}>{user.employeeCode}</span>}
      </div>

      <div style={styles.divider} />

      <nav style={styles.nav}>
        <p style={styles.navGroup}>NAVIGATION</p>
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to}
            style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={logout} style={styles.logoutBtn}>
        <span>&#x2192;</span> Sign Out
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    background: "var(--bg-card)", borderRight: "1px solid var(--border)",
    bottom: 0, display: "flex", flexDirection: "column", left: 0,
    padding: "24px 16px", position: "fixed", top: 0,
    width: "var(--sidebar-w)", zIndex: 100, overflowY: "auto",
  },
  brand: { alignItems: "center", display: "flex", gap: 12, marginBottom: 12, padding: "4px 8px" },
  brandName: { fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 },
  brandSub: { fontSize: "0.7rem", color: "var(--text-muted)" },
  roleChip: {
    alignItems: "center", border: "1px solid", borderRadius: "var(--radius-sm)",
    display: "flex", fontSize: "0.78rem", gap: 7, padding: "7px 12px", marginBottom: 4,
  },
  divider: { borderTop: "1px solid var(--border)", margin: "16px 0" },
  nav: { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
  navGroup: { color: "var(--text-muted)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 8, padding: "0 10px" },
  link: {
    borderRadius: "var(--radius-sm)", color: "var(--text-muted)", display: "block",
    fontSize: "0.875rem", fontWeight: 500, padding: "9px 12px",
    textDecoration: "none", transition: "background 0.15s, color 0.15s",
  },
  linkActive: { background: "var(--accent-dim)", color: "var(--accent)" },
  logoutBtn: {
    alignItems: "center", background: "transparent", border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-sm)", color: "var(--text-muted)", cursor: "pointer",
    display: "flex", fontFamily: "var(--font-body)", fontSize: "0.82rem",
    gap: 8, marginTop: 16, padding: "9px 12px", transition: "all 0.15s", width: "100%",
  },
};

export default Navbar;
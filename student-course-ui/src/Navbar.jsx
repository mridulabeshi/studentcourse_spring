import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/",              icon: "\u229E",  label: "Dashboard"     },
  { to: "/students",      icon: "\uD83D\uDC64", label: "Students"      },
  { to: "/courses",       icon: "\uD83D\uDCDA", label: "Courses"       },
  { to: "/prerequisites", icon: "\uD83D\uDD00", label: "Prerequisites" },
  { to: "/enrollments",   icon: "\uD83D\uDD17", label: "Enrollments"   },
  { to: "/grades",        icon: "\uD83C\uDFC5", label: "Grades"        },
  { to: "/attendance",    icon: "\uD83D\uDCCB", label: "Attendance"    },
  { to: "/reports",       icon: "\uD83D\uDCCA", label: "Reports"       },
  { to: "/view-all",      icon: "\uD83D\uDDC2", label: "View Records"  },
];

function Navbar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <span style={styles.brandIcon}>{"\uD83C\uDF93"}</span>
        <div>
          <div style={styles.brandName}>EduTrack</div>
          <div style={styles.brandSub}>Course Manager</div>
        </div>
      </div>

      <div style={styles.divider} />

      <nav style={styles.nav}>
        <p style={styles.navGroup}>NAVIGATION</p>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}
          >
            <span style={styles.linkIcon}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.sideFooter}>
        <div style={styles.footerDot} />
        <span style={styles.footerText}>Backend: localhost:8080</span>
      </div>
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
  brand: { alignItems: "center", display: "flex", gap: 12, marginBottom: 4, padding: "4px 8px" },
  brandIcon: { fontSize: "1.6rem" },
  brandName: { fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 },
  brandSub: { fontSize: "0.7rem", color: "var(--text-muted)" },
  divider: { borderTop: "1px solid var(--border)", margin: "16px 0" },
  nav: { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
  navGroup: { color: "var(--text-muted)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 8, padding: "0 10px" },
  link: {
    alignItems: "center", borderRadius: "var(--radius-sm)", color: "var(--text-muted)",
    display: "flex", fontSize: "0.875rem", fontWeight: 500, gap: 10,
    padding: "9px 12px", textDecoration: "none", transition: "background 0.15s, color 0.15s",
  },
  linkActive: { background: "var(--accent-dim)", color: "var(--accent)" },
  linkIcon: { fontSize: "1rem", width: 20, textAlign: "center" },
  sideFooter: {
    alignItems: "center", borderTop: "1px solid var(--border)", display: "flex",
    gap: 8, marginTop: "auto", padding: "16px 8px 0",
  },
  footerDot: { background: "var(--green)", borderRadius: "50%", height: 7, width: 7, flexShrink: 0 },
  footerText: { color: "var(--text-muted)", fontSize: "0.72rem" },
};

export default Navbar;
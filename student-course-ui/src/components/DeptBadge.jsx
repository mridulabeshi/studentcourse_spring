// Shared component — imported by Students, Enrollments, Grades, Attendance, Reports, ViewAll

export const DEPT_OPTIONS = [
  { value: "WHM", label: "White Magic",             color: "badge-white"  },
  { value: "ELM", label: "Elemental Magic",         color: "badge-yellow" },
  { value: "DKA", label: "Dark Arts",               color: "badge-red"    },
  { value: "MHL", label: "Mind & Healing",          color: "badge-blue"   },
  { value: "MAD", label: "Martial Arts & Defense",  color: "badge-amber"  },
  { value: "TEM", label: "Technomagic",             color: "badge-cyan"   },
];

export const DEPT_ICONS = {
  WHM: "\uD83C\uDF1F",   // star
  ELM: "\u26A1",         // lightning
  DKA: "\uD83D\uDC80",   // skull
  MHL: "\uD83C\uDF3F",   // herb
  MAD: "\u2694\uFE0F",   // crossed swords
  TEM: "\u2699\uFE0F",   // gear
};

const deptMap = Object.fromEntries(DEPT_OPTIONS.map((d) => [d.value, d]));

export function DeptBadge({ dept }) {
  const key = dept?.toUpperCase();
  const d   = deptMap[key];
  if (!d) return <span className="badge badge-purple">{dept ?? "—"}</span>;
  return (
    <span className={`badge ${d.color}`} title={d.label}>
      {DEPT_ICONS[d.value]} {d.value}
    </span>
  );
}

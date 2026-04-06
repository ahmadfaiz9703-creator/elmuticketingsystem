import { useState, useEffect, useRef } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const DARK = {
  bg: "#080c12", sidebar: "#0a0f18", card: "#0f1117", card2: "#161b27",
  border: "#1e2535", border2: "#2e3a4e", text: "#e2e8f0", text2: "#94a3b8",
  text3: "#6b7280", text4: "#4a5568", inputBg: "#161b27", modalBg: "#0f1117",
};
const LIGHT = {
  bg: "#f0f4f8", sidebar: "#ffffff", card: "#ffffff", card2: "#f8fafc",
  border: "#e2e8f0", border2: "#cbd5e1", text: "#0f172a", text2: "#475569",
  text3: "#94a3b8", text4: "#cbd5e1", inputBg: "#f8fafc", modalBg: "#ffffff",
};

// ─── DATA STORE ───────────────────────────────────────────────────────────────
const INITIAL_TICKETS = [
  { id: "TKT-001", title: "VPN not connecting after Windows update", category: "Network", priority: "High", status: "Open", assignee: "Carlos M.", requester: "Alice Chen", dept: "Finance", created: "2026-02-20", updated: "2026-02-21", sla: "4h", comments: [{ author: "Carlos M.", time: "2026-02-21 09:00", text: "Investigating the issue, likely related to KB5034441 patch.", type: "agent" }], tags: ["VPN", "Windows", "Urgent"] },
  { id: "TKT-002", title: "Outlook crashes on startup", category: "Software", priority: "Medium", status: "In Progress", assignee: "Sara Lee", requester: "Bob Tan", dept: "HR", created: "2026-02-22", updated: "2026-02-23", sla: "8h", comments: [], tags: ["Outlook", "Office365"] },
  { id: "TKT-003", title: "New laptop setup for onboarding - Maria Santos", category: "Hardware", priority: "Low", status: "Resolved", assignee: "James Okafor", requester: "Maria Santos", dept: "Marketing", created: "2026-02-18", updated: "2026-02-19", sla: "24h", comments: [{ author: "James Okafor", time: "2026-02-19 14:00", text: "Laptop configured and handed over. Ticket resolved.", type: "agent" }], tags: ["Onboarding", "Laptop"] },
  { id: "TKT-004", title: "Printer P-203 offline – 3rd floor", category: "Hardware", priority: "Medium", status: "Open", assignee: "Unassigned", requester: "David Lim", dept: "Operations", created: "2026-02-24", updated: "2026-02-24", sla: "8h", comments: [], tags: ["Printer"] },
  { id: "TKT-005", title: "Server storage 90% capacity alert", category: "Infrastructure", priority: "Critical", status: "Open", assignee: "Carlos M.", requester: "System Monitor", dept: "IT", created: "2026-02-25", updated: "2026-02-25", sla: "1h", comments: [{ author: "Carlos M.", time: "2026-02-25 08:30", text: "Escalated to infrastructure team. Emergency cleanup in progress.", type: "agent" }], tags: ["Server", "Storage", "Critical"] },
  { id: "TKT-006", title: "Access request – SharePoint Marketing Hub", category: "Access", priority: "Low", status: "Closed", assignee: "Sara Lee", requester: "Emma Wilson", dept: "Marketing", created: "2026-02-15", updated: "2026-02-16", sla: "24h", comments: [], tags: ["SharePoint", "Access"] },
];

const INITIAL_AGENTS = [
  { id: 0, name: "Admin",        role: "System Admin",     email: "admin@elmu.local",  dept: "IT", status: "Online",  username: "admin",  password: "elmu2026",   isAdmin: true },
  { id: 1, name: "Raj Patel",    role: "IT Manager",       email: "raj@elmu.local",    dept: "IT", status: "Online",  username: "raj",    password: "raj1234"   },
  { id: 2, name: "Carlos M.",    role: "Senior IT Agent",  email: "carlos@elmu.local", dept: "IT", status: "Online",  username: "carlos", password: "carlos1234"},
  { id: 3, name: "Sara Lee",     role: "IT Agent",         email: "sara@elmu.local",   dept: "IT", status: "Online",  username: "sara",   password: "sara1234"  },
  { id: 4, name: "James Okafor", role: "IT Agent",         email: "james@elmu.local",  dept: "IT", status: "Away",    username: "james",  password: "james1234" },
  { id: 5, name: "Nina Cruz",    role: "Junior Agent",     email: "nina@elmu.local",   dept: "IT", status: "Offline", username: "nina",   password: "nina1234"  },
];

const CATEGORIES = ["Network", "Software", "Hardware", "Infrastructure", "Access", "Security", "Other"];
const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Open", "In Progress", "Pending", "Resolved", "Closed"];
const DEPARTMENTS = ["IT", "Finance", "HR", "Marketing", "Operations", "Legal", "Sales"];
const AGENT_ROLES = ["IT Manager", "Senior IT Agent", "IT Agent", "Junior Agent"];
const AGENT_STATUSES = ["Online", "Away", "Offline"];

const PRIORITY_COLOR = { Critical: "#ff3b3b", High: "#ff8c00", Medium: "#f5c518", Low: "#3ecf8e" };
const STATUS_COLOR = { Open: "#4a9eff", "In Progress": "#a78bfa", Pending: "#f5c518", Resolved: "#3ecf8e", Closed: "#6b7280" };

const newId = (tickets) => `TKT-${String(tickets.length + 1).padStart(3, "0")}`;
const today = () => new Date().toISOString().slice(0, 10);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    tickets: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 5H9V7h6v2zm2 4H7v-2h10v2zm0 4H7v-2h10v2z",
    new: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    kb: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z",
    users: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    reports: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z",
    settings: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    alert: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
    chat: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z",
    filter: "M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z",
    time: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
    tag: "M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z",
    sla: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z",
    export: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
    arrow: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
    sun: "M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z",
    moon: "M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z",
    lock: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
    person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    add_user: "M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d={icons[name] || icons.alert} />
    </svg>
  );
};

// ─── THEMED COMPONENTS ────────────────────────────────────────────────────────
const Badge = ({ label, color, small }) => (
  <span style={{
    background: color + "22", color, border: `1px solid ${color}44`,
    borderRadius: 4, padding: small ? "2px 7px" : "3px 10px",
    fontSize: small ? 11 : 12, fontWeight: 600, whiteSpace: "nowrap",
  }}>{label}</span>
);

const Modal = ({ title, onClose, children, wide, T }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div style={{ background: T.modalBg, border: `1px solid ${T.border}`, borderRadius: 12, width: "100%", maxWidth: wide ? 860 : 560, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.modalBg, zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", padding: 4, display: "flex" }}><Icon name="close" size={20} /></button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

const Field = ({ label, children, required }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>
      {label}{required && <span style={{ color: "#ff3b3b" }}> *</span>}
    </label>
    {children}
  </div>
);

const mkInput = (T) => ({ style: s, ...props }) => (
  <input {...props} style={{ width: "100%", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 12px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box", ...s }} />
);
const mkSelect = (T) => ({ children, style: s, ...props }) => (
  <select {...props} style={{ width: "100%", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 12px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box", ...s }}>
    {children}
  </select>
);
const mkTextarea = (T) => ({ style: s, ...props }) => (
  <textarea {...props} style={{ width: "100%", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 12px", color: T.text, fontSize: 13, outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box", ...s }} />
);

const Btn = ({ children, onClick, variant = "primary", small, icon, disabled, style: s }) => {
  const base = { borderRadius: 7, padding: small ? "6px 12px" : "9px 18px", fontSize: small ? 12 : 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", display: "inline-flex", alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1, transition: "opacity 0.15s, transform 0.1s", ...s };
  const v = {
    primary: { background: "#4a9eff", color: "#fff" },
    danger: { background: "#ff3b3b22", color: "#ff3b3b", border: "1px solid #ff3b3b44" },
    ghost: { background: "transparent", color: "#94a3b8", border: "1px solid #1e2535" },
    success: { background: "#3ecf8e22", color: "#3ecf8e", border: "1px solid #3ecf8e44" },
    purple: { background: "#a78bfa22", color: "#a78bfa", border: "1px solid #a78bfa44" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...v[variant] }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = disabled ? "0.5" : "1"; }}>
      {icon && <Icon name={icon} size={14} />}{children}
    </button>
  );
};

const Toggle = ({ value, onChange, label, T }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
    <span style={{ fontSize: 13, color: T.text }}>{label}</span>
    <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, background: value ? "#4a9eff" : T.border2, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: value ? 21 : 3, transition: "left 0.2s" }} />
    </div>
  </div>
);

const StatCard = ({ label, value, color, icon, sub, T }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
    <div style={{ width: 42, height: 42, borderRadius: 10, background: color + "22", color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={icon} size={21} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.text3, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color, marginTop: 1 }}>{sub}</div>}
    </div>
  </div>
);

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
const AdminLogin = ({ onLogin, onBack, agents, T }) => {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const Input = mkInput(T);

  const submit = () => {
    const found = agents.find(a =>
      a.username && a.username.toLowerCase() === u.toLowerCase().trim() && a.password === p
    );
    if (found) {
      onLogin(found);
    } else {
      setErr("Invalid username or password.");
      setTimeout(() => setErr(""), 2500);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#4a9eff,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontWeight: 900, fontSize: 24, color: "#fff" }}>E</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Staff Login</div>
          <div style={{ fontSize: 13, color: T.text3 }}>ELMU IT Ticketing System</div>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28 }}>
          <Field label="Username">
            <Input value={u} onChange={e => setU(e.target.value)} placeholder="e.g. carlos" onKeyDown={e => e.key === "Enter" && submit()} />
          </Field>
          <Field label="Password">
            <div style={{ position: "relative" }}>
              <Input type={showPwd ? "text" : "password"} value={p} onChange={e => setP(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} style={{ paddingRight: 52 }} />
              <button onClick={() => setShowPwd(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#4a9eff", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                {showPwd ? "HIDE" : "SHOW"}
              </button>
            </div>
          </Field>
          {err && <div style={{ background: "#ff3b3b11", border: "1px solid #ff3b3b33", borderRadius: 7, padding: "10px 14px", color: "#ff3b3b", fontSize: 13, marginBottom: 14 }}>{err}</div>}
          <Btn onClick={submit} icon="lock" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}>Sign In</Btn>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", color: T.text3, fontSize: 13, cursor: "pointer" }}>← Back to User Portal</button>
          </div>

          {/* Staff accounts quick-reference table */}
          <div style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "9px 14px", borderBottom: `1px solid ${T.border}`, fontSize: 11, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Staff Accounts — click to fill
            </div>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {agents.filter(a => a.username).map(a => (
                <div key={a.id} onClick={() => { setU(a.username); setP(a.password); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: `1px solid ${T.border}`, cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.border}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#4a9eff22", color: "#4a9eff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                      {a.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{a.name}</div>
                      <div style={{ fontSize: 10, color: T.text3 }}>{a.role}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#4a9eff", fontFamily: "monospace", fontWeight: 700 }}>{a.username}</div>
                    <div style={{ fontSize: 10, color: T.text3, fontFamily: "monospace" }}>{a.password}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TICKET DETAIL MODAL ──────────────────────────────────────────────────────
const TicketDetail = ({ ticket, onClose, onUpdate, agents, T, currentUser }) => {
  const [comment, setComment] = useState("");
  const [edit, setEdit] = useState({ status: ticket.status, assignee: ticket.assignee, priority: ticket.priority });
  const Input = mkInput(T); const Select = mkSelect(T); const Textarea = mkTextarea(T);

  const addComment = () => {
    if (!comment.trim()) return;
    onUpdate({ ...ticket, comments: [...ticket.comments, { author: currentUser?.name || "Agent", time: new Date().toLocaleString(), text: comment, type: "agent" }], updated: today() });
    setComment("");
  };

  return (
    <Modal title={`${ticket.id} — Ticket Details`} onClose={onClose} wide T={T}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: T.text }}>{ticket.title}</h2>
            {ticket.submittedByUser && (
              <div style={{ background: "#4a9eff11", border: "1px solid #4a9eff33", borderRadius: 6, padding: "6px 12px", fontSize: 12, color: "#4a9eff", marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="users" size={12} /> Via User Portal · {ticket.requester}
              </div>
            )}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              <Badge label={ticket.category} color="#94a3b8" />
              <Badge label={ticket.priority} color={PRIORITY_COLOR[ticket.priority]} />
              <Badge label={ticket.status} color={STATUS_COLOR[ticket.status]} />
              {ticket.tags.map(t => <Badge key={t} label={`#${t}`} color="#4a9eff" />)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: T.card2, borderRadius: 8, padding: 14, marginBottom: 16 }}>
              {[["Requester", ticket.requester || "—"], ["Department", ticket.dept], ["Created", ticket.created], ["SLA", ticket.sla], ["Updated", ticket.updated]].map(([k, v]) => (
                <div key={k}><div style={{ fontSize: 10, color: T.text3, marginBottom: 2, textTransform: "uppercase" }}>{k}</div><div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{v}</div></div>
              ))}
            </div>
          </div>
          {/* Quick sidebar */}
          <div style={{ minWidth: 210 }}>
            <div style={{ background: T.card2, borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, marginBottom: 10, textTransform: "uppercase" }}>Update Ticket</div>
              <Field label="Status"><Select value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</Select></Field>
              <Field label="Assignee"><Select value={edit.assignee} onChange={e => setEdit({ ...edit, assignee: e.target.value })}><option>Unassigned</option>{agents.map(a => <option key={a.id}>{a.name}</option>)}</Select></Field>
              <Field label="Priority"><Select value={edit.priority} onChange={e => setEdit({ ...edit, priority: e.target.value })}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</Select></Field>
              <Btn onClick={() => onUpdate({ ...ticket, ...edit, updated: today() })} icon="check" style={{ width: "100%", justifyContent: "center" }}>Save Changes</Btn>
            </div>
            <div style={{ background: T.card2, borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, marginBottom: 10, textTransform: "uppercase" }}>Quick Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <Btn onClick={() => onUpdate({ ...ticket, status: "In Progress", assignee: ticket.assignee === "Unassigned" ? (agents[0]?.name || "Unassigned") : ticket.assignee, updated: today(), comments: [...ticket.comments, { author: "System", time: new Date().toLocaleString(), text: "Ticket marked as In Progress.", type: "agent" }] })} variant="purple" icon="time" small>Mark In Progress</Btn>
                <Btn onClick={() => onUpdate({ ...ticket, status: "Resolved", updated: today(), comments: [...ticket.comments, { author: "System", time: new Date().toLocaleString(), text: "Ticket marked as Resolved.", type: "agent" }] })} variant="success" icon="check" small>Mark Resolved</Btn>
                <Btn onClick={() => onUpdate({ ...ticket, status: "Closed", updated: today() })} variant="ghost" icon="close" small>Close Ticket</Btn>
              </div>
            </div>
          </div>
        </div>
        {/* Comments */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, marginBottom: 10, textTransform: "uppercase" }}>Activity & Comments</div>
          <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 12 }}>
            {ticket.comments.length === 0 && <div style={{ color: T.text3, fontSize: 13, fontStyle: "italic" }}>No comments yet.</div>}
            {ticket.comments.map((c, i) => (
              <div key={i} style={{ background: c.type === "user" ? "#3ecf8e0d" : T.card2, borderRadius: 8, padding: 10, marginBottom: 8, borderLeft: `3px solid ${c.type === "user" ? "#3ecf8e55" : "#4a9eff33"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: c.type === "user" ? "#3ecf8e" : "#4a9eff" }}>{c.type === "user" ? "👤 " : "🛠 "}{c.author}</span>
                  <span style={{ fontSize: 11, color: T.text3 }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 13, color: T.text }}>{c.text}</div>
              </div>
            ))}
          </div>
          <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." style={{ minHeight: 60, marginBottom: 8 }} />
          <Btn onClick={addComment} icon="chat">Add Comment</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ─── NEW TICKET MODAL ─────────────────────────────────────────────────────────
const NewTicketModal = ({ onClose, onCreate, agents, T }) => {
  const [form, setForm] = useState({ title: "", category: "Network", priority: "Medium", dept: "IT", requester: "", description: "", assignee: "Unassigned", tags: "" });
  const f = k => e => setForm({ ...form, [k]: e.target.value });
  const Input = mkInput(T); const Select = mkSelect(T); const Textarea = mkTextarea(T);
  return (
    <Modal title="Create New Ticket" onClose={onClose} T={T}>
      <Field label="Title" required><Input value={form.title} onChange={f("title")} placeholder="Brief description of the issue" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Category"><Select value={form.category} onChange={f("category")}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Priority"><Select value={form.priority} onChange={f("priority")}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</Select></Field>
        <Field label="Requester" required><Input value={form.requester} onChange={f("requester")} placeholder="Full name" /></Field>
        <Field label="Department"><Select value={form.dept} onChange={f("dept")}>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</Select></Field>
        <Field label="Assignee"><Select value={form.assignee} onChange={f("assignee")}><option>Unassigned</option>{agents.map(a => <option key={a.id}>{a.name}</option>)}</Select></Field>
        <Field label="Tags"><Input value={form.tags} onChange={f("tags")} placeholder="VPN, Windows, Printer" /></Field>
      </div>
      <Field label="Description"><Textarea value={form.description} onChange={f("description")} placeholder="Steps to reproduce, error messages, etc." style={{ minHeight: 90 }} /></Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => { if (!form.title || !form.requester) return; onCreate({ ...form, tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [] }); onClose(); }} icon="new" disabled={!form.title || !form.requester}>Create Ticket</Btn>
      </div>
    </Modal>
  );
};

// ─── KB MODAL ─────────────────────────────────────────────────────────────────
const KB_ARTICLES = [
  { id: "KB-001", title: "How to reset your Windows password", category: "Account", views: 342 },
  { id: "KB-002", title: "VPN Setup Guide – Windows & Mac", category: "Network", views: 512 },
  { id: "KB-003", title: "Configure Outlook on a new device", category: "Software", views: 289 },
  { id: "KB-004", title: "Printer troubleshooting steps", category: "Hardware", views: 198 },
  { id: "KB-005", title: "How to request new software access", category: "Access", views: 401 },
  { id: "KB-006", title: "MFA / 2FA Setup Instructions", category: "Security", views: 633 },
];
const KnowledgeBase = ({ onClose, T }) => {
  const [search, setSearch] = useState(""); const Input = mkInput(T);
  const filtered = KB_ARTICLES.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <Modal title="Knowledge Base" onClose={onClose} wide T={T}>
      <div style={{ marginBottom: 14 }}><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." /></div>
      {filtered.map(a => (
        <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: T.card2, borderRadius: 8, marginBottom: 8, cursor: "pointer", borderLeft: "3px solid transparent", transition: "border-color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.borderLeftColor = "#4a9eff"}
          onMouseLeave={e => e.currentTarget.style.borderLeftColor = "transparent"}>
          <div>
            <div style={{ fontWeight: 600, color: T.text, marginBottom: 2 }}>{a.title}</div>
            <div style={{ fontSize: 12, color: T.text3 }}>{a.id} · {a.category}</div>
          </div>
          <div style={{ fontSize: 12, color: T.text3 }}>{a.views} views</div>
        </div>
      ))}
    </Modal>
  );
};

// ─── REPORTS MODAL ────────────────────────────────────────────────────────────
const Reports = ({ tickets, onClose, agents, T }) => {
  const byStatus = STATUSES.map(s => ({ label: s, count: tickets.filter(t => t.status === s).length, color: STATUS_COLOR[s] }));
  const byPriority = PRIORITIES.map(p => ({ label: p, count: tickets.filter(t => t.priority === p).length, color: PRIORITY_COLOR[p] }));
  const max = Math.max(...byStatus.map(s => s.count), 1);
  return (
    <Modal title="Reports & Analytics" onClose={onClose} wide T={T}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {[{ title: "By Status", data: byStatus }, { title: "By Priority", data: byPriority }].map(({ title, data }) => (
          <div key={title} style={{ background: T.card2, borderRadius: 10, padding: 18 }}>
            <div style={{ fontWeight: 700, color: T.text3, fontSize: 11, textTransform: "uppercase", marginBottom: 14 }}>{title}</div>
            {data.map(d => (
              <div key={d.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: T.text }}>{d.label}</span><span style={{ color: d.color, fontWeight: 600 }}>{d.count}</span>
                </div>
                <div style={{ background: T.border, borderRadius: 4, height: 6 }}>
                  <div style={{ width: `${(d.count / max) * 100}%`, background: d.color, height: "100%", borderRadius: 4, transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
        ))}
        <div style={{ background: T.card2, borderRadius: 10, padding: 18 }}>
          <div style={{ fontWeight: 700, color: T.text3, fontSize: 11, textTransform: "uppercase", marginBottom: 14 }}>Agent Workload</div>
          {agents.map(a => {
            const count = tickets.filter(t => t.assignee === a.name && !["Closed", "Resolved"].includes(t.status)).length;
            return (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                <span style={{ color: T.text }}>{a.name}</span>
                <span style={{ color: count > 3 ? "#ff3b3b" : count > 1 ? "#ff8c00" : "#3ecf8e", fontWeight: 600 }}>{count} open</span>
              </div>
            );
          })}
        </div>
        <div style={{ background: T.card2, borderRadius: 10, padding: 18 }}>
          <div style={{ fontWeight: 700, color: T.text3, fontSize: 11, textTransform: "uppercase", marginBottom: 14 }}>By Category</div>
          {CATEGORIES.map(c => { const count = tickets.filter(t => t.category === c).length; return count > 0 ? (
            <div key={c} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
              <span style={{ color: T.text }}>{c}</span><span style={{ color: "#4a9eff", fontWeight: 600 }}>{count}</span>
            </div>
          ) : null; })}
        </div>
      </div>
    </Modal>
  );
};

// ─── TEAM MANAGEMENT MODAL ────────────────────────────────────────────────────
const TeamModule = ({ onClose, agents, setAgents, T }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", role: "IT Agent", email: "", dept: "IT", status: "Online" });
  const Input = mkInput(T); const Select = mkSelect(T);
  const statusColor = { Online: "#3ecf8e", Away: "#f5c518", Offline: "#6b7280" };
  const f = k => e => setForm({ ...form, [k]: e.target.value });

  const addAgent = () => {
    if (!form.name || !form.email) return;
    setAgents(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ name: "", role: "IT Agent", email: "", dept: "IT", status: "Online" });
    setShowAdd(false);
  };
  const removeAgent = (id) => setAgents(prev => prev.filter(a => a.id !== id));

  return (
    <Modal title="Team Management" onClose={onClose} wide T={T}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <Btn icon="add_user" onClick={() => setShowAdd(s => !s)}>{showAdd ? "Cancel" : "Add Member"}</Btn>
      </div>
      {showAdd && (
        <div style={{ background: T.card2, borderRadius: 10, padding: 16, marginBottom: 16, border: `1px solid #4a9eff33` }}>
          <div style={{ fontWeight: 700, color: T.text2, fontSize: 12, textTransform: "uppercase", marginBottom: 12 }}>New Team Member</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Full Name" required><Input value={form.name} onChange={f("name")} placeholder="e.g. Ahmad Faiz" /></Field>
            <Field label="Work Email" required><Input value={form.email} onChange={f("email")} placeholder="faiz@elmu.local" /></Field>
            <Field label="Role"><Select value={form.role} onChange={f("role")}>{AGENT_ROLES.map(r => <option key={r}>{r}</option>)}</Select></Field>
            <Field label="Department"><Select value={form.dept} onChange={f("dept")}>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</Select></Field>
            <Field label="Status"><Select value={form.status} onChange={f("status")}>{AGENT_STATUSES.map(s => <option key={s}>{s}</option>)}</Select></Field>
            <Field label="Username (login)"><Input value={form.username} onChange={f("username")} placeholder="Auto: firstname if blank" /></Field>
            <Field label="Password (login)"><Input value={form.password} onChange={f("password")} placeholder="Auto: name+1234 if blank" /></Field>
          </div>
          <div style={{ background: "#4a9eff11", border: "1px solid #4a9eff22", borderRadius: 7, padding: "8px 12px", fontSize: 11, color: "#4a9eff", marginBottom: 8 }}>
            💡 Leave blank: username = first name (lowercase), password = firstname+1234
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Btn onClick={addAgent} icon="check" disabled={!form.name || !form.email}>Add Member</Btn>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
          </div>
        </div>
      )}
      {agents.map(a => (
        <div key={a.id} style={{ background: T.card2, borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#4a9eff22", color: "#4a9eff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {a.name[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: T.text, fontSize: 14 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: T.text3 }}>{a.role} · {a.email}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[a.status] }} />
                <span style={{ color: statusColor[a.status] }}>{a.status}</span>
              </div>
              {a.id !== 0 && <button onClick={() => removeAgent(a.id)} style={{ background: "#ff3b3b11", border: "1px solid #ff3b3b33", borderRadius: 6, padding: "4px 8px", color: "#ff3b3b", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Remove</button>}
            </div>
          </div>
          {a.username && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "7px 14px", background: T.border + "33", borderTop: `1px solid ${T.border}`, fontSize: 11, alignItems: "center" }}>
              <span style={{ color: T.text3 }}>🔑 Login:</span>
              <span style={{ color: "#4a9eff", fontFamily: "monospace", fontWeight: 700 }}>{a.username}</span>
              <span style={{ color: T.text3 }}>/</span>
              <span style={{ color: T.text2, fontFamily: "monospace" }}>{a.password}</span>
              <span style={{ marginLeft: "auto", color: "#3ecf8e", fontSize: 10, fontWeight: 600 }}>✓ Can access dashboard</span>
            </div>
          )}
        </div>
      ))}
    </Modal>
  );
};

// ─── SETTINGS MODAL ───────────────────────────────────────────────────────────
const SettingsModule = ({ onClose, darkMode, setDarkMode, T }) => {
  const [vals, setVals] = useState({ org: "ELMU Corporation", email: "itsupport@elmu.local", slaHigh: "4", slaMed: "8", slaLow: "24", notif: true, autoAssign: true });
  const Input = mkInput(T);
  return (
    <Modal title="System Settings" onClose={onClose} wide T={T}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, marginBottom: 12, textTransform: "uppercase" }}>Organization</div>
          <Field label="Org Name"><Input value={vals.org} onChange={e => setVals({ ...vals, org: e.target.value })} /></Field>
          <Field label="IT Support Email"><Input value={vals.email} onChange={e => setVals({ ...vals, email: e.target.value })} /></Field>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, marginBottom: 12, textTransform: "uppercase" }}>SLA Targets (hours)</div>
          <Field label="High"><Input type="number" value={vals.slaHigh} onChange={e => setVals({ ...vals, slaHigh: e.target.value })} /></Field>
          <Field label="Medium"><Input type="number" value={vals.slaMed} onChange={e => setVals({ ...vals, slaMed: e.target.value })} /></Field>
          <Field label="Low"><Input type="number" value={vals.slaLow} onChange={e => setVals({ ...vals, slaLow: e.target.value })} /></Field>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, marginBottom: 12, textTransform: "uppercase" }}>Appearance</div>
          <Toggle value={darkMode} onChange={setDarkMode} label="Dark Mode" T={T} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, marginBottom: 12, textTransform: "uppercase" }}>Automation</div>
          <Toggle value={vals.notif} onChange={v => setVals({ ...vals, notif: v })} label="Email Notifications" T={T} />
          <Toggle value={vals.autoAssign} onChange={v => setVals({ ...vals, autoAssign: v })} label="Auto-assign by Workload" T={T} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <Btn icon="check" onClick={onClose}>Save Settings</Btn>
      </div>
    </Modal>
  );
};

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
const AdminDashboard = ({ tickets, setTickets, agents, setAgents, onLogout, darkMode, setDarkMode, T, currentUser }) => {
  const [activeModule, setActiveModule] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "", category: "", assignee: "" });
  const [showNew, setShowNew] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const Input = mkInput(T); const Select = mkSelect(T);

  const notify = (msg, color = "#3ecf8e") => { setNotification({ msg, color }); setTimeout(() => setNotification(null), 3000); };

  const updateTicket = (updated) => {
    setTickets(t => t.map(x => x.id === updated.id ? updated : x));
    setSelectedTicket(updated);
    notify(`Ticket ${updated.id} updated`);
  };

  const createTicket = (form) => {
    const ticket = { ...form, id: newId(tickets), status: "Open", created: today(), updated: today(), sla: form.priority === "Critical" ? "1h" : form.priority === "High" ? "4h" : form.priority === "Medium" ? "8h" : "24h", comments: [] };
    setTickets(t => [ticket, ...t]);
    notify(`Ticket ${ticket.id} created`);
  };

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    return (!q || t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || (t.requester || "").toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
      && (!filters.status || t.status === filters.status)
      && (!filters.priority || t.priority === filters.priority)
      && (!filters.category || t.category === filters.category)
      && (!filters.assignee || t.assignee === filters.assignee);
  });

  const stats = { total: tickets.length, open: tickets.filter(t => t.status === "Open").length, critical: tickets.filter(t => t.priority === "Critical" && !["Closed", "Resolved"].includes(t.status)).length, resolved: tickets.filter(t => ["Resolved", "Closed"].includes(t.status)).length };

  const NAV = [
    { key: null, label: "Tickets", icon: "tickets" },
    { key: "kb", label: "Knowledge Base", icon: "kb" },
    { key: "reports", label: "Reports", icon: "reports" },
    { key: "team", label: "Team", icon: "users" },
    { key: "settings", label: "Settings", icon: "settings" },
  ];

  const SidebarContent = () => (
    <>
      <div style={{ padding: "18px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4a9eff,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#fff", flexShrink: 0 }}>E</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: T.text }}>ELMU</div>
            <div style={{ fontSize: 10, color: T.text3, letterSpacing: "1px", textTransform: "uppercase" }}>IT Ticketing</div>
          </div>
        </div>
        <Btn onClick={() => { setShowNew(true); setSidebarOpen(false); }} icon="new" style={{ width: "100%", justifyContent: "center", marginBottom: 4 }}>New Ticket</Btn>
      </div>
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {NAV.map(n => {
          const active = activeModule === n.key || (!activeModule && n.key === null);
          return (
            <div key={String(n.key)} onClick={() => { if (n.key) setActiveModule(n.key); else setActiveModule(null); setSidebarOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 7, marginBottom: 2, cursor: "pointer", background: active ? "#4a9eff1a" : "transparent", color: active ? "#4a9eff" : T.text3, transition: "all 0.15s", fontSize: 13, fontWeight: 500 }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.card2; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              <Icon name={n.icon} size={16} />{n.label}
              {n.key === null && stats.open > 0 && <span style={{ marginLeft: "auto", background: "#4a9eff", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{stats.open}</span>}
            </div>
          );
        })}
      </nav>
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}` }}>
        <div onClick={() => setDarkMode(!darkMode)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 7, cursor: "pointer", marginBottom: 8, color: T.text3, fontSize: 12, fontWeight: 500 }}
          onMouseEnter={e => e.currentTarget.style.background = T.card2}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <Icon name={darkMode ? "sun" : "moon"} size={15} />{darkMode ? "Light Mode" : "Dark Mode"}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#4a9eff22", color: "#4a9eff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>{(currentUser?.name || "A")[0].toUpperCase()}</div>
            <div><div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{currentUser?.name || "Admin"}</div><div style={{ fontSize: 10, color: T.text3 }}>{currentUser?.role || "IT Manager"}</div></div>
          </div>
          <button onClick={onLogout} title="Logout" style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", padding: 4 }}><Icon name="logout" size={16} /></button>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: T.text, display: "flex" }}>

      {/* ── Sidebar: slides in/out on ALL screen sizes ── */}
      {/* Backdrop for mobile only */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 199 }}
          className="sidebar-backdrop" />
      )}
      <div style={{
        width: 210, background: T.sidebar, borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 200,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
        boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.18)" : "none",
      }}>
        {/* Collapse arrow button — visible on desktop */}
        <button
          onClick={() => setSidebarOpen(false)}
          title="Collapse sidebar"
          style={{ position: "absolute", top: 16, right: -14, width: 28, height: 28, borderRadius: "50%", background: T.sidebar, border: `1px solid ${T.border}`, color: T.text3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          className="sidebar-collapse-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
        </button>
        <SidebarContent />
      </div>

      {/* Main */}
      <div style={{ marginLeft: sidebarOpen ? 210 : 0, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)" }} className="admin-main">
        {/* Header */}
        <div style={{ background: T.sidebar, borderBottom: `1px solid ${T.border}`, padding: "0 16px", height: 56, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
          {/* Hamburger — always visible, toggles open/close */}
          <button onClick={() => setSidebarOpen(s => !s)} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", display: "flex", padding: 4, flexShrink: 0 }}>
            <Icon name="menu" size={22} />
          </button>
          <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.text3 }}><Icon name="search" size={14} /></div>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." style={{ paddingLeft: 32, fontSize: 12 }} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {stats.critical > 0 && <div style={{ background: "#ff3b3b22", color: "#ff3b3b", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><Icon name="alert" size={13} />{stats.critical} Critical</div>}
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 8px", color: T.text3, cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Icon name={darkMode ? "sun" : "moon"} size={16} />
            </button>
          </div>
        </div>

        <div style={{ padding: "16px" }}>
          {/* Stats */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            <StatCard label="Total" value={stats.total} color="#4a9eff" icon="tickets" T={T} />
            <StatCard label="Open" value={stats.open} color="#f5c518" icon="alert" T={T} />
            <StatCard label="Critical" value={stats.critical} color="#ff3b3b" icon="sla" T={T} />
            <StatCard label="Resolved" value={stats.resolved} color="#3ecf8e" icon="check" T={T} />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ color: T.text3, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><Icon name="filter" size={13} /></div>
            {[["status", STATUSES, "Status"], ["priority", PRIORITIES, "Priority"], ["category", CATEGORIES, "Category"]].map(([key, opts, label]) => (
              <Select key={key} value={filters[key]} onChange={e => setFilters({ ...filters, [key]: e.target.value })} style={{ width: "auto", padding: "5px 8px", fontSize: 11 }}>
                <option value="">All {label}</option>
                {opts.map(o => <option key={o}>{o}</option>)}
              </Select>
            ))}
            <Select value={filters.assignee} onChange={e => setFilters({ ...filters, assignee: e.target.value })} style={{ width: "auto", padding: "5px 8px", fontSize: 11 }}>
              <option value="">All Agents</option>
              <option>Unassigned</option>
              {agents.map(a => <option key={a.id}>{a.name}</option>)}
            </Select>
            {(filters.status || filters.priority || filters.category || filters.assignee || search) && (
              <Btn small variant="ghost" onClick={() => { setFilters({ status: "", priority: "", category: "", assignee: "" }); setSearch(""); }}>Clear</Btn>
            )}
            <span style={{ fontSize: 11, color: T.text3, marginLeft: "auto" }}>{filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Ticket Table — Desktop */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 16 }} className="ticket-table">
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 90px 80px 90px 110px 80px", gap: 10, padding: "9px 16px", borderBottom: `1px solid ${T.border}`, background: T.card2 }}>
              {["ID", "Title", "Category", "Priority", "Status", "Assignee", "Updated"].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</div>
              ))}
            </div>
            {filtered.length === 0 && <div style={{ padding: "32px 16px", textAlign: "center", color: T.text3 }}>No tickets found.</div>}
            {filtered.map(t => (
              <div key={t.id} onClick={() => setSelectedTicket(t)} style={{ display: "grid", gridTemplateColumns: "80px 1fr 90px 80px 90px 110px 80px", gap: 10, padding: "11px 16px", borderBottom: `1px solid ${T.border}`, cursor: "pointer", fontSize: 12, transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = T.card2}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ color: "#4a9eff", fontWeight: 600, fontFamily: "monospace", fontSize: 11 }}>{t.id}</span>
                <div>
                  <div style={{ color: T.text, fontWeight: 500, marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                  <div style={{ color: T.text3, fontSize: 10 }}>{t.dept} · {t.requester}</div>
                </div>
                <Badge label={t.category} color="#94a3b8" small />
                <Badge label={t.priority} color={PRIORITY_COLOR[t.priority]} small />
                <Badge label={t.status} color={STATUS_COLOR[t.status]} small />
                <span style={{ color: T.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.assignee}</span>
                <span style={{ color: T.text3, fontSize: 10 }}>{t.updated}</span>
              </div>
            ))}
          </div>

          {/* Ticket Cards — Mobile */}
          <div className="ticket-cards" style={{ display: "none" }}>
            {filtered.length === 0 && <div style={{ padding: "24px", textAlign: "center", color: T.text3, background: T.card, borderRadius: 10, border: `1px solid ${T.border}` }}>No tickets found.</div>}
            {filtered.map(t => (
              <div key={t.id} onClick={() => setSelectedTicket(t)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, marginBottom: 10, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ color: "#4a9eff", fontWeight: 700, fontFamily: "monospace", fontSize: 11 }}>{t.id}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Badge label={t.priority} color={PRIORITY_COLOR[t.priority]} small />
                    <Badge label={t.status} color={STATUS_COLOR[t.status]} small />
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: T.text, marginBottom: 4, fontSize: 13 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: T.text3 }}>{t.category} · {t.dept} · {t.assignee}</div>
              </div>
            ))}
          </div>

          {/* Activity */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 }}>
            <div style={{ fontWeight: 700, color: T.text3, fontSize: 11, textTransform: "uppercase", marginBottom: 12 }}>Recent Activity</div>
            {tickets.filter(t => t.comments.length > 0).slice(0, 4).map(t => {
              const c = t.comments[t.comments.length - 1];
              return (
                <div key={t.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.border}`, alignItems: "flex-start" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#4a9eff22", color: "#4a9eff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{c.author[0]}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: T.text }}><span style={{ color: "#4a9eff" }}>{c.author}</span> on <span style={{ color: "#a78bfa", cursor: "pointer" }} onClick={() => setSelectedTicket(t)}>{t.id}</span></div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.text.slice(0, 70)}{c.text.length > 70 ? "…" : ""}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNew && <NewTicketModal onClose={() => setShowNew(false)} onCreate={createTicket} agents={agents} T={T} />}
      {selectedTicket && <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdate={updateTicket} agents={agents} T={T} currentUser={currentUser} />}
      {activeModule === "kb" && <KnowledgeBase onClose={() => setActiveModule(null)} T={T} />}
      {activeModule === "reports" && <Reports tickets={tickets} onClose={() => setActiveModule(null)} agents={agents} T={T} />}
      {activeModule === "team" && <TeamModule onClose={() => setActiveModule(null)} agents={agents} setAgents={setAgents} T={T} />}
      {activeModule === "settings" && <SettingsModule onClose={() => setActiveModule(null)} darkMode={darkMode} setDarkMode={setDarkMode} T={T} />}

      {notification && (
        <div style={{ position: "fixed", bottom: 20, right: 16, background: notification.color + "22", border: `1px solid ${notification.color}44`, color: notification.color, padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, zIndex: 9999, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="check" size={13} />{notification.msg}
        </div>
      )}
    </div>
  );
};

// ─── USER PORTAL ──────────────────────────────────────────────────────────────
const UserPortal = ({ onSubmit, onGoToLogin, myTickets, onUpdateTicket, darkMode, setDarkMode, T }) => {
  const [view, setView] = useState("home");
  const [form, setForm] = useState({ name: "", email: "", dept: "", category: "Software", priority: "Medium", title: "", description: "" });
  const [submitted, setSubmitted] = useState(null);
  const [trackSearch, setTrackSearch] = useState("");
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [userComment, setUserComment] = useState("");
  const Input = mkInput(T); const Select = mkSelect(T); const Textarea = mkTextarea(T);

  const f = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.title) return;
    const ticket = onSubmit(form);
    setSubmitted(ticket);
    setView("success");
  };

  useEffect(() => {
    if (trackedTicket?.id) {
      const fresh = myTickets.find(t => t.id === trackedTicket.id);
      if (fresh) setTrackedTicket(fresh);
    }
  }, [myTickets]);

  const sendUserComment = () => {
    if (!userComment.trim() || !trackedTicket) return;
    const updated = { ...trackedTicket, comments: [...trackedTicket.comments, { author: trackedTicket.requester || "User", time: new Date().toLocaleString(), text: userComment, type: "user" }], updated: today() };
    onUpdateTicket(updated);
    setTrackedTicket(updated);
    setUserComment("");
  };

  const filteredTickets = myTickets.filter(t => {
    const q = trackSearch.toLowerCase();
    return !q || t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.status.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || (t.requester || "").toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: T.text }}>
      {/* Header */}
      <div style={{ background: T.sidebar, borderBottom: `1px solid ${T.border}`, padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4a9eff,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#fff" }}>E</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: T.text }}>ELMU IT Support</div>
            <div style={{ fontSize: 10, color: T.text3, letterSpacing: "1px", textTransform: "uppercase" }}>User Portal</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: view === "home" ? "#4a9eff" : T.text3, cursor: "pointer", fontSize: 13, fontWeight: 500, padding: "4px 8px" }}>Home</button>
          <button onClick={() => { setView("track"); setTrackedTicket(null); }} style={{ background: "none", border: "none", color: view === "track" ? "#4a9eff" : T.text3, cursor: "pointer", fontSize: 13, fontWeight: 500, padding: "4px 8px" }}>My Tickets</button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 7px", color: T.text3, cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Icon name={darkMode ? "sun" : "moon"} size={15} />
          </button>
          <Btn small icon="lock" onClick={onGoToLogin}>Admin</Btn>
        </div>
      </div>

      {/* HOME */}
      {view === "home" && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 16px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: T.text, marginBottom: 8, letterSpacing: "-0.5px" }}>How can we help you?</div>
            <div style={{ fontSize: 14, color: T.text3 }}>Submit a support request and our IT team will respond quickly.</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }} className="portal-cards">
            {[
              { icon: "new", title: "Submit a Ticket", desc: "Report an issue or request help", color: "#4a9eff", action: () => setView("submit") },
              { icon: "time", title: "My Tickets", desc: "Track your submitted requests", color: "#a78bfa", action: () => setView("track") },
              { icon: "kb", title: "Knowledge Base", desc: "Find answers to common issues", color: "#3ecf8e", action: () => {} },
            ].map(c => (
              <div key={c.title} onClick={c.action} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, cursor: "pointer", transition: "border-color 0.2s, transform 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = c.color + "77"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: c.color + "22", color: c.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Icon name={c.icon} size={20} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: T.text3 }}>{c.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: "uppercase", marginBottom: 12 }}>Common Issues</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {["Password reset", "VPN not connecting", "Printer offline", "Software installation", "Email not working", "New device setup"].map(q => (
                <div key={q} onClick={() => { setForm(p => ({ ...p, title: q })); setView("submit"); }}
                  style={{ padding: "10px 12px", background: T.card2, borderRadius: 7, cursor: "pointer", fontSize: 13, color: T.text2, display: "flex", alignItems: "center", gap: 7, transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#4a9eff"}
                  onMouseLeave={e => e.currentTarget.style.color = T.text2}>
                  <Icon name="arrow" size={13} />{q}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT */}
      {view === "submit" && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "30px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", fontSize: 13 }}>← Back</button>
            <div style={{ fontWeight: 800, fontSize: 20, color: T.text }}>Submit Support Request</div>
          </div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Full Name" required><Input value={form.name} onChange={f("name")} placeholder="e.g. Ahmad Faiz" /></Field>
              <Field label="Work Email" required><Input value={form.email} onChange={f("email")} placeholder="you@elmu.local" /></Field>
              <Field label="Department"><Select value={form.dept} onChange={f("dept")}><option value="">Select...</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</Select></Field>
              <Field label="Category"><Select value={form.category} onChange={f("category")}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</Select></Field>
            </div>
            <Field label="Priority">
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                {PRIORITIES.map(p => (
                  <div key={p} onClick={() => setForm({ ...form, priority: p })} style={{ flex: 1, padding: "7px 0", textAlign: "center", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 600, background: form.priority === p ? PRIORITY_COLOR[p] + "33" : T.card2, border: `1px solid ${form.priority === p ? PRIORITY_COLOR[p] + "88" : T.border}`, color: form.priority === p ? PRIORITY_COLOR[p] : T.text3, transition: "all 0.15s" }}>{p}</div>
                ))}
              </div>
            </Field>
            <Field label="Issue Title" required><Input value={form.title} onChange={f("title")} placeholder="Brief description of your issue" /></Field>
            <Field label="Details"><Textarea value={form.description} onChange={f("description")} placeholder="Error messages, steps tried, etc." style={{ minHeight: 100 }} /></Field>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <Btn variant="ghost" onClick={() => setView("home")}>Cancel</Btn>
              <Btn onClick={handleSubmit} icon="new" disabled={!form.name || !form.email || !form.title}>Submit Request</Btn>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {view === "success" && submitted && (
        <div style={{ maxWidth: 460, margin: "60px auto", padding: "0 16px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#3ecf8e22", color: "#3ecf8e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Icon name="check" size={32} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 8 }}>Request Submitted!</div>
          <div style={{ fontSize: 14, color: T.text3, marginBottom: 22 }}>Your ticket has been logged. IT team will respond soon.</div>
          <div style={{ background: T.card, border: "1px solid #3ecf8e33", borderRadius: 12, padding: 22, marginBottom: 22 }}>
            <div style={{ fontSize: 12, color: T.text3, marginBottom: 6 }}>Your Ticket ID — save this!</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#3ecf8e", fontFamily: "monospace", letterSpacing: "3px" }}>{submitted.id}</div>
            <div style={{ fontSize: 12, color: T.text3, marginTop: 8 }}>Expected response within <strong style={{ color: "#f5c518" }}>{submitted.sla}</strong></div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn variant="ghost" onClick={() => { setTrackSearch(submitted.id); setView("track"); }}>Track Ticket</Btn>
            <Btn onClick={() => { setView("home"); setForm({ name: "", email: "", dept: "", category: "Software", priority: "Medium", title: "", description: "" }); setSubmitted(null); }}>Submit Another</Btn>
          </div>
        </div>
      )}

      {/* TRACK */}
      {view === "track" && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "30px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button onClick={() => { setView("home"); setTrackedTicket(null); }} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", fontSize: 13 }}>← Back</button>
            <div style={{ fontWeight: 800, fontSize: 20, color: T.text, flex: 1 }}>My Tickets</div>
            <div style={{ position: "relative", width: 240 }}>
              <div style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: T.text3 }}><Icon name="search" size={13} /></div>
              <Input value={trackSearch} onChange={e => { setTrackSearch(e.target.value); setTrackedTicket(null); }} placeholder="Search tickets..." style={{ paddingLeft: 30, fontSize: 12 }} />
            </div>
          </div>

          {!trackedTicket ? (
            <div>
              {filteredTickets.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: T.text3, fontSize: 13 }}>No tickets found.</div>}
              {filteredTickets.map(t => (
                <div key={t.id} onClick={() => setTrackedTicket(t)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10, cursor: "pointer", transition: "border-color 0.15s, transform 0.1s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = STATUS_COLOR[t.status] + "66"; e.currentTarget.style.transform = "translateX(3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "#4a9eff", fontFamily: "monospace", fontWeight: 700 }}>{t.id}</span>
                        {t.submittedByUser && <span style={{ fontSize: 10, color: T.text3, background: T.card2, border: `1px solid ${T.border}`, borderRadius: 4, padding: "1px 5px" }}>Portal</span>}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{t.title}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 12 }}>
                      <Badge label={t.status} color={STATUS_COLOR[t.status]} small />
                      <Badge label={t.priority} color={PRIORITY_COLOR[t.priority]} small />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.text3 }}>
                    <span>{t.category} · {t.dept || "—"} · {t.created}</span>
                    <span style={{ color: t.comments.length > 0 ? "#4a9eff" : T.text4 }}>{t.comments.length} update{t.comments.length !== 1 ? "s" : ""} →</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <button onClick={() => setTrackedTicket(null)} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← Back to list</button>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: T.text3, fontFamily: "monospace", marginBottom: 4 }}>{trackedTicket.id}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>{trackedTicket.title}</div>
                  </div>
                  <Badge label={trackedTicket.status} color={STATUS_COLOR[trackedTicket.status]} />
                </div>
                {/* Timeline */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: 20, background: T.card2, borderRadius: 8, padding: "14px 16px" }}>
                  {["Open", "In Progress", "Resolved", "Closed"].map((s, i, arr) => {
                    const order = { Open: 0, "In Progress": 1, Pending: 1, Resolved: 2, Closed: 3 };
                    const done = order[trackedTicket.status] >= order[s];
                    const active = trackedTicket.status === s;
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? 1 : 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: done ? STATUS_COLOR[s] + "33" : T.card, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${done ? STATUS_COLOR[s] : T.border2}`, boxShadow: active ? `0 0 10px ${STATUS_COLOR[s]}44` : "none" }}>
                            {done ? <Icon name="check" size={12} /> : <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.border2 }} />}
                          </div>
                          <div style={{ fontSize: 9, color: done ? T.text : T.text3, whiteSpace: "nowrap", fontWeight: active ? 700 : 400 }}>{s}</div>
                        </div>
                        {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: order[trackedTicket.status] > order[s] ? "#4a9eff44" : T.border, margin: "0 4px", marginBottom: 14 }} />}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
                  {[["Assigned To", trackedTicket.assignee], ["Priority", trackedTicket.priority], ["Last Update", trackedTicket.updated]].map(([k, v]) => (
                    <div key={k} style={{ background: T.card2, borderRadius: 7, padding: 10 }}>
                      <div style={{ fontSize: 10, color: T.text3, marginBottom: 2, textTransform: "uppercase" }}>{k}</div>
                      <div style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: "uppercase", marginBottom: 10 }}>Updates & Messages</div>
                <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 12 }}>
                  {trackedTicket.comments.length === 0 && <div style={{ color: T.text3, fontSize: 13, fontStyle: "italic", padding: "8px 0" }}>No updates yet — we'll be in touch shortly.</div>}
                  {trackedTicket.comments.map((c, i) => (
                    <div key={i} style={{ background: c.type === "user" ? "#3ecf8e0d" : T.card2, borderLeft: `3px solid ${c.type === "user" ? "#3ecf8e55" : "#4a9eff33"}`, borderRadius: 7, padding: "9px 12px", marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: c.type === "user" ? "#3ecf8e" : "#4a9eff" }}>{c.type === "user" ? "👤 You" : "🛠 IT Support"}</span>
                        <span style={{ fontSize: 10, color: T.text3 }}>{c.time}</span>
                      </div>
                      <div style={{ fontSize: 13, color: T.text }}>{c.text}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Input value={userComment} onChange={e => setUserComment(e.target.value)} onKeyDown={e => e.key === "Enter" && sendUserComment()} placeholder="Reply to IT team..." style={{ flex: 1 }} />
                  <Btn onClick={sendUserComment} small icon="chat">Send</Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [appMode, setAppMode] = useState("portal"); // "portal" | "login" | "admin"
  const [darkMode, setDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const T = darkMode ? DARK : LIGHT;

  const updateTicket = (updated) => setTickets(t => t.map(x => x.id === updated.id ? updated : x));

  const handleUserSubmit = (form) => {
    const ticket = { ...form, requester: form.name, id: newId(tickets), status: "Open", created: today(), updated: today(), sla: form.priority === "Critical" ? "1h" : form.priority === "High" ? "4h" : form.priority === "Medium" ? "8h" : "24h", comments: [], tags: [], submittedByUser: true };
    setTickets(t => [ticket, ...t]);
    return ticket;
  };

  const handleLogin = (user) => { setCurrentUser(user); setAppMode("admin"); };
  const handleLogout = () => { setCurrentUser(null); setAppMode("portal"); };

  return (
    <>
      {appMode === "portal" && (
        <UserPortal
          onSubmit={handleUserSubmit}
          onGoToLogin={() => setAppMode("login")}
          myTickets={tickets}
          onUpdateTicket={updateTicket}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          T={T}
        />
      )}
      {appMode === "login" && (
        <AdminLogin
          onLogin={handleLogin}
          onBack={() => setAppMode("portal")}
          agents={agents}
          T={T}
        />
      )}
      {appMode === "admin" && (
        <AdminDashboard
          tickets={tickets}
          setTickets={setTickets}
          agents={agents}
          setAgents={setAgents}
          onLogout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          T={T}
          currentUser={currentUser}
        />
      )}
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2e3a4e; border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: #6b7280; }
        select option { background: #0f1117; color: #e2e8f0; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

        /* Sidebar collapse button — hide on mobile (backdrop handles close) */
        .sidebar-collapse-btn { display: flex !important; }
        .sidebar-backdrop { display: none !important; }

        /* Responsive breakpoints */
        @media (max-width: 768px) {
          /* On mobile: sidebar overlays (no margin push), backdrop shows */
          .admin-main { margin-left: 0 !important; transition: none !important; }
          .sidebar-backdrop { display: block !important; }
          .sidebar-collapse-btn { display: none !important; }
          .ticket-table { display: none !important; }
          .ticket-cards { display: block !important; }
          .portal-cards { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .portal-cards { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  );
}

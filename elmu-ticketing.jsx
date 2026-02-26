import { useState, useEffect, useRef } from "react";

// ─── DATA STORE ───────────────────────────────────────────────────────────────
const INITIAL_TICKETS = [
  { id: "TKT-001", title: "VPN not connecting after Windows update", category: "Network", priority: "High", status: "Open", assignee: "Carlos M.", requester: "Alice Chen", dept: "Finance", created: "2026-02-20", updated: "2026-02-21", sla: "4h", comments: [{ author: "Carlos M.", time: "2026-02-21 09:00", text: "Investigating the issue, likely related to KB5034441 patch." }], tags: ["VPN", "Windows", "Urgent"] },
  { id: "TKT-002", title: "Outlook crashes on startup", category: "Software", priority: "Medium", status: "In Progress", assignee: "Sara Lee", requester: "Bob Tan", dept: "HR", created: "2026-02-22", updated: "2026-02-23", sla: "8h", comments: [], tags: ["Outlook", "Office365"] },
  { id: "TKT-003", title: "New laptop setup for onboarding - Maria Santos", category: "Hardware", priority: "Low", status: "Resolved", assignee: "James Okafor", requester: "Maria Santos", dept: "Marketing", created: "2026-02-18", updated: "2026-02-19", sla: "24h", comments: [{ author: "James Okafor", time: "2026-02-19 14:00", text: "Laptop configured and handed over. Ticket resolved." }], tags: ["Onboarding", "Laptop"] },
  { id: "TKT-004", title: "Printer P-203 offline – 3rd floor", category: "Hardware", priority: "Medium", status: "Open", assignee: "Unassigned", requester: "David Lim", dept: "Operations", created: "2026-02-24", updated: "2026-02-24", sla: "8h", comments: [], tags: ["Printer"] },
  { id: "TKT-005", title: "Server storage 90% capacity alert", category: "Infrastructure", priority: "Critical", status: "Open", assignee: "Carlos M.", requester: "System Monitor", dept: "IT", created: "2026-02-25", updated: "2026-02-25", sla: "1h", comments: [{ author: "Carlos M.", time: "2026-02-25 08:30", text: "Escalated to infrastructure team. Emergency cleanup in progress." }], tags: ["Server", "Storage", "Critical"] },
  { id: "TKT-006", title: "Access request – SharePoint Marketing Hub", category: "Access", priority: "Low", status: "Closed", assignee: "Sara Lee", requester: "Emma Wilson", dept: "Marketing", created: "2026-02-15", updated: "2026-02-16", sla: "24h", comments: [], tags: ["SharePoint", "Access"] },
];

const AGENTS = ["Carlos M.", "Sara Lee", "James Okafor", "Raj Patel", "Nina Cruz"];
const CATEGORIES = ["Network", "Software", "Hardware", "Infrastructure", "Access", "Security", "Other"];
const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Open", "In Progress", "Pending", "Resolved", "Closed"];
const DEPARTMENTS = ["IT", "Finance", "HR", "Marketing", "Operations", "Legal", "Sales"];

const PRIORITY_COLOR = { Critical: "#ff3b3b", High: "#ff8c00", Medium: "#f5c518", Low: "#3ecf8e" };
const STATUS_COLOR = { Open: "#4a9eff", "In Progress": "#a78bfa", Pending: "#f5c518", Resolved: "#3ecf8e", Closed: "#6b7280" };

// ─── UTILS ────────────────────────────────────────────────────────────────────
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
    attach: "M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z",
    filter: "M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z",
    bell: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
    time: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
    tag: "M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z",
    sla: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z",
    merge: "M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z",
    export: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
    plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    arrow: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d={icons[name] || icons.alert} />
    </svg>
  );
};

// ─── BADGE ─────────────────────────────────────────────────────────────────
const Badge = ({ label, color, small }) => (
  <span style={{
    background: color + "22", color, border: `1px solid ${color}44`,
    borderRadius: 4, padding: small ? "2px 7px" : "3px 10px",
    fontSize: small ? 11 : 12, fontWeight: 600, whiteSpace: "nowrap",
    letterSpacing: "0.3px"
  }}>{label}</span>
);

// ─── MODAL ─────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div style={{ background: "#0f1117", border: "1px solid #1e2535", borderRadius: 12, width: wide ? 860 : 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #1e2535" }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}><Icon name="close" size={20} /></button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

// ─── FORM FIELD ─────────────────────────────────────────────────────────────
const Field = ({ label, children, required }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
      {label}{required && <span style={{ color: "#ff3b3b" }}> *</span>}
    </label>
    {children}
  </div>
);

const Input = ({ ...props }) => (
  <input {...props} style={{ width: "100%", background: "#161b27", border: "1px solid #1e2535", borderRadius: 6, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", ...props.style }} />
);

const Select = ({ children, ...props }) => (
  <select {...props} style={{ width: "100%", background: "#161b27", border: "1px solid #1e2535", borderRadius: 6, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", ...props.style }}>
    {children}
  </select>
);

const Textarea = ({ ...props }) => (
  <textarea {...props} style={{ width: "100%", background: "#161b27", border: "1px solid #1e2535", borderRadius: 6, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box", ...props.style }} />
);

const Btn = ({ children, onClick, variant = "primary", small, icon, disabled }) => {
  const variants = {
    primary: { background: "#4a9eff", color: "#fff" },
    danger: { background: "#ff3b3b22", color: "#ff3b3b", border: "1px solid #ff3b3b44" },
    ghost: { background: "transparent", color: "#94a3b8", border: "1px solid #1e2535" },
    success: { background: "#3ecf8e22", color: "#3ecf8e", border: "1px solid #3ecf8e44" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...variants[variant], borderRadius: 7, padding: small ? "6px 12px" : "9px 18px",
      fontSize: small ? 12 : 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      border: "none", display: "inline-flex", alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1,
      transition: "opacity 0.15s", ...variants[variant]
    }}>
      {icon && <Icon name={icon} size={14} />}{children}
    </button>
  );
};

// ─── STAT CARD ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon, sub }) => (
  <div style={{ background: "#0f1117", border: "1px solid #1e2535", borderRadius: 10, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: color + "22", color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={icon} size={22} />
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#e2e8f0", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 1 }}>{sub}</div>}
    </div>
  </div>
);

// ─── TICKET ROW ─────────────────────────────────────────────────────────────
const TicketRow = ({ ticket, onClick }) => (
  <div onClick={onClick} style={{
    display: "grid", gridTemplateColumns: "90px 1fr 110px 90px 90px 120px 90px",
    alignItems: "center", gap: 12, padding: "13px 20px", borderBottom: "1px solid #1e2535",
    cursor: "pointer", transition: "background 0.1s", fontSize: 13
  }}
    onMouseEnter={e => e.currentTarget.style.background = "#161b27"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
  >
    <span style={{ color: "#4a9eff", fontWeight: 600, fontFamily: "monospace", fontSize: 12 }}>{ticket.id}</span>
    <div>
      <div style={{ color: "#e2e8f0", fontWeight: 500, marginBottom: 2 }}>{ticket.title}</div>
      <div style={{ color: "#6b7280", fontSize: 11 }}>{ticket.dept} · {ticket.requester}</div>
    </div>
    <Badge label={ticket.category} color="#94a3b8" small />
    <Badge label={ticket.priority} color={PRIORITY_COLOR[ticket.priority]} small />
    <Badge label={ticket.status} color={STATUS_COLOR[ticket.status]} small />
    <span style={{ color: "#94a3b8" }}>{ticket.assignee}</span>
    <span style={{ color: "#6b7280", fontSize: 11 }}>{ticket.updated}</span>
  </div>
);

// ─── TICKET DETAIL MODAL ────────────────────────────────────────────────────
const TicketDetail = ({ ticket, onClose, onUpdate }) => {
  const [comment, setComment] = useState("");
  const [edit, setEdit] = useState({ status: ticket.status, assignee: ticket.assignee, priority: ticket.priority });

  const addComment = () => {
    if (!comment.trim()) return;
    const updated = { ...ticket, comments: [...ticket.comments, { author: "You (Admin)", time: new Date().toLocaleString(), text: comment, type: "agent" }], updated: today() };
    onUpdate(updated);
    setComment("");
  };

  const saveEdit = () => { onUpdate({ ...ticket, ...edit, updated: today() }); };

  return (
    <Modal title={`${ticket.id} — Ticket Details`} onClose={onClose} wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 24 }}>
        <div>
          <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{ticket.title}</h2>
          {ticket.submittedByUser && (
            <div style={{ background: "#4a9eff11", border: "1px solid #4a9eff33", borderRadius: 6, padding: "7px 12px", fontSize: 12, color: "#4a9eff", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="users" size={13} /> Submitted via <strong>User Portal</strong> by {ticket.requester}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <Badge label={ticket.category} color="#94a3b8" />
            <Badge label={ticket.priority} color={PRIORITY_COLOR[ticket.priority]} />
            <Badge label={ticket.status} color={STATUS_COLOR[ticket.status]} />
            {ticket.tags.map(t => <Badge key={t} label={`#${t}`} color="#4a9eff" />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, background: "#161b27", borderRadius: 8, padding: 16 }}>
            {[["Requester", ticket.requester], ["Department", ticket.dept], ["Created", ticket.created], ["SLA", ticket.sla], ["Last Updated", ticket.updated]].map(([k, v]) => (
              <div key={k}><div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{k}</div><div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{v}</div></div>
            ))}
          </div>
          {ticket.description && (
            <div style={{ background: "#161b27", borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase" }}>Description</div>
              {ticket.description}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>ACTIVITY & COMMENTS</div>
            <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 12 }}>
              {ticket.comments.length === 0 && <div style={{ color: "#6b7280", fontSize: 13, fontStyle: "italic" }}>No comments yet.</div>}
              {ticket.comments.map((c, i) => (
                <div key={i} style={{
                  background: c.type === "user" ? "#3ecf8e0d" : "#161b27",
                  borderRadius: 8, padding: 12, marginBottom: 8,
                  borderLeft: `3px solid ${c.type === "user" ? "#3ecf8e55" : "#4a9eff33"}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.type === "user" ? "#3ecf8e" : "#4a9eff" }}>
                      {c.type === "user" ? "👤 " : "🛠 "}{c.author}
                    </span>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#e2e8f0" }}>{c.text}</div>
                </div>
              ))}
            </div>
            <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add an agent comment or update..." style={{ minHeight: 60 }} />
            <div style={{ marginTop: 8 }}><Btn onClick={addComment} icon="chat">Add Comment</Btn></div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#161b27", borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 12, textTransform: "uppercase" }}>Update Ticket</div>
            <Field label="Status">
              <Select value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value })}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Assignee">
              <Select value={edit.assignee} onChange={e => setEdit({ ...edit, assignee: e.target.value })}>
                <option>Unassigned</option>
                {AGENTS.map(a => <option key={a}>{a}</option>)}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={edit.priority} onChange={e => setEdit({ ...edit, priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </Select>
            </Field>
            <Btn onClick={saveEdit} icon="check">Save Changes</Btn>
          </div>

          <div style={{ background: "#161b27", borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 10, textTransform: "uppercase" }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn
                onClick={() => onUpdate({ ...ticket, status: "In Progress", assignee: ticket.assignee === "Unassigned" ? AGENTS[0] : ticket.assignee, updated: today(), comments: [...ticket.comments, { author: "System", time: new Date().toLocaleString(), text: "Ticket marked as In Progress by agent.", type: "agent" }] })}
                variant="ghost"
                icon="time"
                small
                style={{ borderColor: "#a78bfa44", color: "#a78bfa" }}
              >Mark In Progress</Btn>
              <Btn onClick={() => onUpdate({ ...ticket, status: "Resolved", updated: today(), comments: [...ticket.comments, { author: "System", time: new Date().toLocaleString(), text: "Ticket marked as Resolved.", type: "agent" }] })} variant="success" icon="check" small>Mark Resolved</Btn>
              <Btn onClick={() => onUpdate({ ...ticket, status: "Closed", updated: today() })} variant="ghost" icon="close" small>Close Ticket</Btn>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ─── NEW TICKET MODAL ────────────────────────────────────────────────────────
const NewTicketModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ title: "", category: "Network", priority: "Medium", dept: "IT", requester: "", description: "", assignee: "Unassigned", tags: "" });
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    if (!form.title || !form.requester) return;
    onCreate({ ...form, tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [] });
    onClose();
  };

  return (
    <Modal title="Create New Ticket" onClose={onClose}>
      <Field label="Ticket Title" required><Input value={form.title} onChange={f("title")} placeholder="Brief description of the issue" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Category" required><Select value={form.category} onChange={f("category")}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Priority" required><Select value={form.priority} onChange={f("priority")}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</Select></Field>
        <Field label="Requester" required><Input value={form.requester} onChange={f("requester")} placeholder="Full name" /></Field>
        <Field label="Department"><Select value={form.dept} onChange={f("dept")}>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</Select></Field>
        <Field label="Assignee"><Select value={form.assignee} onChange={f("assignee")}><option>Unassigned</option>{AGENTS.map(a => <option key={a}>{a}</option>)}</Select></Field>
        <Field label="Tags"><Input value={form.tags} onChange={f("tags")} placeholder="e.g. VPN, Windows, Printer" /></Field>
      </div>
      <Field label="Description"><Textarea value={form.description} onChange={f("description")} placeholder="Detailed description, steps to reproduce, screenshots, etc." style={{ minHeight: 100 }} /></Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit} icon="new">Create Ticket</Btn>
      </div>
    </Modal>
  );
};

// ─── KB MODAL ────────────────────────────────────────────────────────────────
const KB_ARTICLES = [
  { id: "KB-001", title: "How to reset your Windows password", category: "Account", views: 342, updated: "2026-02-10" },
  { id: "KB-002", title: "VPN Setup Guide – Windows & Mac", category: "Network", views: 512, updated: "2026-02-05" },
  { id: "KB-003", title: "Configure Outlook on a new device", category: "Software", views: 289, updated: "2026-01-28" },
  { id: "KB-004", title: "Printer troubleshooting steps", category: "Hardware", views: 198, updated: "2026-02-14" },
  { id: "KB-005", title: "How to request new software access", category: "Access", views: 401, updated: "2026-02-18" },
  { id: "KB-006", title: "MFA / 2FA Setup Instructions", category: "Security", views: 633, updated: "2026-02-20" },
];

const KnowledgeBase = ({ onClose }) => {
  const [search, setSearch] = useState("");
  const filtered = KB_ARTICLES.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()));
  return (
    <Modal title="Knowledge Base" onClose={onClose} wide>
      <div style={{ marginBottom: 16 }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." />
      </div>
      {filtered.map(a => (
        <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#161b27", borderRadius: 8, marginBottom: 8, cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.borderLeft = "3px solid #4a9eff"}
          onMouseLeave={e => e.currentTarget.style.borderLeft = "none"}>
          <div>
            <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{a.title}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{a.id} · {a.category} · Updated {a.updated}</div>
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{a.views} views</div>
        </div>
      ))}
    </Modal>
  );
};

// ─── REPORTS MODULE ──────────────────────────────────────────────────────────
const Reports = ({ tickets, onClose }) => {
  const byStatus = STATUSES.map(s => ({ label: s, count: tickets.filter(t => t.status === s).length, color: STATUS_COLOR[s] }));
  const byPriority = PRIORITIES.map(p => ({ label: p, count: tickets.filter(t => t.priority === p).length, color: PRIORITY_COLOR[p] }));
  const byCategory = CATEGORIES.map(c => ({ label: c, count: tickets.filter(t => t.category === c).length }));
  const max = Math.max(...byStatus.map(s => s.count), 1);

  return (
    <Modal title="Reports & Analytics" onClose={onClose} wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#161b27", borderRadius: 10, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: "#94a3b8", fontSize: 12, textTransform: "uppercase" }}>Tickets by Status</div>
          {byStatus.map(s => (
            <div key={s.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: "#e2e8f0" }}>{s.label}</span><span style={{ color: s.color }}>{s.count}</span>
              </div>
              <div style={{ background: "#0f1117", borderRadius: 4, height: 6 }}>
                <div style={{ width: `${(s.count / max) * 100}%`, background: s.color, height: "100%", borderRadius: 4, transition: "width 0.4s ease" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "#161b27", borderRadius: 10, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: "#94a3b8", fontSize: 12, textTransform: "uppercase" }}>Tickets by Priority</div>
          {byPriority.map(p => (
            <div key={p.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: "#e2e8f0" }}>{p.label}</span><span style={{ color: p.color }}>{p.count}</span>
              </div>
              <div style={{ background: "#0f1117", borderRadius: 4, height: 6 }}>
                <div style={{ width: `${(p.count / max) * 100}%`, background: p.color, height: "100%", borderRadius: 4, transition: "width 0.4s ease" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "#161b27", borderRadius: 10, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: "#94a3b8", fontSize: 12, textTransform: "uppercase" }}>By Category</div>
          {byCategory.filter(c => c.count > 0).map(c => (
            <div key={c.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e2535", fontSize: 13 }}>
              <span style={{ color: "#e2e8f0" }}>{c.label}</span><span style={{ color: "#4a9eff", fontWeight: 600 }}>{c.count}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#161b27", borderRadius: 10, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: "#94a3b8", fontSize: 12, textTransform: "uppercase" }}>Agent Workload</div>
          {AGENTS.map(a => {
            const count = tickets.filter(t => t.assignee === a && t.status !== "Closed" && t.status !== "Resolved").length;
            return (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e2535", fontSize: 13 }}>
                <span style={{ color: "#e2e8f0" }}>{a}</span>
                <span style={{ color: count > 3 ? "#ff3b3b" : count > 1 ? "#ff8c00" : "#3ecf8e", fontWeight: 600 }}>{count} open</span>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

// ─── USERS MODULE ─────────────────────────────────────────────────────────────
const UsersModule = ({ onClose }) => {
  const users = [
    { name: "Carlos M.", role: "Senior IT Agent", email: "carlos@elmu.local", dept: "IT", tickets: 12, status: "Online" },
    { name: "Sara Lee", role: "IT Agent", email: "sara@elmu.local", dept: "IT", tickets: 8, status: "Online" },
    { name: "James Okafor", role: "IT Agent", email: "james@elmu.local", dept: "IT", tickets: 5, status: "Away" },
    { name: "Raj Patel", role: "IT Manager", email: "raj@elmu.local", dept: "IT", tickets: 3, status: "Online" },
    { name: "Nina Cruz", role: "Junior Agent", email: "nina@elmu.local", dept: "IT", tickets: 2, status: "Offline" },
  ];
  const statusColor = { Online: "#3ecf8e", Away: "#f5c518", Offline: "#6b7280" };
  return (
    <Modal title="Team & Users" onClose={onClose} wide>
      {users.map(u => (
        <div key={u.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#161b27", borderRadius: 8, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#4a9eff22", color: "#4a9eff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>
              {u.name[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "#e2e8f0" }}>{u.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{u.role} · {u.email}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "#4a9eff", fontWeight: 600 }}>{u.tickets}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>tickets</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[u.status] }} />
              <span style={{ color: statusColor[u.status] }}>{u.status}</span>
            </div>
          </div>
        </div>
      ))}
    </Modal>
  );
};

// ─── SETTINGS MODULE ─────────────────────────────────────────────────────────
const SettingsModule = ({ onClose }) => {
  const [vals, setVals] = useState({ org: "ELMU Corporation", email: "itsupport@elmu.local", slaHigh: "4", slaMed: "8", slaLow: "24", notif: true, autoAssign: true });
  return (
    <Modal title="System Settings" onClose={onClose} wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase" }}>Organization</div>
          <Field label="Organization Name"><Input value={vals.org} onChange={e => setVals({ ...vals, org: e.target.value })} /></Field>
          <Field label="IT Support Email"><Input value={vals.email} onChange={e => setVals({ ...vals, email: e.target.value })} /></Field>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase" }}>SLA Targets (hours)</div>
          <Field label="High Priority"><Input type="number" value={vals.slaHigh} onChange={e => setVals({ ...vals, slaHigh: e.target.value })} /></Field>
          <Field label="Medium Priority"><Input type="number" value={vals.slaMed} onChange={e => setVals({ ...vals, slaMed: e.target.value })} /></Field>
          <Field label="Low Priority"><Input type="number" value={vals.slaLow} onChange={e => setVals({ ...vals, slaLow: e.target.value })} /></Field>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase" }}>Automation</div>
          {[["notif", "Email notifications"], ["autoAssign", "Auto-assign by workload"]].map(([k, label]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e2535" }}>
              <span style={{ fontSize: 13, color: "#e2e8f0" }}>{label}</span>
              <div onClick={() => setVals({ ...vals, [k]: !vals[k] })} style={{
                width: 40, height: 22, borderRadius: 11, background: vals[k] ? "#4a9eff" : "#1e2535",
                cursor: "pointer", position: "relative", transition: "background 0.2s"
              }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: vals[k] ? 21 : 3, transition: "left 0.2s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <Btn icon="check">Save Settings</Btn>
      </div>
    </Modal>
  );
};


// ─── USER PORTAL ─────────────────────────────────────────────────────────────
const UserPortal = ({ onSubmit, onSwitchToAdmin, myTickets, onUpdateTicket }) => {
  const [view, setView] = useState("home");
  const [form, setForm] = useState({ name: "", email: "", dept: "", category: "Software", priority: "Medium", title: "", description: "" });
  const [submitted, setSubmitted] = useState(null);
  const [trackId, setTrackId] = useState("");
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [userComment, setUserComment] = useState("");

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.title) return;
    const ticket = onSubmit(form);
    setSubmitted(ticket);
    setView("success");
  };

  const handleTrack = () => {
    const found = myTickets.find(t => t.id.toLowerCase() === trackId.toLowerCase().trim());
    setTrackedTicket(found !== undefined ? found : false);
  };

  useEffect(() => {
    if (trackedTicket && trackedTicket.id) {
      const fresh = myTickets.find(t => t.id === trackedTicket.id);
      if (fresh) setTrackedTicket(fresh);
    }
  }, [myTickets]);

  const sendUserComment = () => {
    if (!userComment.trim() || !trackedTicket) return;
    const updated = {
      ...trackedTicket,
      comments: [...trackedTicket.comments, { author: trackedTicket.requester || "User", time: new Date().toLocaleString(), text: userComment, type: "user" }],
      updated: today()
    };
    onUpdateTicket(updated);
    setTrackedTicket(updated);
    setUserComment("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06090f", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#e2e8f0" }}>
      {/* Portal Header */}
      <div style={{ background: "#0a0f18", borderBottom: "1px solid #1e2535", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg,#4a9eff,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#fff" }}>E</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#e2e8f0" }}>ELMU IT Support</div>
            <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: "1px" }}>USER PORTAL</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Btn variant="ghost" small onClick={() => setView("home")}>Home</Btn>
          <Btn variant="ghost" small onClick={() => setView("track")}>Track Ticket</Btn>
          <Btn small icon="settings" onClick={onSwitchToAdmin}>Agent Login</Btn>
        </div>
      </div>

      {/* HOME */}
      {view === "home" && (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "60px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-1px" }}>How can we help you?</div>
            <div style={{ fontSize: 16, color: "#6b7280" }}>Submit a support request and our IT team will get back to you quickly.</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 40 }}>
            {[
              { icon: "new", title: "Submit a Ticket", desc: "Report an issue or request IT help", color: "#4a9eff", action: () => setView("submit") },
              { icon: "time", title: "Track My Ticket", desc: "Check the status of your request", color: "#a78bfa", action: () => setView("track") },
              { icon: "kb", title: "Knowledge Base", desc: "Find answers to common questions", color: "#3ecf8e", action: () => {} },
            ].map(card => (
              <div key={card.title} onClick={card.action} style={{ background: "#0f1117", border: "1px solid #1e2535", borderRadius: 12, padding: 24, cursor: "pointer", transition: "border-color 0.2s, transform 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = card.color + "77"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2535"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: card.color + "22", color: card.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon name={card.icon} size={22} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 6 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{card.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#0f1117", border: "1px solid #1e2535", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 12 }}>Common Issues — click to pre-fill</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {["Password reset", "VPN not connecting", "Printer offline", "Software installation", "Email not working", "New device setup"].map(q => (
                <div key={q} onClick={() => { setForm(p => ({ ...p, title: q })); setView("submit"); }}
                  style={{ padding: "10px 14px", background: "#161b27", borderRadius: 7, cursor: "pointer", fontSize: 13, color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#4a9eff"}
                  onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                  <Icon name="arrow" size={14} />{q}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT */}
      {view === "submit" && (
        <div style={{ maxWidth: 620, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13 }}>← Back</button>
            <div style={{ fontWeight: 800, fontSize: 22, color: "#e2e8f0" }}>Submit Support Request</div>
          </div>
          <div style={{ background: "#0f1117", border: "1px solid #1e2535", borderRadius: 12, padding: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Your Full Name" required><Input value={form.name} onChange={f("name")} placeholder="e.g. Alice Chen" /></Field>
              <Field label="Work Email" required><Input value={form.email} onChange={f("email")} placeholder="you@elmu.local" /></Field>
              <Field label="Department"><Select value={form.dept} onChange={f("dept")}><option value="">Select...</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</Select></Field>
              <Field label="Category"><Select value={form.category} onChange={f("category")}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</Select></Field>
            </div>
            <Field label="Priority">
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {PRIORITIES.map(p => (
                  <div key={p} onClick={() => setForm({ ...form, priority: p })} style={{
                    flex: 1, padding: "8px 0", textAlign: "center", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    background: form.priority === p ? PRIORITY_COLOR[p] + "33" : "#161b27",
                    border: `1px solid ${form.priority === p ? PRIORITY_COLOR[p] + "88" : "#1e2535"}`,
                    color: form.priority === p ? PRIORITY_COLOR[p] : "#6b7280",
                    transition: "all 0.15s"
                  }}>{p}</div>
                ))}
              </div>
            </Field>
            <Field label="Issue Title" required><Input value={form.title} onChange={f("title")} placeholder="Brief description of your issue" /></Field>
            <Field label="Describe your issue in detail">
              <Textarea value={form.description} onChange={f("description")} placeholder="Error messages, steps already tried, screenshots description..." style={{ minHeight: 120 }} />
            </Field>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <Btn variant="ghost" onClick={() => setView("home")}>Cancel</Btn>
              <Btn onClick={handleSubmit} icon="new" disabled={!form.name || !form.email || !form.title}>Submit Request</Btn>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {view === "success" && submitted && (
        <div style={{ maxWidth: 500, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#3ecf8e22", color: "#3ecf8e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Icon name="check" size={36} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#e2e8f0", marginBottom: 10 }}>Request Submitted!</div>
          <div style={{ fontSize: 15, color: "#6b7280", marginBottom: 24 }}>Your ticket has been logged. Our IT team will respond shortly.</div>
          <div style={{ background: "#0f1117", border: "1px solid #3ecf8e33", borderRadius: 10, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Your Ticket ID — save this!</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#3ecf8e", fontFamily: "monospace", letterSpacing: "3px" }}>{submitted.id}</div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
              Expected response within <strong style={{ color: "#f5c518" }}>{submitted.sla}</strong>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn variant="ghost" onClick={() => { setTrackId(submitted.id); setView("track"); }}>Track this Ticket</Btn>
            <Btn onClick={() => { setView("home"); setForm({ name: "", email: "", dept: "", category: "Software", priority: "Medium", title: "", description: "" }); setSubmitted(null); }}>Submit Another</Btn>
          </div>
        </div>
      )}

      {/* TRACK — list view + detail drawer */}
      {view === "track" && (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <button onClick={() => { setView("home"); setTrackedTicket(null); setTrackId(""); }} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13 }}>← Back</button>
            <div style={{ fontWeight: 800, fontSize: 22, color: "#e2e8f0", flex: 1 }}>My Tickets</div>
            <div style={{ position: "relative", width: 280 }}>
              <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}><Icon name="search" size={14} /></div>
              <Input value={trackId} onChange={e => { setTrackId(e.target.value); setTrackedTicket(null); }} placeholder="Search by ID, title, status..." style={{ paddingLeft: 32, fontSize: 12 }} />
            </div>
          </div>

          {!trackedTicket ? (
            /* ── TICKET LIST ── */
            <div>
              {(() => {
                const q = trackId.toLowerCase();
                const list = myTickets.filter(t =>
                  !q ||
                  t.id.toLowerCase().includes(q) ||
                  t.title.toLowerCase().includes(q) ||
                  t.status.toLowerCase().includes(q) ||
                  t.category.toLowerCase().includes(q) ||
                  (t.requester || "").toLowerCase().includes(q)
                );
                return list.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: 13 }}>No tickets found.</div>
                ) : list.map(t => (
                  <div key={t.id} onClick={() => setTrackedTicket(t)} style={{ background: "#0f1117", border: "1px solid #1e2535", borderRadius: 10, padding: "16px 20px", marginBottom: 10, cursor: "pointer", transition: "border-color 0.15s, transform 0.1s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = STATUS_COLOR[t.status] + "66"; e.currentTarget.style.transform = "translateX(3px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2535"; e.currentTarget.style.transform = "none"; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                          <span style={{ fontSize: 11, color: "#4a9eff", fontFamily: "monospace", fontWeight: 700 }}>{t.id}</span>
                          {t.submittedByUser && <span style={{ fontSize: 10, color: "#6b7280", background: "#4a9eff11", border: "1px solid #4a9eff22", borderRadius: 4, padding: "1px 6px" }}>Portal</span>}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{t.title}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{t.category} · {t.dept || "—"} · Submitted {t.created}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, marginLeft: 16 }}>
                        <Badge label={t.status} color={STATUS_COLOR[t.status]} small />
                        <Badge label={t.priority} color={PRIORITY_COLOR[t.priority]} small />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 5 }}>
                        <Icon name="users" size={12} />
                        {t.assignee === "Unassigned" ? <span style={{ color: "#ff8c0077" }}>Unassigned</span> : <span style={{ color: "#94a3b8" }}>{t.assignee}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: t.comments.length > 0 ? "#4a9eff" : "#4a5568", display: "flex", alignItems: "center", gap: 4 }}>
                        <Icon name="chat" size={12} />{t.comments.length} update{t.comments.length !== 1 ? "s" : ""}
                        <span style={{ color: "#6b7280", marginLeft: 8 }}>View details →</span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            /* ── TICKET DETAIL ── */
            <div>
              <button onClick={() => setTrackedTicket(null)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="arrow" size={14} style={{ transform: "rotate(180deg)" }} />← Back to list
              </button>
              <div style={{ background: "#0f1117", border: "1px solid #1e2535", borderRadius: 12, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4, fontFamily: "monospace" }}>{trackedTicket.id}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>{trackedTicket.title}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge label={trackedTicket.status} color={STATUS_COLOR[trackedTicket.status]} />
                      <Badge label={trackedTicket.priority} color={PRIORITY_COLOR[trackedTicket.priority]} />
                      <Badge label={trackedTicket.category} color="#94a3b8" />
                    </div>
                  </div>
                </div>
                {/* Progress Timeline */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: 22, background: "#161b27", borderRadius: 8, padding: "16px 20px" }}>
                  {["Open", "In Progress", "Resolved", "Closed"].map((s, i, arr) => {
                    const order = { Open: 0, "In Progress": 1, Pending: 1, Resolved: 2, Closed: 3 };
                    const done = order[trackedTicket.status] >= order[s];
                    const active = trackedTicket.status === s;
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? 1 : 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? STATUS_COLOR[s] + "33" : "#0f1117", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${done ? STATUS_COLOR[s] : "#2e3a4e"}`, boxShadow: active ? `0 0 12px ${STATUS_COLOR[s]}66` : "none", transition: "all 0.3s" }}>
                            {done ? <Icon name="check" size={13} /> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2e3a4e" }} />}
                          </div>
                          <div style={{ fontSize: 10, color: done ? "#e2e8f0" : "#4a5568", whiteSpace: "nowrap", fontWeight: active ? 700 : 400 }}>{s}</div>
                        </div>
                        {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: order[trackedTicket.status] > order[s] ? "#4a9eff55" : "#1e2535", margin: "0 6px", marginBottom: 18, transition: "background 0.3s" }} />}
                      </div>
                    );
                  })}
                </div>
                {/* Info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {[["Requester", trackedTicket.requester || "—"], ["Assigned To", trackedTicket.assignee], ["SLA Target", trackedTicket.sla], ["Last Update", trackedTicket.updated]].map(([k, v]) => (
                    <div key={k} style={{ background: "#161b27", borderRadius: 7, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 3, textTransform: "uppercase" }}>{k}</div>
                      <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Comments */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 10 }}>Updates & Messages</div>
                  <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 12 }}>
                    {trackedTicket.comments.length === 0 && (
                      <div style={{ color: "#6b7280", fontSize: 13, fontStyle: "italic", padding: "10px 0" }}>No updates yet — we'll be in touch shortly.</div>
                    )}
                    {trackedTicket.comments.map((c, i) => (
                      <div key={i} style={{ background: c.type === "user" ? "#3ecf8e0d" : "#161b27", borderLeft: `3px solid ${c.type === "user" ? "#3ecf8e55" : "#4a9eff33"}`, borderRadius: 7, padding: "10px 12px", marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: c.type === "user" ? "#3ecf8e" : "#4a9eff" }}>
                            {c.type === "user" ? "👤 You" : "🛠 IT Support"}
                          </span>
                          <span style={{ fontSize: 11, color: "#6b7280" }}>{c.time}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#e2e8f0" }}>{c.text}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Input value={userComment} onChange={e => setUserComment(e.target.value)} onKeyDown={e => e.key === "Enter" && sendUserComment()} placeholder="Reply to IT team..." style={{ flex: 1 }} />
                    <Btn onClick={sendUserComment} small icon="chat">Send</Btn>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [activeModule, setActiveModule] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "", category: "", assignee: "" });
  const [showNew, setShowNew] = useState(false);
  const [notification, setNotification] = useState(null);
  const [portalMode, setPortalMode] = useState(false); // false = admin, true = user portal

  const notify = (msg, color = "#3ecf8e") => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateTicket = (updated) => {
    setTickets(t => t.map(x => x.id === updated.id ? updated : x));
    if (selectedTicket && selectedTicket.id === updated.id) setSelectedTicket(updated);
    notify(`Ticket ${updated.id} updated`);
  };

  const createTicket = (form) => {
    const ticket = {
      ...form,
      id: newId(tickets),
      status: "Open",
      created: today(),
      updated: today(),
      sla: form.priority === "Critical" ? "1h" : form.priority === "High" ? "4h" : form.priority === "Medium" ? "8h" : "24h",
      comments: [],
      submittedByUser: true,
    };
    setTickets(t => [ticket, ...t]);
    notify(`Ticket ${ticket.id} created successfully`);
    return ticket;
  };

  // User portal submit handler (returns the ticket so portal can show success)
  const handleUserSubmit = (form) => {
    return createTicket({ ...form, requester: form.name, tags: [] });
  };

  if (portalMode) {
    return (
      <>
        <UserPortal
          onSubmit={handleUserSubmit}
          onSwitchToAdmin={() => setPortalMode(false)}
          myTickets={tickets}
          onUpdateTicket={updateTicket}
        />
        <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0f18; } ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 3px; } input::placeholder, textarea::placeholder { color: #4a5568; } select option { background: #0f1117; color: #e2e8f0; }`}</style>
      </>
    );
  }

  const deleteTicket = (id) => {
    setTickets(t => t.filter(x => x.id !== id));
    setSelectedTicket(null);
    notify(`Ticket ${id} deleted`, "#ff3b3b");
  };

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.requester.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    const matchStatus = !filters.status || t.status === filters.status;
    const matchPriority = !filters.priority || t.priority === filters.priority;
    const matchCategory = !filters.category || t.category === filters.category;
    const matchAssignee = !filters.assignee || t.assignee === filters.assignee;
    return matchSearch && matchStatus && matchPriority && matchCategory && matchAssignee;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "Open").length,
    critical: tickets.filter(t => t.priority === "Critical" && t.status !== "Closed" && t.status !== "Resolved").length,
    resolved: tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length,
  };

  const NAV = [
    { key: null, label: "Tickets", icon: "tickets" },
    { key: "kb", label: "Knowledge Base", icon: "kb" },
    { key: "reports", label: "Reports", icon: "reports" },
    { key: "users", label: "Team", icon: "users" },
    { key: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080c12", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e2e8f0", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#0a0f18", borderRight: "1px solid #1e2535", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0 }}>
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#4a9eff,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#fff" }}>E</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#e2e8f0", letterSpacing: "-0.3px" }}>ELMU</div>
              <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "1px", textTransform: "uppercase" }}>IT Ticketing</div>
            </div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <Btn onClick={() => setShowNew(true)} icon="new" style={{ width: "100%" }}>New Ticket</Btn>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {NAV.map(n => (
            <div key={String(n.key)} onClick={() => { if (n.key) setActiveModule(n.key); else setActiveModule(null); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 7, marginBottom: 2,
                cursor: "pointer", background: activeModule === n.key && !n.key || (!activeModule && n.key === null) ? "#4a9eff1a" : "transparent",
                color: activeModule === n.key || (!activeModule && n.key === null) ? "#4a9eff" : "#6b7280",
                transition: "all 0.15s", fontSize: 13, fontWeight: 500
              }}
              onMouseEnter={e => { if (!(activeModule === n.key || (!activeModule && n.key === null))) e.currentTarget.style.background = "#ffffff08"; }}
              onMouseLeave={e => { if (!(activeModule === n.key || (!activeModule && n.key === null))) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name={n.icon} size={16} />{n.label}
              {n.key === null && stats.open > 0 && <span style={{ marginLeft: "auto", background: "#4a9eff", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{stats.open}</span>}
            </div>
          ))}
        </nav>
        <div style={{ padding: "12px 14px", borderTop: "1px solid #1e2535" }}>
          <div onClick={() => setPortalMode(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 7, cursor: "pointer", background: "#4a9eff11", border: "1px solid #4a9eff22", marginBottom: 10 }}>
            <Icon name="users" size={14} /><span style={{ fontSize: 12, color: "#4a9eff", fontWeight: 600 }}>User Portal</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#4a9eff22", color: "#4a9eff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>A</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>Admin</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>IT Manager</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ background: "#0a0f18", borderBottom: "1px solid #1e2535", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
              <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}><Icon name="search" size={15} /></div>
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets by ID, title, requester..." style={{ paddingLeft: 34, fontSize: 13 }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {stats.critical > 0 && (
              <div style={{ background: "#ff3b3b22", color: "#ff3b3b", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="alert" size={14} />{stats.critical} Critical
              </div>
            )}
            <div style={{ color: "#6b7280", fontSize: 12 }}>Thu, 26 Feb 2026</div>
          </div>
        </div>

        <div style={{ padding: 28 }}>
          {/* Stats */}
          <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
            <StatCard label="Total Tickets" value={stats.total} color="#4a9eff" icon="tickets" />
            <StatCard label="Open" value={stats.open} color="#f5c518" icon="alert" sub={`${Math.round((stats.open / stats.total) * 100)}% of all tickets`} />
            <StatCard label="Critical" value={stats.critical} color="#ff3b3b" icon="sla" sub="Needs immediate attention" />
            <StatCard label="Resolved" value={stats.resolved} color="#3ecf8e" icon="check" sub={`${Math.round((stats.resolved / stats.total) * 100)}% resolution rate`} />
          </div>

          {/* Filters Bar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ color: "#6b7280", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Icon name="filter" size={14} />Filters:</div>
            {[["status", STATUSES], ["priority", PRIORITIES], ["category", CATEGORIES]].map(([key, opts]) => (
              <Select key={key} value={filters[key]} onChange={e => setFilters({ ...filters, [key]: e.target.value })} style={{ width: "auto", padding: "6px 10px", fontSize: 12 }}>
                <option value="">All {key.charAt(0).toUpperCase() + key.slice(1)}s</option>
                {opts.map(o => <option key={o}>{o}</option>)}
              </Select>
            ))}
            <Select value={filters.assignee} onChange={e => setFilters({ ...filters, assignee: e.target.value })} style={{ width: "auto", padding: "6px 10px", fontSize: 12 }}>
              <option value="">All Agents</option>
              <option>Unassigned</option>
              {AGENTS.map(a => <option key={a}>{a}</option>)}
            </Select>
            {(filters.status || filters.priority || filters.category || filters.assignee || search) && (
              <Btn small variant="ghost" onClick={() => { setFilters({ status: "", priority: "", category: "", assignee: "" }); setSearch(""); }}>Clear All</Btn>
            )}
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#6b7280" }}>{filtered.length} ticket{filtered.length !== 1 ? "s" : ""} found</span>
          </div>

          {/* Ticket Table */}
          <div style={{ background: "#0f1117", border: "1px solid #1e2535", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 110px 90px 90px 120px 90px", gap: 12, padding: "10px 20px", borderBottom: "1px solid #1e2535", background: "#0a0f18" }}>
              {["ID", "Title", "Category", "Priority", "Status", "Assignee", "Updated"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#6b7280" }}>No tickets match your filters.</div>
            )}
            {filtered.map(t => <TicketRow key={t.id} ticket={t} onClick={() => setSelectedTicket(t)} />)}
          </div>

          {/* Recent Activity */}
          <div style={{ marginTop: 24, background: "#0f1117", border: "1px solid #1e2535", borderRadius: 10, padding: 20 }}>
            <div style={{ fontWeight: 700, color: "#94a3b8", fontSize: 12, textTransform: "uppercase", marginBottom: 14 }}>Recent Activity</div>
            {tickets.filter(t => t.comments.length > 0).slice(0, 4).map(t => t.comments.slice(-1).map(c => (
              <div key={t.id} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #1e2535", alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#4a9eff22", color: "#4a9eff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{c.author[0]}</div>
                <div>
                  <div style={{ fontSize: 13, color: "#e2e8f0" }}><span style={{ color: "#4a9eff" }}>{c.author}</span> commented on <span style={{ color: "#a78bfa", cursor: "pointer" }} onClick={() => setSelectedTicket(t)}>{t.id}</span></div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{c.text.slice(0, 80)}{c.text.length > 80 ? "..." : ""}</div>
                  <div style={{ fontSize: 11, color: "#4a5568", marginTop: 2 }}>{c.time}</div>
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNew && <NewTicketModal onClose={() => setShowNew(false)} onCreate={createTicket} />}
      {selectedTicket && <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdate={updateTicket} />}
      {activeModule === "kb" && <KnowledgeBase onClose={() => setActiveModule(null)} />}
      {activeModule === "reports" && <Reports tickets={tickets} onClose={() => setActiveModule(null)} />}
      {activeModule === "users" && <UsersModule onClose={() => setActiveModule(null)} />}
      {activeModule === "settings" && <SettingsModule onClose={() => setActiveModule(null)} />}

      {/* Notification */}
      {notification && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: notification.color + "22", border: `1px solid ${notification.color}44`, color: notification.color, padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999, display: "flex", alignItems: "center", gap: 8, animation: "fadeIn 0.2s ease" }}>
          <Icon name="check" size={14} />{notification.msg}
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f18; }
        ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 3px; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder, textarea::placeholder { color: #4a5568; }
        select option { background: #0f1117; color: #e2e8f0; }
      `}</style>
    </div>
  );
}

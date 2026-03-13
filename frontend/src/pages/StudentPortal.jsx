import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { outingAPI } from "../utils/api";
import { useToast } from "../components/Toast";

const STATUS_COLORS = {
  PENDING:  { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  APPROVED: { bg: "rgba(16,185,129,0.12)",  color: "#10b981", border: "rgba(16,185,129,0.25)" },
  OUT:      { bg: "rgba(59,130,246,0.12)",  color: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  OVERDUE:  { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", border: "rgba(239,68,68,0.25)" },
  RETURNED: { bg: "rgba(156,163,175,0.12)", color: "#9ca3af", border: "rgba(156,163,175,0.25)" },
};

const FLAG_COLORS = {
  MEDICAL_EMERGENCY: "#ef4444", URGENT: "#f97316", ROUTINE: "#10b981", SUSPICIOUS: "#8b5cf6",
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  return (
    <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {status}
    </span>
  );
}

function formatDT(dt) {
  if (!dt) return "—";
  try { return new Date(dt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); }
  catch { return "—"; }
}

export default function StudentPortal() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("apply");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const now = new Date();
  const minDT = new Date(now.getTime() + 60000).toISOString().slice(0, 16); // at least 1 min from now

  const [form, setForm] = useState({
    studentId: user?.name || "",    // use login name as studentId by default
    studentName: user?.name || "",
    parentEmail: "",
    reason: "",
    destination: "",
    outDate: "",
    returnDate: "",
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Load history using the logged-in user's name (matches backend /outing/student/{studentId})
  const loadHistory = async (id) => {
    const searchId = id || form.studentId;
    if (!searchId.trim()) return toast("Enter a Student ID to search", "warn");
    setHistoryLoading(true);
    try {
      const data = await outingAPI.getStudentHistory(searchId.trim());
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      toast("Could not load history: " + err.message, "error");
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Auto-load history when switching to history tab
  const switchToHistory = () => {
    setTab("history");
    loadHistory(user?.name);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    const required = ["studentId", "studentName", "parentEmail", "reason", "destination", "outDate", "returnDate"];
    for (const f of required) {
      if (!form[f]) return toast(`${f.replace(/([A-Z])/g, " $1")} is required`, "warn");
    }
    if (!form.parentEmail.includes("@")) return toast("Invalid parent email", "warn");
    if (new Date(form.outDate) >= new Date(form.returnDate))
      return toast("Return date must be after out date", "warn");

    setSubmitting(true);
    try {
      await outingAPI.apply({
        ...form,
        outDate: new Date(form.outDate).toISOString(),
        returnDate: new Date(form.returnDate).toISOString(),
      });
      toast("Outing request submitted! AI is analysing... 🤖", "success");
      setForm((p) => ({ ...p, reason: "", destination: "", outDate: "", returnDate: "", parentEmail: "" }));
      switchToHistory();
    } catch (err) {
      const msg = err.message || "Submission failed";
      if (msg.includes("active") || msg.includes("approved") || msg.includes("APPROVED"))
        toast("You already have an active or approved outing request.", "warn");
      else if (msg.includes("banned") || msg.includes("Denied") || msg.includes("overdue") || msg.includes("blacklist"))
        toast("❌ You are banned due to overdue outings. Contact the warden.", "error");
      else
        toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sideTop}>
          <div style={styles.brandRow}>
            <div style={styles.brandIcon}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="url(#g1)" />
                <path d="M12 16L15 19L21 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs><linearGradient id="g1" x1="4" y1="2" x2="28" y2="30"><stop stopColor="#F6C90E"/><stop offset="1" stopColor="#E8A000"/></linearGradient></defs>
              </svg>
            </div>
            <div>
              <div style={styles.brandName}>SmartOuting</div>
              <div style={styles.brandRole}>Student Portal</div>
            </div>
          </div>

          <div style={styles.userCard}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase() || "S"}</div>
            <div>
              <div style={{ color: "#f9fafb", fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
              <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>🎓 Student</div>
            </div>
          </div>

          <nav style={styles.nav}>
            {[
              { id: "apply",   label: "Apply for Outing", icon: "📤" },
              { id: "history", label: "My Requests",       icon: "📋" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => item.id === "history" ? switchToHistory() : setTab(item.id)}
                style={{ ...styles.navBtn, ...(tab === item.id ? styles.navBtnActive : {}) }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <button onClick={logout} style={styles.logoutBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* APPLY TAB */}
        {tab === "apply" && (
          <div style={styles.content}>
            <div style={styles.pageHeader}>
              <h1 style={styles.pageTitle}>Apply for Outing</h1>
              <p style={styles.pageDesc}>Submit a new outing request. Our AI will analyse your request automatically.</p>
            </div>

            <form onSubmit={handleApply} style={styles.formCard}>
              <div style={styles.formGrid}>
                <Field label="Student ID" name="studentId" value={form.studentId} onChange={handleChange} placeholder="Your student ID" icon="🆔" />
                <Field label="Full Name"  name="studentName" value={form.studentName} onChange={handleChange} placeholder="Your full name" icon="👤" />
                <Field label="Parent / Guardian Email" name="parentEmail" value={form.parentEmail} onChange={handleChange} type="email" placeholder="parent@email.com" icon="📧" span={2} />
                <Field label="Destination" name="destination" value={form.destination} onChange={handleChange} placeholder="Where are you going?" icon="📍" span={2} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.fieldLabel}>Reason for Outing</label>
                  <textarea
                    name="reason" value={form.reason} onChange={handleChange}
                    placeholder="Describe why you need to go out in detail... (AI will analyse urgency)"
                    rows={3} style={styles.textarea}
                  />
                </div>
                <Field label="Out Date & Time"    name="outDate"    value={form.outDate}    onChange={handleChange} type="datetime-local" min={minDT} icon="🗓️" />
                <Field label="Return Date & Time" name="returnDate" value={form.returnDate} onChange={handleChange} type="datetime-local" min={minDT} icon="🔙" />
              </div>

              <div style={styles.formFooter}>
                <div style={styles.aiNote}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>
                    Your request will be <strong style={{ color: "#F6C90E" }}>AI-analysed</strong> for urgency and automatically flagged for the warden.
                  </span>
                </div>
                <button type="submit" disabled={submitting} style={{ ...styles.submitBtn, opacity: submitting ? 0.8 : 1 }}>
                  {submitting ? "Submitting..." : "Submit Request →"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div style={styles.content}>
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>My Requests</h1>
                <p style={styles.pageDesc}>{history.length} total request(s)</p>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  value={form.studentId}
                  onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                  placeholder="Student ID..."
                  style={styles.searchInput}
                />
                <button onClick={() => loadHistory()} style={styles.searchBtn} disabled={historyLoading}>
                  {historyLoading ? "Loading..." : "🔍 Search"}
                </button>
              </div>
            </div>

            {historyLoading && (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#F6C90E", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ color: "#6b7280", fontSize: 13 }}>Loading requests...</p>
              </div>
            )}

            {!historyLoading && history.length === 0 && (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ color: "#f9fafb", fontWeight: 600, fontSize: 16 }}>No requests found</div>
                <div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>Apply for your first outing or check your Student ID.</div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {history.map((o) => (
                <div key={o.id} style={styles.historyCard}>
                  <div style={styles.historyTop}>
                    <div>
                      <div style={{ color: "#f9fafb", fontWeight: 700, fontSize: 15 }}>#{o.id} — {o.destination}</div>
                      <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>{o.reason}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <StatusBadge status={o.status} />
                      {o.aiFlag && (
                        <span style={{ fontSize: 11, color: FLAG_COLORS[o.aiFlag] || "#9ca3af", fontWeight: 600 }}>
                          🤖 {o.aiFlag} (Score: {o.urgencyScore})
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={styles.historyMeta}>
                    <span>🗓️ Out: {formatDT(o.outDate)}</span>
                    <span>🔙 Return: {formatDT(o.returnDate)}</span>
                    {o.wardenComment && <span>💬 &quot;{o.wardenComment}&quot;</span>}
                  </div>
                  {o.qrCodeUrl && (o.status === "APPROVED") && (
                    <div style={{ marginTop: 12, padding: 16, background: "rgba(16,185,129,0.06)", borderRadius: 10, border: "1px solid rgba(16,185,129,0.15)" }}>
                      <div style={{ color: "#10b981", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>✓ APPROVED — Show this QR to guard at the gate</div>
                      <img src={o.qrCodeUrl} alt="QR Code" style={{ width: 120, height: 120, borderRadius: 8, background: "white", padding: 4 }} />
                      <div style={{ color: "#6b7280", fontSize: 11, marginTop: 8 }}>Outing ID: #{o.id}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060D1F; }
        input, textarea, select { color-scheme: dark; }
        textarea::placeholder, input::placeholder { color: #4b5563; }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder, icon, span, min }) {
  return (
    <div style={{ gridColumn: span === 2 ? "1 / -1" : undefined }}>
      <label style={styles.fieldLabel}>{icon && <span style={{ marginRight: 6 }}>{icon}</span>}{label}</label>
      <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder} min={min} style={styles.formInput} />
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", background: "#060D1F", fontFamily: "'DM Sans', sans-serif" },
  sidebar: { width: 260, background: "rgba(10,18,40,0.95)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "24px 16px", position: "sticky", top: 0, height: "100vh", flexShrink: 0 },
  sideTop: { display: "flex", flexDirection: "column", gap: 24 },
  brandRow: { display: "flex", alignItems: "center", gap: 12, padding: "0 8px" },
  brandIcon: { width: 40, height: 40, borderRadius: 12, background: "rgba(246,201,14,0.1)", border: "1px solid rgba(246,201,14,0.2)", display: "flex", alignItems: "center", justifyContent: "center" },
  brandName: { fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#F6C90E" },
  brandRole: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  userCard: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #F6C90E, #E8A000)", color: "#060D1F", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif" },
  nav: { display: "flex", flexDirection: "column", gap: 4 },
  navBtn: { display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderRadius: 10, border: "1px solid transparent", background: "none", color: "#6b7280", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", textAlign: "left" },
  navBtnActive: { background: "rgba(246,201,14,0.1)", color: "#F6C90E", border: "1px solid rgba(246,201,14,0.2)" },
  logoutBtn: { display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "none", color: "#6b7280", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
  main: { flex: 1, overflow: "auto", padding: "32px 40px" },
  content: { maxWidth: 860, margin: "0 auto", animation: "fadeIn 0.4s ease" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#f9fafb" },
  pageDesc: { color: "#6b7280", fontSize: 14, marginTop: 4 },
  formCard: { background: "rgba(10,18,40,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 32, boxShadow: "0 8px 40px rgba(0,0,0,0.3)" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 },
  fieldLabel: { display: "block", fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8 },
  formInput: { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#f9fafb", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s" },
  textarea: { width: "100%", padding: "12px 16px", resize: "vertical", background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#f9fafb", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" },
  formFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" },
  aiNote: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(246,201,14,0.05)", border: "1px solid rgba(246,201,14,0.12)", borderRadius: 10, flex: 1 },
  submitBtn: { padding: "14px 28px", background: "linear-gradient(135deg, #F6C90E, #E8A000)", border: "none", borderRadius: 12, color: "#060D1F", fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 6px 20px rgba(246,201,14,0.3)" },
  searchInput: { padding: "10px 16px", background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f9fafb", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", width: 200 },
  searchBtn: { padding: "10px 20px", background: "rgba(246,201,14,0.1)", border: "1.5px solid rgba(246,201,14,0.25)", borderRadius: 10, color: "#F6C90E", fontSize: 13, fontWeight: 600, fontFamily: "'Syne', sans-serif", cursor: "pointer" },
  emptyState: { textAlign: "center", padding: "80px 20px", background: "rgba(10,18,40,0.5)", borderRadius: 20, border: "1px dashed rgba(255,255,255,0.08)" },
  historyCard: { background: "rgba(10,18,40,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 24px", transition: "border-color 0.2s", animation: "fadeIn 0.3s ease" },
  historyTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  historyMeta: { display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap", fontSize: 12, color: "#6b7280" },
};

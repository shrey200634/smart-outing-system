import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { outingAPI } from "../utils/api";
import { useToast } from "../components/Toast";

const STATUS_STYLES = {
  PENDING:  { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "rgba(251,191,36,0.3)" },
  APPROVED: { bg: "rgba(16,185,129,0.12)", color: "#10b981", border: "rgba(16,185,129,0.3)" },
  OUT:      { bg: "rgba(99,102,241,0.12)", color: "#818cf8", border: "rgba(99,102,241,0.3)" },
  OVERDUE:  { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", border: "rgba(239,68,68,0.3)" },
  RETURNED: { bg: "rgba(156,163,175,0.12)", color: "#9ca3af", border: "rgba(156,163,175,0.3)" },
};

const AI_FLAG_INFO = {
  MEDICAL_EMERGENCY: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: "🚨" },
  URGENT:            { color: "#f97316", bg: "rgba(249,115,22,0.1)", icon: "⚡" },
  ROUTINE:           { color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: "✅" },
  SUSPICIOUS:        { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: "⚠️" },
};

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  return (
    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

function AiChip({ flag, score }) {
  if (!flag) return null;
  const info = AI_FLAG_INFO[flag] || { color: "#9ca3af", bg: "rgba(156,163,175,0.1)", icon: "🤖" };
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: info.bg, color: info.color, border: `1px solid ${info.color}30` }}>
      {info.icon} {flag} · {score}
    </span>
  );
}

function formatDT(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function WardenDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [outings, setOutings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [approving, setApproving] = useState(null);
  const [comment, setComment] = useState("");
  const [selected, setSelected] = useState(null);
  const [commentFocused, setCommentFocused] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await outingAPI.getAll();
      setOutings(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      toast("Failed to load requests: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    if (!comment.trim()) return toast("Please enter an approval comment", "warn");
    setApproving(id);
    try {
      await outingAPI.approve(id, comment.trim());
      toast("Outing approved! QR code generated. ✅", "success");
      setComment("");
      setSelected(null);
      load();
    } catch (err) {
      toast("Approval failed: " + err.message, "error");
    } finally {
      setApproving(null);
    }
  };

  const filtered = outings.filter((o) => {
    const matchFilter = filter === "ALL" || o.status === filter;
    const matchSearch = !search || o.studentName?.toLowerCase().includes(search.toLowerCase()) || o.studentId?.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search);
    return matchFilter && matchSearch;
  });

  const stats = {
    total: outings.length,
    pending: outings.filter((o) => o.status === "PENDING").length,
    approved: outings.filter((o) => o.status === "APPROVED").length,
    out: outings.filter((o) => o.status === "OUT").length,
    overdue: outings.filter((o) => o.status === "OVERDUE").length,
  };

  const FILTERS = ["ALL", "PENDING", "APPROVED", "OUT", "OVERDUE", "RETURNED"];

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brandRow}>
            <div style={styles.brandIcon}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="url(#wg)" />
                <path d="M12 16L15 19L21 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs><linearGradient id="wg" x1="4" y1="2" x2="28" y2="30"><stop stopColor="#F6C90E"/><stop offset="1" stopColor="#E8A000"/></linearGradient></defs>
              </svg>
            </div>
            <div>
              <div style={styles.brandName}>SmartOuting</div>
              <div style={styles.brandRole}>Warden Panel</div>
            </div>
          </div>

          <div style={styles.userCard}>
            <div style={{ ...styles.avatar, background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
              {user?.name?.[0]?.toUpperCase() || "W"}
            </div>
            <div>
              <div style={{ color: "#f9fafb", fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
              <div style={{ color: "#8b5cf6", fontSize: 12, marginTop: 2 }}>🏛️ Warden</div>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsBlock}>
            {[
              { label: "Total", value: stats.total, color: "#9ca3af" },
              { label: "Pending", value: stats.pending, color: "#fbbf24" },
              { label: "Approved", value: stats.approved, color: "#10b981" },
              { label: "Out Now", value: stats.out, color: "#818cf8" },
              { label: "Overdue", value: stats.overdue, color: "#ef4444" },
            ].map((s) => (
              <div key={s.label} style={styles.statItem}>
                <span style={{ color: "#6b7280", fontSize: 11 }}>{s.label}</span>
                <span style={{ color: s.color, fontWeight: 800, fontSize: 18, fontFamily: "'Syne', sans-serif" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={load} style={styles.refreshBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
          <button onClick={logout} style={styles.logoutBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Outing Requests</h1>
            <p style={styles.subtitle}>{stats.pending} pending approval • {stats.overdue} overdue</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID..."
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Filter chips */}
        <div style={styles.filterRow}>
          {FILTERS.map((f) => {
            const count = f === "ALL" ? outings.length : outings.filter((o) => o.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterChip,
                  ...(filter === f ? styles.filterChipActive : {}),
                }}
              >
                {f} {count > 0 && <span style={{ opacity: 0.7, fontSize: 10 }}>({count})</span>}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={styles.loadingWrap}>
            <div style={styles.spinnerLarge} />
            <p style={{ color: "#6b7280", marginTop: 16 }}>Loading requests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ color: "#f9fafb", fontWeight: 600 }}>No requests found</div>
            <div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>Try adjusting your filter or search</div>
          </div>
        ) : (
          <div style={styles.table}>
            {/* Header */}
            <div style={styles.tableHeader}>
              {["ID", "Student", "Destination & Reason", "AI Analysis", "Dates", "Status", "Actions"].map((h) => (
                <div key={h} style={styles.th}>{h}</div>
              ))}
            </div>

            {filtered.map((o) => (
              <div key={o.id} style={{ ...styles.tableRow, ...(selected?.id === o.id ? styles.tableRowSelected : {}) }}>
                <div style={{ color: "#F6C90E", fontWeight: 700, fontSize: 13 }}>#{o.id}</div>

                <div>
                  <div style={{ color: "#f9fafb", fontWeight: 600, fontSize: 13 }}>{o.studentName}</div>
                  <div style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>{o.studentId}</div>
                </div>

                <div>
                  <div style={{ color: "#f9fafb", fontSize: 13, fontWeight: 600 }}>{o.destination}</div>
                  <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 3, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.reason}</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <AiChip flag={o.aiFlag} score={o.urgencyScore} />
                </div>

                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  <div>📤 {formatDT(o.outDate)}</div>
                  <div style={{ marginTop: 3 }}>🔙 {formatDT(o.returnDate)}</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <Badge status={o.status} />
                  {o.wardenComment && (
                    <span style={{ fontSize: 10, color: "#9ca3af", fontStyle: "italic" }}>
                      "{o.wardenComment.slice(0, 30)}{o.wardenComment.length > 30 ? "..." : ""}"
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {o.status === "PENDING" && (
                    <button
                      onClick={() => { setSelected(o === selected ? null : o); setComment(""); }}
                      style={styles.approveBtn}
                    >
                      {selected?.id === o.id ? "Cancel" : "✓ Approve"}
                    </button>
                  )}
                  {o.qrCodeUrl && (
                    <button onClick={() => setSelected(selected?.id === o.id ? null : o)} style={styles.viewBtn}>
                      QR Code
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approve Panel */}
        {selected && selected.status === "PENDING" && (
          <div style={styles.approvePanel}>
            <div style={styles.approvePanelHeader}>
              <div>
                <h3 style={{ color: "#f9fafb", fontWeight: 700, fontFamily: "'Syne', sans-serif", fontSize: 16 }}>
                  Approve Request #{selected.id}
                </h3>
                <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
                  {selected.studentName} • {selected.destination}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                Approval Comment (Required)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={() => setCommentFocused(true)}
                onBlur={() => setCommentFocused(false)}
                placeholder="Add your comment for the student..."
                rows={3}
                style={{
                  ...styles.commentBox,
                  borderColor: commentFocused ? "#F6C90E" : "rgba(255,255,255,0.1)",
                  boxShadow: commentFocused ? "0 0 0 3px rgba(246,201,14,0.1)" : "none",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                onClick={() => handleApprove(selected.id)}
                disabled={approving === selected.id}
                style={{
                  ...styles.confirmBtn,
                  opacity: approving === selected.id ? 0.7 : 1,
                }}
              >
                {approving === selected.id ? "Approving..." : "✓ Confirm Approval & Generate QR"}
              </button>
              <button onClick={() => setSelected(null)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* QR View Panel */}
        {selected && selected.qrCodeUrl && selected.status !== "PENDING" && (
          <div style={styles.approvePanel}>
            <div style={styles.approvePanelHeader}>
              <div>
                <h3 style={{ color: "#10b981", fontWeight: 700, fontFamily: "'Syne', sans-serif", fontSize: 16 }}>
                  QR Code — Request #{selected.id}
                </h3>
                <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{selected.studentName}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <img src={selected.qrCodeUrl} alt="QR" style={{ width: 180, height: 180, background: "white", padding: 8, borderRadius: 12 }} />
            </div>
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060D1F; }
        input, textarea { color-scheme: dark; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::placeholder, input::placeholder { color: #4b5563; }
      `}</style>
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", background: "#060D1F", fontFamily: "'DM Sans', sans-serif" },
  sidebar: {
    width: 240, background: "rgba(10,18,40,0.98)", borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    padding: "24px 16px", position: "sticky", top: 0, height: "100vh", flexShrink: 0,
  },
  brandRow: { display: "flex", alignItems: "center", gap: 12, padding: "0 8px", marginBottom: 20 },
  brandIcon: {
    width: 40, height: 40, borderRadius: 12, background: "rgba(246,201,14,0.1)",
    border: "1px solid rgba(246,201,14,0.2)", display: "flex", alignItems: "center", justifyContent: "center",
  },
  brandName: { fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#F6C90E" },
  brandRole: { fontSize: 11, color: "#8b5cf6", marginTop: 1 },
  userCard: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
    background: "rgba(139,92,246,0.06)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.15)", marginBottom: 24,
  },
  avatar: {
    width: 36, height: 36, borderRadius: "50%", color: "white", fontWeight: 800, fontSize: 15,
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif",
  },
  statsBlock: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  statItem: {
    display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px",
    background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)",
  },
  refreshBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)", color: "#9ca3af", fontSize: 13,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  logoutBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.15)",
    background: "rgba(239,68,68,0.05)", color: "#ef4444", fontSize: 13,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  main: { flex: 1, padding: "32px 36px", overflow: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 },
  title: { fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#f9fafb" },
  subtitle: { color: "#6b7280", fontSize: 14, marginTop: 4 },
  searchInput: {
    padding: "10px 16px", background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 10,
    color: "#f9fafb", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", width: 220,
  },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 },
  filterChip: {
    padding: "7px 14px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)", color: "#6b7280", fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
  },
  filterChipActive: {
    background: "rgba(246,201,14,0.1)", border: "1px solid rgba(246,201,14,0.3)", color: "#F6C90E",
  },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "100px 0" },
  spinnerLarge: {
    width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#F6C90E", borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  empty: {
    textAlign: "center", padding: "80px 20px", background: "rgba(10,18,40,0.5)",
    borderRadius: 20, border: "1px dashed rgba(255,255,255,0.08)",
  },
  table: {
    background: "rgba(10,18,40,0.8)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20, overflow: "hidden",
  },
  tableHeader: {
    display: "grid", gridTemplateColumns: "50px 130px 1fr 140px 160px 110px 120px",
    gap: 16, padding: "14px 20px",
    background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  th: { fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" },
  tableRow: {
    display: "grid", gridTemplateColumns: "50px 130px 1fr 140px 160px 110px 120px",
    gap: 16, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)",
    alignItems: "center", animation: "fadeIn 0.3s ease", transition: "background 0.2s",
  },
  tableRowSelected: { background: "rgba(246,201,14,0.04)" },
  approveBtn: {
    padding: "7px 14px", background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.25)", borderRadius: 8,
    color: "#10b981", fontSize: 12, fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  viewBtn: {
    padding: "6px 12px", background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.25)", borderRadius: 8,
    color: "#818cf8", fontSize: 11, fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  approvePanel: {
    marginTop: 24, background: "rgba(10,18,40,0.95)", border: "1px solid rgba(246,201,14,0.2)",
    borderRadius: 20, padding: 28, animation: "fadeIn 0.3s ease",
    boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
  },
  approvePanelHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  commentBox: {
    width: "100%", padding: "12px 16px", marginTop: 8, resize: "vertical",
    background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#f9fafb", fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  },
  confirmBtn: {
    padding: "12px 24px", background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none", borderRadius: 10, color: "white", fontSize: 14, fontWeight: 700,
    fontFamily: "'Syne', sans-serif", cursor: "pointer",
    boxShadow: "0 6px 20px rgba(16,185,129,0.25)",
  },
  cancelBtn: {
    padding: "12px 20px", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
    color: "#9ca3af", fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
  },
};

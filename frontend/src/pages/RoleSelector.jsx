import { useAuth } from "../context/AuthContext";

const ROLES = [
  {
    value: "STUDENT",
    label: "Student",
    icon: "🎓",
    desc: "Apply for outings, track approvals, view QR codes",
    color: "#F6C90E",
    bg: "rgba(246,201,14,0.08)",
    border: "rgba(246,201,14,0.2)",
  },
  {
    value: "WARDEN",
    label: "Warden",
    icon: "🏛️",
    desc: "Review requests, approve outings, monitor campus activity",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
  },
  {
    value: "GUARD",
    label: "Gate Guard",
    icon: "🛡️",
    desc: "Verify student QR codes and manage gate exit/entry",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
];

export default function RoleSelector() {
  const { setUserRole } = useAuth();

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.card}>
        <div style={styles.icon}>👋</div>
        <h1 style={styles.title}>Welcome! What's your role?</h1>
        <p style={styles.sub}>
          We couldn't detect your role automatically. Please select how you use SmartOuting.
        </p>
        <div style={styles.grid}>
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setUserRole(r.value)}
              style={{
                ...styles.roleCard,
                background: r.bg,
                borderColor: r.border,
              }}
            >
              <span style={styles.roleIcon}>{r.icon}</span>
              <div style={{ ...styles.roleLabel, color: r.color }}>{r.label}</div>
              <div style={styles.roleDesc}>{r.desc}</div>
              <div style={{ ...styles.arrow, color: r.color }}>→</div>
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060D1F; }
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-60px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-50px,40px)} }
        @keyframes cardIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", background: "#060D1F",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", padding: 20,
  },
  orb1: {
    position: "absolute", top: "-10%", left: "-5%", width: 600, height: 600,
    borderRadius: "50%", background: "radial-gradient(circle, rgba(246,201,14,0.1) 0%, transparent 70%)",
    animation: "float1 12s ease-in-out infinite", pointerEvents: "none",
  },
  orb2: {
    position: "absolute", bottom: "-15%", right: "-10%", width: 700, height: 700,
    borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
    animation: "float2 15s ease-in-out infinite", pointerEvents: "none",
  },
  card: {
    position: "relative", background: "rgba(10,18,40,0.9)", backdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "52px 44px",
    width: "100%", maxWidth: 620, textAlign: "center",
    boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
    animation: "cardIn 0.6s cubic-bezier(.34,1.26,.64,1)",
  },
  icon: { fontSize: 48, marginBottom: 20 },
  title: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f9fafb", marginBottom: 10 },
  sub: { color: "#6b7280", fontSize: 14, maxWidth: 420, margin: "0 auto 36px", lineHeight: 1.6 },
  grid: { display: "flex", flexDirection: "column", gap: 14 },
  roleCard: {
    display: "grid", gridTemplateColumns: "48px 1fr 1fr auto",
    alignItems: "center", gap: 16, padding: "20px 24px",
    border: "1.5px solid", borderRadius: 16, cursor: "pointer",
    textAlign: "left", transition: "transform 0.15s, box-shadow 0.15s",
  },
  roleIcon: { fontSize: 26, textAlign: "center" },
  roleLabel: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700 },
  roleDesc: { color: "#6b7280", fontSize: 13, lineHeight: 1.4 },
  arrow: { fontSize: 18, fontWeight: 700, textAlign: "right" },
};

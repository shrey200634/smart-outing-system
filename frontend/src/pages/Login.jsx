import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function Login({ onSwitchToRegister }) {
  const { login, setUserRole } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      toast("Please fill in all fields", "warn");
      return;
    }
    setLoading(true);
    try {
      const userData = await login(form.username.trim(), form.password);
      // Role is set inside login() from sos_role_map — no separate call needed
      toast(`Welcome back, ${userData.name}! 🎉`, "success");
    } catch (err) {
      const msg = err.message || "Login failed";
      if (msg.includes("User not found")) {
        toast("No account found with this name. Please register first.", "error");
      } else if (msg.includes("Wrong Password") || msg.includes("Invalid Access")) {
        toast("Incorrect password. Please try again.", "error");
      } else if (msg.includes("Cannot connect") || msg.includes("Failed to fetch")) {
        toast("Cannot connect to server. Is the backend running on port 8989?", "error");
      } else {
        toast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />
      <div style={styles.grid} />

      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="url(#grad)" />
              <path d="M12 16L15 19L21 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="grad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F6C90E" /><stop offset="1" stopColor="#E8A000" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div style={styles.logoTitle}>SmartOuting</div>
            <div style={styles.logoSub}>Secure Campus Management</div>
          </div>
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in with your registered name</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Full Name (as registered)</label>
            <div style={{ position: "relative" }}>
              <span style={{ ...styles.inputIcon, color: focused === "username" ? "#F6C90E" : "#6b7280" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                onFocus={() => setFocused("username")}
                onBlur={() => setFocused("")}
                placeholder="e.g. John Doe"
                style={{
                  ...styles.input,
                  borderColor: focused === "username" ? "#F6C90E" : "rgba(255,255,255,0.1)",
                  boxShadow: focused === "username" ? "0 0 0 3px rgba(246,201,14,0.15)" : "none",
                }}
                autoComplete="username"
              />
            </div>
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={{ ...styles.inputIcon, color: focused === "password" ? "#F6C90E" : "#6b7280" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                placeholder="Enter your password"
                style={{
                  ...styles.input,
                  borderColor: focused === "password" ? "#F6C90E" : "rgba(255,255,255,0.1)",
                  boxShadow: focused === "password" ? "0 0 0 3px rgba(246,201,14,0.15)" : "none",
                  paddingRight: 48,
                }}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass((p) => !p)} style={styles.eyeBtn}>
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.8 : 1 }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={styles.spinner} /> Signing in...
              </span>
            ) : "Sign In →"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>New to SmartOuting?</span>
          <span style={styles.dividerLine} />
        </div>

        <button onClick={onSwitchToRegister} style={styles.switchBtn}>
          Create an account
        </button>

        <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(246,201,14,0.04)", borderRadius: 10, border: "1px solid rgba(246,201,14,0.1)" }}>
          <p style={{ fontSize: 11, color: "#6b7280", textAlign: "center", lineHeight: 1.6 }}>
            💡 Login uses your <strong style={{ color: "#F6C90E" }}>Full Name</strong> (not email).<br />
            Make sure all backend services are running on port <strong style={{ color: "#F6C90E" }}>8989</strong>.
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060D1F; }
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-60px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,40px) scale(0.9)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,50px) scale(1.05)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cardIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", background: "#060D1F",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden",
  },
  orb1: {
    position: "absolute", top: "-10%", left: "-5%", width: 600, height: 600, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(246,201,14,0.12) 0%, transparent 70%)",
    animation: "float1 12s ease-in-out infinite", pointerEvents: "none",
  },
  orb2: {
    position: "absolute", bottom: "-15%", right: "-10%", width: 700, height: 700, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(67,97,238,0.15) 0%, transparent 70%)",
    animation: "float2 15s ease-in-out infinite", pointerEvents: "none",
  },
  orb3: {
    position: "absolute", top: "40%", right: "20%", width: 300, height: 300, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(76,201,240,0.08) 0%, transparent 70%)",
    animation: "float3 10s ease-in-out infinite", pointerEvents: "none",
  },
  grid: {
    position: "absolute", inset: 0,
    backgroundImage: "linear-gradient(rgba(246,201,14,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(246,201,14,0.03) 1px, transparent 1px)",
    backgroundSize: "60px 60px", pointerEvents: "none",
  },
  card: {
    position: "relative", background: "rgba(10,18,40,0.85)", backdropFilter: "blur(24px)",
    border: "1px solid rgba(246,201,14,0.15)", borderRadius: 24, padding: "48px 44px",
    width: "100%", maxWidth: 460,
    boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
    animation: "cardIn 0.6s cubic-bezier(.34,1.26,.64,1)",
  },
  logoWrap: { display: "flex", alignItems: "center", gap: 12, marginBottom: 36 },
  logo: {
    width: 48, height: 48, borderRadius: 14, background: "rgba(246,201,14,0.1)",
    border: "1px solid rgba(246,201,14,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  logoTitle: { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#F6C90E", letterSpacing: "-0.3px" },
  logoSub: { fontSize: 11, color: "#6b7280", letterSpacing: "0.5px", marginTop: 1 },
  heading: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.5px", marginBottom: 8 },
  subheading: { fontSize: 14, color: "#6b7280", marginBottom: 32, lineHeight: 1.5 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.6px", textTransform: "uppercase" },
  inputIcon: {
    position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
    pointerEvents: "none", transition: "color 0.2s",
  },
  input: {
    width: "100%", padding: "14px 16px 14px 44px",
    background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 12, color: "#f9fafb", fontSize: 15,
    fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  },
  eyeBtn: {
    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center",
  },
  btn: {
    marginTop: 8, padding: "16px 24px",
    background: "linear-gradient(135deg, #F6C90E 0%, #E8A000 100%)",
    border: "none", borderRadius: 12, color: "#060D1F", fontSize: 15, fontWeight: 700,
    fontFamily: "'Syne', sans-serif", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 8px 24px rgba(246,201,14,0.3)", transition: "transform 0.15s, box-shadow 0.15s",
  },
  spinner: {
    width: 18, height: 18, border: "2.5px solid rgba(0,0,0,0.2)", borderTopColor: "#060D1F",
    borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block",
  },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "28px 0 20px" },
  dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.08)" },
  dividerText: { fontSize: 13, color: "#4b5563", whiteSpace: "nowrap" },
  switchBtn: {
    width: "100%", padding: "14px 24px",
    background: "rgba(246,201,14,0.07)", border: "1.5px solid rgba(246,201,14,0.2)",
    borderRadius: 12, color: "#F6C90E", fontSize: 14, fontWeight: 600,
    fontFamily: "'Syne', sans-serif", cursor: "pointer", transition: "background 0.2s",
  },
};

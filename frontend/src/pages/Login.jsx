import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [active, setActive] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return toast("Please fill in all fields", "warn");
    setLoading(true);
    try {
      const u = await login(form.username.trim(), form.password);
      toast(`Welcome back, ${u.name}!`, "success");
    } catch (err) {
      const m = err.message || "";
      if (m.includes("User not found")) toast("No account found with that name.", "error");
      else if (m.includes("Wrong Password") || m.includes("Invalid Access")) toast("Incorrect password. Please try again.", "error");
      else if (m.includes("Cannot connect") || m.includes("Failed to fetch")) toast("Unable to connect. Please try again shortly.", "error");
      else toast("Login failed. Please check your details.", "error");
    } finally { setLoading(false); }
  };

  const inputStyle = (name) => ({
    width: "100%", padding: "15px 16px 15px 48px", borderRadius: 14,
    border: `1.5px solid ${active === name ? "#2DD4BF" : "rgba(0,0,0,0.08)"}`,
    background: active === name ? "rgba(45,212,191,0.02)" : "#FAFAFA",
    boxShadow: active === name ? "0 0 0 4px rgba(45,212,191,0.07)" : "none",
    color: "var(--text-1)", fontSize: 15, fontWeight: 500, outline: "none",
    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
    fontFamily: "inherit",
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter',sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        ::placeholder { color: #B0B0B0 !important; font-weight: 400 !important; }
        .login-fade { opacity:0; transform:translateY(24px); transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .login-fade.show { opacity:1; transform:translateY(0); }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes float1 { 0%,100%{transform:translate(0,0) rotate(0deg)} 33%{transform:translate(12px,-18px) rotate(3deg)} 66%{transform:translate(-8px,10px) rotate(-2deg)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) rotate(0deg)} 33%{transform:translate(-16px,12px) rotate(-4deg)} 66%{transform:translate(10px,-14px) rotate(2deg)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(6px,-10px)} }
        @keyframes pulseRing { 0%{transform:scale(0.95);opacity:0.5} 50%{transform:scale(1.05);opacity:0.8} 100%{transform:scale(0.95);opacity:0.5} }
        @keyframes countUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gridPulse { 0%,100%{opacity:0.03} 50%{opacity:0.06} }
        .login-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow: 0 8px 28px rgba(45,212,191,0.4) !important; }
        .login-btn:active:not(:disabled) { transform:translateY(0) scale(0.99); }
        .register-btn:hover { border-color: rgba(45,212,191,0.4) !important; background: rgba(45,212,191,0.03) !important; color: #14B8A6 !important; }
        .stat-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important; }
        @media (max-width: 900px) {
          .login-left-panel { display: none !important; }
          .login-right-panel { flex: 1 !important; }
        }
      `}</style>

      {/* LEFT — Premium Dark Hero Panel */}
      <div className={`login-left-panel login-fade ${mounted ? "show" : ""}`} style={{
        flex: "0 0 50%", position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "48px 56px",
        background: "linear-gradient(165deg, #0F172A 0%, #1A1F3A 40%, #162032 100%)",
        color: "#fff",
        overflow: "hidden",
      }}>
        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(rgba(45,212,191,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          animation: "gridPulse 6s ease infinite",
        }} />

        {/* Gradient orbs */}
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)", top: "-10%", right: "-5%", zIndex: 0, animation: "float1 12s ease-in-out infinite", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", bottom: "5%", left: "-5%", zIndex: 0, animation: "float2 15s ease-in-out infinite", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)", top: "45%", left: "40%", zIndex: 0, animation: "float3 10s ease-in-out infinite", filter: "blur(30px)" }} />

        {/* Top — Brand */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(45,212,191,0.3)",
            }}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="rgba(255,255,255,0.9)" />
                <path d="M12 16L15 19L21 13" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.5px", color: "#fff" }}>SmartOuting</span>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.3px", marginTop: 1 }}>Enterprise Platform</div>
            </div>
          </div>
        </div>

        {/* Middle — Main content */}
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 32, height: 2, background: "linear-gradient(90deg, #2DD4BF, transparent)", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2DD4BF", textTransform: "uppercase", letterSpacing: "2.5px" }}>Campus Exit Management</span>
          </div>

          <h1 style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.06, letterSpacing: "-2.5px", marginBottom: 22, color: "#fff" }}>
            Every exit,<br />tracked &<br />
            <span style={{ background: "linear-gradient(135deg, #2DD4BF 0%, #6EE7B7 50%, #2DD4BF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>secured.</span>
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.5)", maxWidth: 380, marginBottom: 40, fontWeight: 400 }}>
            AI-driven approvals, real-time QR gate scanning, and instant parent notifications — all in one platform.
          </p>

          {/* Stat cards */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { value: "AI", label: "Urgency Detection", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" /><circle cx="12" cy="15" r="2" /></svg>, gradient: "linear-gradient(135deg, rgba(45,212,191,0.15) 0%, rgba(45,212,191,0.05) 100%)" },
              { value: "QR", label: "Gate Scanning", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3z" /><path d="M20 14v3h-3" /><path d="M14 20h3" /><path d="M20 20h0" /></svg>, gradient: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)" },
              { value: "24/7", label: "Monitoring", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, gradient: "linear-gradient(135deg, rgba(45,212,191,0.15) 0%, rgba(99,102,241,0.05) 100%)" }
            ].map((s, i) => (
              <div key={s.value} className="stat-card" style={{
                padding: "20px 18px", flex: 1,
                background: s.gradient, backdropFilter: "blur(16px)",
                borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
                animation: `countUp 0.6s ${0.3 + i * 0.12}s backwards cubic-bezier(0.16,1,0.3,1)`,
              }}>
                <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(45,212,191,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.icon}
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, fontFamily: "'JetBrains Mono',monospace", color: "#fff", letterSpacing: "-0.5px" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500, letterSpacing: "0.2px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Role tags */}
          <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
            {[
              { name: "Students", icon: "M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422A12.083 12.083 0 0 1 12 21a12.083 12.083 0 0 1-6.16-10.422L12 14z" },
              { name: "Wardens", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
              { name: "Guards", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
            ].map(r => (
              <span key={r.name} style={{
                padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(45,212,191,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={r.icon} /></svg>
                {r.name}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom — Trust bar */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2DD4BF", boxShadow: "0 0 8px rgba(45,212,191,0.5)", animation: "pulseRing 2s ease infinite" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>System Online</span>
            </div>
            <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>256-bit Encrypted</span>
            <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>SOC 2 Compliant</span>
          </div>
        </div>
      </div>

      {/* RIGHT — Clean Form Panel */}
      <div className={`login-right-panel login-fade ${mounted ? "show" : ""}`} style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 52px", background: "#FFFFFF",
        transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.12s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.12s",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 99,
              background: "rgba(45,212,191,0.06)", color: "#14B8A6",
              fontSize: 12, fontWeight: 600, marginBottom: 24,
              border: "1px solid rgba(45,212,191,0.1)",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2DD4BF", boxShadow: "0 0 6px rgba(45,212,191,0.4)" }} />
              Secure Portal
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-1.2px", marginBottom: 10 }}>Welcome back</h2>
            <p style={{ fontSize: 15, color: "var(--text-3)", lineHeight: 1.6, fontWeight: 400 }}>Sign in with your registered name to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Username */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", letterSpacing: "0.1px" }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: "color 0.25s", display: "flex", color: active === "username" ? "#2DD4BF" : "#C0C0C0" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <input name="username" value={form.username} onChange={handleChange}
                  onFocus={() => setActive("username")} onBlur={() => setActive("")}
                  placeholder="e.g. Rahul Sharma" autoComplete="username"
                  style={inputStyle("username")} />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", letterSpacing: "0.1px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: "color 0.25s", display: "flex", color: active === "password" ? "#2DD4BF" : "#C0C0C0" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <input name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handleChange}
                  onFocus={() => setActive("password")} onBlur={() => setActive("")}
                  placeholder="Your password" autoComplete="current-password"
                  style={{ ...inputStyle("password"), paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 4,
                  display: "flex", borderRadius: 6, color: "#B5B5B5", transition: "color 0.2s",
                }}>
                  {showPass
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="login-btn" style={{
              width: "100%", padding: "15px", border: "none", borderRadius: 14,
              background: "linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)",
              color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 20px rgba(45,212,191,0.3)",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
              opacity: loading ? 0.7 : 1, marginTop: 6, letterSpacing: "0.1px",
            }}>
              {loading
                ? <><span style={{ width: 17, height: 17, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Signing in...</>
                : <>Sign In <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "28px 0 22px" }}>
            <span style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)" }} />
            <span style={{ fontSize: 12, color: "#C0C0C0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px" }}>or</span>
            <span style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)" }} />
          </div>

          <button onClick={onSwitchToRegister} className="register-btn" style={{
            width: "100%", padding: "14px", border: "1.5px solid rgba(0,0,0,0.08)",
            borderRadius: 14, background: "#fff", color: "var(--text-2)", fontSize: 14, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          }}>
            Create account
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>

          {/* AI Security footer */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            marginTop: 28, padding: "12px 16px",
            background: "rgba(45,212,191,0.03)", borderRadius: 12,
            border: "1px solid rgba(45,212,191,0.06)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Protected by AI-powered security analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

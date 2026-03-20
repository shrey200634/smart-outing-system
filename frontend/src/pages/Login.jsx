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
  const [hoverBtn, setHoverBtn] = useState(false);
  const [hoverReg, setHoverReg] = useState(false);

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

  const P = {
    navy: "#0C1B33",
    navyLight: "#1B2D4F",
    teal: "#0EA5A0",
    tealDark: "#0C8C88",
    tealLight: "#E8FAF9",
    tealGlow: "rgba(14,165,160,0.12)",
    cream: "#FAFBF9",
    warmWhite: "#F5F6F3",
    sand: "#EEF0EB",
    textDark: "#0C1B33",
    textMid: "#4A5567",
    textLight: "#8E96A4",
    textFaint: "#B8BEC9",
    border: "rgba(12,27,51,0.08)",
    borderHover: "rgba(12,27,51,0.15)",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', sans-serif", background: P.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(8px,-14px); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }

        .so-input {
          width: 100%; padding: 15px 18px 15px 50px; border-radius: 12px;
          border: 1.5px solid ${P.border};
          background: #FFFFFF;
          color: ${P.textDark}; font-size: 15px; font-weight: 500; outline: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Inter', sans-serif;
        }
        .so-input::placeholder { color: ${P.textFaint} !important; font-weight: 400 !important; }
        .so-input:focus {
          border-color: ${P.teal};
          background: #fff;
          box-shadow: 0 0 0 4px ${P.tealGlow}, 0 2px 8px rgba(14,165,160,0.06);
        }

        @media (max-width: 960px) {
          .so-left-panel { display: none !important; }
          .so-right-panel { flex: 1 !important; min-width: 0 !important; }
        }
      `}</style>

      {/* ═══════════ LEFT — Elegant Navy Panel ═══════════ */}
      <div className="so-left-panel" style={{
        flex: "0 0 50%", position: "relative", display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "44px 56px",
        background: `linear-gradient(160deg, ${P.navy} 0%, ${P.navyLight} 60%, #1E3456 100%)`,
        color: "#fff", overflow: "hidden",
        opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateX(-16px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {/* Decorative shapes */}
        <div style={{ position: "absolute", top: -80, right: -60, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,160,0.1) 0%, transparent 70%)", filter: "blur(40px)", animation: "float1 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: -100, left: -40, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)", filter: "blur(30px)", animation: "float1 18s ease-in-out infinite reverse" }} />

        {/* Top — Brand */}
        <div style={{ position: "relative", zIndex: 2, animation: mounted ? "slideIn 0.6s 0.15s backwards ease-out" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 13,
              background: `linear-gradient(135deg, ${P.teal}, ${P.tealDark})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 20px rgba(14,165,160,0.3)",
            }}>
              <svg width="23" height="23" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="rgba(255,255,255,0.92)" />
                <path d="M12 16L15 19L21 13" stroke={P.tealDark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.3px" }}>SmartOuting</span>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "2px", marginTop: 2, textTransform: "uppercase" }}>Campus Platform</div>
            </div>
          </div>
        </div>

        {/* Center — Hero */}
        <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 440, animation: mounted ? "fadeUp 0.8s 0.25s backwards ease-out" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30 }}>
            <div style={{ width: 36, height: 1.5, borderRadius: 1, background: `linear-gradient(90deg, ${P.teal}, transparent)` }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: P.teal, letterSpacing: "2.5px", textTransform: "uppercase" }}>Exit Management System</span>
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 50, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.5px", marginBottom: 22 }}>
            Every exit,{" "}
            <span style={{ color: P.teal, fontStyle: "italic" }}>tracked</span>{" "}
            &{" "}
            <span style={{ color: P.teal, fontStyle: "italic" }}>secured.</span>
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.45)", maxWidth: 380, marginBottom: 44 }}>
            Smart approvals, real-time QR scanning at gates, and instant parent notifications — unified in one system.
          </p>

          {/* Feature chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { label: "Smart Approvals", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
              { label: "QR Gate Scan", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17 17h3v3" },
            ].map((f, i) => (
              <div key={f.label} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "7px 15px", borderRadius: 100,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                animation: mounted ? `fadeUp 0.5s ${0.55 + i * 0.08}s backwards ease-out` : "none",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ═══════════ RIGHT — Clean Light Form ═══════════ */}
      <div className="so-right-panel" style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 52px", background: P.cream,
        opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(16px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Header */}
          <div style={{ marginBottom: 36, animation: mounted ? "fadeUp 0.7s 0.2s backwards ease-out" : "none" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 100,
              background: P.tealLight, marginBottom: 26,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: P.teal, animation: "pulse 2.5s ease-in-out infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: P.tealDark, letterSpacing: "0.3px" }}>Secure Portal</span>
            </div>

            <h2 style={{
              fontFamily: "'DM Serif Display', serif", fontSize: 34, fontWeight: 400,
              color: P.textDark, letterSpacing: "-0.3px", marginBottom: 10, lineHeight: 1.15,
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 15, color: P.textLight, lineHeight: 1.6 }}>
              Sign in with your registered name to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{
            display: "flex", flexDirection: "column", gap: 20,
            animation: mounted ? "fadeUp 0.7s 0.35s backwards ease-out" : "none",
          }}>
            {/* Username */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: P.textMid }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  pointerEvents: "none", display: "flex",
                  color: active === "username" ? P.teal : P.textFaint, transition: "color 0.25s",
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <input name="username" value={form.username} onChange={handleChange}
                  onFocus={() => setActive("username")} onBlur={() => setActive("")}
                  placeholder="e.g. Rahul Sharma" autoComplete="username" className="so-input" />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: P.textMid }}>Password</label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  pointerEvents: "none", display: "flex",
                  color: active === "password" ? P.teal : P.textFaint, transition: "color 0.25s",
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <input name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handleChange}
                  onFocus={() => setActive("password")} onBlur={() => setActive("")}
                  placeholder="Your password" autoComplete="current-password"
                  className="so-input" style={{ paddingRight: 50 }} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 4,
                  display: "flex", borderRadius: 6, color: P.textFaint, transition: "color 0.2s",
                }}>
                  {showPass
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* Sign In */}
            <button type="submit" disabled={loading}
              onMouseEnter={() => setHoverBtn(true)} onMouseLeave={() => setHoverBtn(false)}
              style={{
                width: "100%", padding: "15px", border: "none", borderRadius: 12,
                background: `linear-gradient(135deg, ${P.teal}, ${P.tealDark})`,
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                fontFamily: "'Inter', sans-serif", letterSpacing: "0.2px", marginTop: 4,
                opacity: loading ? 0.7 : 1,
                transform: hoverBtn && !loading ? "translateY(-2px)" : "none",
                boxShadow: hoverBtn && !loading
                  ? "0 12px 36px rgba(14,165,160,0.3), 0 0 0 1px rgba(14,165,160,0.15)"
                  : "0 4px 16px rgba(14,165,160,0.2)",
              }}
            >
              {loading
                ? <><span style={{ width: 17, height: 17, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Signing in...</>
                : <>Sign In <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "26px 0 22px", animation: mounted ? "fadeIn 0.6s 0.5s backwards" : "none" }}>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${P.border}, transparent)` }} />
            <span style={{ fontSize: 11, color: P.textFaint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px" }}>or</span>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${P.border}, transparent)` }} />
          </div>

          {/* Register */}
          <div style={{ animation: mounted ? "fadeUp 0.6s 0.55s backwards ease-out" : "none" }}>
            <button onClick={onSwitchToRegister}
              onMouseEnter={() => setHoverReg(true)} onMouseLeave={() => setHoverReg(false)}
              style={{
                width: "100%", padding: "14px", borderRadius: 12,
                border: `1.5px solid ${hoverReg ? P.teal : P.border}`,
                background: hoverReg ? P.tealLight : "#fff",
                color: hoverReg ? P.tealDark : P.textMid,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                fontFamily: "'Inter', sans-serif",
                transform: hoverReg ? "translateY(-1px)" : "none",
                boxShadow: hoverReg ? "0 4px 12px rgba(14,165,160,0.08)" : "none",
              }}
            >
              Create an account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Trust footer */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 20,
            marginTop: 30, paddingTop: 22, borderTop: `1px solid ${P.border}`,
            animation: mounted ? "fadeIn 0.6s 0.7s backwards" : "none",
          }}>
            {[
              { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", text: "Encrypted" },
              { icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14", text: "Verified" },
              { icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", text: "Always On" },
            ].map(item => (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d={item.icon} /></svg>
                <span style={{ fontSize: 11, color: P.textFaint, fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

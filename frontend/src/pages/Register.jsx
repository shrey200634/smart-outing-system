import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const ROLES = [
  { value: "STUDENT", label: "Student",   icon: "🎓", desc: "Apply for campus outings" },
  { value: "WARDEN",  label: "Warden",    icon: "🏛️", desc: "Approve & manage requests" },
  { value: "GUARD",   label: "Gate Guard",icon: "🛡️", desc: "Verify QR at gate" },
];

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const nextStep = () => {
    if (!form.name.trim())                                return toast("Name is required", "warn");
    if (!form.email.trim() || !form.email.includes("@")) return toast("Valid email required", "warn");
    if (form.password.length < 6)                         return toast("Password must be at least 6 characters", "warn");
    if (form.password !== form.confirmPassword)           return toast("Passwords do not match", "error");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.role) return toast("Please select your role", "warn");
    setLoading(true);
    try {
      await register({
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        role:     form.role,
      });
      toast("Account created! Please sign in with your full name.", "success");
      setTimeout(() => onSwitchToLogin(), 1200);
    } catch (err) {
      const msg = err.message || "Registration failed";
      // Catches MySQL duplicate entry for email (unique constraint)
      if (
        msg.toLowerCase().includes("exist") ||
        msg.toLowerCase().includes("duplicate") ||
        msg.includes("1062") ||
        msg.includes("unique") ||
        msg.includes("Unique")
      ) {
        toast("An account with this email already exists. Please log in.", "error");
      } else if (msg.includes("Cannot connect") || msg.includes("Failed to fetch")) {
        toast("Cannot connect to server. Is the backend running?", "error");
      } else {
        toast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    ...styles.input,
    borderColor: focused === name ? "#F6C90E" : "rgba(255,255,255,0.1)",
    boxShadow: focused === name ? "0 0 0 3px rgba(246,201,14,0.15)" : "none",
  });

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.grid} />

      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="url(#grad2)" />
              <path d="M12 16L15 19L21 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="grad2" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
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

        <div style={styles.stepWrap}>
          {[1, 2].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ ...styles.stepDot, background: step >= s ? "#F6C90E" : "rgba(255,255,255,0.1)", color: step >= s ? "#060D1F" : "#4b5563" }}>{s}</div>
              <span style={{ fontSize: 12, color: step >= s ? "#F6C90E" : "#4b5563", fontWeight: 600 }}>
                {s === 1 ? "Your Info" : "Select Role"}
              </span>
              {s < 2 && <div style={{ width: 40, height: 1, background: step > s ? "#F6C90E" : "rgba(255,255,255,0.1)", margin: "0 4px" }} />}
            </div>
          ))}
        </div>

        <h1 style={styles.heading}>{step === 1 ? "Create account" : "Select your role"}</h1>
        <p style={styles.subheading}>
          {step === 1 ? "Fill in your details to get started" : "Choose how you'll use SmartOuting"}
        </p>

        {step === 1 ? (
          <div style={styles.form}>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Full Name</label>
              <div style={{ position: "relative" }}>
                <span style={{ ...styles.inputIcon, color: focused === "name" ? "#F6C90E" : "#6b7280" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input name="name" value={form.name} onChange={handleChange}
                  onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                  placeholder="John Doe" style={inputStyle("name")} />
              </div>
              <p style={styles.fieldHint}>⚠️ This name will be your login username</p>
            </div>

            <div style={styles.fieldWrap}>
              <label style={styles.label}>Email Address</label>
              <div style={{ position: "relative" }}>
                <span style={{ ...styles.inputIcon, color: focused === "email" ? "#F6C90E" : "#6b7280" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                  placeholder="john@example.com" style={inputStyle("email")} />
              </div>
            </div>

            <div style={styles.fieldWrap}>
              <label style={styles.label}>Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ ...styles.inputIcon, color: focused === "password" ? "#F6C90E" : "#6b7280" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input name="password" type={showPass ? "text" : "password"} value={form.password}
                  onChange={handleChange} onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                  placeholder="Min. 6 characters" style={{ ...inputStyle("password"), paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPass((p) => !p)} style={styles.eyeBtn}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    {showPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              {form.password && (
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 999,
                      background: form.password.length >= i * 2
                        ? i <= 1 ? "#ef4444" : i <= 2 ? "#f59e0b" : i <= 3 ? "#3b82f6" : "#10b981"
                        : "rgba(255,255,255,0.1)",
                      transition: "background 0.3s",
                    }} />
                  ))}
                </div>
              )}
            </div>

            <div style={styles.fieldWrap}>
              <label style={styles.label}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ ...styles.inputIcon, color: "#6b7280" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <input name="confirmPassword" type="password" value={form.confirmPassword}
                  onChange={handleChange} onFocus={() => setFocused("confirm")} onBlur={() => setFocused("")}
                  placeholder="Re-enter password"
                  style={{
                    ...inputStyle("confirm"),
                    borderColor: form.confirmPassword && form.password !== form.confirmPassword
                      ? "#ef4444" : focused === "confirm" ? "#F6C90E" : "rgba(255,255,255,0.1)",
                  }} />
              </div>
            </div>

            <button onClick={nextStep} style={styles.btn}>Continue →</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ROLES.map((r) => (
              <button key={r.value} onClick={() => setForm((p) => ({ ...p, role: r.value }))}
                style={{
                  ...styles.roleCard,
                  borderColor: form.role === r.value ? "#F6C90E" : "rgba(255,255,255,0.08)",
                  background: form.role === r.value ? "rgba(246,201,14,0.08)" : "rgba(255,255,255,0.02)",
                  boxShadow: form.role === r.value ? "0 0 0 1px #F6C90E, 0 8px 24px rgba(246,201,14,0.12)" : "none",
                }}
              >
                <span style={{ fontSize: 26 }}>{r.icon}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: form.role === r.value ? "#F6C90E" : "#f9fafb", fontWeight: 700, fontSize: 15, fontFamily: "'Syne', sans-serif" }}>{r.label}</div>
                  <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{r.desc}</div>
                </div>
                {form.role === r.value && (
                  <div style={{ marginLeft: "auto", width: 22, height: 22, borderRadius: "50%", background: "#F6C90E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="#060D1F" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={() => setStep(1)} style={styles.backBtn}>← Back</button>
              <button onClick={handleSubmit} disabled={loading} style={{ ...styles.btn, flex: 1, opacity: loading ? 0.8 : 1 }}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <span style={styles.spinner} /> Creating account...
                  </span>
                ) : "Create Account ✓"}
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span style={{ color: "#6b7280", fontSize: 13 }}>Already have an account? </span>
          <button onClick={onSwitchToLogin} style={styles.linkBtn}>Sign in</button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060D1F; }
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-60px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-50px,40px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cardIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#060D1F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" },
  orb1: { position: "absolute", top: "-10%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(246,201,14,0.1) 0%, transparent 70%)", animation: "float1 12s ease-in-out infinite", pointerEvents: "none" },
  orb2: { position: "absolute", bottom: "-15%", left: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(67,97,238,0.12) 0%, transparent 70%)", animation: "float2 15s ease-in-out infinite", pointerEvents: "none" },
  grid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(246,201,14,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(246,201,14,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" },
  card: { position: "relative", background: "rgba(10,18,40,0.9)", backdropFilter: "blur(24px)", border: "1px solid rgba(246,201,14,0.15)", borderRadius: 24, padding: "48px 44px", width: "100%", maxWidth: 480, boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset", animation: "cardIn 0.6s cubic-bezier(.34,1.26,.64,1)" },
  logoWrap: { display: "flex", alignItems: "center", gap: 12, marginBottom: 28 },
  logo: { width: 48, height: 48, borderRadius: 14, background: "rgba(246,201,14,0.1)", border: "1px solid rgba(246,201,14,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoTitle: { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#F6C90E" },
  logoSub: { fontSize: 11, color: "#6b7280", letterSpacing: "0.5px", marginTop: 1 },
  stepWrap: { display: "flex", alignItems: "center", gap: 4, marginBottom: 24 },
  stepDot: { width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: "'Syne', sans-serif", transition: "all 0.3s" },
  heading: { fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.5px", marginBottom: 6 },
  subheading: { fontSize: 14, color: "#6b7280", marginBottom: 28, lineHeight: 1.5 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 7 },
  fieldHint: { fontSize: 11, color: "#F6C90E", opacity: 0.7, marginTop: 2 },
  label: { fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.6px", textTransform: "uppercase" },
  inputIcon: { position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: "color 0.2s" },
  input: { width: "100%", padding: "13px 16px 13px 44px", background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f9fafb", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" },
  eyeBtn: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" },
  btn: { padding: "15px 24px", background: "linear-gradient(135deg, #F6C90E 0%, #E8A000 100%)", border: "none", borderRadius: 12, color: "#060D1F", fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", cursor: "pointer", width: "100%", boxShadow: "0 8px 24px rgba(246,201,14,0.25)", transition: "transform 0.15s" },
  backBtn: { padding: "15px 20px", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#9ca3af", fontSize: 14, fontWeight: 600, fontFamily: "'Syne', sans-serif", cursor: "pointer" },
  roleCard: { display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", border: "1.5px solid", borderRadius: 14, cursor: "pointer", transition: "all 0.2s", background: "none", textAlign: "left" },
  spinner: { width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#060D1F", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" },
  linkBtn: { background: "none", border: "none", color: "#F6C90E", fontSize: 13, fontWeight: 600, cursor: "pointer" },
};

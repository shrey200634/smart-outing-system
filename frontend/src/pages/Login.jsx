import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [activeField, setActiveField] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return toast("Please fill in all fields", "warn");
    setLoading(true);
    try {
      const userData = await login(form.username.trim(), form.password);
      toast(`Welcome back, ${userData.name}! 🎉`, "success");
    } catch (err) {
      const msg = err.message || "Login failed";
      if (msg.includes("User not found")) toast("No account found. Please register first.", "error");
      else if (msg.includes("Wrong Password") || msg.includes("Invalid Access")) toast("Incorrect password. Try again.", "error");
      else if (msg.includes("Cannot connect") || msg.includes("Failed to fetch")) toast("Can't reach server. Is backend running on port 8989?", "error");
      else toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#04080F", display:"flex", fontFamily:"'Outfit',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#04080F; }
        input { color-scheme:dark; }
        ::placeholder { color:#334155 !important; }

        .blob { position:fixed; border-radius:50%; pointer-events:none; z-index:0; filter:blur(80px); }
        .blob-g { width:600px;height:600px;top:-150px;left:-100px; background:radial-gradient(circle,rgba(246,201,14,0.18) 0%,transparent 70%); animation:bd1 20s ease-in-out infinite; }
        .blob-b { width:700px;height:700px;bottom:-200px;right:-150px; background:radial-gradient(circle,rgba(59,130,246,0.14) 0%,transparent 70%); animation:bd2 26s ease-in-out infinite; }
        .blob-t { width:400px;height:400px;top:40%;left:40%; background:radial-gradient(circle,rgba(20,184,166,0.1) 0%,transparent 70%); animation:bd3 18s ease-in-out infinite; }

        .pt { position:fixed; border-radius:50%; pointer-events:none; z-index:0; }
        .pt0 { width:3px;height:3px;top:15%;left:20%;background:rgba(246,201,14,0.6);animation:f0 8s ease-in-out infinite; }
        .pt1 { width:2px;height:2px;top:70%;left:10%;background:rgba(246,201,14,0.4);animation:f1 11s ease-in-out infinite; }
        .pt2 { width:4px;height:4px;top:30%;left:75%;background:rgba(99,102,241,0.6);animation:f2 9s ease-in-out infinite; }
        .pt3 { width:2px;height:2px;top:80%;left:60%;background:rgba(246,201,14,0.5);animation:f3 14s ease-in-out infinite; }
        .pt4 { width:3px;height:3px;top:55%;left:85%;background:rgba(20,184,166,0.6);animation:f4 10s ease-in-out infinite; }
        .pt5 { width:2px;height:2px;top:10%;left:55%;background:rgba(246,201,14,0.4);animation:f5 12s ease-in-out infinite; }

        .lp { opacity:0; transform:translateX(-32px); transition:opacity 0.8s cubic-bezier(.22,1,.36,1),transform 0.8s cubic-bezier(.22,1,.36,1); }
        .rp { opacity:0; transform:translateX(32px);  transition:opacity 0.8s cubic-bezier(.22,1,.36,1) 0.15s,transform 0.8s cubic-bezier(.22,1,.36,1) 0.15s; }
        .lp.in, .rp.in { opacity:1; transform:translateX(0); }

        .s1,.s2,.s3,.s4,.s5,.s6 { opacity:0; transform:translateY(16px); animation:si 0.6s cubic-bezier(.22,1,.36,1) forwards; }
        .s1{animation-delay:0.3s}.s2{animation-delay:0.4s}.s3{animation-delay:0.5s}
        .s4{animation-delay:0.6s}.s5{animation-delay:0.68s}.s6{animation-delay:0.75s}

        .sbtn {
          width:100%; padding:15px 24px;
          background:linear-gradient(135deg,#F6C90E 0%,#D4A017 100%);
          border:none; border-radius:14px; color:#0a0f1a;
          font-size:15px; font-weight:700; font-family:'Outfit',sans-serif; cursor:pointer;
          box-shadow:0 4px 24px rgba(246,201,14,0.3),0 1px 0 rgba(255,255,255,0.15) inset;
          transition:transform 0.18s cubic-bezier(.34,1.56,.64,1),box-shadow 0.18s ease;
          position:relative; overflow:hidden;
        }
        .sbtn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 60%); opacity:0; transition:opacity 0.2s; }
        .sbtn:hover:not(:disabled) { transform:translateY(-2px) scale(1.01); box-shadow:0 8px 36px rgba(246,201,14,0.45),0 1px 0 rgba(255,255,255,0.15) inset; }
        .sbtn:hover:not(:disabled)::before { opacity:1; }
        .sbtn:active:not(:disabled) { transform:translateY(0) scale(0.99); }

        .rbtn {
          width:100%; padding:13px 24px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
          border-radius:14px; color:#94a3b8;
          font-size:14px; font-weight:600; font-family:'Outfit',sans-serif; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:all 0.2s ease;
        }
        .rbtn:hover { background:rgba(246,201,14,0.08); border-color:rgba(246,201,14,0.3); color:#F6C90E; transform:translateY(-1px); }

        .pill { transition:all 0.2s ease; cursor:default; }
        .pill:hover { transform:translateY(-2px); background:rgba(255,255,255,0.07) !important; }

        @keyframes bd1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(80px,-60px) scale(1.1)} 66%{transform:translate(-40px,80px) scale(0.95)} }
        @keyframes bd2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-70px,50px) scale(1.05)} 66%{transform:translate(60px,-70px) scale(0.9)} }
        @keyframes bd3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-60px)} }
        @keyframes f0 { 0%,100%{transform:translate(0,0);opacity:0.5} 50%{transform:translate(20px,-30px);opacity:1} }
        @keyframes f1 { 0%,100%{transform:translate(0,0);opacity:0.4} 50%{transform:translate(-15px,-25px);opacity:0.9} }
        @keyframes f2 { 0%,100%{transform:translate(0,0);opacity:0.6} 50%{transform:translate(10px,20px);opacity:1} }
        @keyframes f3 { 0%,100%{transform:translate(0,0);opacity:0.3} 50%{transform:translate(-20px,-15px);opacity:0.8} }
        @keyframes f4 { 0%,100%{transform:translate(0,0);opacity:0.5} 50%{transform:translate(15px,-25px);opacity:1} }
        @keyframes f5 { 0%,100%{transform:translate(0,0);opacity:0.4} 50%{transform:translate(-10px,18px);opacity:0.9} }
        @keyframes si   { to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shim { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>

      {/* Grain */}
      <div style={{ position:"fixed",inset:0,zIndex:1,pointerEvents:"none",opacity:0.03,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize:"128px" }} />

      {/* Grid */}
      <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(246,201,14,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(246,201,14,0.03) 1px,transparent 1px)",
        backgroundSize:"64px 64px" }} />

      {/* Blobs */}
      <div className="blob blob-g" />
      <div className="blob blob-b" />
      <div className="blob blob-t" />

      {/* Particles */}
      {[0,1,2,3,4,5].map(i => <div key={i} className={`pt pt${i}`} />)}

      {/* ── LEFT PANEL ── */}
      <div className={`lp ${mounted ? "in" : ""}`} style={{
        flex:"0 0 52%", position:"relative", zIndex:2,
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"64px 72px", borderRight:"1px solid rgba(255,255,255,0.05)",
      }}>

        {/* Brand */}
        <div className="s1" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:64 }}>
          <div style={{ width:48,height:48,borderRadius:14, background:"linear-gradient(135deg,rgba(246,201,14,0.2),rgba(246,201,14,0.05))", border:"1px solid rgba(246,201,14,0.3)", display:"flex",alignItems:"center",justifyContent:"center", boxShadow:"0 0 24px rgba(246,201,14,0.15)" }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="url(#lg)" />
              <path d="M12 16L15 19L21 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs><linearGradient id="lg" x1="4" y1="2" x2="28" y2="30"><stop stopColor="#F6C90E"/><stop offset="1" stopColor="#E8A000"/></linearGradient></defs>
            </svg>
          </div>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700, color:"#F6C90E" }}>SmartOuting</span>
        </div>

        {/* Headline */}
        <div style={{ marginBottom:40 }}>
          <div className="s2" style={{ fontSize:11, fontWeight:600, color:"#F6C90E", letterSpacing:"2px", textTransform:"uppercase", marginBottom:20, opacity:0.8 }}>
            Campus Management System
          </div>
          <h1 className="s3" style={{ fontFamily:"'Outfit',sans-serif", fontSize:52, fontWeight:800, color:"#f1f5f9", lineHeight:1.12, letterSpacing:"-1.5px", marginBottom:20 }}>
            The smartest<br />way to manage<br />
            <span style={{ background:"linear-gradient(135deg,#F6C90E 0%,#ffb347 50%,#F6C90E 100%)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shim 3s linear infinite", display:"inline-block" }}>
              campus exits.
            </span>
          </h1>
          <p className="s4" style={{ fontSize:15, color:"#64748b", lineHeight:1.7, maxWidth:400 }}>
            AI-driven approvals, live QR scanning, and instant parent alerts — all in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="s5" style={{ display:"flex", marginBottom:36, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, overflow:"hidden" }}>
          {[{v:"AI",l:"Urgency Detection"},{v:"QR",l:"Gate Scanning"},{v:"24/7",l:"Monitoring"}].map((s,i) => (
            <div key={s.v} style={{ flex:1, padding:"18px 20px", textAlign:"center", borderRight: i<2 ? "1px solid rgba(255,255,255,0.06)":"none" }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:800, color:"#F6C90E", marginBottom:4 }}>{s.v}</div>
              <div style={{ fontSize:11, color:"#475569", fontWeight:500 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Roles */}
        <div className="s6" style={{ display:"flex", gap:10 }}>
          {[{icon:"🎓",label:"Students",color:"#F6C90E"},{icon:"🏛️",label:"Wardens",color:"#a78bfa"},{icon:"🛡️",label:"Guards",color:"#34d399"}].map(r => (
            <div key={r.label} className="pill" style={{ display:"flex",alignItems:"center",gap:8, padding:"9px 16px",borderRadius:99, background:"rgba(255,255,255,0.03)", border:`1px solid ${r.color}30` }}>
              <span style={{ fontSize:14 }}>{r.icon}</span>
              <span style={{ fontSize:12, fontWeight:600, color:r.color }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ width:1, flexShrink:0, zIndex:2, background:"linear-gradient(to bottom,transparent,rgba(255,255,255,0.07) 20%,rgba(255,255,255,0.07) 80%,transparent)" }} />

      {/* ── RIGHT PANEL ── */}
      <div className={`rp ${mounted ? "in" : ""}`} style={{ flex:1, position:"relative", zIndex:2, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 56px" }}>
        <div style={{ width:"100%", maxWidth:400 }}>

          {/* Header */}
          <div className="s2" style={{ marginBottom:36 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8, padding:"6px 14px",borderRadius:99, background:"rgba(246,201,14,0.08)", border:"1px solid rgba(246,201,14,0.2)", color:"#F6C90E",fontSize:12,fontWeight:600, marginBottom:16 }}>
              👋 Welcome back
            </div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:34, fontWeight:800, color:"#f1f5f9", letterSpacing:"-1px", marginBottom:6 }}>Sign in</h2>
            <p style={{ fontSize:14, color:"#475569", lineHeight:1.6 }}>Enter your registered name to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* Name field */}
            <div className="s3" style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <label style={{ display:"flex",alignItems:"center",justifyContent:"space-between", fontSize:11, fontWeight:700, color:"#64748b", letterSpacing:"0.8px", textTransform:"uppercase" }}>
                Full Name
                <span style={{ fontSize:10, fontWeight:500, color:"#334155", textTransform:"none", letterSpacing:0 }}>as registered</span>
              </label>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute",left:15,top:"50%",transform:"translateY(-50%)", pointerEvents:"none", color: activeField==="username" ? "#F6C90E" : "#475569", transition:"color 0.2s", display:"flex" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <input
                  name="username" value={form.username} onChange={handleChange}
                  onFocus={() => setActiveField("username")} onBlur={() => setActiveField("")}
                  placeholder="e.g. John Doe" autoComplete="username"
                  style={{ width:"100%", padding:"14px 44px 14px 44px", borderRadius:14, border:"1.5px solid", outline:"none", transition:"all 0.2s", color:"#f1f5f9", fontSize:14, fontFamily:"'Outfit',sans-serif",
                    borderColor: activeField==="username" ? "rgba(246,201,14,0.6)" : "rgba(255,255,255,0.08)",
                    background: activeField==="username" ? "rgba(246,201,14,0.04)" : "rgba(255,255,255,0.03)",
                    boxShadow: activeField==="username" ? "0 0 0 3px rgba(246,201,14,0.08)" : "none",
                  }}
                />
                {form.username && (
                  <div style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)", width:20,height:20,borderRadius:"50%", background:"rgba(52,211,153,0.15)", display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </div>
                )}
              </div>
            </div>

            {/* Password field */}
            <div className="s4" style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"#64748b", letterSpacing:"0.8px", textTransform:"uppercase" }}>Password</label>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute",left:15,top:"50%",transform:"translateY(-50%)", pointerEvents:"none", color: activeField==="password" ? "#F6C90E" : "#475569", transition:"color 0.2s", display:"flex" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input
                  name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handleChange}
                  onFocus={() => setActiveField("password")} onBlur={() => setActiveField("")}
                  placeholder="Your password" autoComplete="current-password"
                  style={{ width:"100%", padding:"14px 48px 14px 44px", borderRadius:14, border:"1.5px solid", outline:"none", transition:"all 0.2s", color:"#f1f5f9", fontSize:14, fontFamily:"'Outfit',sans-serif",
                    borderColor: activeField==="password" ? "rgba(246,201,14,0.6)" : "rgba(255,255,255,0.08)",
                    background: activeField==="password" ? "rgba(246,201,14,0.04)" : "rgba(255,255,255,0.03)",
                    boxShadow: activeField==="password" ? "0 0 0 3px rgba(246,201,14,0.08)" : "none",
                  }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position:"absolute",right:13,top:"50%",transform:"translateY(-50%)", background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",alignItems:"center",borderRadius:6 }}>
                  {showPass
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="s5">
              <button type="submit" disabled={loading} className="sbtn" style={{ opacity: loading ? 0.8 : 1 }}>
                {loading
                  ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
                      <span style={{ width:17,height:17,border:"2.5px solid rgba(10,15,26,0.3)",borderTopColor:"#0a0f1a",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }} />
                      Signing in...
                    </span>
                  : <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                      Sign In
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                }
              </button>
            </div>
          </form>

          {/* Sep */}
          <div className="s6" style={{ display:"flex",alignItems:"center",gap:12,margin:"24px 0 16px" }}>
            <span style={{ flex:1,height:1,background:"rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize:11,color:"#334155",letterSpacing:"0.5px" }}>new here?</span>
            <span style={{ flex:1,height:1,background:"rgba(255,255,255,0.06)" }} />
          </div>

          {/* Register */}
          <div className="s6">
            <button onClick={onSwitchToRegister} className="rbtn">
              Create an account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Hint */}
          <div className="s6" style={{ display:"flex",alignItems:"flex-start",gap:8,padding:"11px 14px",marginTop:16, background:"rgba(246,201,14,0.03)",border:"1px solid rgba(246,201,14,0.1)",borderRadius:10, fontSize:11,color:"#475569",lineHeight:1.65 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F6C90E" strokeWidth="2" style={{ flexShrink:0,marginTop:1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Login uses your <strong style={{ color:"#F6C90E" }}>Full Name</strong>, not email. Backend on port <strong style={{ color:"#F6C90E" }}>8989</strong>.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
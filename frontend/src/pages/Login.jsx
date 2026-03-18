import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function Login({ onSwitchToRegister, onSwitchToAdminRegister }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [active, setActive] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return toast("Please fill in all fields", "warn");
    setLoading(true);
    try {
      const u = await login(form.username.trim(), form.password);
      toast(`Welcome back, ${u.name}`, "success");
    } catch (err) {
      const m = err.message || "";
      if (m.includes("User not found")) toast("No account found with that name", "error");
      else if (m.includes("Wrong Password") || m.includes("Invalid Access")) toast("Incorrect password", "error");
      else if (m.includes("Cannot connect") || m.includes("Failed to fetch")) toast("Cannot reach server — is backend running?", "error");
      else toast("Sign in failed. Check your details.", "error");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", fontFamily:"'Inter',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        .geo { position:fixed;inset:0;z-index:0;pointer-events:none;
          background-image:linear-gradient(rgba(0,212,170,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,170,0.025) 1px,transparent 1px);
          background-size:56px 56px; }
        .geo::after { content:'';position:absolute;inset:0;
          background:radial-gradient(ellipse 90% 70% at 15% 50%,rgba(0,212,170,0.06) 0%,transparent 55%),
                     radial-gradient(ellipse 60% 80% at 85% 15%,rgba(155,127,255,0.04) 0%,transparent 55%); }
        .panel { transition:opacity 0.7s cubic-bezier(.22,1,.36,1),transform 0.7s cubic-bezier(.22,1,.36,1); }
        .panel-l { opacity:0;transform:translateX(-24px); }
        .panel-r { opacity:0;transform:translateX(24px); }
        .panel-l.in,.panel-r.in { opacity:1;transform:translateX(0); }
        .s1{animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.2s both;}
        .s2{animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.3s both;}
        .s3{animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.38s both;}
        .s4{animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.45s both;}
        .s5{animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.52s both;}
        .s6{animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.58s both;}
        .inp {
          width:100%;padding:13px 14px 13px 44px;border-radius:10px;
          border:1.5px solid var(--border-2);background:var(--surface-2);
          color:var(--text-1);font-size:14px;outline:none;
          transition:border-color 0.2s,box-shadow 0.2s,background 0.2s;
          font-family:'Inter',sans-serif;
        }
        .inp:focus { border-color:var(--teal);box-shadow:0 0 0 3px rgba(0,212,170,0.12);background:rgba(0,212,170,0.03); }
        .inp::placeholder { color:var(--text-4); }
        .sign-btn {
          width:100%;padding:14px;border:none;border-radius:10px;
          background:linear-gradient(135deg,#00D4AA,#00B890);
          color:#040810;font-size:14px;font-weight:700;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:9px;
          box-shadow:0 4px 24px rgba(0,212,170,0.28);
          transition:transform 0.18s,box-shadow 0.18s;letter-spacing:-0.1px;
        }
        .sign-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 36px rgba(0,212,170,0.4);}
        .sign-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .sec-btn {
          width:100%;padding:12px;border:1.5px solid var(--border-2);border-radius:10px;
          background:transparent;color:var(--text-3);font-size:14px;font-weight:500;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
          transition:all 0.2s;
        }
        .sec-btn:hover{border-color:var(--teal);color:var(--teal);background:var(--teal-dim);}
        .stat-pill{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;padding:14px 8px;text-align:center;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
      `}</style>
      <div className="geo"/>

      {/* LEFT — branding */}
      <div className={`panel panel-l ${mounted?"in":""}`}
        style={{ flex:"0 0 52%", position:"relative", zIndex:2, display:"flex", flexDirection:"column", justifyContent:"center", padding:"64px 72px", borderRight:"1px solid var(--border)" }}>

        {/* Logo */}
        <div className="s1" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:60 }}>
          <div style={{ width:40,height:40,borderRadius:11,background:"var(--teal-dim)",border:"1px solid rgba(0,212,170,0.28)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px rgba(0,212,170,0.12)" }}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="url(#lg)"/>
              <path d="M12 16L15 19L21 13" stroke="#040810" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs><linearGradient id="lg" x1="4" y1="2" x2="28" y2="30"><stop stopColor="#00D4AA"/><stop offset="1" stopColor="#00B890"/></linearGradient></defs>
            </svg>
          </div>
          <span style={{ fontSize:16,fontWeight:700,color:"var(--text-1)",letterSpacing:"-0.4px" }}>SmartOuting</span>
        </div>

        {/* Headline */}
        <div className="s2" style={{ fontSize:11,fontWeight:600,color:"var(--teal)",letterSpacing:"2.5px",textTransform:"uppercase",marginBottom:20,display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:24,height:1.5,background:"var(--teal)",borderRadius:2 }}/>
          Campus Exit Management
        </div>
        <h1 className="s3" style={{ fontSize:48,fontWeight:700,color:"var(--text-1)",lineHeight:1.1,letterSpacing:"-2px",marginBottom:20 }}>
          Every exit,<br/>tracked &{" "}
          <span style={{ background:"linear-gradient(135deg,#00D4AA,#9B7FFF,#00D4AA)",backgroundSize:"200%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmer 4s linear infinite",fontStyle:"italic" }}>
            secured.
          </span>
        </h1>
        <p className="s4" style={{ fontSize:15,color:"var(--text-3)",lineHeight:1.8,maxWidth:360,marginBottom:40 }}>
          AI-driven approvals, real-time QR gate scanning, and instant parent notifications.
        </p>

        {/* Stats */}
        <div className="s5" style={{ display:"flex",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden",marginBottom:32,maxWidth:380 }}>
          {[{v:"AI",l:"Urgency Scoring"},{v:"QR",l:"Gate Scanning"},{v:"24/7",l:"Monitoring"}].map((s,i)=>(
            <div key={s.v} className="stat-pill" style={{ borderRight:i<2?"1px solid var(--border)":"none" }}>
              <div style={{ fontSize:18,fontWeight:700,color:"var(--teal)",letterSpacing:"-0.5px" }}>{s.v}</div>
              <div style={{ fontSize:10,color:"var(--text-4)",fontWeight:500,letterSpacing:"0.3px" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Role pills */}
        <div className="s6" style={{ display:"flex",gap:8 }}>
          {[
            {icon:"⬡",label:"Students",  c:"var(--teal)",  b:"rgba(0,212,170,0.08)",  bd:"rgba(0,212,170,0.18)"},
            {icon:"⬡",label:"Wardens",   c:"var(--purple)",b:"rgba(155,127,255,0.08)",bd:"rgba(155,127,255,0.18)"},
            {icon:"⬡",label:"Guards",    c:"var(--green)", b:"rgba(31,209,122,0.08)", bd:"rgba(31,209,122,0.18)"},
          ].map(r=>(
            <div key={r.label} style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:99,background:r.b,border:`1px solid ${r.bd}`,fontSize:12,fontWeight:600,color:r.c }}>
              {r.label}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ width:1,flexShrink:0,zIndex:2,background:"linear-gradient(to bottom,transparent,var(--border) 20%,var(--border) 80%,transparent)" }}/>

      {/* RIGHT — form */}
      <div className={`panel panel-r ${mounted?"in":""}`}
        style={{ flex:1,position:"relative",zIndex:2,display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 60px" }}>
        <div style={{ width:"100%",maxWidth:360 }}>

          <div className="s2" style={{ marginBottom:36 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:7,padding:"5px 12px",borderRadius:8,background:"var(--surface-2)",border:"1px solid var(--border-2)",color:"var(--text-3)",fontSize:11,fontWeight:600,marginBottom:20,letterSpacing:"0.5px" }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:"var(--teal)",animation:"pulse 2s ease-in-out infinite" }}/>
              SECURE PORTAL
            </div>
            <h2 style={{ fontSize:30,fontWeight:700,color:"var(--text-1)",letterSpacing:"-1px",marginBottom:8 }}>Welcome back</h2>
            <p style={{ fontSize:14,color:"var(--text-3)",lineHeight:1.6 }}>Sign in with your registered name to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:16 }}>

            <div className="s3" style={{ display:"flex",flexDirection:"column",gap:7 }}>
              <label style={{ fontSize:11,fontWeight:600,color:"var(--text-3)",letterSpacing:"0.8px",textTransform:"uppercase" }}>Full Name</label>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:active==="username"?"var(--teal)":"var(--text-4)",transition:"color 0.2s",display:"flex" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <input name="username" value={form.username} onChange={handleChange} onFocus={()=>setActive("username")} onBlur={()=>setActive("")} placeholder="e.g. Rahul Sharma" autoComplete="username" className="inp"/>
                {form.username && (
                  <div style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",width:18,height:18,borderRadius:"50%",background:"rgba(31,209,122,0.15)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                )}
              </div>
            </div>

            <div className="s4" style={{ display:"flex",flexDirection:"column",gap:7 }}>
              <label style={{ fontSize:11,fontWeight:600,color:"var(--text-3)",letterSpacing:"0.8px",textTransform:"uppercase" }}>Password</label>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:active==="password"?"var(--teal)":"var(--text-4)",transition:"color 0.2s",display:"flex" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input name="password" type={showPass?"text":"password"} value={form.password} onChange={handleChange} onFocus={()=>setActive("password")} onBlur={()=>setActive("")} placeholder="Your password" autoComplete="current-password" className="inp" style={{ paddingRight:46 }}/>
                <button type="button" onClick={()=>setShowPass(p=>!p)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",color:"var(--text-4)" }}>
                  {showPass
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <div className="s5">
              <button type="submit" disabled={loading} className="sign-btn">
                {loading
                  ? <><span style={{ width:16,height:16,border:"2px solid rgba(4,8,16,0.3)",borderTopColor:"#040810",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }}/> Signing in</>
                  : <>Sign In <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                }
              </button>
            </div>
          </form>

          <div className="s6" style={{ display:"flex",alignItems:"center",gap:12,margin:"24px 0 16px" }}>
            <span style={{ flex:1,height:1,background:"var(--border)" }}/>
            <span style={{ fontSize:11,color:"var(--text-4)",letterSpacing:"0.5px" }}>don't have an account?</span>
            <span style={{ flex:1,height:1,background:"var(--border)" }}/>
          </div>

          <div className="s6">
            <button onClick={onSwitchToRegister} className="sec-btn">
              Create account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div style={{ textAlign:"center",marginTop:20 }}>
            <button onClick={onSwitchToAdminRegister} style={{ background:"none",border:"none",color:"var(--text-4)",fontSize:11,cursor:"pointer",letterSpacing:"0.3px",opacity:0.6 }}>Admin Registration</button>
          </div>
        </div>
      </div>
    </div>
  );
}

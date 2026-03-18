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
    width:"100%", padding:"14px 16px 14px 46px", borderRadius:12,
    border: `1.5px solid ${active===name ? "var(--accent)" : "var(--border-2)"}`,
    background: "#fff",
    boxShadow: active===name ? "0 0 0 4px rgba(108,92,231,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
    color:"var(--text-1)", fontSize:15, outline:"none", transition:"all 0.2s",
  });

  return (
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"'Inter',sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{`
        ::placeholder { color: var(--text-4) !important; }
        .fade-in { opacity:0; transform:translateY(20px); transition:opacity 0.7s ease,transform 0.7s ease; }
        .fade-in.show { opacity:1; transform:translateY(0); }
        @keyframes fadeUp { to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      {/* LEFT — Hero Panel with gradient */}
      <div className={`fade-in ${mounted?"show":""}`} style={{
        flex:"0 0 48%", position:"relative", zIndex:2,
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"60px 64px",
        background:"linear-gradient(135deg, #6C5CE7 0%, #a29bfe 50%, #fd79a8 100%)",
        color:"#fff",
        overflow:"hidden",
      }}>
        {/* Decorative circles */}
        <div style={{position:"absolute",top:"-10%",right:"-15%",width:300,height:300,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}}/>
        <div style={{position:"absolute",bottom:"-20%",left:"-10%",width:400,height:400,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
        <div style={{position:"absolute",top:"30%",right:"10%",width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.06)",animation:"float 4s ease-in-out infinite"}}/>

        {/* Brand */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:52,position:"relative",zIndex:1}}>
          <div style={{width:42,height:42,borderRadius:12,background:"rgba(255,255,255,0.2)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="#fff"/>
              <path d="M12 16L15 19L21 13" stroke="#6C5CE7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{fontSize:18,fontWeight:800,letterSpacing:"-0.5px"}}>SmartOuting</span>
        </div>

        {/* Headline */}
        <h1 style={{fontSize:44,fontWeight:900,lineHeight:1.1,letterSpacing:"-2px",marginBottom:20,position:"relative",zIndex:1}}>
          Every exit,<br/>tracked &<br/>secured.
        </h1>

        <p style={{fontSize:16,lineHeight:1.7,opacity:0.85,maxWidth:360,marginBottom:40,position:"relative",zIndex:1}}>
          Smart approvals, real-time QR gate scanning, and instant parent notifications.
        </p>

        {/* Feature cards */}
        <div style={{display:"flex",gap:12,position:"relative",zIndex:1}}>
          {[{v:"AI",l:"Detection"},{v:"QR",l:"Scanning"},{v:"24/7",l:"Monitoring"}].map(s=>(
            <div key={s.v} style={{padding:"14px 20px",background:"rgba(255,255,255,0.15)",backdropFilter:"blur(10px)",borderRadius:12,border:"1px solid rgba(255,255,255,0.2)",textAlign:"center",flex:1}}>
              <div style={{fontSize:18,fontWeight:800,marginBottom:2,fontFamily:"'JetBrains Mono',monospace"}}>{s.v}</div>
              <div style={{fontSize:11,opacity:0.75,fontWeight:500}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Role tags */}
        <div style={{display:"flex",gap:8,marginTop:24,position:"relative",zIndex:1}}>
          {["Students","Wardens","Guards"].map(r=>(
            <span key={r} style={{padding:"6px 14px",borderRadius:99,fontSize:12,fontWeight:600,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)"}}>{r}</span>
          ))}
        </div>
      </div>

      {/* RIGHT — Form Panel */}
      <div className={`fade-in ${mounted?"show":""}`} style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px 52px", background:"var(--bg)",
        transition:"opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
      }}>
        <div style={{width:"100%",maxWidth:400}}>

          {/* Header */}
          <div style={{marginBottom:32}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:99,background:"var(--accent-dim)",color:"var(--accent)",fontSize:12,fontWeight:600,marginBottom:20}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"var(--green)"}}/>
              Secure Portal
            </div>
            <h2 style={{fontSize:28,fontWeight:800,color:"var(--text-1)",letterSpacing:"-1px",marginBottom:8}}>Welcome back</h2>
            <p style={{fontSize:15,color:"var(--text-3)",lineHeight:1.5}}>Sign in with your registered name to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:18}}>
            {/* Username */}
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              <label style={{fontSize:14,fontWeight:600,color:"var(--text-1)"}}>Full Name</label>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:active==="username"?"var(--accent)":"var(--text-4)",transition:"color 0.2s",display:"flex"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <input name="username" value={form.username} onChange={handleChange}
                  onFocus={()=>setActive("username")} onBlur={()=>setActive("")}
                  placeholder="e.g. Rahul Sharma" autoComplete="username"
                  style={inputStyle("username")}/>
              </div>
            </div>

            {/* Password */}
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              <label style={{fontSize:14,fontWeight:600,color:"var(--text-1)"}}>Password</label>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:active==="password"?"var(--accent)":"var(--text-4)",transition:"color 0.2s",display:"flex"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input name="password" type={showPass?"text":"password"} value={form.password} onChange={handleChange}
                  onFocus={()=>setActive("password")} onBlur={()=>setActive("")}
                  placeholder="Your password" autoComplete="current-password"
                  style={{...inputStyle("password"),paddingRight:46}}/>
                <button type="button" onClick={()=>setShowPass(p=>!p)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",borderRadius:6,color:"var(--text-4)"}}>
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width:"100%", padding:"14px", border:"none", borderRadius:12,
              background:"var(--accent)", color:"#fff", fontSize:15, fontWeight:700,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 14px rgba(108,92,231,0.35)",
              transition:"all 0.2s", opacity:loading?0.7:1, marginTop:4,
            }}>
              {loading
                ? <><span style={{width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/> Signing in...</>
                : <>Sign In <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:14,margin:"24px 0 18px"}}>
            <span style={{flex:1,height:"1px",background:"var(--border-2)"}}/>
            <span style={{fontSize:13,color:"var(--text-4)"}}>or</span>
            <span style={{flex:1,height:"1px",background:"var(--border-2)"}}/>
          </div>

          <button onClick={onSwitchToRegister} style={{
            width:"100%", padding:"13px", border:"1.5px solid var(--border-2)",
            borderRadius:12, background:"#fff", color:"var(--text-2)", fontSize:14, fontWeight:600,
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            transition:"all 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
          }}>
            Create account
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

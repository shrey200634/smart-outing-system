import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const ROLES = [
  { value:"STUDENT", label:"Student",    desc:"Apply for campus outings & track requests",  gradient:"linear-gradient(135deg, #6C5CE7, #a29bfe)", iconBg:"rgba(108,92,231,0.1)" },
  { value:"WARDEN",  label:"Warden",     desc:"Review, approve & monitor student activity", gradient:"linear-gradient(135deg, #00b894, #55efc4)", iconBg:"rgba(0,184,148,0.1)" },
  { value:"GUARD",   label:"Gate Guard",  desc:"Verify QR codes at campus entry & exit",    gradient:"linear-gradient(135deg, #fd79a8, #e84393)", iconBg:"rgba(232,67,147,0.1)" },
];

const RoleIcon = ({ role, size = 20 }) => {
  const icons = {
    STUDENT: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>,
    WARDEN: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 0v1a3 3 0 0 0 6 0V7m0 0v1a3 3 0 0 0 6 0V7M3 7l9-4 9 4"/><path d="M6 21V11m12 10V11"/></svg>,
    GUARD: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  };
  return icons[role] || null;
};

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const { toast }    = useToast();

  const [step, setStep]             = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm]             = useState({ name:"", email:"", password:"", confirmPassword:"" });
  const [loading, setLoading]       = useState(false);
  const [focused, setFocused]       = useState("");
  const [showPass, setShowPass]     = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const proceedToDetails = () => {
    if (!selectedRole) return toast("Please select your role to continue", "warn");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.name.trim())                               return toast("Name is required", "warn");
    if (!form.email.trim() || !form.email.includes("@")) return toast("Valid email required", "warn");
    if (form.password.length < 6)                        return toast("Password must be at least 6 characters", "warn");
    if (form.password !== form.confirmPassword)          return toast("Passwords do not match", "error");
    setLoading(true);
    try {
      await register({ name:form.name.trim(), email:form.email.trim().toLowerCase(), password:form.password, role:selectedRole.value });
      toast("Account created! Sign in with your full name.", "success");
      setTimeout(() => onSwitchToLogin(), 1200);
    } catch (err) {
      const m = err.message || "";
      if (m.toLowerCase().includes("exist") || m.toLowerCase().includes("duplicate") || m.includes("1062"))
        toast("An account with this email already exists.", "error");
      else if (m.includes("Cannot connect") || m.includes("Failed to fetch"))
        toast("Cannot connect to server. Please try again.", "error");
      else toast(m || "Registration failed.", "error");
    } finally { setLoading(false); }
  };

  const pwStrength = () => { const l=form.password.length; if(!l)return 0; if(l<4)return 1; if(l<6)return 2; if(l<10)return 3; return 4; };
  const strColors = ["","#E74C3C","#F39C12","#F0A500","#00B894"];

  const inputStyle = (name) => ({
    width:"100%", padding:"13px 16px 13px 44px",
    background: "#fff",
    border: `1.5px solid ${focused===name ? "var(--accent)" : "var(--border-2)"}`,
    boxShadow: focused===name ? "0 0 0 4px rgba(108,92,231,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
    borderRadius:12, color:"var(--text-1)", fontSize:14, outline:"none", transition:"all 0.2s",
  });

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",padding:20}}>
      <style>{`
        ::placeholder { color:var(--text-4) !important; }
        @keyframes cardIn { from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{position:"relative",background:"#fff",border:"1px solid var(--border)",borderRadius:20,padding:"40px 40px",width:"100%",maxWidth:480,boxShadow:"0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",animation:"cardIn 0.5s ease"}}>

        {/* Brand */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
          <div style={{width:38,height:38,borderRadius:10,background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="#fff"/>
              <path d="M12 16L15 19L21 13" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"var(--text-1)"}}>SmartOuting</div>
            <div style={{fontSize:11,color:"var(--text-3)",marginTop:1}}>Campus Management</div>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:28}}>
          {[{n:1,label:"Choose Role"},{n:2,label:"Your Details"}].map(({n,label},i) => (
            <div key={n} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,transition:"all 0.3s",
                background:step>=n?"var(--accent)":"var(--bg-3)",
                color:step>=n?"#fff":"var(--text-4)",
              }}>
                {step>n ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg> : n}
              </div>
              <span style={{fontSize:13,fontWeight:step>=n?600:400,color:step>=n?"var(--text-1)":"var(--text-4)"}}>{label}</span>
              {i<1 && <div style={{width:32,height:2,background:step>n?"var(--accent)":"var(--bg-4)",margin:"0 4px",borderRadius:2,transition:"background 0.3s"}}/>}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h1 style={{fontSize:24,fontWeight:800,color:"var(--text-1)",marginBottom:6}}>Who are you?</h1>
            <p style={{fontSize:14,color:"var(--text-3)",marginBottom:24}}>Select your role to get started</p>

            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
              {ROLES.map(r => {
                const isSelected = selectedRole?.value===r.value;
                return (
                  <button key={r.value} onClick={() => setSelectedRole(r)}
                    style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",border:`2px solid ${isSelected?"var(--accent)":"var(--border)"}`,borderRadius:14,cursor:"pointer",textAlign:"left",background:isSelected?"var(--accent-dim)":"#fff",transition:"all 0.2s",width:"100%",fontFamily:"'Inter',sans-serif",boxShadow:isSelected?"0 0 0 4px rgba(108,92,231,0.06)":"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <div style={{width:42,height:42,borderRadius:12,background:r.gradient,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}>
                      <RoleIcon role={r.value} size={20} />
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:700,color:"var(--text-1)",marginBottom:3}}>{r.label}</div>
                      <div style={{fontSize:12,color:"var(--text-3)",lineHeight:1.4}}>{r.desc}</div>
                    </div>
                    {isSelected && (
                      <div style={{width:22,height:22,borderRadius:"50%",background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button onClick={proceedToDetails} style={{
              width:"100%",padding:"14px",border:"none",borderRadius:12,
              background:selectedRole?"var(--accent)":"var(--bg-4)",
              color:selectedRole?"#fff":"var(--text-4)",fontSize:15,fontWeight:700,
              cursor:selectedRole?"pointer":"default",
              boxShadow:selectedRole?"0 4px 14px rgba(108,92,231,0.3)":"none",
              transition:"all 0.2s",
            }}>
              {selectedRole ? `Continue as ${selectedRole.label}` : "Select a role to continue"}
            </button>

            <div style={{textAlign:"center",marginTop:20}}>
              <span style={{color:"var(--text-3)",fontSize:14}}>Already have an account? </span>
              <button onClick={onSwitchToLogin} style={{background:"none",border:"none",color:"var(--accent)",fontSize:14,fontWeight:700,cursor:"pointer"}}>Sign in</button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <button onClick={() => setStep(1)}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",marginBottom:20,padding:"12px 16px",borderRadius:12,cursor:"pointer",textAlign:"left",background:"var(--accent-dim)",border:`1.5px solid rgba(108,92,231,0.15)`}}>
              <div style={{width:32,height:32,borderRadius:8,background:selectedRole.gradient,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
                <RoleIcon role={selectedRole.value} size={16} />
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--accent)"}}>Registering as {selectedRole.label}</div>
                <div style={{fontSize:11,color:"var(--text-3)",marginTop:1}}>Click to change role</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            <h1 style={{fontSize:24,fontWeight:800,color:"var(--text-1)",marginBottom:6}}>Create your account</h1>
            <p style={{fontSize:14,color:"var(--text-3)",marginBottom:24}}>Fill in your details below</p>

            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <label style={{display:"block",fontSize:14,fontWeight:600,color:"var(--text-1)",marginBottom:7}}>Full Name</label>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:focused==="name"?"var(--accent)":"var(--text-4)",pointerEvents:"none",display:"flex",transition:"color 0.2s"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <input name="name" value={form.name} onChange={handleChange} onFocus={()=>setFocused("name")} onBlur={()=>setFocused("")} placeholder="John Doe" style={inputStyle("name")}/>
                </div>
                <p style={{fontSize:12,color:"var(--text-3)",marginTop:5}}>This name will be used to sign in</p>
              </div>

              <div>
                <label style={{display:"block",fontSize:14,fontWeight:600,color:"var(--text-1)",marginBottom:7}}>Email Address</label>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:focused==="email"?"var(--accent)":"var(--text-4)",pointerEvents:"none",display:"flex",transition:"color 0.2s"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <input name="email" type="email" value={form.email} onChange={handleChange} onFocus={()=>setFocused("email")} onBlur={()=>setFocused("")} placeholder="john@example.com" style={inputStyle("email")}/>
                </div>
              </div>

              <div>
                <label style={{display:"block",fontSize:14,fontWeight:600,color:"var(--text-1)",marginBottom:7}}>Password</label>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:focused==="password"?"var(--accent)":"var(--text-4)",pointerEvents:"none",display:"flex",transition:"color 0.2s"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input name="password" type={showPass?"text":"password"} value={form.password} onChange={handleChange} onFocus={()=>setFocused("password")} onBlur={()=>setFocused("")} placeholder="Min. 6 characters" style={{...inputStyle("password"),paddingRight:46}}/>
                  <button type="button" onClick={()=>setShowPass(p=>!p)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:4,color:"var(--text-4)",display:"flex"}}>
                    {showPass
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {form.password && (
                  <div style={{display:"flex",gap:4,marginTop:8}}>
                    {[1,2,3,4].map(i=>(
                      <div key={i} style={{flex:1,height:3,borderRadius:99,background:pwStrength()>=i?strColors[pwStrength()]:"var(--bg-4)",transition:"background 0.3s"}}/>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{display:"block",fontSize:14,fontWeight:600,color:"var(--text-1)",marginBottom:7}}>Confirm Password</label>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"var(--text-4)",pointerEvents:"none",display:"flex"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </span>
                  <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} onFocus={()=>setFocused("confirm")} onBlur={()=>setFocused("")} placeholder="Re-enter password"
                    style={{...inputStyle("confirm"),borderColor:form.confirmPassword&&form.password!==form.confirmPassword?"var(--red)":focused==="confirm"?"var(--accent)":"var(--border-2)"}}/>
                </div>
              </div>

              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button onClick={()=>setStep(1)} style={{padding:"13px 20px",background:"#fff",border:"1.5px solid var(--border-2)",borderRadius:12,color:"var(--text-2)",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>Back</button>
                <button onClick={handleSubmit} disabled={loading} style={{flex:1,padding:"13px",background:"var(--accent)",border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(108,92,231,0.3)",opacity:loading?0.7:1,fontFamily:"'Inter',sans-serif"}}>
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </div>

            <div style={{textAlign:"center",marginTop:20}}>
              <span style={{color:"var(--text-3)",fontSize:14}}>Already have an account? </span>
              <button onClick={onSwitchToLogin} style={{background:"none",border:"none",color:"var(--accent)",fontSize:14,fontWeight:700,cursor:"pointer"}}>Sign in</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

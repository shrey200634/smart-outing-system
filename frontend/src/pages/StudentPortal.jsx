import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { outingAPI } from "../utils/api";
import { useToast } from "../components/Toast";

const STATUS = {
  PENDING:  { color:"var(--amber)",  bg:"rgba(245,166,35,0.1)",  border:"rgba(245,166,35,0.22)"  },
  APPROVED: { color:"var(--green)",  bg:"rgba(31,209,122,0.1)",  border:"rgba(31,209,122,0.22)"  },
  OUT:      { color:"var(--blue)",   bg:"rgba(77,159,255,0.1)",  border:"rgba(77,159,255,0.22)"  },
  OVERDUE:  { color:"var(--red)",    bg:"rgba(255,92,92,0.1)",   border:"rgba(255,92,92,0.22)"   },
  RETURNED: { color:"var(--text-3)", bg:"rgba(107,122,153,0.1)", border:"rgba(107,122,153,0.22)" },
};

const AI_COLORS = {
  MEDICAL_EMERGENCY:"var(--red)", MEDICAL:"var(--amber)", HEALTH:"var(--amber)",
  ACADEMIC_PRIORITY:"var(--blue)", ACADEMIC:"var(--blue)", FAMILY_EMERGENCY:"var(--purple)",
  FAMILY:"var(--purple)", PERSONAL_LEISURE:"var(--text-3)", UNCATEGORIZED:"var(--text-3)",
};

function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.PENDING;
  return <span style={{ padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,letterSpacing:"0.7px",textTransform:"uppercase",background:s.bg,color:s.color,border:`1px solid ${s.border}` }}>{status}</span>;
}

function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", { dateStyle:"medium", timeStyle:"short" });
}

const NAV = [
  { id:"apply", label:"Apply for Outing",
    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7-7 7 7"/></svg> },
  { id:"history", label:"My Requests",
    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
];

export default function StudentPortal() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [tab, setTab]         = useState("apply");
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [focused, setFocused] = useState("");

  const minDT = new Date(Date.now() + 60000).toISOString().slice(0,16);
  const [form, setForm] = useState({ studentId:user?.name||"", studentName:user?.name||"", parentEmail:"", reason:"", destination:"", outDate:"", returnDate:"" });
  const handleChange = (e) => setForm(p=>({...p,[e.target.name]:e.target.value}));

  const loadHistory = async (id) => {
    const sid = id || form.studentId;
    if (!sid?.trim()) return toast("Enter a Student ID", "warn");
    setHistLoading(true);
    try { const d = await outingAPI.getStudentHistory(sid.trim()); setHistory(Array.isArray(d)?d:[]); }
    catch (e) { toast("Could not load: "+e.message,"error"); setHistory([]); }
    finally { setHistLoading(false); }
  };

  const goHistory = () => { setTab("history"); loadHistory(user?.name); };

  const handleApply = async (e) => {
    e.preventDefault();
    const req = ["studentId","studentName","parentEmail","reason","destination","outDate","returnDate"];
    for (const f of req) if (!form[f]) return toast(`${f.replace(/([A-Z])/g," $1")} is required`,"warn");
    if (!form.parentEmail.includes("@")) return toast("Invalid parent email","warn");
    if (new Date(form.outDate)>=new Date(form.returnDate)) return toast("Return must be after out date","warn");
    setSubmitting(true);
    try {
      await outingAPI.apply({...form, outDate:new Date(form.outDate).toISOString(), returnDate:new Date(form.returnDate).toISOString()});
      toast("Request submitted — AI is analysing","success");
      setForm(p=>({...p,reason:"",destination:"",outDate:"",returnDate:"",parentEmail:""}));
      goHistory();
    } catch(err) {
      const m=err.message||"";
      if(m.includes("active")||m.includes("APPROVED")) toast("You already have an active outing request","warn");
      else if(m.includes("banned")||m.includes("Denied")) toast("Access denied — contact the warden","error");
      else toast(m,"error");
    } finally { setSubmitting(false); }
  };

  const inp = (name,extra={}) => ({
    width:"100%",padding:"11px 14px",background:focused===name?"rgba(0,212,170,0.03)":"var(--surface-2)",
    border:`1.5px solid ${focused===name?"var(--teal)":"var(--border-2)"}`,
    boxShadow:focused===name?"0 0 0 3px rgba(0,212,170,0.1)":"none",
    borderRadius:9,color:"var(--text-1)",fontSize:14,outline:"none",
    transition:"all 0.2s",fontFamily:"'Inter',sans-serif",...extra
  });

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"var(--bg)",fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        input,textarea{color-scheme:dark;}
        input::placeholder,textarea::placeholder{color:var(--text-4);}
        input[type=datetime-local]::-webkit-calendar-picker-indicator{filter:invert(0.5) sepia(1) saturate(5) hue-rotate(130deg);cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .nav-item{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:8px;border:1px solid transparent;background:none;color:var(--text-3);font-size:13px;font-weight:500;cursor:pointer;transition:all 0.18s;text-align:left;width:100%;font-family:'Inter',sans-serif;}
        .nav-item:hover{background:var(--surface-2);color:var(--text-1);}
        .nav-item.on{background:var(--teal-dim);color:var(--teal);border-color:rgba(0,212,170,0.18);font-weight:600;}
        .card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:22px 24px;transition:border-color 0.2s;animation:fadeUp 0.3s ease both;}
        .card:hover{border-color:var(--border-2);}
        .submit-btn{padding:12px 24px;background:linear-gradient(135deg,#00D4AA,#00B890);border:none;border-radius:9px;color:#040810;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:0 4px 18px rgba(0,212,170,0.28);transition:all 0.2s;font-family:'Inter',sans-serif;}
        .submit-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,212,170,0.38);}
        .submit-btn:disabled{opacity:0.6;cursor:not-allowed;}
      `}</style>

      {/* Sidebar */}
      <aside style={{ width:240,background:"var(--surface)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"22px 14px",position:"sticky",top:0,height:"100vh",flexShrink:0 }}>
        <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
          {/* Brand */}
          <div style={{ display:"flex",alignItems:"center",gap:9,padding:"0 4px",marginBottom:4 }}>
            <div style={{ width:32,height:32,borderRadius:8,background:"var(--teal-dim)",border:"1px solid rgba(0,212,170,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="url(#sb1)"/><path d="M12 16L15 19L21 13" stroke="#040810" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><defs><linearGradient id="sb1" x1="4" y1="2" x2="28" y2="30"><stop stopColor="#00D4AA"/><stop offset="1" stopColor="#00B890"/></linearGradient></defs></svg>
            </div>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:"var(--text-1)",letterSpacing:"-0.3px" }}>SmartOuting</div>
              <div style={{ fontSize:10,color:"var(--text-4)",marginTop:1 }}>Student Portal</div>
            </div>
          </div>

          {/* User card */}
          <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"var(--surface-2)",borderRadius:10,border:"1px solid var(--border)" }}>
            <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#00D4AA,#00B890)",color:"#040810",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              {user?.name?.[0]?.toUpperCase()||"S"}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ color:"var(--text-1)",fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.name}</div>
              <div style={{ color:"var(--text-4)",fontSize:11,marginTop:1 }}>Student</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display:"flex",flexDirection:"column",gap:2 }}>
            {NAV.map(item=>(
              <button key={item.id} className={`nav-item${tab===item.id?" on":""}`}
                onClick={()=>item.id==="history"?goHistory():setTab(item.id)}>
                {item.icon}{item.label}
              </button>
            ))}
          </nav>
        </div>

        <button onClick={logout} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:8,border:"1px solid rgba(255,92,92,0.18)",background:"rgba(255,92,92,0.06)",color:"var(--red)",fontSize:13,cursor:"pointer",width:"100%",fontFamily:"'Inter',sans-serif" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex:1,overflow:"auto",padding:"36px 44px" }}>
        <div style={{ maxWidth:820,margin:"0 auto" }}>

          {/* APPLY TAB */}
          {tab==="apply" && (
            <div style={{ animation:"fadeUp 0.35s ease" }}>
              <div style={{ marginBottom:28 }}>
                <h1 style={{ fontSize:22,fontWeight:700,color:"var(--text-1)",letterSpacing:"-0.5px",marginBottom:4 }}>Apply for Outing</h1>
                <p style={{ color:"var(--text-3)",fontSize:13 }}>Submit a request — AI will analyse urgency automatically</p>
              </div>

              <form onSubmit={handleApply}>
                <div style={{ background:"var(--surface)",border:"1px solid var(--border-2)",borderRadius:14,padding:26 }}>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18 }}>
                    {[
                      {label:"Student ID",name:"studentId",placeholder:"Your ID"},
                      {label:"Full Name",name:"studentName",placeholder:"Your full name"},
                    ].map(f=>(
                      <div key={f.name}>
                        <label style={{ display:"block",fontSize:11,fontWeight:600,color:"var(--text-3)",letterSpacing:"0.7px",textTransform:"uppercase",marginBottom:7 }}>{f.label}</label>
                        <input name={f.name} value={form[f.name]} onChange={handleChange} onFocus={()=>setFocused(f.name)} onBlur={()=>setFocused("")} placeholder={f.placeholder} style={inp(f.name)}/>
                      </div>
                    ))}
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={{ display:"block",fontSize:11,fontWeight:600,color:"var(--text-3)",letterSpacing:"0.7px",textTransform:"uppercase",marginBottom:7 }}>Parent / Guardian Email</label>
                      <input name="parentEmail" type="email" value={form.parentEmail} onChange={handleChange} onFocus={()=>setFocused("parentEmail")} onBlur={()=>setFocused("")} placeholder="parent@email.com" style={inp("parentEmail")}/>
                    </div>
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={{ display:"block",fontSize:11,fontWeight:600,color:"var(--text-3)",letterSpacing:"0.7px",textTransform:"uppercase",marginBottom:7 }}>Destination</label>
                      <input name="destination" value={form.destination} onChange={handleChange} onFocus={()=>setFocused("destination")} onBlur={()=>setFocused("")} placeholder="Where are you going?" style={inp("destination")}/>
                    </div>
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={{ display:"block",fontSize:11,fontWeight:600,color:"var(--text-3)",letterSpacing:"0.7px",textTransform:"uppercase",marginBottom:7 }}>Reason for Outing</label>
                      <textarea name="reason" value={form.reason} onChange={handleChange} onFocus={()=>setFocused("reason")} onBlur={()=>setFocused("")} placeholder="Describe your reason in detail — AI will assess urgency" rows={3}
                        style={{...inp("reason"),resize:"vertical",lineHeight:1.6}}/>
                    </div>
                    <div>
                      <label style={{ display:"block",fontSize:11,fontWeight:600,color:"var(--text-3)",letterSpacing:"0.7px",textTransform:"uppercase",marginBottom:7 }}>Out Date & Time</label>
                      <input name="outDate" type="datetime-local" value={form.outDate} onChange={handleChange} onFocus={()=>setFocused("outDate")} onBlur={()=>setFocused("")} min={minDT} style={inp("outDate")}/>
                    </div>
                    <div>
                      <label style={{ display:"block",fontSize:11,fontWeight:600,color:"var(--text-3)",letterSpacing:"0.7px",textTransform:"uppercase",marginBottom:7 }}>Return Date & Time</label>
                      <input name="returnDate" type="datetime-local" value={form.returnDate} onChange={handleChange} onFocus={()=>setFocused("returnDate")} onBlur={()=>setFocused("")} min={minDT} style={inp("returnDate")}/>
                    </div>
                  </div>

                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap",paddingTop:18,borderTop:"1px solid var(--border)" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"var(--teal-dim)",border:"1px solid rgba(0,212,170,0.18)",borderRadius:9,flex:1 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                      <span style={{ fontSize:13,color:"var(--text-3)" }}>Your request will be <strong style={{ color:"var(--teal)" }}>AI-analysed</strong> for urgency before reaching the warden</span>
                    </div>
                    <button type="submit" disabled={submitting} className="submit-btn">
                      {submitting?"Submitting...":"Submit Request →"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* HISTORY TAB */}
          {tab==="history" && (
            <div style={{ animation:"fadeUp 0.35s ease" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:14 }}>
                <div>
                  <h1 style={{ fontSize:22,fontWeight:700,color:"var(--text-1)",letterSpacing:"-0.5px",marginBottom:4 }}>My Requests</h1>
                  <p style={{ color:"var(--text-3)",fontSize:13 }}>{history.length} request{history.length!==1?"s":""} total</p>
                </div>
                <div style={{ display:"flex",gap:9,alignItems:"center" }}>
                  <input value={form.studentId} onChange={e=>setForm(p=>({...p,studentId:e.target.value}))} placeholder="Student ID" style={{ padding:"9px 13px",background:"var(--surface-2)",border:"1.5px solid var(--border-2)",borderRadius:9,color:"var(--text-1)",fontSize:13,outline:"none",width:160,fontFamily:"'Inter',sans-serif" }}/>
                  <button onClick={()=>loadHistory()} disabled={histLoading} style={{ padding:"9px 16px",background:"var(--teal-dim)",border:"1.5px solid rgba(0,212,170,0.22)",borderRadius:9,color:"var(--teal)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap" }}>
                    {histLoading?"Loading...":"Search"}
                  </button>
                </div>
              </div>

              {histLoading && (
                <div style={{ textAlign:"center",padding:48 }}>
                  <div style={{ width:28,height:28,border:"2px solid var(--border-2)",borderTopColor:"var(--teal)",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px" }}/>
                  <p style={{ color:"var(--text-3)",fontSize:13 }}>Loading requests...</p>
                </div>
              )}

              {!histLoading && history.length===0 && (
                <div style={{ textAlign:"center",padding:"64px 20px",background:"var(--surface)",borderRadius:14,border:"1px dashed var(--border-2)" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth="1.5" style={{ margin:"0 auto 14px",display:"block" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <div style={{ color:"var(--text-2)",fontWeight:600,marginBottom:6 }}>No requests found</div>
                  <div style={{ color:"var(--text-3)",fontSize:13 }}>Apply for your first outing or check your Student ID</div>
                </div>
              )}

              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {history.map(o=>(
                  <div key={o.id} className="card">
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                          <span style={{ fontSize:11,fontWeight:600,color:"var(--teal)",fontVariantNumeric:"tabular-nums" }}>#{o.id}</span>
                          <span style={{ fontSize:15,fontWeight:700,color:"var(--text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{o.destination}</span>
                        </div>
                        <p style={{ color:"var(--text-3)",fontSize:13,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{o.reason}</p>
                      </div>
                      <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0 }}>
                        <StatusPill status={o.status}/>
                        {o.aiFlag && <span style={{ fontSize:11,color:AI_COLORS[o.aiFlag]||"var(--text-3)",fontWeight:600 }}>{o.aiFlag} · {o.urgencyScore}</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex",gap:20,marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)",flexWrap:"wrap",fontSize:12,color:"var(--text-3)" }}>
                      <span>Out: {fmt(o.outDate)}</span>
                      <span>Return: {fmt(o.returnDate)}</span>
                      {o.wardenComment && <span style={{ fontStyle:"italic" }}>"{o.wardenComment}"</span>}
                    </div>
                    {o.qrCodeUrl && o.status==="APPROVED" && (
                      <div style={{ marginTop:14,padding:16,background:"rgba(31,209,122,0.06)",borderRadius:10,border:"1px solid rgba(31,209,122,0.18)",display:"flex",alignItems:"flex-start",gap:16 }}>
                        <img src={o.qrCodeUrl} alt="QR" style={{ width:96,height:96,borderRadius:8,background:"white",padding:4,flexShrink:0 }}/>
                        <div>
                          <div style={{ color:"var(--green)",fontWeight:700,fontSize:13,marginBottom:4 }}>Approved — Show QR at the gate</div>
                          <div style={{ color:"var(--text-3)",fontSize:12 }}>Outing #{o.id}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

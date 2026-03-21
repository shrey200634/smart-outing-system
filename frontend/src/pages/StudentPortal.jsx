import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { outingAPI } from "../utils/api";
import { useToast } from "../components/Toast";

const STATUS_COLORS = {
  PENDING:  { bg: "rgba(240,165,0,0.08)", color: "#D4880F", border: "rgba(240,165,0,0.20)" },
  APPROVED: { bg: "rgba(0,184,148,0.08)", color: "#00B894", border: "rgba(0,184,148,0.20)" },
  OUT:      { bg: "rgba(45,212,191,0.08)", color: "#2DD4BF", border: "rgba(45,212,191,0.20)" },
  OVERDUE:  { bg: "rgba(231,76,60,0.08)", color: "#E74C3C", border: "rgba(231,76,60,0.20)" },
  RETURNED: { bg: "rgba(138,138,138,0.08)", color: "#8A8A8A", border: "rgba(138,138,138,0.20)" },
  REJECTED: { bg: "rgba(192,57,43,0.08)", color: "#C0392B", border: "rgba(192,57,43,0.20)" },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  return <span style={{ padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,background:c.bg,color:c.color,border:`1px solid ${c.border}` }}>{status}</span>;
}

const AI_FLAG_STYLES = {
  MEDICAL_EMERGENCY:{bg:"#C0392B",label:"Medical Emergency"},
  MEDICAL:{bg:"#E74C3C",label:"Medical"},
  HEALTH:{bg:"#E67E22",label:"Health"},
  FAMILY_EMERGENCY:{bg:"#8E44AD",label:"Family Emergency"},
  FAMILY:{bg:"#9B59B6",label:"Family"},
  ACADEMIC_PRIORITY:{bg:"#2980B9",label:"Academic Priority"},
  ACADEMIC:{bg:"#3498DB",label:"Academic"},
  PERSONAL_LEISURE:{bg:"#1ABC9C",label:"Personal"},
  SUSPICIOUS:{bg:"#6C5CE7",label:"Suspicious"},
  INSUFFICIENT_INFO:{bg:"#95A5A6",label:"Insufficient Info"},
  UNCATEGORIZED:{bg:"#7F8C8D",label:"Uncategorized"},
};
function AiFlagBadge({flag,score}) {
  if(!flag)return null;
  const s=AI_FLAG_STYLES[flag]||{bg:"#8A8A8A",label:flag};
  return <span style={{padding:"4px 12px",borderRadius:99,fontSize:10,fontWeight:700,background:s.bg,color:"#fff",letterSpacing:"0.3px",boxShadow:`0 2px 8px ${s.bg}40`}}>{s.label} &middot; {score}</span>;
}

function formatDT(dt) {
  if (!dt) return "\u2014";
  try { return new Date(dt).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}); } catch { return "\u2014"; }
}

export default function StudentPortal() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("apply");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const now = new Date();
  const minDT = new Date(now.getTime()+60000).toISOString().slice(0,16);

  const [form, setForm] = useState({ studentId:user?.name||"", studentName:user?.name||"", parentEmail:"", reason:"", destination:"", outDate:"", returnDate:"" });
  const handleChange = (e) => setForm(p=>({...p,[e.target.name]:e.target.value}));

  const loadHistory = async (id) => {
    const searchId = id||form.studentId;
    if (!searchId.trim()) return toast("Enter a Student ID to search","warn");
    setHistoryLoading(true);
    try { const data = await outingAPI.getStudentHistory(searchId.trim()); setHistory(Array.isArray(data)?data:[]); }
    catch (err) { toast("Could not load history: "+err.message,"error"); setHistory([]); }
    finally { setHistoryLoading(false); }
  };

  const switchToHistory = () => { setTab("history"); loadHistory(user?.name); };

  const handleApply = async (e) => {
    e.preventDefault();
    for (const f of ["studentId","studentName","parentEmail","reason","destination","outDate","returnDate"])
      if (!form[f]) return toast(`${f.replace(/([A-Z])/g," $1")} is required`,"warn");
    if (!form.parentEmail.includes("@")) return toast("Invalid parent email","warn");
    if (new Date(form.outDate)>=new Date(form.returnDate)) return toast("Return date must be after out date","warn");
    setSubmitting(true);
    try {
      await outingAPI.apply({...form, studentEmail: user?.email || "", outDate:new Date(form.outDate).toISOString(),returnDate:new Date(form.returnDate).toISOString()});
      setForm(p=>({...p,reason:"",destination:"",outDate:"",returnDate:"",parentEmail:""}));
      setShowSuccessPopup(true);
    } catch (err) {
      const msg=err.message||"Submission failed";
      if (msg.includes("active")||msg.includes("approved")||msg.includes("APPROVED")) toast("You already have an active outing request.","warn");
      else if (msg.includes("banned")||msg.includes("Denied")||msg.includes("overdue")) toast("You are banned due to overdue outings.","error");
      else toast(msg,"error");
    } finally { setSubmitting(false); }
  };

  const navItems = [
    { id:"apply", label:"Apply for Outing", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> },
    { id:"history", label:"My Requests", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { id:"rules", label:"Rules & Guidelines", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  ];

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::placeholder { color:#999 !important; }
      `}</style>

      {/* SIDEBAR — dark */}
      <aside style={{width:260,background:"var(--sidebar-bg)",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"24px 16px",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
        <div style={{display:"flex",flexDirection:"column",gap:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 8px"}}>
            <div style={{width:36,height:36,borderRadius:10,background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="#fff"/><path d="M12 16L15 19L21 13" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>SmartOuting</div>
              <div style={{fontSize:11,color:"var(--sidebar-text)",opacity:0.6,marginTop:1}}>Student Portal</div>
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"rgba(255,255,255,0.05)",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"var(--accent)",color:"#fff",fontWeight:700,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>{user?.name?.[0]?.toUpperCase()||"S"}</div>
            <div>
              <div style={{color:"#fff",fontWeight:600,fontSize:14}}>{user?.name}</div>
              <div style={{color:"var(--sidebar-text)",fontSize:12,marginTop:1,opacity:0.7}}>Student</div>
            </div>
          </div>

          <nav style={{display:"flex",flexDirection:"column",gap:4}}>
            {navItems.map(item=>(
              <button key={item.id} onClick={()=>item.id==="history"?switchToHistory():setTab(item.id)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:8,border:"none",
                  background:tab===item.id?"var(--sidebar-active)":"transparent",
                  color:tab===item.id?"#fff":"var(--sidebar-text)",
                  fontSize:13,fontWeight:tab===item.id?600:400,cursor:"pointer",width:"100%",textAlign:"left",fontFamily:"'Inter',sans-serif",transition:"all 0.15s"}}>
                <span style={{display:"flex",opacity:tab===item.id?1:0.6}}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <button onClick={logout} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"var(--sidebar-text)",fontSize:13,cursor:"pointer",width:"100%",fontFamily:"'Inter',sans-serif"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </aside>

      {/* MAIN — light */}
      <main style={{flex:1,background:"var(--bg)",padding:"32px 40px",overflow:"auto"}}>
        {tab==="apply" && (
          <div style={{maxWidth:820,animation:"fadeIn 0.3s ease"}}>
            <h1 style={{fontSize:24,fontWeight:800,color:"var(--text-1)",marginBottom:4}}>Apply for Outing</h1>
            <p style={{color:"var(--text-3)",fontSize:14,marginBottom:28}}>Submit a new outing request. AI will analyse your request automatically.</p>

            <form onSubmit={handleApply} style={{background:"#fff",border:"1px solid var(--border)",borderRadius:16,padding:28,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:22}}>
                <FormField label="Student ID" name="studentId" value={form.studentId} onChange={handleChange} placeholder="Your student ID" />
                <FormField label="Full Name" name="studentName" value={form.studentName} onChange={handleChange} placeholder="Your full name" />
                <FormField label="Parent / Guardian Email" name="parentEmail" value={form.parentEmail} onChange={handleChange} type="email" placeholder="parent@email.com" span={2} />
                <FormField label="Destination" name="destination" value={form.destination} onChange={handleChange} placeholder="Where are you going?" span={2} />
                <div style={{gridColumn:"1/-1"}}>
                  <label style={labelStyle}>Reason for Outing</label>
                  <textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Describe why you need to go out..." rows={3}
                    style={{width:"100%",padding:"12px 14px",resize:"vertical",background:"#fff",border:"1.5px solid var(--border-2)",borderRadius:10,color:"var(--text-1)",fontSize:14,outline:"none"}} />
                </div>
                <FormField label="Out Date & Time" name="outDate" value={form.outDate} onChange={handleChange} type="datetime-local" min={minDT} />
                <FormField label="Return Date & Time" name="returnDate" value={form.returnDate} onChange={handleChange} type="datetime-local" min={minDT} />
              </div>

              {/* AI Categories */}
              <div style={{padding:"14px 16px",background:"var(--bg)",borderRadius:12,border:"1px solid var(--border)",marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  <span style={{fontSize:13,fontWeight:700,color:"var(--text-1)"}}>AI Urgency Detection</span>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {[{label:"Emergency",bg:"#E74C3C",desc:"Medical/Safety"},{label:"Urgent",bg:"#F39C12",desc:"Time-sensitive"},{label:"Routine",bg:"#00B894",desc:"Normal outing"},{label:"Suspicious",bg:"#2DD4BF",desc:"Needs review"}].map(f=>(
                    <div key={f.label} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",background:`${f.bg}0D`,borderRadius:8,border:`1px solid ${f.bg}20`}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:f.bg,flexShrink:0}}/>
                      <span style={{fontSize:11,fontWeight:600,color:f.bg}}>{f.label}</span>
                      <span style={{fontSize:10,color:"var(--text-3)"}}>{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"var(--accent-dim)",borderRadius:10,flex:1}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  <span style={{fontSize:13,color:"var(--text-2)"}}>Your request will be <strong style={{color:"var(--accent)"}}>AI-analysed</strong> for urgency.</span>
                </div>
                <button type="submit" disabled={submitting} style={{padding:"13px 28px",background:"var(--accent)",border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(45,212,191,0.3)",opacity:submitting?0.7:1,whiteSpace:"nowrap"}}>
                  {submitting?"Submitting...":"Submit Request"}
                </button>
              </div>
            </form>
          </div>
        )}

        {tab==="history" && (
          <div style={{maxWidth:820,animation:"fadeIn 0.3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:14}}>
              <div>
                <h1 style={{fontSize:24,fontWeight:800,color:"var(--text-1)"}}>My Requests</h1>
                <p style={{color:"var(--text-3)",fontSize:14,marginTop:4}}>{history.length} total request(s)</p>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <input value={form.studentId} onChange={(e)=>setForm(p=>({...p,studentId:e.target.value}))} placeholder="Student ID..." style={{padding:"9px 14px",background:"#fff",border:"1.5px solid var(--border-2)",borderRadius:8,color:"var(--text-1)",fontSize:13,outline:"none",width:170}} />
                <button onClick={()=>loadHistory()} disabled={historyLoading} style={{padding:"9px 18px",background:"var(--accent)",border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>{historyLoading?"...":"Search"}</button>
              </div>
            </div>

            {historyLoading && (
              <div style={{textAlign:"center",padding:40}}>
                <div style={{width:28,height:28,border:"2.5px solid var(--border-2)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}} />
                <p style={{color:"var(--text-3)",fontSize:13}}>Loading...</p>
              </div>
            )}

            {!historyLoading && history.length===0 && (
              <div style={{textAlign:"center",padding:"60px 20px",background:"#fff",borderRadius:16,border:"1px dashed var(--border-2)"}}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth="1.5" style={{marginBottom:12}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <div style={{color:"var(--text-1)",fontWeight:600,fontSize:15}}>No requests found</div>
                <div style={{color:"var(--text-3)",fontSize:13,marginTop:4}}>Apply for your first outing or check your Student ID.</div>
              </div>
            )}

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {history.map(o=>(
                <div key={o.id} style={{background:"#fff",border:"1px solid var(--border)",borderRadius:12,padding:"18px 22px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",animation:"fadeIn 0.3s ease"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{color:"var(--text-1)",fontWeight:600,fontSize:15}}>#{o.id} — {o.destination}</div>
                      <div style={{color:"var(--text-3)",fontSize:13,marginTop:4}}>{o.reason}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      <StatusBadge status={o.status} />
                      {o.aiFlag && <AiFlagBadge flag={o.aiFlag} score={o.urgencyScore} />}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:20,marginTop:12,fontSize:12,color:"var(--text-3)"}}>
                    <span>Out: {formatDT(o.outDate)}</span>
                    <span>Return: {formatDT(o.returnDate)}</span>
                    {o.wardenComment && <span>&quot;{o.wardenComment}&quot;</span>}
                  </div>
                  {o.qrCodeUrl && o.status==="APPROVED" && (
                    <div style={{marginTop:14,padding:14,background:"rgba(0,184,148,0.06)",borderRadius:10,border:"1px solid rgba(0,184,148,0.15)"}}>
                      <div style={{color:"var(--green)",fontSize:12,fontWeight:700,marginBottom:10}}>Approved — Show this QR to the guard</div>
                      <img src={o.qrCodeUrl} alt="QR Code" style={{width:110,height:110,borderRadius:8,background:"white",padding:4}} />
                    </div>
                  )}
                  {o.status==="REJECTED" && (
                    <div style={{marginTop:14,padding:14,background:"rgba(231,76,60,0.06)",borderRadius:10,border:"1px solid rgba(231,76,60,0.15)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        <span style={{color:"#C0392B",fontSize:12,fontWeight:700}}>Request Rejected by Warden</span>
                      </div>
                      {o.wardenComment && <div style={{color:"#991B1B",fontSize:13,fontWeight:500,marginBottom:8}}>"{o.wardenComment}"</div>}
                      <div style={{fontSize:12,color:"var(--text-3)"}}>If you have concerns, please contact the hostel administration office.</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="rules" && (
          <div style={{maxWidth:820,animation:"fadeIn 0.3s ease"}}>
            <h1 style={{fontSize:24,fontWeight:800,color:"var(--text-1)",marginBottom:4}}>Rules & Guidelines</h1>
            <p style={{color:"var(--text-3)",fontSize:14,marginBottom:28}}>Please read carefully before applying for an outing pass.</p>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>

              {/* Rule 1 */}
              <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"20px 24px",boxShadow:"0 1px 4px rgba(0,0,0,0.03)",display:"flex",gap:16,alignItems:"flex-start"}}>
                <div style={{width:40,height:40,borderRadius:10,background:"rgba(45,212,191,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:"var(--text-1)",marginBottom:4}}>Portal-Only Approvals</div>
                  <div style={{fontSize:13,color:"var(--text-3)",lineHeight:1.6}}>All leave requests must be submitted and approved exclusively through this portal. No offline or verbal requests will be entertained.</div>
                </div>
              </div>

              {/* Rule 2 */}
              <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"20px 24px",boxShadow:"0 1px 4px rgba(0,0,0,0.03)",display:"flex",gap:16,alignItems:"flex-start"}}>
                <div style={{width:40,height:40,borderRadius:10,background:"rgba(52,152,219,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3498DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:"var(--text-1)",marginBottom:4}}>Contact Administration for Issues</div>
                  <div style={{fontSize:13,color:"var(--text-3)",lineHeight:1.6}}>Facing any problems with your outing request or portal access? Reach out to the administration office directly for assistance.</div>
                </div>
              </div>

              {/* Rule 3 — Warning */}
              <div style={{background:"linear-gradient(135deg, rgba(231,76,60,0.04), rgba(231,76,60,0.02))",border:"1px solid rgba(231,76,60,0.15)",borderRadius:14,padding:"20px 24px",boxShadow:"0 1px 4px rgba(0,0,0,0.03)",display:"flex",gap:16,alignItems:"flex-start"}}>
                <div style={{width:40,height:40,borderRadius:10,background:"rgba(231,76,60,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:"#C0392B",marginBottom:4}}>Strict No-Alcohol Policy</div>
                  <div style={{fontSize:13,color:"var(--text-3)",lineHeight:1.6}}>Returning to campus in an intoxicated or drunk state is a <strong style={{color:"#E74C3C"}}>serious disciplinary offence</strong> and will result in immediate suspension.</div>
                </div>
              </div>

              {/* Rule 4 — Curfew */}
              <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:"20px 24px",boxShadow:"0 1px 4px rgba(0,0,0,0.03)",display:"flex",gap:16,alignItems:"flex-start"}}>
                <div style={{width:40,height:40,borderRadius:10,background:"rgba(243,156,18,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F39C12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:"var(--text-1)",marginBottom:4}}>Day Outing Curfew — 9:30 PM</div>
                  <div style={{fontSize:13,color:"var(--text-3)",lineHeight:1.6}}>All students on a day outing must return to campus by <strong style={{color:"#F39C12"}}>9:30 PM</strong>. Failure to return on time will be flagged as overdue and may affect future outing privileges.</div>
                </div>
              </div>

            </div>

            {/* Footer note */}
            <div style={{marginTop:22,padding:"14px 18px",background:"var(--accent-dim)",borderRadius:12,display:"flex",alignItems:"center",gap:10}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              <span style={{fontSize:13,color:"var(--text-2)",lineHeight:1.5}}>By submitting an outing request, you agree to abide by all the rules listed above. Violations may lead to disciplinary action.</span>
            </div>
          </div>
        )}
      </main>

      {/* SUCCESS POPUP — after submitting outing request */}
      {showSuccessPopup && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,animation:"fadeIn 0.2s ease"}} onClick={()=>{setShowSuccessPopup(false);switchToHistory();}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,padding:"36px 32px",maxWidth:420,width:"90%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.15)",animation:"fadeIn 0.3s ease"}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(0,184,148,0.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00B894" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 style={{fontSize:20,fontWeight:800,color:"#1A1A1A",margin:"0 0 8px"}}>Request Submitted!</h2>
            <p style={{color:"#6b7280",fontSize:14,lineHeight:1.6,margin:"0 0 20px"}}>
              Your outing request has been sent to the Warden for approval.
              <br/><br/>
              <span style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(0,184,148,0.08)",padding:"8px 14px",borderRadius:10,border:"1px solid rgba(0,184,148,0.15)"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00B894" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                <span style={{color:"#065f46",fontWeight:600,fontSize:13}}>You'll receive your Outing Pass via email once approved</span>
              </span>
            </p>
            <p style={{color:"#9ca3af",fontSize:12,margin:"0 0 22px"}}>
              The pass will be sent to <strong style={{color:"#374151"}}>{user?.email || "your registered email"}</strong> with a QR code that you need to show at the gate.
            </p>
            <button onClick={()=>{setShowSuccessPopup(false);switchToHistory();}} style={{padding:"12px 32px",background:"var(--accent)",border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(45,212,191,0.3)"}}>
              View My Requests
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display:"block",fontSize:14,fontWeight:600,color:"#1A1A1A",marginBottom:7 };

function FormField({ label, name, value, onChange, type="text", placeholder, span, min }) {
  return (
    <div style={{gridColumn:span===2?"1/-1":undefined}}>
      <label style={labelStyle}>{label}</label>
      <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder} min={min}
        style={{width:"100%",padding:"12px 14px",background:"#fff",border:"1.5px solid rgba(0,0,0,0.10)",borderRadius:10,color:"#1A1A1A",fontSize:14,outline:"none"}} />
    </div>
  );
}

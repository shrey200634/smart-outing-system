import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { outingAPI } from "../utils/api";
import { useToast } from "../components/Toast";

const STATUS_COLORS = {
  PENDING:  { bg: "rgba(240,165,0,0.08)", color: "#D4880F", border: "rgba(240,165,0,0.20)" },
  APPROVED: { bg: "rgba(0,184,148,0.08)", color: "#00B894", border: "rgba(0,184,148,0.20)" },
  OUT:      { bg: "rgba(108,92,231,0.08)", color: "#6C5CE7", border: "rgba(108,92,231,0.20)" },
  OVERDUE:  { bg: "rgba(231,76,60,0.08)", color: "#E74C3C", border: "rgba(231,76,60,0.20)" },
  RETURNED: { bg: "rgba(138,138,138,0.08)", color: "#8A8A8A", border: "rgba(138,138,138,0.20)" },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  return <span style={{ padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,background:c.bg,color:c.color,border:`1px solid ${c.border}` }}>{status}</span>;
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
      await outingAPI.apply({...form,outDate:new Date(form.outDate).toISOString(),returnDate:new Date(form.returnDate).toISOString()});
      toast("Outing request submitted successfully!","success");
      setForm(p=>({...p,reason:"",destination:"",outDate:"",returnDate:"",parentEmail:""}));
      switchToHistory();
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

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"var(--accent-dim)",borderRadius:10,flex:1}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  <span style={{fontSize:13,color:"var(--text-2)"}}>Your request will be <strong style={{color:"var(--accent)"}}>AI-analysed</strong> for urgency.</span>
                </div>
                <button type="submit" disabled={submitting} style={{padding:"13px 28px",background:"var(--accent)",border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(108,92,231,0.3)",opacity:submitting?0.7:1,whiteSpace:"nowrap"}}>
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
                      {o.aiFlag && <span style={{fontSize:11,color:"var(--text-3)",fontWeight:500}}>{o.aiFlag} (Score: {o.urgencyScore})</span>}
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
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
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

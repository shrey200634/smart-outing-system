import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { outingAPI } from "../utils/api";
import { useToast } from "../components/Toast";

const STATUS = {
  PENDING:  {color:"var(--amber)",  bg:"rgba(245,166,35,0.1)",  bd:"rgba(245,166,35,0.22)"},
  APPROVED: {color:"var(--green)",  bg:"rgba(31,209,122,0.1)",  bd:"rgba(31,209,122,0.22)"},
  OUT:      {color:"var(--blue)",   bg:"rgba(77,159,255,0.1)",  bd:"rgba(77,159,255,0.22)"},
  OVERDUE:  {color:"var(--red)",    bg:"rgba(255,92,92,0.1)",   bd:"rgba(255,92,92,0.22)"},
  RETURNED: {color:"var(--text-3)", bg:"rgba(107,122,153,0.1)", bd:"rgba(107,122,153,0.22)"},
};
const AI_INFO = {
  MEDICAL_EMERGENCY:{color:"var(--red)",   bg:"rgba(255,92,92,0.1)",   icon:"●"},
  MEDICAL:          {color:"var(--amber)",  bg:"rgba(245,166,35,0.1)",  icon:"●"},
  HEALTH:           {color:"var(--amber)",  bg:"rgba(245,166,35,0.1)",  icon:"●"},
  ACADEMIC_PRIORITY:{color:"var(--blue)",   bg:"rgba(77,159,255,0.1)",  icon:"●"},
  ACADEMIC:         {color:"var(--blue)",   bg:"rgba(77,159,255,0.1)",  icon:"●"},
  FAMILY_EMERGENCY: {color:"var(--purple)", bg:"rgba(155,127,255,0.1)", icon:"●"},
  FAMILY:           {color:"var(--purple)", bg:"rgba(155,127,255,0.1)", icon:"●"},
};
const FILTERS = ["ALL","PENDING","APPROVED","OUT","OVERDUE","RETURNED"];
function fmt(dt){ if(!dt)return"—"; return new Date(dt).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}); }

export default function WardenDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [outings, setOutings]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("ALL");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);
  const [comment, setComment]   = useState("");
  const [approving, setApproving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await outingAPI.getAll(); setOutings(d.sort((a,b)=>b.id-a.id)); }
    catch(e){ toast("Failed to load: "+e.message,"error"); }
    finally { setLoading(false); }
  },[]);
  useEffect(()=>{ load(); },[load]);

  const handleApprove = async () => {
    if(!comment.trim()) return toast("Approval comment is required","warn");
    setApproving(true);
    try {
      await outingAPI.approve(selected.id, comment.trim());
      toast("Approved — QR code generated","success");
      setSelected(null); setComment(""); load();
    } catch(e){ toast("Failed: "+e.message,"error"); }
    finally{ setApproving(false); }
  };

  const stats = { total:outings.length, pending:outings.filter(o=>o.status==="PENDING").length, out:outings.filter(o=>o.status==="OUT").length, overdue:outings.filter(o=>o.status==="OVERDUE").length };
  const filtered = outings.filter(o=>{
    const mf = filter==="ALL"||o.status===filter;
    const ms = !search||o.studentName?.toLowerCase().includes(search.toLowerCase())||o.studentId?.toLowerCase().includes(search.toLowerCase())||String(o.id).includes(search);
    return mf&&ms;
  });

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg)",fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        input,textarea{color-scheme:dark;font-family:'Inter',sans-serif;}
        input::placeholder,textarea::placeholder{color:var(--text-4);}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .nav-w{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:8px;border:1px solid transparent;background:none;color:var(--text-3);font-size:13px;font-weight:500;cursor:pointer;transition:all 0.18s;text-align:left;width:100%;font-family:'Inter',sans-serif;}
        .nav-w:hover{background:var(--surface-2);color:var(--text-1);}
        .row{display:grid;grid-template-columns:48px 140px 1fr 150px 170px 100px 110px;gap:14px;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border);transition:background 0.15s;animation:fadeUp 0.25s ease both;}
        .row:hover{background:var(--surface-2);}
        .row.sel{background:rgba(0,212,170,0.03);border-color:rgba(0,212,170,0.12);}
        .chip{padding:5px 12px;border-radius:99px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid;font-family:'Inter',sans-serif;transition:all 0.15s;letter-spacing:0.3px;}
        .approve-btn{padding:6px 12px;background:rgba(31,209,122,0.1);border:1px solid rgba(31,209,122,0.22);border-radius:7px;color:var(--green);font-size:11px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;}
        .qr-btn{padding:5px 10px;background:var(--teal-dim);border:1px solid rgba(0,212,170,0.22);border-radius:7px;color:var(--teal);font-size:11px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;}
        .panel{background:var(--surface);border:1px solid var(--border-2);border-radius:14px;padding:24px;margin-top:20px;animation:slideDown 0.25s ease;}
      `}</style>

      {/* Sidebar */}
      <aside style={{width:240,background:"var(--surface)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"22px 14px",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          <div style={{display:"flex",alignItems:"center",gap:9,padding:"0 4px"}}>
            <div style={{width:32,height:32,borderRadius:8,background:"var(--teal-dim)",border:"1px solid rgba(0,212,170,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="url(#sw)"/><path d="M12 16L15 19L21 13" stroke="#040810" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><defs><linearGradient id="sw" x1="4" y1="2" x2="28" y2="30"><stop stopColor="#00D4AA"/><stop offset="1" stopColor="#00B890"/></linearGradient></defs></svg>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text-1)",letterSpacing:"-0.3px"}}>SmartOuting</div>
              <div style={{fontSize:10,color:"var(--text-4)",marginTop:1}}>Warden Panel</div>
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"rgba(155,127,255,0.07)",borderRadius:10,border:"1px solid rgba(155,127,255,0.15)"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#9B7FFF,#7C5FE0)",color:"#fff",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {user?.name?.[0]?.toUpperCase()||"W"}
            </div>
            <div style={{minWidth:0}}>
              <div style={{color:"var(--text-1)",fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name}</div>
              <div style={{color:"var(--purple)",fontSize:11,marginTop:1}}>Warden</div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {[{l:"Total",v:stats.total,c:"var(--text-2)"},{l:"Pending",v:stats.pending,c:"var(--amber)"},{l:"Out Now",v:stats.out,c:"var(--blue)"},{l:"Overdue",v:stats.overdue,c:"var(--red)"}].map(s=>(
              <div key={s.l} style={{padding:"10px 12px",background:"var(--surface-2)",borderRadius:9,border:"1px solid var(--border)"}}>
                <div style={{fontSize:10,color:"var(--text-4)",marginBottom:3,fontWeight:500}}>{s.l}</div>
                <div style={{fontSize:20,fontWeight:700,color:s.c,letterSpacing:"-0.5px"}}>{s.v}</div>
              </div>
            ))}
          </div>

          <button onClick={load} className="nav-w" style={{justifyContent:"center",background:"var(--surface-2)",border:"1px solid var(--border-2)"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Refresh Data
          </button>
        </div>

        <button onClick={logout} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:8,border:"1px solid rgba(255,92,92,0.18)",background:"rgba(255,92,92,0.06)",color:"var(--red)",fontSize:13,cursor:"pointer",width:"100%",fontFamily:"'Inter',sans-serif"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main style={{flex:1,padding:"32px 36px",overflow:"auto"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:14}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:700,color:"var(--text-1)",letterSpacing:"-0.5px"}}>Outing Requests</h1>
            <p style={{color:"var(--text-3)",fontSize:13,marginTop:4}}>{stats.pending} pending · {stats.overdue} overdue</p>
          </div>
          <div style={{position:"relative"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-4)"}}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student, ID..." style={{padding:"9px 14px 9px 34px",background:"var(--surface-2)",border:"1.5px solid var(--border-2)",borderRadius:9,color:"var(--text-1)",fontSize:13,outline:"none",width:220}}/>
          </div>
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
          {FILTERS.map(f=>{
            const cnt=f==="ALL"?outings.length:outings.filter(o=>o.status===f).length;
            const s=STATUS[f]||{color:"var(--text-3)",bd:"var(--border-2)"};
            return (
              <button key={f} className="chip"
                style={{background:filter===f?(STATUS[f]?.bg||"var(--teal-dim)"):"transparent",borderColor:filter===f?(s.bd||"rgba(0,212,170,0.3)"):"var(--border-2)",color:filter===f?(s.color||"var(--teal)"):"var(--text-3)"}}>
                <span onClick={()=>setFilter(f)}>{f}{cnt>0&&<span style={{opacity:0.65,fontSize:10,marginLeft:5}}>({cnt})</span>}</span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"80px 0",gap:14}}>
            <div style={{width:32,height:32,border:"2px solid var(--border-2)",borderTopColor:"var(--teal)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
            <span style={{color:"var(--text-3)",fontSize:13}}>Loading requests...</span>
          </div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"64px 20px",background:"var(--surface)",borderRadius:14,border:"1px dashed var(--border-2)"}}>
            <div style={{color:"var(--text-2)",fontWeight:600,marginBottom:6}}>No requests found</div>
            <div style={{color:"var(--text-3)",fontSize:13}}>Try changing your filter or search</div>
          </div>
        ) : (
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"48px 140px 1fr 150px 170px 100px 110px",gap:14,padding:"11px 20px",background:"var(--surface-2)",borderBottom:"1px solid var(--border)"}}>
              {["ID","Student","Destination","AI Flag","Dates","Status","Actions"].map(h=>(
                <div key={h} style={{fontSize:10,fontWeight:700,color:"var(--text-4)",textTransform:"uppercase",letterSpacing:"0.6px"}}>{h}</div>
              ))}
            </div>
            {filtered.map((o,i)=>{
              const ai = AI_INFO[o.aiFlag];
              const st = STATUS[o.status]||STATUS.PENDING;
              return (
                <div key={o.id} className={`row${selected?.id===o.id?" sel":""}`}>
                  <span style={{fontSize:11,fontWeight:700,color:"var(--teal)",fontVariantNumeric:"tabular-nums"}}>#{o.id}</span>
                  <div>
                    <div style={{color:"var(--text-1)",fontWeight:600,fontSize:13}}>{o.studentName}</div>
                    <div style={{color:"var(--text-4)",fontSize:11,marginTop:2}}>{o.studentId}</div>
                  </div>
                  <div>
                    <div style={{color:"var(--text-1)",fontSize:13,fontWeight:500}}>{o.destination}</div>
                    <div style={{color:"var(--text-3)",fontSize:11,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:220}}>{o.reason}</div>
                  </div>
                  <div>
                    {ai ? (
                      <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:99,fontSize:10,fontWeight:700,background:ai.bg,color:ai.color}}>
                        <span style={{fontSize:7}}>{ai.icon}</span>{o.aiFlag?.replace(/_/g," ")} · {o.urgencyScore}
                      </span>
                    ) : <span style={{color:"var(--text-4)",fontSize:12}}>—</span>}
                  </div>
                  <div style={{fontSize:11,color:"var(--text-3)",lineHeight:1.7}}>
                    <div>{fmt(o.outDate)}</div>
                    <div>{fmt(o.returnDate)}</div>
                  </div>
                  <div>
                    <span style={{padding:"3px 9px",borderRadius:99,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",background:st.bg,color:st.color,border:`1px solid ${st.bd}`}}>{o.status}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {o.status==="PENDING" && <button className="approve-btn" onClick={()=>{setSelected(o===selected?null:o);setComment("");}}>
                      {selected?.id===o.id?"Cancel":"Approve"}
                    </button>}
                    {o.qrCodeUrl && <button className="qr-btn" onClick={()=>setSelected(selected?.id===o.id?null:o)}>QR Code</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Approve panel */}
        {selected?.status==="PENDING" && (
          <div className="panel">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
              <div>
                <h3 style={{color:"var(--text-1)",fontWeight:700,fontSize:16,marginBottom:4}}>Approve Request #{selected.id}</h3>
                <p style={{color:"var(--text-3)",fontSize:13}}>{selected.studentName} — {selected.destination}</p>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
            </div>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:"var(--text-3)",letterSpacing:"0.7px",textTransform:"uppercase",marginBottom:7}}>Approval Comment (required)</label>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} placeholder="Add a comment for the student..."
              style={{width:"100%",padding:"11px 14px",background:"var(--surface-2)",border:"1.5px solid var(--border-2)",borderRadius:9,color:"var(--text-1)",fontSize:14,outline:"none",resize:"vertical",marginBottom:16}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={handleApprove} disabled={approving}
                style={{padding:"11px 22px",background:"linear-gradient(135deg,#1FD17A,#17B068)",border:"none",borderRadius:9,color:"#040810",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(31,209,122,0.28)",fontFamily:"'Inter',sans-serif",opacity:approving?0.7:1}}>
                {approving?"Approving...":"Confirm & Generate QR"}
              </button>
              <button onClick={()=>setSelected(null)} style={{padding:"11px 18px",background:"var(--surface-2)",border:"1px solid var(--border-2)",borderRadius:9,color:"var(--text-3)",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>Cancel</button>
            </div>
          </div>
        )}

        {/* QR panel */}
        {selected?.qrCodeUrl && selected?.status!=="PENDING" && (
          <div className="panel" style={{textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h3 style={{color:"var(--green)",fontWeight:700,fontSize:15}}>QR Code — #{selected.id} · {selected.studentName}</h3>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
            </div>
            <img src={selected.qrCodeUrl} alt="QR" style={{width:160,height:160,background:"white",padding:8,borderRadius:12,display:"block",margin:"0 auto"}}/>
          </div>
        )}
      </main>
    </div>
  );
}

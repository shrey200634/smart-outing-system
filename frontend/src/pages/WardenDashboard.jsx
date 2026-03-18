import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { outingAPI } from "../utils/api";
import { useToast } from "../components/Toast";

const STATUS_MAP = {
  PENDING:  { bg:"rgba(240,165,0,0.08)",color:"#D4880F",border:"rgba(240,165,0,0.20)" },
  APPROVED: { bg:"rgba(0,184,148,0.08)",color:"#00B894",border:"rgba(0,184,148,0.20)" },
  OUT:      { bg:"rgba(108,92,231,0.08)",color:"#6C5CE7",border:"rgba(108,92,231,0.20)" },
  OVERDUE:  { bg:"rgba(231,76,60,0.08)",color:"#E74C3C",border:"rgba(231,76,60,0.20)" },
  RETURNED: { bg:"rgba(138,138,138,0.08)",color:"#8A8A8A",border:"rgba(138,138,138,0.20)" },
};

const AI_FLAGS = {
  MEDICAL_EMERGENCY:{color:"#E74C3C",bg:"rgba(231,76,60,0.06)"},
  URGENT:{color:"#F39C12",bg:"rgba(243,156,18,0.06)"},
  ROUTINE:{color:"#00B894",bg:"rgba(0,184,148,0.06)"},
  SUSPICIOUS:{color:"#6C5CE7",bg:"rgba(108,92,231,0.06)"},
};

function Badge({status}) { const s=STATUS_MAP[status]||STATUS_MAP.PENDING; return <span style={{padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,background:s.bg,color:s.color,border:`1px solid ${s.border}`}}>{status}</span>; }
function AiChip({flag,score}) { if(!flag)return null; const i=AI_FLAGS[flag]||{color:"#8A8A8A",bg:"rgba(138,138,138,0.06)"}; return <span style={{padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:600,background:i.bg,color:i.color}}>{flag} &middot; {score}</span>; }
function formatDT(dt) { if(!dt)return"\u2014"; return new Date(dt).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}); }

export default function WardenDashboard() {
  const {user,logout}=useAuth();
  const {toast}=useToast();
  const [outings,setOutings]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("ALL");
  const [search,setSearch]=useState("");
  const [approving,setApproving]=useState(null);
  const [comment,setComment]=useState("");
  const [selected,setSelected]=useState(null);

  const load=useCallback(async()=>{setLoading(true);try{const d=await outingAPI.getAll();setOutings(d.sort((a,b)=>b.id-a.id));}catch(e){toast("Failed to load: "+e.message,"error");}finally{setLoading(false);}},[]);
  useEffect(()=>{load();},[load]);

  const handleApprove=async(id)=>{if(!comment.trim())return toast("Enter a comment","warn");setApproving(id);try{await outingAPI.approve(id,comment.trim());toast("Approved! QR generated.","success");setComment("");setSelected(null);load();}catch(e){toast("Failed: "+e.message,"error");}finally{setApproving(null);}};

  const filtered=outings.filter(o=>(filter==="ALL"||o.status===filter)&&(!search||o.studentName?.toLowerCase().includes(search.toLowerCase())||o.studentId?.toLowerCase().includes(search.toLowerCase())||String(o.id).includes(search)));
  const stats={total:outings.length,pending:outings.filter(o=>o.status==="PENDING").length,approved:outings.filter(o=>o.status==="APPROVED").length,out:outings.filter(o=>o.status==="OUT").length,overdue:outings.filter(o=>o.status==="OVERDUE").length};
  const FILTERS=["ALL","PENDING","APPROVED","OUT","OVERDUE","RETURNED"];

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::placeholder { color:#999 !important; }
        textarea::placeholder { color:#999 !important; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{width:250,background:"var(--sidebar-bg)",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"24px 16px",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 8px",marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:10,background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="#fff"/><path d="M12 16L15 19L21 13" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>SmartOuting</div>
              <div style={{fontSize:11,color:"var(--sidebar-text)",opacity:0.6}}>Warden Panel</div>
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"rgba(255,255,255,0.05)",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",marginBottom:20}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#00b894,#55efc4)",color:"#fff",fontWeight:700,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>{user?.name?.[0]?.toUpperCase()||"W"}</div>
            <div>
              <div style={{color:"#fff",fontWeight:600,fontSize:14}}>{user?.name}</div>
              <div style={{color:"#55efc4",fontSize:12,marginTop:1}}>Warden</div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {[{l:"Total",v:stats.total,c:"#C8C8D0"},{l:"Pending",v:stats.pending,c:"#F0A500"},{l:"Approved",v:stats.approved,c:"#00B894"},{l:"Out",v:stats.out,c:"#6C5CE7"},{l:"Overdue",v:stats.overdue,c:"#E74C3C"}].map(s=>(
              <div key={s.l} style={{padding:"10px 12px",background:"rgba(255,255,255,0.04)",borderRadius:8,border:"1px solid rgba(255,255,255,0.06)"}}>
                <div style={{fontSize:11,color:"var(--sidebar-text)",opacity:0.6}}>{s.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:s.c,fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <button onClick={load} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"9px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"var(--sidebar-text)",fontSize:13,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Refresh
          </button>
          <button onClick={logout} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"9px",borderRadius:8,border:"1px solid rgba(231,76,60,0.2)",background:"rgba(231,76,60,0.06)",color:"#E74C3C",fontSize:13,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{flex:1,background:"var(--bg)",padding:"28px 36px",overflow:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:14}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:800,color:"var(--text-1)"}}>Outing Requests</h1>
            <p style={{color:"var(--text-3)",fontSize:13,marginTop:4}}>{stats.pending} pending &bull; {stats.overdue} overdue</p>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, ID..." style={{padding:"9px 14px",background:"#fff",border:"1.5px solid var(--border-2)",borderRadius:8,color:"var(--text-1)",fontSize:13,outline:"none",width:220}} />
        </div>

        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
          {FILTERS.map(f=>{
            const cnt=f==="ALL"?outings.length:outings.filter(o=>o.status===f).length;
            return <button key={f} onClick={()=>setFilter(f)} style={{padding:"6px 14px",borderRadius:99,border:filter===f?"1.5px solid var(--accent)":"1px solid var(--border-2)",background:filter===f?"var(--accent-dim)":"#fff",color:filter===f?"var(--accent)":"var(--text-3)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{f} {cnt>0&&<span style={{opacity:0.6,fontSize:10}}>({cnt})</span>}</button>;
          })}
        </div>

        {loading?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"80px 0"}}>
            <div style={{width:30,height:30,border:"2.5px solid var(--border-2)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />
            <p style={{color:"var(--text-3)",marginTop:14}}>Loading...</p>
          </div>
        ):filtered.length===0?(
          <div style={{textAlign:"center",padding:"60px 20px",background:"#fff",borderRadius:16,border:"1px dashed var(--border-2)"}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth="1.5" style={{marginBottom:12}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <div style={{color:"var(--text-1)",fontWeight:600}}>No requests found</div>
            <div style={{color:"var(--text-3)",fontSize:13,marginTop:4}}>Try adjusting your filter or search</div>
          </div>
        ):(
          <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <div style={{display:"grid",gridTemplateColumns:"50px 130px 1fr 130px 150px 100px 100px",gap:14,padding:"12px 20px",background:"var(--bg-3)",borderBottom:"1px solid var(--border)"}}>
              {["ID","Student","Destination & Reason","AI Analysis","Dates","Status","Actions"].map(h=><div key={h} style={{fontSize:10,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</div>)}
            </div>
            {filtered.map(o=>(
              <div key={o.id} style={{display:"grid",gridTemplateColumns:"50px 130px 1fr 130px 150px 100px 100px",gap:14,padding:"14px 20px",borderBottom:"1px solid var(--border)",alignItems:"center",animation:"fadeIn 0.2s ease",background:selected?.id===o.id?"var(--accent-dim)":"transparent"}}>
                <div style={{color:"var(--accent)",fontWeight:600,fontSize:13}}>#{o.id}</div>
                <div>
                  <div style={{color:"var(--text-1)",fontWeight:600,fontSize:13}}>{o.studentName}</div>
                  <div style={{color:"var(--text-3)",fontSize:11,marginTop:2}}>{o.studentId}</div>
                </div>
                <div>
                  <div style={{color:"var(--text-1)",fontSize:13,fontWeight:500}}>{o.destination}</div>
                  <div style={{color:"var(--text-3)",fontSize:11,marginTop:3,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.reason}</div>
                </div>
                <div><AiChip flag={o.aiFlag} score={o.urgencyScore}/></div>
                <div style={{fontSize:11,color:"var(--text-3)"}}>
                  <div>Out: {formatDT(o.outDate)}</div>
                  <div style={{marginTop:3}}>Return: {formatDT(o.returnDate)}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <Badge status={o.status}/>
                  {o.wardenComment&&<span style={{fontSize:10,color:"var(--text-3)",fontStyle:"italic"}}>&quot;{o.wardenComment.slice(0,30)}{o.wardenComment.length>30?"...":""}&quot;</span>}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {o.status==="PENDING"&&<button onClick={()=>{setSelected(o===selected?null:o);setComment("");}} style={{padding:"6px 12px",background:"rgba(0,184,148,0.08)",border:"1px solid rgba(0,184,148,0.2)",borderRadius:8,color:"#00B894",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{selected?.id===o.id?"Cancel":"Approve"}</button>}
                  {o.qrCodeUrl&&<button onClick={()=>setSelected(selected?.id===o.id?null:o)} style={{padding:"5px 10px",background:"var(--accent-dim)",border:"1px solid rgba(108,92,231,0.15)",borderRadius:8,color:"var(--accent)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>QR Code</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approve panel */}
        {selected&&selected.status==="PENDING"&&(
          <div style={{marginTop:18,background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:24,boxShadow:"0 8px 30px rgba(0,0,0,0.08)",animation:"fadeIn 0.2s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <h3 style={{color:"var(--text-1)",fontWeight:700,fontSize:16}}>Approve Request #{selected.id}</h3>
                <p style={{color:"var(--text-3)",fontSize:13,marginTop:4}}>{selected.studentName} &bull; {selected.destination}</p>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer",fontSize:20}}>&times;</button>
            </div>
            <div style={{marginTop:14}}>
              <label style={{fontSize:14,fontWeight:600,color:"var(--text-1)"}}>Approval Comment</label>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add your comment..." rows={3}
                style={{width:"100%",padding:"12px 14px",marginTop:6,resize:"vertical",background:"#fff",border:"1.5px solid var(--border-2)",borderRadius:10,color:"var(--text-1)",fontSize:14,outline:"none"}} />
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <button onClick={()=>handleApprove(selected.id)} disabled={approving===selected.id} style={{padding:"11px 22px",background:"var(--green)",border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,184,148,0.25)",opacity:approving===selected.id?0.7:1}}>
                {approving===selected.id?"Approving...":"Confirm Approval & Generate QR"}
              </button>
              <button onClick={()=>setSelected(null)} style={{padding:"11px 18px",background:"#fff",border:"1.5px solid var(--border-2)",borderRadius:10,color:"var(--text-2)",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        )}

        {/* QR view */}
        {selected&&selected.qrCodeUrl&&selected.status!=="PENDING"&&(
          <div style={{marginTop:18,background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:24,boxShadow:"0 8px 30px rgba(0,0,0,0.08)",animation:"fadeIn 0.2s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <h3 style={{color:"var(--green)",fontWeight:700,fontSize:16}}>QR Code — #{selected.id}</h3>
                <p style={{color:"var(--text-3)",fontSize:13,marginTop:4}}>{selected.studentName}</p>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer",fontSize:20}}>&times;</button>
            </div>
            <div style={{display:"flex",justifyContent:"center",marginTop:16}}>
              <img src={selected.qrCodeUrl} alt="QR" style={{width:160,height:160,background:"white",padding:8,borderRadius:12,border:"1px solid var(--border)"}} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

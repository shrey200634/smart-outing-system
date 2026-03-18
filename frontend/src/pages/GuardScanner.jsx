import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { outingAPI } from "../utils/api";
import { useToast } from "../components/Toast";

function fmt(dt){ if(!dt)return"—"; return new Date(dt).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}); }

const STATUS_C = { PENDING:"var(--amber)",APPROVED:"var(--green)",OUT:"var(--blue)",OVERDUE:"var(--red)",RETURNED:"var(--text-3)" };

export default function GuardScanner() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [outingId, setOutingId]       = useState("");
  const [scanResult, setScanResult]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [scanning, setScanning]       = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(()=>{
    if(!showScanner) return;
    let scanner=null;
    const init=async()=>{
      try{
        const {Html5QrcodeScanner}=await import('html5-qrcode');
        scanner=new Html5QrcodeScanner("qr-reader",{fps:10,qrbox:{width:240,height:240}},false);
        scanner.render((text)=>{
          const m=text.match(/ID:(\d+)/);
          if(m){const id=m[1];setOutingId(id);toast("Scanned ID: "+id,"success");fetchById(id);setShowScanner(false);scanner?.clear();}
          else toast("Invalid QR format","warn");
        },(e)=>console.debug(e));
      }catch(e){toast("Camera access denied","error");setShowScanner(false);}
    };
    init();
    return()=>scanner?.clear().catch(()=>{});
  },[showScanner]);

  const fetchById=async(id)=>{
    const sid=id||outingId;
    if(!String(sid).trim())return toast("Enter an outing ID","warn");
    setLoading(true);setScanResult(null);
    try{const d=await outingAPI.getById(Number(sid));setScanResult({type:"preview",data:d});}
    catch(e){toast("Not found: "+e.message,"error");}
    finally{setLoading(false);}
  };

  const markOut=async()=>{
    if(!scanResult?.data?.id)return;
    setScanning(true);
    try{
      const r=await outingAPI.scan(scanResult.data.id);
      toast(r.studentName+" marked OUT","success");
      setRecentScans(p=>[{...r,scannedAt:new Date(),evt:"OUT"},...p.slice(0,9)]);
      setScanResult({type:"success",data:r});setOutingId("");
    }catch(e){
      toast(e.message||"Failed","error");
      if((e.message||"").includes("NOT approved"))setScanResult(p=>({...p,error:"Not approved to leave!"}));
    }finally{setScanning(false);}
  };

  const markIn=async()=>{
    if(!scanResult?.data?.id)return;
    setScanning(true);
    try{
      const r=await outingAPI.returnIn(scanResult.data.id);
      toast(r.studentName+" marked RETURNED","success");
      setRecentScans(p=>[{...r,scannedAt:new Date(),evt:"IN"},...p.slice(0,9)]);
      setScanResult({type:"returned",data:r});setOutingId("");
    }catch(e){toast(e.message||"Failed","error");}
    finally{setScanning(false);}
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg)",fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        input{color-scheme:dark;font-family:'Inter',sans-serif;}
        input::placeholder{color:var(--text-4);}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ripple{0%{transform:scale(1);opacity:0.5}100%{transform:scale(2.2);opacity:0}}
      `}</style>

      {/* QR Scanner overlay */}
      {showScanner && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
          <div style={{background:"var(--surface)",border:"1px solid rgba(31,209,122,0.2)",borderRadius:18,padding:24,maxWidth:480,width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,0.6)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h3 style={{color:"var(--text-1)",fontWeight:700,fontSize:17}}>Scan QR Code</h3>
              <button onClick={()=>setShowScanner(false)} style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,92,92,0.1)",border:"1px solid rgba(255,92,92,0.2)",color:"var(--red)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>×</button>
            </div>
            <div id="qr-reader" style={{width:"100%",borderRadius:10}}/>
            <p style={{color:"var(--text-3)",fontSize:13,marginTop:14,textAlign:"center"}}>Point camera at student's QR code</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside style={{width:240,background:"var(--surface)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"22px 14px",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          <div style={{display:"flex",alignItems:"center",gap:9,padding:"0 4px"}}>
            <div style={{width:32,height:32,borderRadius:8,background:"var(--teal-dim)",border:"1px solid rgba(0,212,170,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="url(#sg)"/><path d="M12 16L15 19L21 13" stroke="#040810" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><defs><linearGradient id="sg" x1="4" y1="2" x2="28" y2="30"><stop stopColor="#00D4AA"/><stop offset="1" stopColor="#00B890"/></linearGradient></defs></svg>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text-1)",letterSpacing:"-0.3px"}}>SmartOuting</div>
              <div style={{fontSize:10,color:"var(--text-4)",marginTop:1}}>Guard Panel</div>
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"rgba(31,209,122,0.07)",borderRadius:10,border:"1px solid rgba(31,209,122,0.15)"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#1FD17A,#17B068)",color:"#040810",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {user?.name?.[0]?.toUpperCase()||"G"}
            </div>
            <div style={{minWidth:0}}>
              <div style={{color:"var(--text-1)",fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name}</div>
              <div style={{color:"var(--green)",fontSize:11,marginTop:1}}>Gate Guard</div>
            </div>
          </div>

          {/* Steps */}
          <div style={{background:"var(--surface-2)",border:"1px solid var(--border)",borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:10,fontWeight:700,color:"var(--text-4)",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:12}}>Verification Steps</div>
            {["Click Scan QR button","Point camera at code","Confirm student details","Mark OUT or IN"].map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:i<3?10:0}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:"var(--teal-dim)",border:"1px solid rgba(0,212,170,0.22)",color:"var(--teal)",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</div>
                <span style={{fontSize:12,color:"var(--text-3)",lineHeight:1.5}}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={logout} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:8,border:"1px solid rgba(255,92,92,0.18)",background:"rgba(255,92,92,0.06)",color:"var(--red)",fontSize:13,cursor:"pointer",width:"100%",fontFamily:"'Inter',sans-serif"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main style={{flex:1,padding:"40px 52px",overflow:"auto"}}>
        <div style={{marginBottom:32}}>
          <h1 style={{fontSize:22,fontWeight:700,color:"var(--text-1)",letterSpacing:"-0.5px",marginBottom:4}}>Gate Scanner</h1>
          <p style={{color:"var(--text-3)",fontSize:13}}>Scan QR code or enter outing ID manually</p>
        </div>

        <div style={{maxWidth:560}}>
          {/* Scan card */}
          <div style={{background:"var(--surface)",border:"1px solid rgba(31,209,122,0.14)",borderRadius:18,padding:"40px 36px",textAlign:"center",boxShadow:"0 12px 48px rgba(0,0,0,0.35)",animation:"fadeUp 0.4s ease",position:"relative",overflow:"hidden"}}>
            {/* Decorative glow */}
            <div style={{position:"absolute",top:-40,left:"50%",transform:"translateX(-50%)",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(31,209,122,0.06) 0%,transparent 70%)",pointerEvents:"none"}}/>

            {/* Pulse icon */}
            <div style={{position:"relative",width:72,height:72,margin:"0 auto 24px"}}>
              <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"1.5px solid rgba(31,209,122,0.3)",animation:"ripple 2s ease-in-out infinite"}}/>
              <div style={{position:"absolute",inset:8,borderRadius:"50%",border:"1.5px solid rgba(31,209,122,0.2)",animation:"ripple 2s ease-in-out 0.5s infinite"}}/>
              <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(31,209,122,0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
              </div>
            </div>

            <h2 style={{fontSize:20,fontWeight:700,color:"var(--text-1)",marginBottom:6}}>Verify Student</h2>
            <p style={{color:"var(--text-3)",fontSize:13,marginBottom:28}}>Scan QR code or enter the outing ID</p>

            <button onClick={()=>setShowScanner(true)}
              style={{width:"100%",maxWidth:380,padding:"16px 28px",background:"linear-gradient(135deg,#1FD17A,#17B068)",border:"none",borderRadius:12,color:"#040810",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 8px 28px rgba(31,209,122,0.35)",marginBottom:22,display:"flex",alignItems:"center",justifyContent:"center",gap:9,fontFamily:"'Inter',sans-serif"}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 7V1h-6M1 7V1h6M23 17v6h-6M1 17v6h6"/></svg>
              Scan QR Code
            </button>

            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}>
              <div style={{flex:1,height:1,background:"var(--border)"}}/>
              <span style={{fontSize:11,color:"var(--text-4)",fontWeight:500,letterSpacing:"0.5px"}}>OR ENTER ID</span>
              <div style={{flex:1,height:1,background:"var(--border)"}}/>
            </div>

            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <input value={outingId} onChange={e=>setOutingId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchById()} type="number" placeholder="e.g. 42"
                style={{padding:"13px 18px",background:"var(--surface-2)",border:"2px solid rgba(31,209,122,0.2)",borderRadius:11,color:"var(--text-1)",fontSize:20,fontWeight:700,outline:"none",width:150,textAlign:"center",letterSpacing:"1px"}}/>
              <button onClick={()=>fetchById()} disabled={loading}
                style={{padding:"13px 22px",background:"var(--surface-2)",border:"1.5px solid var(--border-2)",borderRadius:11,color:"var(--text-2)",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                {loading?<span style={{width:16,height:16,border:"2px solid var(--border-2)",borderTopColor:"var(--teal)",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>:"Lookup"}
              </button>
            </div>

            {/* Result */}
            {scanResult && (
              <div style={{marginTop:24,background:"var(--surface-2)",border:`1.5px solid ${scanResult.error?"rgba(255,92,92,0.25)":scanResult.type==="success"?"rgba(31,209,122,0.25)":"rgba(0,212,170,0.18)"}`,borderRadius:13,padding:20,textAlign:"left",animation:"fadeUp 0.25s ease"}}>
                {scanResult.error ? (
                  <div style={{textAlign:"center",padding:"8px 0"}}>
                    <div style={{fontSize:32,marginBottom:8}}>⛔</div>
                    <div style={{color:"var(--red)",fontWeight:700,fontSize:14}}>{scanResult.error}</div>
                  </div>
                ) : (
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                      <div>
                        <div style={{color:"var(--text-1)",fontSize:17,fontWeight:700}}>{scanResult.data.studentName}</div>
                        <div style={{color:"var(--text-3)",fontSize:12,marginTop:2}}>ID: {scanResult.data.studentId}</div>
                      </div>
                      <span style={{padding:"5px 12px",borderRadius:99,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",background:`${STATUS_C[scanResult.data.status]}15`,color:STATUS_C[scanResult.data.status],border:`1.5px solid ${STATUS_C[scanResult.data.status]}35`}}>
                        {scanResult.data.status}
                      </span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                      {[["Destination",scanResult.data.destination],["Reason",scanResult.data.reason],["Out",fmt(scanResult.data.outDate)],["Return",fmt(scanResult.data.returnDate)]].map(([l,v])=>(
                        <div key={l}>
                          <div style={{fontSize:10,fontWeight:700,color:"var(--text-4)",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:3}}>{l}</div>
                          <div style={{fontSize:13,color:"var(--text-2)",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v||"—"}</div>
                        </div>
                      ))}
                    </div>

                    {scanResult.type==="success" && (
                      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"rgba(31,209,122,0.08)",border:"1px solid rgba(31,209,122,0.2)",borderRadius:9}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        <div>
                          <div style={{color:"var(--green)",fontWeight:700,fontSize:13}}>Marked OUT</div>
                          <div style={{color:"var(--text-3)",fontSize:11,marginTop:1}}>Parent notification sent</div>
                        </div>
                      </div>
                    )}
                    {scanResult.type==="returned" && (
                      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"rgba(0,212,170,0.08)",border:"1px solid rgba(0,212,170,0.2)",borderRadius:9}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        <div>
                          <div style={{color:"var(--teal)",fontWeight:700,fontSize:13}}>Marked RETURNED</div>
                          <div style={{color:"var(--text-3)",fontSize:11,marginTop:1}}>Student back on campus</div>
                        </div>
                      </div>
                    )}
                    {scanResult.type==="preview" && (
                      <>
                        {scanResult.data.status==="APPROVED" && (
                          <button onClick={markOut} disabled={scanning}
                            style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#1FD17A,#17B068)",border:"none",borderRadius:10,color:"#040810",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 18px rgba(31,209,122,0.3)",fontFamily:"'Inter',sans-serif",opacity:scanning?0.7:1}}>
                            {scanning?"Processing...":"Mark OUT — Allow Exit"}
                          </button>
                        )}
                        {(scanResult.data.status==="OUT"||scanResult.data.status==="OVERDUE") && (
                          <button onClick={markIn} disabled={scanning}
                            style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#00D4AA,#00B890)",border:"none",borderRadius:10,color:"#040810",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 18px rgba(0,212,170,0.28)",fontFamily:"'Inter',sans-serif",opacity:scanning?0.7:1}}>
                            {scanning?"Processing...":"Mark IN — Student Returned"}
                          </button>
                        )}
                        {!["APPROVED","OUT","OVERDUE"].includes(scanResult.data.status) && (
                          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"rgba(245,166,35,0.07)",border:"1px solid rgba(245,166,35,0.2)",borderRadius:9}}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            <span style={{fontSize:13,color:"var(--amber)"}}>Status <strong>{scanResult.data.status}</strong> — cannot process</span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Recent scans */}
          {recentScans.length>0 && (
            <div style={{marginTop:24,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"20px 22px",animation:"fadeUp 0.3s ease"}}>
              <h3 style={{fontSize:12,fontWeight:700,color:"var(--text-4)",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:14}}>Recent Scans</h3>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {recentScans.map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<recentScans.length-1?"1px solid var(--border)":"none"}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:s.evt==="IN"?"var(--teal)":"var(--green)",flexShrink:0}}/>
                    <span style={{color:"var(--text-1)",fontWeight:600,fontSize:13,minWidth:120}}>{s.studentName}</span>
                    <span style={{color:"var(--text-3)",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{s.destination}</span>
                    <span style={{color:s.evt==="IN"?"var(--teal)":"var(--green)",fontSize:11,fontWeight:600,flexShrink:0}}>
                      {s.evt} · {s.scannedAt?.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                    </span>
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

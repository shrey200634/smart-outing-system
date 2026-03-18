import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value:"STUDENT", label:"Student",    desc:"Apply for outings, track approvals, view your QR codes", gradient:"linear-gradient(135deg, #6C5CE7, #a29bfe)" },
  { value:"WARDEN",  label:"Warden",     desc:"Review requests, approve outings, monitor campus",       gradient:"linear-gradient(135deg, #00b894, #55efc4)" },
  { value:"GUARD",   label:"Gate Guard",  desc:"Verify student QR codes, manage gate entry & exit",     gradient:"linear-gradient(135deg, #fd79a8, #e84393)" },
];

const RoleIcon = ({ role }) => {
  const icons = {
    STUDENT: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>,
    WARDEN: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 0v1a3 3 0 0 0 6 0V7m0 0v1a3 3 0 0 0 6 0V7M3 7l9-4 9 4"/><path d="M6 21V11m12 10V11"/></svg>,
    GUARD: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  };
  return icons[role] || null;
};

export default function RoleSelector() {
  const { setUserRole } = useAuth();
  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",padding:20}}>

      <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:20,padding:"40px 40px",width:"100%",maxWidth:500,boxShadow:"0 20px 60px rgba(0,0,0,0.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28}}>
          <div style={{width:38,height:38,borderRadius:10,background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="#fff"/><path d="M12 16L15 19L21 13" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{fontSize:16,fontWeight:800,color:"var(--text-1)"}}>SmartOuting</span>
        </div>

        <h1 style={{fontSize:24,fontWeight:800,color:"var(--text-1)",marginBottom:8}}>How are you using SmartOuting?</h1>
        <p style={{fontSize:15,color:"var(--text-3)",marginBottom:28}}>Select your role to access your dashboard.</p>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {ROLES.map(r=>(
            <button key={r.value} onClick={()=>setUserRole(r.value)}
              style={{display:"flex",alignItems:"center",gap:14,padding:"18px 20px",border:"1.5px solid var(--border)",borderRadius:14,cursor:"pointer",textAlign:"left",background:"#fff",transition:"all 0.2s",width:"100%",fontFamily:"'Inter',sans-serif",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{width:46,height:46,borderRadius:12,background:r.gradient,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}>
                <RoleIcon role={r.value} />
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:"var(--text-1)",marginBottom:3}}>{r.label}</div>
                <div style={{fontSize:13,color:"var(--text-3)",lineHeight:1.4}}>{r.desc}</div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth="2" style={{flexShrink:0}}><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

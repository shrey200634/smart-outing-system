import { useState, useCallback, useEffect } from "react";

let _add = null;
export function useToast() {
  const toast = useCallback((msg, type="info") => { if (_add) _add(msg, type); }, []);
  return { toast };
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _add = (msg, type) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4200);
  };
  const remove = (id) => setToasts(p => p.filter(t => t.id !== id));

  const cfg = {
    success: { bg:"#0E2D1E", border:"rgba(31,209,122,0.25)", icon:"var(--green)",  dot:"var(--green)"  },
    error:   { bg:"#2D0E0E", border:"rgba(255,92,92,0.25)",  icon:"var(--red)",    dot:"var(--red)"    },
    warn:    { bg:"#2D1E0E", border:"rgba(245,166,35,0.25)", icon:"var(--amber)",  dot:"var(--amber)"  },
    info:    { bg:"#0A1E28", border:"rgba(0,212,170,0.22)",  icon:"var(--teal)",   dot:"var(--teal)"   },
  };
  const icons = {
    success: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
    error:   <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
    warn:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v5M6 9v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
    info:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 5v4M6 3v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  };

  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:99999, display:"flex", flexDirection:"column", gap:8, pointerEvents:"none" }}>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(32px) scale(0.95);}to{opacity:1;transform:translateX(0) scale(1);}}`}</style>
      {toasts.map(t => {
        const c = cfg[t.type] || cfg.info;
        return (
          <div key={t.id} onClick={() => remove(t.id)}
            style={{ display:"flex", alignItems:"center", gap:11, padding:"11px 16px", background:c.bg, border:`1px solid ${c.border}`, borderRadius:10, color:"var(--text-1)", fontSize:13, fontWeight:500, fontFamily:"'Inter',sans-serif", boxShadow:"0 8px 32px rgba(0,0,0,0.4)", cursor:"pointer", animation:"toastIn 0.3s cubic-bezier(.34,1.26,.64,1) both", maxWidth:340, pointerEvents:"all" }}>
            <div style={{ width:20, height:20, borderRadius:"50%", background:`${c.dot}18`, border:`1px solid ${c.dot}40`, display:"flex", alignItems:"center", justifyContent:"center", color:c.icon, flexShrink:0 }}>
              {icons[t.type]}
            </div>
            <span style={{ flex:1, lineHeight:1.45 }}>{t.msg}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink:0, opacity:0.4 }}><line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        );
      })}
    </div>
  );
}

import { useState, useCallback } from "react";

let _addToast = null;

export function useToast() {
  const toast = useCallback((msg, type = "info") => {
    if (_addToast) _addToast(msg, type);
  }, []);
  return { toast };
}

const TOAST_CONFIG = {
  success: { bg: "#00B894", color: "#fff", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
  error:   { bg: "#E74C3C", color: "#fff", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
  info:    { bg: "#6C5CE7", color: "#fff", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg> },
  warn:    { bg: "#F0A500", color: "#fff", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  _addToast = (msg, type) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const remove = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => {
        const config = TOAST_CONFIG[t.type] || TOAST_CONFIG.info;
        return (
          <div key={t.id} onClick={() => remove(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 18px",
              background: config.bg,
              borderRadius: 12, color: config.color,
              fontFamily: "'Inter', sans-serif",
              fontSize: 14, fontWeight: 600,
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              cursor: "pointer",
              animation: "toastIn 0.3s ease",
              maxWidth: 360,
            }}
          >
            <span style={{ display: "flex", flexShrink: 0 }}>{config.icon}</span>
            <span>{t.msg}</span>
          </div>
        );
      })}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

import { useState, useCallback, useEffect } from "react";

let _addToast = null;

export function useToast() {
  const toast = useCallback((msg, type = "info") => {
    if (_addToast) _addToast(msg, type);
  }, []);
  return { toast };
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  _addToast = (msg, type) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const remove = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const icons = { success: "✓", error: "✕", info: "◆", warn: "⚠" };
  const colors = {
    success: "linear-gradient(135deg, #00c896, #00a878)",
    error: "linear-gradient(135deg, #ff4d6d, #c9184a)",
    info: "linear-gradient(135deg, #4cc9f0, #4361ee)",
    warn: "linear-gradient(135deg, #f8961e, #f3722c)",
  };

  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 20px",
            background: colors[t.type] || colors.info,
            borderRadius: 12,
            color: "#fff",
            fontFamily: "'Syne', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            cursor: "pointer",
            animation: "toastIn 0.35s cubic-bezier(.34,1.56,.64,1)",
            maxWidth: 380,
            backdropFilter: "blur(10px)",
          }}
        >
          <span style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, flexShrink: 0,
          }}>
            {icons[t.type] || "◆"}
          </span>
          <span>{t.msg}</span>
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(60px) scale(0.8); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

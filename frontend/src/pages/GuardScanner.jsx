import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { outingAPI } from "../utils/api";
import { useToast } from "../components/Toast";

function formatDT(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function GuardScanner() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [outingId, setOutingId] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  // QR Scanner initialization
  useEffect(() => {
    if (!showScanner) return;

    let html5QrcodeScanner = null;

    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        
        html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        html5QrcodeScanner.render(
          (decodedText) => {
            // Extract ID from QR: "ID:42-STATUS:APPROVED-ST12345"
            const match = decodedText.match(/ID:(\d+)/);
            if (match) {
              const id = match[1];
              setOutingId(id);
              toast(`✅ Scanned ID: ${id}`, "success");
              fetchOutingById(id);
              setShowScanner(false);
              html5QrcodeScanner?.clear();
            } else {
              toast("Invalid QR format", "warn");
            }
          },
          (error) => console.debug("Scan error:", error)
        );
      } catch (error) {
        toast("Camera access denied", "error");
        setShowScanner(false);
      }
    };

    initScanner();
    return () => html5QrcodeScanner?.clear().catch(() => {});
  }, [showScanner, toast]);

  const fetchOutingById = async (id) => {
    const searchId = id || outingId;
    if (!searchId.trim()) return toast("Enter outing ID", "warn");
    
    setLoading(true);
    setScanResult(null);
    try {
      const data = await outingAPI.getById(Number(searchId));
      setScanResult({ type: "preview", data });
    } catch (err) {
      toast("Not found: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!scanResult?.data?.id) return;
    setScanning(true);
    try {
      const result = await outingAPI.scan(scanResult.data.id);
      toast(`✅ ${result.studentName} marked OUT`, "success");
      setRecentScans(p => [{ ...result, scannedAt: new Date(), eventType: "OUT" }, ...p.slice(0, 9)]);
      setScanResult({ type: "success", data: result });
      setOutingId("");
    } catch (err) {
      toast(err.message || "Scan failed", "error");
      if ((err.message || "").includes("NOT approved")) {
        setScanResult(p => ({ ...p, error: "NOT approved to leave!" }));
      }
    } finally {
      setScanning(false);
    }
  };

  const handleReturn = async () => {
    if (!scanResult?.data?.id) return;
    setScanning(true);
    try {
      const result = await outingAPI.returnIn(scanResult.data.id);
      toast(`✅ ${result.studentName} marked RETURNED`, "success");
      setRecentScans(p => [{ ...result, scannedAt: new Date(), eventType: "IN" }, ...p.slice(0, 9)]);
      setScanResult({ type: "returned", data: result });
      setOutingId("");
    } catch (err) {
      toast(err.message || "Return failed", "error");
    } finally {
      setScanning(false);
    }
  };

  const statusColor = {
    PENDING: "#fbbf24", APPROVED: "#10b981", OUT: "#818cf8", OVERDUE: "#ef4444", RETURNED: "#9ca3af",
  };

  return (
    <div style={styles.layout}>
      {/* Scanner Modal */}
      {showScanner && (
        <div style={styles.scannerOverlay}>
          <div style={styles.scannerModal}>
            <div style={styles.scannerHeader}>
              <h3 style={{ color: "#f9fafb", fontSize: 18, fontWeight: 700 }}>📷 Scan QR Code</h3>
              <button onClick={() => setShowScanner(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div id="qr-reader" style={{ width: "100%", borderRadius: 12 }}></div>
            <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 16, textAlign: "center" }}>
              Point camera at student's QR code
            </p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>
            <div style={styles.brandIcon}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L28 8V16C28 22.627 22.627 28 16 30C9.373 28 4 22.627 4 16V8L16 2Z" fill="url(#gg)" />
                <path d="M12 16L15 19L21 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs><linearGradient id="gg" x1="4" y1="2" x2="28" y2="30"><stop stopColor="#F6C90E"/><stop offset="1" stopColor="#E8A000"/></linearGradient></defs>
              </svg>
            </div>
            <div>
              <div style={styles.brandName}>SmartOuting</div>
              <div style={{ fontSize: 11, color: "#10b981", marginTop: 1 }}>Guard Panel</div>
            </div>
          </div>

          <div style={styles.userCard}>
            <div style={{ ...styles.avatar, background: "linear-gradient(135deg, #10b981, #059669)" }}>
              {user?.name?.[0]?.toUpperCase() || "G"}
            </div>
            <div>
              <div style={{ color: "#f9fafb", fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
              <div style={{ color: "#10b981", fontSize: 12, marginTop: 2 }}>🛡️ Gate Guard</div>
            </div>
          </div>

          <div style={styles.instructions}>
            <div style={styles.instructTitle}>How to verify</div>
            {[
              "Click 'Scan QR' button",
              "Point camera at QR code",
              "System extracts ID",
              "Click 'Mark OUT' to exit",
              "Click 'Mark IN' when return",
            ].map((step, i) => (
              <div key={i} style={styles.instructStep}>
                <span style={styles.instructNum}>{i + 1}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={logout} style={styles.logoutBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Gate Scanner</h1>
          <p style={styles.pageSub}>Scan QR or enter ID manually</p>
        </div>

        <div style={styles.scanCard}>
          <div style={styles.pulseWrap}>
            <div style={styles.pulseRing1} />
            <div style={styles.pulseRing2} />
            <div style={styles.scanIcon}>🔍</div>
          </div>

          <h2 style={styles.scanTitle}>Verify Student</h2>
          <p style={styles.scanSub}>Scan QR code or enter ID</p>

          {/* SCAN BUTTON */}
          <button onClick={() => setShowScanner(true)} style={styles.qrScanBtn}>
            📷 Scan QR Code
          </button>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>OR</span>
            <div style={styles.dividerLine} />
          </div>

          {/* MANUAL INPUT */}
          <div style={styles.inputRow}>
            <input
              value={outingId}
              onChange={(e) => setOutingId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchOutingById()}
              placeholder="e.g. 42"
              type="number"
              style={styles.scanInput}
            />
            <button onClick={fetchOutingById} disabled={loading} style={styles.fetchBtn}>
              {loading ? "..." : "Lookup"}
            </button>
          </div>

          {/* RESULT */}
          {scanResult && (
            <div style={{
              ...styles.resultCard,
              borderColor: scanResult.type === "success" ? "rgba(16,185,129,0.3)"
                : scanResult.error ? "rgba(239,68,68,0.3)" : "rgba(246,201,14,0.2)",
            }}>
              {scanResult.error ? (
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🚫</div>
                  <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 15 }}>{scanResult.error}</div>
                </div>
              ) : (
                <>
                  <div style={styles.resultHeader}>
                    <div>
                      <div style={{ color: "#f9fafb", fontSize: 18, fontWeight: 800 }}>
                        {scanResult.data.studentName}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>ID: {scanResult.data.studentId}</div>
                    </div>
                    <span style={{
                      padding: "6px 14px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                      background: `${statusColor[scanResult.data.status]}15`,
                      color: statusColor[scanResult.data.status],
                      border: `1.5px solid ${statusColor[scanResult.data.status]}40`,
                    }}>
                      {scanResult.data.status}
                    </span>
                  </div>

                  <div style={styles.resultGrid}>
                    <div style={styles.resultItem}>
                      <div style={styles.resultLabel}>Destination</div>
                      <div style={styles.resultValue}>{scanResult.data.destination}</div>
                    </div>
                    <div style={styles.resultItem}>
                      <div style={styles.resultLabel}>Reason</div>
                      <div style={styles.resultValue}>{scanResult.data.reason}</div>
                    </div>
                    <div style={styles.resultItem}>
                      <div style={styles.resultLabel}>Out Date</div>
                      <div style={styles.resultValue}>{formatDT(scanResult.data.outDate)}</div>
                    </div>
                    <div style={styles.resultItem}>
                      <div style={styles.resultLabel}>Return Date</div>
                      <div style={styles.resultValue}>{formatDT(scanResult.data.returnDate)}</div>
                    </div>
                  </div>

                  {scanResult.type === "success" && (
                    <div style={styles.successBanner}>
                      <div style={{ fontSize: 24 }}>✅</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#10b981", fontWeight: 700, fontSize: 14 }}>Marked OUT</div>
                        <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>Parent email sent</div>
                      </div>
                    </div>
                  )}

                  {scanResult.type === "returned" && (
                    <div style={styles.returnedBanner}>
                      <div style={{ fontSize: 24 }}>🏠</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#818cf8", fontWeight: 700, fontSize: 14 }}>Marked RETURNED</div>
                        <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>Student back on campus</div>
                      </div>
                    </div>
                  )}

                  {scanResult.type === "preview" && (
                    <>
                      {scanResult.data.status === "APPROVED" && (
                        <button onClick={handleScan} disabled={scanning} style={styles.markOutBtn}>
                          {scanning ? "Processing..." : "✓ Mark OUT (Exit)"}
                        </button>
                      )}

                      {(scanResult.data.status === "OUT" || scanResult.data.status === "OVERDUE") && (
                        <button onClick={handleReturn} disabled={scanning} style={styles.markInBtn}>
                          {scanning ? "Processing..." : "🏠 Mark IN (Return)"}
                        </button>
                      )}

                      {!["APPROVED", "OUT", "OVERDUE"].includes(scanResult.data.status) && (
                        <div style={styles.warningBanner}>
                          <div style={{ fontSize: 20 }}>⚠️</div>
                          <span style={{ fontSize: 13, color: "#f59e0b", flex: 1 }}>
                            Status: <strong>{scanResult.data.status}</strong> — Cannot process
                          </span>
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
        {recentScans.length > 0 && (
          <div style={styles.recentSection}>
            <h2 style={styles.recentTitle}>Recent Scans</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentScans.map((s, i) => (
                <div key={i} style={styles.recentItem}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.eventType === "IN" ? "#818cf8" : "#10b981", flexShrink: 0 }} />
                  <span style={{ color: "#f9fafb", fontWeight: 600, fontSize: 13 }}>{s.studentName}</span>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>→ {s.destination}</span>
                  <span style={{ marginLeft: "auto", color: s.eventType === "IN" ? "#818cf8" : "#10b981", fontSize: 11 }}>
                    {s.eventType} • {s.scannedAt?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060D1F; }
        input { color-scheme: dark; }
        input::placeholder { color: #4b5563; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.15);opacity:0.15} }
        @keyframes pulse2 { 0%,100%{transform:scale(1);opacity:0.2} 50%{transform:scale(1.25);opacity:0.05} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", background: "#060D1F", fontFamily: "'DM Sans', sans-serif" },
  sidebar: {
    width: 260, background: "rgba(10,18,40,0.98)", borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    padding: "24px 16px", position: "sticky", top: 0, height: "100vh", flexShrink: 0,
  },
  brand: { display: "flex", alignItems: "center", gap: 12, padding: "0 8px", marginBottom: 20 },
  brandIcon: {
    width: 40, height: 40, borderRadius: 12, background: "rgba(246,201,14,0.1)",
    border: "1px solid rgba(246,201,14,0.2)", display: "flex", alignItems: "center", justifyContent: "center",
  },
  brandName: { fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#F6C90E" },
  userCard: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
    background: "rgba(16,185,129,0.06)", borderRadius: 12, border: "1px solid rgba(16,185,129,0.15)", marginBottom: 24,
  },
  avatar: {
    width: 36, height: 36, borderRadius: "50%", color: "white", fontWeight: 800, fontSize: 15,
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif",
  },
  instructions: {
    background: "rgba(255,255,255,0.02)", borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.05)", padding: 16, display: "flex", flexDirection: "column", gap: 10,
  },
  instructTitle: { fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 },
  instructStep: { display: "flex", alignItems: "flex-start", gap: 10 },
  instructNum: {
    width: 20, height: 20, borderRadius: "50%", background: "rgba(246,201,14,0.1)",
    border: "1px solid rgba(246,201,14,0.2)", color: "#F6C90E", fontSize: 10, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
  },
  logoutBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.15)",
    background: "rgba(239,68,68,0.05)", color: "#ef4444", fontSize: 13,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  main: { flex: 1, padding: "40px 48px", overflow: "auto" },
  pageHeader: { marginBottom: 36 },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f9fafb" },
  pageSub: { color: "#6b7280", fontSize: 14, marginTop: 6 },
  scanCard: {
    background: "rgba(10,18,40,0.9)", border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: 24, padding: "48px 40px", textAlign: "center", maxWidth: 600,
    position: "relative", overflow: "hidden", boxShadow: "0 16px 60px rgba(0,0,0,0.4)", animation: "fadeIn 0.4s ease",
  },
  pulseWrap: { position: "relative", width: 80, height: 80, margin: "0 auto 24px" },
  pulseRing1: {
    position: "absolute", inset: 0, borderRadius: "50%",
    background: "rgba(16,185,129,0.15)", animation: "pulse 2.5s ease-in-out infinite",
  },
  pulseRing2: {
    position: "absolute", inset: -12, borderRadius: "50%",
    background: "rgba(16,185,129,0.07)", animation: "pulse2 2.5s ease-in-out infinite",
  },
  scanIcon: {
    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 32, zIndex: 1,
  },
  scanTitle: { fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#f9fafb", marginBottom: 8 },
  scanSub: { color: "#6b7280", fontSize: 14, marginBottom: 28 },
  qrScanBtn: {
    width: "100%", maxWidth: 400, margin: "0 auto", padding: "18px 32px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none", borderRadius: 16, color: "white", fontSize: 16, fontWeight: 700,
    fontFamily: "'Syne', sans-serif", cursor: "pointer",
    boxShadow: "0 8px 28px rgba(16,185,129,0.4)",
  },
  divider: { display: "flex", alignItems: "center", gap: 16, margin: "24px 0" },
  dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.1)" },
  dividerText: { color: "#6b7280", fontSize: 12, fontWeight: 600 },
  inputRow: { display: "flex", gap: 12, justifyContent: "center" },
  scanInput: {
    padding: "14px 20px", background: "rgba(255,255,255,0.05)",
    border: "2px solid rgba(16,185,129,0.2)", borderRadius: 14,
    color: "#f9fafb", fontSize: 20, fontWeight: 700,
    fontFamily: "'Syne', sans-serif", outline: "none", width: 180,
    textAlign: "center", letterSpacing: "2px",
  },
  fetchBtn: {
    padding: "14px 28px", background: "linear-gradient(135deg, #6b7280, #4b5563)",
    border: "none", borderRadius: 14, color: "white", fontSize: 15, fontWeight: 700,
    fontFamily: "'Syne', sans-serif", cursor: "pointer",
  },
  scannerOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, padding: 20,
  },
  scannerModal: {
    background: "rgba(10,18,40,0.98)", border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: 20, padding: 24, maxWidth: 500, width: "100%",
    boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
  },
  scannerHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: "50%",
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
    color: "#ef4444", fontSize: 18, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  resultCard: {
    marginTop: 28, background: "rgba(255,255,255,0.02)", border: "1.5px solid",
    borderRadius: 16, padding: 24, textAlign: "left", animation: "fadeIn 0.3s ease",
  },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  resultGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  resultItem: { display: "flex", flexDirection: "column", gap: 4 },
  resultLabel: { fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" },
  resultValue: { fontSize: 13, color: "#e5e7eb" },
  markOutBtn: {
    width: "100%", marginTop: 20, padding: "16px 24px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none", borderRadius: 12, color: "white", fontSize: 15, fontWeight: 700,
    fontFamily: "'Syne', sans-serif", cursor: "pointer", boxShadow: "0 8px 28px rgba(16,185,129,0.35)",
  },
  markInBtn: {
    width: "100%", marginTop: 20, padding: "16px 24px",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    border: "none", borderRadius: 12, color: "white", fontSize: 15, fontWeight: 700,
    fontFamily: "'Syne', sans-serif", cursor: "pointer", boxShadow: "0 8px 28px rgba(99,102,241,0.35)",
  },
  successBanner: {
    marginTop: 16, display: "flex", alignItems: "center", gap: 12,
    padding: "14px 18px", background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10,
  },
  returnedBanner: {
    marginTop: 16, display: "flex", alignItems: "center", gap: 12,
    padding: "14px 18px", background: "rgba(129,140,248,0.1)",
    border: "1px solid rgba(129,140,248,0.25)", borderRadius: 10,
  },
  warningBanner: {
    marginTop: 16, display: "flex", alignItems: "flex-start", gap: 12,
    padding: "14px 18px", background: "rgba(251,191,36,0.06)",
    border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10,
  },
  recentSection: {
    marginTop: 32, background: "rgba(10,18,40,0.7)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16, padding: 24, maxWidth: 600,
  },
  recentTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#9ca3af",
    textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16,
  },
  recentItem: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
};
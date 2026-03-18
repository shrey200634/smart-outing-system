import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ToastContainer from "./components/Toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentPortal from "./pages/StudentPortal";
import WardenDashboard from "./pages/WardenDashboard";
import GuardScanner from "./pages/GuardScanner";
import RoleSelector from "./pages/RoleSelector";

function AppContent() {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState("login");

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#060D1F",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16,
      }}>
        <div style={{
          width: 44, height: 44,
          border: "3px solid rgba(255,255,255,0.1)",
          borderTopColor: "#F6C90E",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#6b7280", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
          Loading SmartOuting...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    if (authPage === "register") {
      return <Register onSwitchToLogin={() => setAuthPage("login")} />;
    }
    return <Login onSwitchToRegister={() => setAuthPage("register")} />;
  }

  // Logged in — route by role
  const role = user.role;
  if (!role) return <RoleSelector />;
  if (role === "STUDENT") return <StudentPortal />;
  if (role === "WARDEN") return <WardenDashboard />;
  if (role === "GUARD") return <GuardScanner />;

  return <RoleSelector />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <AppContent />
    </AuthProvider>
  );
}

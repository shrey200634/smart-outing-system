// ============================================================
//  API Utility — Smart Outing System
//  Uses Vite proxy in dev → no CORS issues!
//  Proxy: /auth → http://localhost:8989/auth
//         /outing → http://localhost:8989/outing
// ============================================================

// Use relative paths — Vite proxy handles the forwarding to port 8989
// This completely eliminates CORS issues in development
const BASE = "";

async function request(url, options = {}) {
  const token = localStorage.getItem("sos_token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${url}`, { ...options, headers });
  } catch (networkErr) {
    throw new Error(
      "Cannot connect to server. Make sure the backend is running on port 8989 and all microservices are up."
    );
  }

  if (!res.ok) {
    let errMsg = `Server error (${res.status})`;
    try {
      const text = await res.text();
      if (text) errMsg = text;
    } catch (_) {}
    throw new Error(errMsg);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

// ── AUTH ───────────────────────────────────────────────────
export const authAPI = {
  // POST /auth/register  →  body: { name, email, password, role }
  register: (data) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // POST /auth/token  →  body: { username, password }
  login: (username, password) =>
    request("/auth/token", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  // GET /auth/validate?token=...
  validate: (token) => request(`/auth/validate?token=${encodeURIComponent(token)}`),
};

// ── OUTING ────────────────────────────────────────────────
export const outingAPI = {
  // POST /outing/apply
  apply: (data) =>
    request("/outing/apply", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // PUT /outing/approve/{id}?comment=...
  approve: (id, comment) =>
    request(`/outing/approve/${id}?comment=${encodeURIComponent(comment)}`, {
      method: "PUT",
    }),

  // PUT /outing/scan/{id}
  scan: (id) =>
    request(`/outing/scan/${id}`, { method: "PUT" }),

  // GET /outing/all
  getAll: () => request("/outing/all"),

  // GET /outing/{id}
  getById: (id) => request(`/outing/${id}`),

  // GET /outing/student/{studentId}
  getStudentHistory: (studentId) =>
    request(`/outing/student/${encodeURIComponent(studentId)}`),
};

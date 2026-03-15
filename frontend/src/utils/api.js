// ============================================================
//  API Utility — Smart Outing System
//  Vite proxy forwards /auth and /outing to port 8989
// ============================================================

async function request(url, options = {}) {
  const token = localStorage.getItem("sos_token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    throw new Error(
      "Network error: Cannot reach the server.\n\nMake sure ALL 4 backend services are running:\n1. service-registry  → port 8761\n2. identity-service  → port 8081\n3. outing-service    → port 8082\n4. api-gateway       → port 8989\n\nStart them in that order and wait ~30 seconds before trying again."
    );
  }

  if (!res.ok) {
    let errMsg = `Server error (${res.status})`;
    try {
      const text = await res.text();
      if (text) errMsg = text;
    } catch (_) {}

    // 404 from gateway = service not yet registered with Eureka
    if (res.status === 404) {
      throw new Error(
        "404: Service not found.\n\nThis usually means identity-service or outing-service hasn't registered with Eureka yet.\n\n✅ Fix: Wait 15–30 seconds after starting all services, then try again."
      );
    }
    throw new Error(errMsg);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

// ── AUTH ────────────────────────────────────────────────────
export const authAPI = {
  register: (data) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Backend uses name (not email) to look up user: findByName(username)
  login: (username, password) =>
    request("/auth/token", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  validate: (token) =>
    request(`/auth/validate?token=${encodeURIComponent(token)}`),
};

// ── OUTING ──────────────────────────────────────────────────
export const outingAPI = {
  apply: (data) =>
    request("/outing/apply", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approve: (id, comment) =>
    request(`/outing/approve/${id}?comment=${encodeURIComponent(comment)}`, {
      method: "PUT",
    }),

  scan: (id) =>
    request(`/outing/scan/${id}`, { method: "PUT" }),

  returnIn: (id) =>
    request(`/outing/return/${id}`, { method: "PUT" }),

  getAll: () => request("/outing/all"),

  getById: (id) => request(`/outing/${id}`),

  getStudentHistory: (studentId) =>
    request(`/outing/student/${encodeURIComponent(studentId)}`),
};

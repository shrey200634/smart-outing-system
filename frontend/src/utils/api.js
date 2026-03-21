// ============================================================
//  API Utility — Smart Outing System
//  Netlify proxies /auth and /outing to Railway API Gateway
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
      "Network error: Cannot reach the server. Please try again later."
    );
  }

  if (!res.ok) {
    let errMsg = `Server error (${res.status})`;
    try {
      const text = await res.text();
      if (text) errMsg = text;
    } catch (_) {}

    if (res.status === 404) {
      throw new Error(
        "404: Service not found. Please wait a moment and try again."
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

  verifyOtp: (email, otp) =>
    request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  resendOtp: (email) =>
    request("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

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
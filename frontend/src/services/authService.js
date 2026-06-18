const BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const TOKEN_KEY = "aarogya_token";
const SESSION_KEY = "medico_session";

const ROLE_MAP = {
  admin: "ADMIN",
  doctor: "DOCTOR",
  patient: "PATIENT",
  nurse: "NURSE",
  billing: "BILLING",
  lab_assistant: "LAB",
  dispensary_staff: "CLINIC",
  appointment_manager: "APPOINTMENT",
};

function normalizeRole(role) {
  if (!role) return role;
  return ROLE_MAP[role.toLowerCase()] || role.toUpperCase();
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `API ${res.status}`);
  return data;
}

export const authService = {
  login: async (credentials) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    });
    const token = data.data?.token;
    const user = data.data?.user;
    if (user) user.role = normalizeRole(user.role);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { user };
  },

  register: async (userData) => {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    const token = data.data?.token;
    const user = data.data?.user;
    if (user) user.role = normalizeRole(user.role);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { user };
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    return { message: "Logged out" };
  },

  getMe: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error("Unauthorized");
    const data = await request("/auth/me");
    const user = data.data?.user;
    if (user) user.role = normalizeRole(user.role);
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { user };
  },
};

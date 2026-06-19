import axios from "axios";
import { users } from "./mockData";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const mapRole = (backendRole) => {
  const r = (backendRole || "").toLowerCase();
  if (r === "admin") return "ADMIN";
  if (r === "doctor") return "DOCTOR";
  if (r === "lab_assistant" || r === "lab") return "LAB";
  if (r === "appointment_manager" || r === "appointment") return "APPOINTMENT";
  if (r === "dispensary_staff" || r === "clinic") return "CLINIC";
  return backendRole.toUpperCase();
};

export const authService = {
  login: async (credentials) => {
    let { email, password } = credentials;

    // Map mock credentials to seeded DB users
    if (email === "admin.medico" && password === "medicouseradmin") {
      email = "admin@hospital.com";
      password = "Admin@123";
    } else if (email === "doctor.medico" && password === "medicouserdoctor") {
      email = "doctor@hospital.com";
      password = "Doctor@123";
    } else if (email === "lab.medico" && password === "medicouserlab") {
      email = "lab@hospital.com";
      password = "Lab@1234";
    } else if (email === "appointment.medico" && password === "medicouserappointment") {
      email = "scheduler@hospital.com";
      password = "Schedule@123";
    } else if (email === "clinic.medico" && password === "medicouserclinic") {
      email = "dispensary@hospital.com";
      password = "Dispense@123";
    }

    try {
      // Call the real backend login endpoint
      const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      const { token, user } = response.data.data;

      // Save token for API interceptors
      localStorage.setItem("aarogya_token", token);

      // Save session in local storage matching the mock format
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: mapRole(user.role), // Map role to uppercase/frontend format
        phone: user.phone,
        specializations: user.specializations || [],
        degrees: user.degrees || [],
        medals: user.medals || [],
        history: user.history || [],
      };

      localStorage.setItem("medico_session", JSON.stringify(userData));

      return { user: userData };
    } catch (error) {
      console.error("Backend login failed, falling back to mock", error);
      
      // Fallback to mock login for offline testing if backend is down
      let mockUser = users.find(
        (u) =>
          (u.email === credentials.email || u.id === credentials.email) &&
          u.password === credentials.password
      );

      if (!mockUser) {
        throw new Error(error.response?.data?.message || "Invalid credentials");
      }

      const userData = {
        id: mockUser.id || mockUser.email,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        phone: mockUser.phone,
        specializations: mockUser.specializations || [],
        degrees: mockUser.degrees || [],
        medals: mockUser.medals || [],
        history: mockUser.history || [],
      };

      localStorage.setItem("medico_session", JSON.stringify(userData));
      return { user: userData };
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, userData);
      const { token, user } = response.data.data;
      localStorage.setItem("aarogya_token", token);
      const mappedUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: mapRole(user.role),
        phone: user.phone,
        specializations: user.specializations || [],
        degrees: user.degrees || [],
        medals: user.medals || [],
        history: user.history || [],
      };
      localStorage.setItem("medico_session", JSON.stringify(mappedUser));
      return { user: mappedUser };
    } catch (error) {
      console.error("Backend register failed, falling back to mock registration", error);

      await new Promise((resolve) => setTimeout(resolve, 800));

      const registeredUsers = JSON.parse(
        localStorage.getItem("medico_registered_users") || "[]"
      );

      const newUser = {
        ...userData,
        id: `REG-${Date.now().toString().slice(-4)}`,
      };

      registeredUsers.push(newUser);

      localStorage.setItem(
        "medico_registered_users",
        JSON.stringify(registeredUsers)
      );

      return {
        user: newUser,
      };
    }
  },

  logout: async () => {
    localStorage.removeItem("medico_session");
    localStorage.removeItem("aarogya_token");

    return {
      message: "Logged out",
    };
  },

  getMe: async () => {
    const token = localStorage.getItem("aarogya_token");
    if (token) {
      try {
        const response = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { user } = response.data.data;
        const userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: mapRole(user.role),
          phone: user.phone,
          specializations: user.specializations || [],
          degrees: user.degrees || [],
          medals: user.medals || [],
          history: user.history || [],
        };
        localStorage.setItem("medico_session", JSON.stringify(userData));
        return { user: userData };
      } catch (error) {
        console.error("Fetch profile failed, falling back to local session", error);
      }
    }

    const session = localStorage.getItem("medico_session");

    if (!session) {
      throw new Error("Unauthorized");
    }

    return {
      user: JSON.parse(session),
    };
  },
};

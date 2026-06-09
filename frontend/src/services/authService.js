import { users } from "./mockData";

export const authService = {

  // ======================================================
  // LOGIN
  // ======================================================

  login: async (credentials) => {

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // ======================================================
    // FIND USER IN MOCK USERS
    // ======================================================

    let user = users.find(
      (u) =>
        (
          u.email === credentials.email ||
          u.id === credentials.email
        ) &&
        u.password === credentials.password
    );

    // ======================================================
    // CHECK REGISTERED USERS FROM LOCAL STORAGE
    // ======================================================

    if (!user) {

      const registeredUsers = JSON.parse(
        localStorage.getItem("medico_registered_users") || "[]"
      );

      user = registeredUsers.find(
        (u) =>
          (
            u.email === credentials.email ||
            u.id === credentials.email
          ) &&
          u.password === credentials.password
      );
    }

    // ======================================================
    // INVALID USER
    // ======================================================

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // ======================================================
    // USER SESSION DATA
    // ======================================================

    const userData = {
      id: user.id || user.email,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      specializations: user.specializations || [],
      degrees: user.degrees || [],
      medals: user.medals || [],
      history: user.history || [],
    };

    // ======================================================
    // SAVE SESSION
    // ======================================================

    localStorage.setItem(
      "medico_session",
      JSON.stringify(userData)
    );

    return {
      user: userData,
    };
  },

  // ======================================================
  // REGISTER
  // ======================================================

  register: async (userData) => {

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
  },

  // ======================================================
  // LOGOUT
  // ======================================================

  logout: async () => {

    localStorage.removeItem("medico_session");

    return {
      message: "Logged out",
    };
  },

  // ======================================================
  // GET CURRENT USER
  // ======================================================

  getMe: async () => {

    const session = localStorage.getItem("medico_session");

    if (!session) {
      throw new Error("Unauthorized");
    }

    return {
      user: JSON.parse(session),
    };
  },
};
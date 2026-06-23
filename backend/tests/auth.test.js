import "dotenv/config";
import request from "supertest";
import db from "../config/db-client.js";
import app from "../app.js";
import User from "../models/User.js";

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.disconnect();
});

afterEach(async () => {
  await User.deleteMany({});
});


describe("Auth Routes", () => {
  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email: "test@example.com", password: "password123" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("test@example.com");
    expect(res.body.data.token).toBeDefined();
  });

  it("should login a user and return JWT", async () => {
    const password = "password123";
    const user = new User({ name: "Test User", email: "login@example.com", role: "PATIENT", isActive: true });
    await user.setPassword(password);
    await user.save();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("should return profile for authenticated user", async () => {
    const password = "password123";
    const user = new User({ name: "Profile User", email: "profile@example.com", role: "PATIENT", isActive: true });
    await user.setPassword(password);
    await user.save();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "profile@example.com", password });

    const token = loginRes.body.data.token;
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("profile@example.com");
  });

  it("should change password for authenticated user", async () => {
    const password = "password123";
    const user = new User({ name: "Password User", email: "changepwd@example.com", role: "PATIENT", isActive: true });
    await user.setPassword(password);
    await user.save();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "changepwd@example.com", password });

    const token = loginRes.body.data.token;
    const res = await request(app)
      .post("/api/users/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ oldPassword: password, newPassword: "newpassword123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe("Password changed successfully");
  });

  it("should create a user as admin and get all users", async () => {
    const password = "admin123";
    const admin = new User({ name: "Admin", email: "admin@example.com", role: "ADMIN", isActive: true });
    await admin.setPassword(password);
    await admin.save();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password });

    const token = loginRes.body.data.token;
    const createRes = await request(app)
      .post("/api/auth/create-user")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "User Two", email: "user2@example.com", password: "password123", role: "PATIENT" });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.data.user.email).toBe("user2@example.com");

    const usersRes = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(usersRes.statusCode).toBe(200);
    expect(usersRes.body.data.users.length).toBe(2);
  });

  it("should create a user as admin via /api/admin/users alias", async () => {
    const password = "admin123";
    const admin = new User({ name: "Admin", email: "adminalias@example.com", role: "ADMIN", isActive: true });
    await admin.setPassword(password);
    await admin.save();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "adminalias@example.com", password });

    const token = loginRes.body.data.token;
    const createRes = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "User Alias", email: "useralias@example.com", password: "password123", role: "PATIENT" });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.data.user.email).toBe("useralias@example.com");
  });

  it("should execute the full admin user management flow", async () => {
    const adminPassword = "admin@123456";
    const admin = new User({ name: "Admin User", email: "admin@hospital.com", role: "ADMIN", isActive: true });
    await admin.setPassword(adminPassword);
    await admin.save();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@hospital.com", password: adminPassword });

    expect(loginRes.statusCode).toBe(200);
    const token = loginRes.body.data.token;

    const createRes = await request(app)
      .post("/api/auth/create-user")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Doctor Test", email: "doctor@test.com", password: "password123", role: "DOCTOR", phone: "9999999999" });

    expect(createRes.statusCode).toBe(201);
    const createdUserId = createRes.body.data.user._id;
    expect(createRes.body.data.user.role).toBe("DOCTOR");
    expect(createRes.body.data.user.email).toBe("doctor@test.com");

    const usersRes = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(usersRes.statusCode).toBe(200);
    expect(Array.isArray(usersRes.body.data.users)).toBe(true);
    expect(usersRes.body.data.users.some((u) => u.email === "doctor@test.com")).toBe(true);

    const deactivateRes = await request(app)
      .patch(`/api/users/${createdUserId}/deactivate`)
      .set("Authorization", `Bearer ${token}`);

    expect(deactivateRes.statusCode).toBe(200);
    expect(deactivateRes.body.data.user.isActive).toBe(false);

    const activateRes = await request(app)
      .patch(`/api/users/${createdUserId}/activate`)
      .set("Authorization", `Bearer ${token}`);

    expect(activateRes.statusCode).toBe(200);
    expect(activateRes.body.data.user.isActive).toBe(true);

    const changeRoleRes = await request(app)
      .patch(`/api/users/${createdUserId}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "NURSE" });

    expect(changeRoleRes.statusCode).toBe(200);
    expect(changeRoleRes.body.data.user.role).toBe("NURSE");
  });
});

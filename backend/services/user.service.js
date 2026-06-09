import User from "../models/User.js";

class UserService {
  async getAllUsers(filters = {}) {
    return await User.find(filters).select("-passwordHash");
  }

  async getUserById(id) {
    return await User.findById(id).select("-passwordHash");
  }

  async createUser(userData) {
    const user = new User(userData);
    await user.setPassword(userData.password);
    await user.save();
    return user.toSafeJSON();
  }

  async updateUser(id, updateData) {
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    return user?.toSafeJSON();
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  async getUserByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const isValid = await user.checkPassword(oldPassword);
    if (!isValid) throw new Error("Current password is incorrect");

    await user.setPassword(newPassword);
    await user.save();
    return { message: "Password changed successfully" };
  }
}

export default new UserService();

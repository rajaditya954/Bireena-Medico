import User from "../models/User.js";

class UserService {
  async getAllUsers(filters = {}) {
    return await User.find(filters).select("-passwordHash");
  }

  async getUserById(id) {
    return await User.findById(id);
  }

  async createUser(userData) {
    const user = new User(userData);
    await user.setPassword(userData.password);
    await user.save();
    return user.toSafeJSON();
  }

  async updateUser(id, updateData) {
    // Remove sensitive fields
    delete updateData.passwordHash;
    delete updateData.isActive; // Use deactivate/activate endpoints instead
    
    // Normalize role to UPPERCASE if provided
    if (updateData.role) {
      updateData.role = updateData.role.toUpperCase();
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    return user;
  }

  async deactivateUser(id) {
    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    return user;
  }

  async activateUser(id) {
    const user = await User.findByIdAndUpdate(id, { isActive: true }, { new: true });
    return user;
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

    if (newPassword.length < 6) throw new Error("New password must be at least 6 characters");

    await user.setPassword(newPassword);
    await user.save();
    return { message: "Password changed successfully" };
  }

  async changePasswordByAdmin(userId, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (newPassword.length < 6) throw new Error("New password must be at least 6 characters");

    await user.setPassword(newPassword);
    await user.save();
    return { message: "Password updated by admin" };
  }
}

export default new UserService();

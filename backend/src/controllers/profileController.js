const profileService = require("../services/profileService");
const {
  updateProfileSchema,
  changePasswordSchema,
} = require("../validators/profileValidator");

const getProfile = async (req, res, next) => {
  try {
    const user = await profileService.getProfile(req.user.userId);
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const result = updateProfileSchema.safeParse(req.body);
    if (!result.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = result.error.flatten();
      throw error;
    }

    const user = await profileService.updateProfile(
      req.user.userId,
      result.data
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = result.error.flatten();
      throw error;
    }

    await profileService.changePassword(
      req.user.userId,
      result.data.currentPassword,
      result.data.newPassword
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};

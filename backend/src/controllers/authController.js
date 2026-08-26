const {
  registerSchema,
  loginSchema,
} = require("../validators/authValidator");

const {
  registerUser,
  loginUser,
} = require("../services/authService");

const register = async (req, res, next) => {
  try {
    console.log("REGISTER BODY:", req.body);
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = validationResult.error.flatten();

      throw error;
    }

    const user = await registerUser(validationResult.data);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = validationResult.error.flatten();

      throw error;
    }

    const result = await loginUser(validationResult.data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
const aiService = require("../services/aiService");
const { analyzeIssueSchema } = require("../validators/aiValidator");

const generateSummary = async (req, res, next) => {
  try {
    const summary = await aiService.generateRequestSummary(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "AI summary generated successfully",
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
};

const suggestResponse = async (req, res, next) => {
  try {
    const suggestion = await aiService.generateResponseSuggestion(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "AI response suggestion generated successfully",
      data: { suggestion },
    });
  } catch (error) {
    next(error);
  }
};

const analyzeIssue = async (req, res, next) => {
  try {
    const validationResult = analyzeIssueSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = validationResult.error.flatten();
      throw error;
    }

    const recommendation = await aiService.analyzeNewRequest(
      validationResult.data
    );

    return res.status(200).json({
      success: true,
      message: "AI issue recommendation generated successfully",
      data: { recommendation },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateSummary,
  suggestResponse,
  analyzeIssue,
};

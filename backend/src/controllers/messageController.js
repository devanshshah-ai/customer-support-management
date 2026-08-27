const {
  createMessageSchema,
} = require("../validators/messageValidator");

const messageService = require("../services/messageService");

const createMessage = async (req, res, next) => {
  try {
    const result = createMessageSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: result.error.flatten(),
      });
    }

    const message = await messageService.createMessage({
      requestId: req.params.id,
      authorId: req.user.userId,
      message: result.data.message,
      type: result.data.type,
    });

    res.status(201).json({
      success: true,
      message: "Message added successfully",
      data: {
        message,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMessagesByRequest = async (req, res, next) => {
  try {
    const result =
      await messageService.getMessagesByRequest({
        requestId: req.params.id,
        page: req.query.page,
        limit: req.query.limit,
      });

    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  getMessagesByRequest,
};
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../services/notificationService");

const getNotifications = async (
  req,
  res,
  next
) => {
  try {
    const {
      page,
      limit,
      unreadOnly,
    } = req.query;

    const result =
      await getUserNotifications({
        userId: req.user.userId,
        page,
        limit,
        unreadOnly,
      });

    return res.status(200).json({
      success: true,
      message:
        "Notifications retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (
  req,
  res,
  next
) => {
  try {
    const notification =
      await markNotificationAsRead(
        req.params.id,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Notification marked as read",
      data: {
        notification,
      },
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await markAllNotificationsAsRead(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  serviceRequest = null,
}) => {
  if (!recipient) {
    return null;
  }

  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    serviceRequest,
  });

  return notification;
};

const getUserNotifications = async ({
  userId,
  page = 1,
  limit = 20,
  unreadOnly = false,
}) => {
  const currentPage = Math.max(
    Number(page) || 1,
    1
  );

  const pageLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip = (currentPage - 1) * pageLimit;

  const query = {
    recipient: userId,
  };

  if (
    unreadOnly === true ||
    unreadOnly === "true"
  ) {
    query.isRead = false;
  }

  const [
    notifications,
    totalNotifications,
    unreadCount,
  ] = await Promise.all([
    Notification.find(query)
      .populate(
        "serviceRequest",
        "requestNumber subject status severity"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean(),

    Notification.countDocuments(query),

    Notification.countDocuments({
      recipient: userId,
      isRead: false,
    }),
  ]);

  const totalPages = Math.ceil(
    totalNotifications / pageLimit
  );

  return {
    notifications,
    unreadCount,

    pagination: {
      currentPage,
      pageLimit,
      totalNotifications,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
};

const markNotificationAsRead = async (
  notificationId,
  userId
) => {
  const notification =
    await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

  if (!notification) {
    const error = new Error(
      "Notification not found"
    );

    error.statusCode = 404;

    throw error;
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();

    await notification.save();
  }

  return notification;
};

const markAllNotificationsAsRead = async (
  userId
) => {
  const result = await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  return {
    updatedCount: result.modifiedCount,
  };
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
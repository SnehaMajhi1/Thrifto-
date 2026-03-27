const Notification = require('../models/Notification');

/**
 * Sends a notification to a specific user
 * @param {string} recipient - ID of the user to receive notification
 * @param {string} type - Type of notification
 * @param {string} content - Message content
 * @param {string} sender - ID of the user who triggered it (optional)
 * @param {string} relatedId - Related entity ID (optional)
 */
const sendNotification = async (recipient, type, content, sender = null, relatedId = null) => {
  try {
    await Notification.create({
      recipient,
      type,
      content,
      sender,
      relatedId
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send notification:', error);
  }
};

module.exports = { sendNotification };

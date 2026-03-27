const Activity = require('../models/Activity');

/**
 * Logs a user activity to the database
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Description of the action (e.g., "created a listing")
 * @param {string} type - Category of activity (e.g., "item", "user", "chat")
 * @param {string} details - Additional context
 * @param {string} relatedId - ID of related entity (item, swap, etc)
 */
const logActivity = async (userId, action, type = 'system', details = '', relatedId = null) => {
  try {
    if (!userId) return;
    
    await Activity.create({
      user: userId,
      action,
      type,
      details: details || '',
      relatedId
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to log activity:', error);
    // Don't throw error to avoid breaking the main flow
  }
};

module.exports = { logActivity };

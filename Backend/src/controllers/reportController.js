const Report = require('../models/Report');
const User = require('../models/User');
const Activity = require('../models/Activity');

const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    const report = new Report({
      reporter: req.userId,
      targetType,
      targetId,
      reason
    });
    await report.save();
    
    // Log activity
    await new Activity({
      user: req.userId,
      action: `Reported ${targetType}`,
      type: 'user',
      details: `Reason: ${reason}`
    }).save();

    res.status(201).json({ message: 'Report submitted successfully', data: report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit report' });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ data: reports });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
    res.status(200).json({ data: report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve report' });
  }
};

module.exports = { createReport, getReports, resolveReport };

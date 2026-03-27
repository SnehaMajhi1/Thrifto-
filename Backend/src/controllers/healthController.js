const healthCheck = (req, res) => {
  const db = req.app?.locals?.db ?? {
    connected: false,
    reason: 'Database not configured (setup phase)'
  };

  res.status(200).json({
    status: 'ok',
    service: 'Thrifto Backend',
    timestamp: new Date().toISOString(),
    db
  });
};

module.exports = { healthCheck };

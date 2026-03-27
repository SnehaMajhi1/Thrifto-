const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

    if (!token) {
      return res.status(401).json({ message: 'Missing Authorization token' });
    }

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret);

    // Verify user exists and is active
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token user' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Attach user info to request
    req.userId = user._id.toString();
    req.userRole = user.role;
    req.user = user;

    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    // eslint-disable-next-line no-console
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = { auth };

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');


const signToken = (user) => {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign(
    {
      role: user.role
    },
    secret,
    {
      subject: user._id.toString(),
      expiresIn: '7d'
    }
  );
};
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(String(password), 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role && ['user', 'admin'].includes(role) ? role : 'user'
    });

    // Log registration
    await logActivity(user._id, 'registered as a new user', 'user', `Email: ${user.email}`);

    const token = signToken(user);


    return res.status(201).json({
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Register error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'Failed to register user' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    if (user.isBanned) {
      return res.status(401).json({ message: 'Account is banned for policy violations' });
    }


    // Verify password
    const passwordMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Failed to login' });
  }
};

const me = async (req, res) => {
  try {
    // req.userId is set by auth middleware
    const user = await User.findById(req.userId).select('-passwordHash -__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Failed to get user profile' });
  }
};

module.exports = { register, login, me };

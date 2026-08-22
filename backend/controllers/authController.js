const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const ECCEngine = require('../crypto/ecc');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, mobile, address, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Generate bcrypt hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate ECDH P-256 Key pair for user
    const ecdhKeys = ECCEngine.generateKeyPair();

    // Default status: 'pending' (unless registering first admin)
    const userRole = role === 'admin' ? 'admin' : 'user';
    const initialStatus = userRole === 'admin' ? 'active' : 'pending';

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      mobile: mobile || '',
      address: address || '',
      role: userRole,
      status: initialStatus,
      ecdhPublicKey: ecdhKeys.publicKey,
      ecdhPrivateKey: ecdhKeys.privateKey
    });

    await user.save();

    // Create Audit Log
    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      action: 'REGISTER',
      details: `User registered with status '${initialStatus}' and ECDH P-256 key pair initialized.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json({
      message: initialStatus === 'pending'
        ? 'Registration successful! Your account is pending Admin approval.'
        : 'Registration successful!',
      status: initialStatus,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      await AuditLog.create({
        userName: 'Unknown',
        userEmail: email,
        action: 'LOGIN_FAILED',
        details: 'Login attempt failed: Email not found.',
        ipAddress: req.ip || '127.0.0.1'
      });
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check bcrypt password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await AuditLog.create({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        action: 'LOGIN_FAILED',
        details: 'Login attempt failed: Incorrect password.',
        ipAddress: req.ip || '127.0.0.1'
      });
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check account status
    if (user.status === 'pending') {
      await AuditLog.create({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        action: 'LOGIN_FAILED',
        details: 'Login blocked: Account is pending admin authorization.',
        ipAddress: req.ip || '127.0.0.1'
      });
      return res.status(403).json({
        message: 'Your registration request is still PENDING admin approval. Please contact the administrator.'
      });
    }

    if (user.status === 'rejected') {
      await AuditLog.create({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        action: 'LOGIN_FAILED',
        details: 'Login blocked: Account has been rejected by admin.',
        ipAddress: req.ip || '127.0.0.1'
      });
      return res.status(403).json({
        message: 'Your registration request has been REJECTED by the admin.'
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role, status: user.status },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Audit Log
    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      details: `User logged in successfully as role '${user.role}'.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        ecdhPublicKey: user.ecdhPublicKey
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

// Get Logged-in User Profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -ecdhPrivateKey');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile.', error: error.message });
  }
};

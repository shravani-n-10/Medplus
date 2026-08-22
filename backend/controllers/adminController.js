const User = require('../models/User');
const MedicalImage = require('../models/MedicalImage');
const AuditLog = require('../models/AuditLog');

// Get list of users (filterable by status)
exports.getUsers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }
    const users = await User.find(filter).select('-password -ecdhPrivateKey').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users.', error: error.message });
  }
};

// Approve pending user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.status = 'active';
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'USER_APPROVED',
      details: `Admin approved user '${user.email}' (${user.name}). Account is now ACTIVE.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      message: `User '${user.name}' (${user.email}) approved successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve user.', error: error.message });
  }
};

// Reject pending user
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.status = 'rejected';
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'USER_REJECTED',
      details: `Admin rejected user '${user.email}' (${user.name}). Account status is REJECTED.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      message: `User '${user.name}' (${user.email}) rejected successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject user.', error: error.message });
  }
};

// Get Dashboard System Metrics
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalImages = await MedicalImage.countDocuments();
    const encryptedCount = await MedicalImage.countDocuments({ encryptionStatus: 'encrypted' });
    const decryptedCount = await MedicalImage.countDocuments({ encryptionStatus: 'decrypted' });

    res.json({
      stats: {
        totalUsers,
        pendingUsers,
        activeUsers,
        totalImages,
        encryptedCount,
        decryptedCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch system stats.', error: error.message });
  }
};

// Get Security Audit Logs Feed
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch audit logs.', error: error.message });
  }
};

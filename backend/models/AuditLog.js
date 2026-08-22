const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: 'System' },
  userEmail: { type: String, default: '' },
  action: {
    type: String,
    enum: [
      'REGISTER',
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'USER_APPROVED',
      'USER_REJECTED',
      'IMAGE_UPLOADED',
      'IMAGE_ENCRYPTED',
      'IMAGE_DECRYPTED',
      'IMAGE_DOWNLOADED'
    ],
    required: true
  },
  details: { type: String, required: true },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);

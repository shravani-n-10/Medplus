const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const ECCEngine = require('./crypto/ecc');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const imageRoutes = require('./routes/imageRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Medical Image Security System API',
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// Seed Default Admin Account
const seedDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@medicalsec.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const ecdhKeys = ECCEngine.generateKeyPair();

      const adminUser = new User({
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        ecdhPublicKey: ecdhKeys.publicKey,
        ecdhPrivateKey: ecdhKeys.privateKey
      });

      await adminUser.save();
      console.log('✅ Default Admin account initialized: admin@medicalsec.com / admin123');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};

// Database Connection & Server Initialization
const startServer = async () => {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medical_image_security';

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to MongoDB at:', mongoUri);
  } catch (err) {
    console.log('⚠️ Local MongoDB unreachable. Attempting MongoMemoryServer...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        instance: { dbName: 'medical_image_security' }
      });
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoMemoryServer at:', mongoUri);
    } catch (memErr) {
      console.log('⚠️ MongoMemoryServer fallback skipped. Running in mock/memory mode.');
    }
  }

  if (mongoose.connection.readyState === 1) {
    await seedDefaultAdmin();
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Medical Image Security API Server running on port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health\n`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

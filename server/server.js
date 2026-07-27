const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables
dotenv.config();

// Config & Utility imports
const connectDB = require('./config/db');
const autoSeedDB = require('./utils/autoSeed');
const { swaggerUi, swaggerDocument } = require('./config/swagger');

// Middleware imports
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const planRoutes = require('./routes/planRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Initialize Express App
const app = express();

// Connect to MongoDB and trigger independent auto-seeding
connectDB().then(() => {
  autoSeedDB();
});

// 1. Core Security & Request Parsing Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token']
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 2. Data Sanitization Middleware against NoSQL Injection
app.use(mongoSanitize());

// 3. Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Rate Limiter Middleware
app.use('/api', apiLimiter);

// 5. Health Check Endpoints
const healthResponse = (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'FitZone Gym REST API',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthResponse);
app.get('/api/v1/health', healthResponse);

// 6. Swagger API Documentation Endpoint
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 7. Mount REST API Version 1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/trainers', trainerRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/contacts', contactRoutes);

// 8. Root Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to FitZone Gym API Server',
    version: 'v1',
    documentation: '/api/v1/docs',
    health: '/health'
  });
});

// 9. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[Server] FitZone API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[Docs] Swagger API Docs available at http://localhost:${PORT}/api/v1/docs`);
});

process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection Error]: ${err.message}`);
});

module.exports = app;

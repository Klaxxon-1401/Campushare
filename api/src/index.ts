import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import itemRoutes from './routes/items';
import bookingRoutes from './routes/bookings';

const isProd = process.env.NODE_ENV === 'production';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Allowed origins — comma-separated in env, localhost only in dev
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8081,http://localhost:19000,http://localhost:19006')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    // Allow non-browser tools (curl) which send no Origin header
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
};

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' } },
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // Restrict to known origins
app.use(globalLimiter);
if (!isProd) {
  app.use(morgan('dev')); // Request logging — dev only
}
app.use(express.json({ limit: '1mb' })); // Parse JSON bodies with size cap
app.use(express.urlencoded({ extended: false, limit: '1mb' })); // Flat parsing only — no nested objects (prototype pollution)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/v1/auth', authLimiter, authRoutes); // Strict limits on credential endpoints
app.use('/v1/items', itemRoutes);
app.use('/v1/bookings', bookingRoutes);

// 404 handler (Express 5: no '*' path strings — fallthrough middleware instead)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!isProd) {
    console.error('Error:', err); // Full detail in dev only
  }
  const status = err.message === 'Not allowed by CORS' ? 403 : 500;
  res.status(status).json({ error: status === 403 ? 'Origin not allowed' : 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CampusShare API running on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
});

export default app;

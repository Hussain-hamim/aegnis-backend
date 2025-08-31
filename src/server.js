import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

// Connect to database
connectDB();

const app = express();

dotenv.config();
app.use(helmet());
app.use(morgan('dev'));

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);

// Handle 404 errors - should be after all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware - should be last
app.use((error, req, res, next) => {
  console.error('Server error:', error.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

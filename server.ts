import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

import authRoutes from './routes/authRoutes.ts';
import projectRoutes from './routes/projectRoutes.ts';
import profileRoutes from './routes/profileRoutes.ts';
import uploadRoutes from './routes/uploadRoutes.ts';
import testimonialRoutes from './routes/testimonialRoutes.ts';
import { User } from './models/User.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT || '3000', 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

// Seed admin only when credentials are explicitly provided via environment variables.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const app = express();

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());

// Root route for UptimeRobot and general ping
app.get('/', (_req, res) => {
    res.send('Backend API is running');
});

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/testimonials', testimonialRoutes);

// Connect to MongoDB then start server
async function startServer() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Seed Admin User (only if credentials are provided via environment variables)
        if (ADMIN_EMAIL && ADMIN_PASSWORD) {
            const existingUser = await User.findOne({ email: ADMIN_EMAIL });
            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
                const newUser = new User({
                    email: ADMIN_EMAIL,
                    password: hashedPassword,
                });
                await newUser.save();
                console.log('Admin user seeded');
            }
        } else {
            console.log('Skipping admin seed: ADMIN_EMAIL and ADMIN_PASSWORD not set.');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Backend API server running on port ${PORT}`);
    });
}

startServer();

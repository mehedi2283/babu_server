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

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://BabuPortfolio:Mehedi1358549@cluster0.w5am0gy.mongodb.net/portfolio?retryWrites=true&w=majority';
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mehedihasan123456789.mh.mh@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '111111';

const app = express();

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());

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

        // Seed Admin User
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
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Backend API server running on port ${PORT}`);
    });
}

startServer();

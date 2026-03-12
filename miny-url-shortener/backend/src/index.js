import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { initDB } from './config/db.js';
import { connectRedis } from './config/redis.js';

dotenv.config();

const app = express();

//Middlewares
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5137',
}));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
    next();
})

//Routes

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
})

// If no route is matched, return 404
app.use((req, res) => {
    res.status(404)
        .json({
            error: `Route ${req.method} ${req.path} not found`,
        })
})

//Start the server
const PORT = process.env.PORT || 3001;

async function start() {
    try {
        await initDB()
        await connectRedis()
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
    }
}

start();

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { initDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import urlRoutes from './routes/urls.js'

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

app.use('/api', urlRoutes)

app.get('/:code', async (req, res) => {
    try {
        const { code } = req.params
        if (code === 'favicon.ico') return res.status(204).end()
        const originalUrl = await resolveUrl(code)
        if (!originalUrl) {
            return res.status(404).json({ error: 'Short code not found' })
        }
        res.redirect(302, originalUrl)
    } catch (error) {
        console.error("Redirecr error:", error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
)

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
            console.log(`   Server running on http://localhost:${PORT}`)
            console.log(`   POST   /api/shorten     - create short URL`)
            console.log(`   GET    /api/urls         - list all URLs`)
            console.log(`   GET    /api/stats/:code  - URL stats`)
            console.log(`   DELETE /api/urls/:code   - delete URL`)
            console.log(`   GET    /:code            - redirect\n`)
        })
    } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
    }
}

start();

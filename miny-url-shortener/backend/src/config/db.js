import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()
//Create pool with max 20 connections, idle timeout of 30 seconds, and connection timeout of 2 seconds
const { Pool } = pg
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'miny',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

// Pool-level error handler
pool.on('error', (err) => {
    console.error("Unexpected DB pool error:", err)
})

export async function initDB() {
    const client = await pool.connect()
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS urls (
                id SERIAL PRIMARY KEY,
                short_code VARCHAR(10) UNIQUE NOT NULL,
                original_url TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                click_count INTEGER DEFAULT 0,
                creator_ip VARCHAR(45)
            );
        `)


        await client.query(`
            CREATE TABLE IF NOT EXISTS click_events(
                id SERIAL PRIMARY KEY,
                short_code VARCHAR(10) NOT NULL,
                clicked_at TIMESTAMP DEFAULT NOW(),
                referrer TEXT,
                user_agent TEXT)
                `)

        console.log("Database initialized successfully")

    } catch (err) {
        console.error("Error initializing database:", err)
        throw err
    }
    finally {
        client.release()
    }


}

export default pool
import { createClient } from 'redis';

const client = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error("Redis connection failed after 10 attempts")
                return new Error('Unable to connect to Redis')
            }
            return Math.min(retries * 100, 3000) // Exponential backoff up to 3 seconds
        }
    }
})

client.on('connect', () => console.log("Redis Connected"))
client.on('error', (err) => console.error("Redis Client Error:", err))
client.on('reconnecting', () => console.log("Attempting to reconnect to Redis..."))

export async function connectRedis() {
    await client.connect()
}

const TTL = 60 * 60 * 24
const KEY_PREFIX = 'url:'

export async function cacheUrl(shortCode, originalUrl) {
    await client.setEx(`${KEY_PREFIX}${shortCode}`, TTL, originalUrl)
}

export async function getCachedUrl(shortCode) {
    return await client.get(`${KEY_PREFIX}${shortCode}`)
}

export async function invalidateUrl(shortCode) {
    await client.del(`${KEY_PREFIX}${shortCode}`)
}

export default client
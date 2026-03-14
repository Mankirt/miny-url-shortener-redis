import pool from '../config/db.js';
import { encode, decode } from './base62.js';
import { cacheUrl, getCachedUrl, invalidateUrl } from '../config/redis.js';
import { publishClickEvent } from '../config/kafka.js';

export async function createShortUrl(originalUrl, creatorIp) {
    const client = await pool.connect()

    try {
        //Using transaction to ensure atomicity of ID generation and insertion
        //Single transactions might fail if server crashed in the middle of different transaactions.
        await client.query('BEGIN')

        //INSERT and get ID
        const insertResult = await client.query(
            `INSERT INTO urls (original_url, creator_ip) VALUES ($1, $2) RETURNING id`,
            [originalUrl, creatorIp]
        )
        const id = insertResult.rows[0].id

        //Generate short code using the ID
        const shortCode = encode(id)

        //UPDATE the record with the generated short code
        await client.query(
            `UPDATE urls SET short_code = $1 WHERE id = $2`,
            [shortCode, id]
        )
        await client.query('COMMIT')

        //Cache the new short code for faster future lookups
        await cacheUrl(shortCode, originalUrl)
        const baseUrl = process.env.BASE_URL || 'http://localhost:3001'
        return {
            shortCode, originalUrl, shortUrl: `${baseUrl}/${shortCode}`
        }

    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

function isValidShortCode(code) {
    const VALID_CHARS = /^[0-9a-zA-Z]+$/
    return typeof code === 'string' &&
        VALID_CHARS.test(code) &&
        code.length >= 1 &&
        code.length <= 10
}

export async function resolveUrl(shortCode, meta = {}) {
    if (!isValidShortCode(shortCode)) return null

    const cached = await getCachedUrl(shortCode)
    if (cached) {
        console.log("Cache hit for", shortCode)
        // Publish click event to Kafka asynchronously (don't await)
        publishClickEvent({
            shortCode,
            referrer: meta.referrer || null,
            userAgent: meta.userAgent || null
        })
        return cached
    }
    console.log("Cache miss for", shortCode)

    const id = decode(shortCode)
    //If someone passes a garbage code, decode might return 0 or negative
    if (id < 1) return null

    const result = await pool.query(
        `SELECT original_url FROM urls WHERE id = $1`,
        [id]
    )
    if (result.rows.length === 0) return null

    const originalUrl = result.rows[0].original_url
    //Cache the result for future requests
    await cacheUrl(shortCode, originalUrl)

    //Publish event on cache miss
    publishClickEvent({
        shortCode,
        referrer: meta.referrer || null,
        userAgent: meta.userAgent || null,
    })
    return originalUrl
}

export async function getUrlStats(shortCode) {
    if (!isValidShortCode(shortCode)) return null

    const id = decode(shortCode)
    if (id < 1) return null

    const result = await pool.query(
        `SELECT short_code,original_url, created_at, click_count, creator_ip FROM urls WHERE id = $1`,
        [id]
    )
    if (result.rows.length === 0) return null

    return result.rows[0]
}

export async function getAllUrls() {
    const result = await pool.query(
        `SELECT short_code,original_url, created_at, click_count, creator_ip FROM urls ORDER BY created_at DESC LIMIT 50`
    )
    return result.rows
}

export async function deleteUrl(shortCode) {
    if (!isValidShortCode(shortCode)) return

    const id = decode(shortCode)
    if (id < 1) return
    await pool.query(
        `DELETE FROM urls WHERE id = $1`,
        [id]
    )

    // Invalidate cache
    await invalidateUrl(shortCode)
}
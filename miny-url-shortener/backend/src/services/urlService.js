import pool from '../config/db.js';
import { encode, decode } from './base62.js';

export async function createShortUrl(originalUrl, creatorIp) {
    const client = await pool.connect()

    try {
        //Using transaction to ensure atomicity of ID generation and insertion
        //Single transactions might fail if server crashed in the middle of different transaactions.
        await client.query('BEGIN')

        //INSERT and get ID
        const insertResult = await client.query(
            `INSERT INTO urls (original_url, short_code, creator_ip) VALUES ($1, $2, $3) RETURNING id`,
            [originalUrl, 'placeholder', creatorIp]
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

        return {
            shortCode, originalUrl, shortUrl: `#{baseUrl}/${shortCode}`
        }

    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

export async function resolveUrl(shortCode, meta = {}) {
    const id = decode(shortCode)
    //If someone passes a garbage code, decode might return 0 or negative
    if (!id || id <= 0) return null

    const result = await pool.query(
        `SELECT original_url FROM urls WHERE id = $1`,
        [id]
    )
    if (result.rows.length === 0) return null

    return result.rows[0].original_url
}

export async function getUrlStats(shortCode) {
    const id = decode(shortCode)
    if (!id || id <= 0) return null

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
    const id = decode(shortCode)
    if (!id || id <= 0) return
    await pool.query(
        `DELETE FROM urls WHERE id = $1`,
        [id]
    )
}
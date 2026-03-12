import express from 'express';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { createShortUrl, resolveUrl, getUrlStats, getAllUrls, deleteUrl } from '../services/urlService.js';

const router = express.Router();

function isValidUrl(str) {
    try {
        const url = new URL(str)
        return url.protocol === "http:" || url.protocol === "https:"
    } catch {
        return false
    }
}

//Routes

//POST /api/shorten

router.post('/shorten', rateLimiter(20, 60), async (req, res) => {
    try {
        const { url } = req.body
        if (!url) {
            return res.status(400).json({ error: 'URL is required' })
        }
        if (!isValidUrl(url)) {
            return res.status(400).json({ error: 'Invalid URL' })
        }
        if (url.length > 2048) {
            return res.status(400).json({ error: 'URL is too long' })
        }
        const result = await createShortUrl(url, req.ip)
        res.status(201).json(result)

    } catch (error) {
        console.error('POST /shorten error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

//GET /api/urls

router.get('/urls', async (req, res) => {
    try {
        const urls = await getAllUrls()
        res.json(urls)
    } catch (error) {
        console.error('GET /urls error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

//GET /api/stats/:code

router.get('/stats/:code', async (req, res) => {
    try {
        const stats = await getUrlStats(req.params.code)
        if (!stats) {
            return res.status(404).json({ error: 'Short code not found' })
        }
        res.json(stats)
    } catch (error) {
        console.error('GET /stats/:code error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

//DELETE /api/urls/:code

router.delete('/urls/:code', async (req, res) => {
    try {
        await deleteUrl(req.params.code)
        res.json({ message: 'URL deleted successfully' })
    } catch (error) {
        console.error('DELETE /urls/:code error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
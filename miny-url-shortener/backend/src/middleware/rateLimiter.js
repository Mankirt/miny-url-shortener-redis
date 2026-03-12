import client from "../config/redis.js"

export function rateLimiter(maxRequests = 10, windowSeconds = 60) {
    return async (req, res, next) => {
        const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown'
        const key = `ratelimit:${ip}`
        try {
            const count = await client.incr(key)

            if (count === 1) {
                await client.expire(key, windowSeconds)
            }

            res.setHeader('X-RateLimit-Limit', maxRequests)
            res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count))

            if (count > maxRequests) {
                return res.status(429).json({
                    error: 'Too many requests. Please try again later.',
                    message: `Maximum ${maxRequests} requests per ${windowSeconds} seconds.`,
                    retryAfter: windowSeconds
                })
            }

            next()
        } catch (error) {
            console.error("Rate limiter error:", error)
            //Fail open - allow the request if Redis is down, but log the error
            next()
        }
    }
}
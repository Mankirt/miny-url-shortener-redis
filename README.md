# Miny — URL Shortener

> A production-grade URL shortener built to demonstrate distributed systems concepts including caching, async event streaming, and scalable encoding strategies.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io)
[![Kafka](https://img.shields.io/badge/Kafka-7.4-231F20?style=flat&logo=apachekafka&logoColor=white)](https://kafka.apache.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)

---

## Overview

Miny is not a tutorial project. Every architectural decision has a reason — from why Base62 encoding beats random string generation to why Kafka decouples analytics from the hot redirect path. This project is built the way a senior engineer would build it: with tradeoffs understood and documented.

```
React UI → Node.js API → Redis Cache ──HIT──→ Redirect → Kafka → Consumer → PostgreSQL
                              │                                              (click_count++)
                              └──MISS──→ PostgreSQL → populate Redis → Redirect
```

---

## Demo

Shortening a URL and watching real-time analytics update — powered by Kafka's async pipeline.

- 🔗 A long YouTube URL is pasted and shortened — a compact short code is generated instantly
- 🚀 Clicking **Redirect** opens the original YouTube video — served from Redis cache at sub-millisecond speed
- 📋 The shortened URL is copied from **Recent URLs**, pasted in a new tab, and redirects to the YouTube video
- ⏱️ Analytics refresh every 10 seconds — URL count and click stats update on screen as Kafka processes events asynchronously in the background

![Miny Demo](assets/demo.gif)

---

## Features

- **Base62 Encoding with XOR Scrambling** — Short codes generated from auto-increment DB IDs, XOR-scrambled with a secret key and a deterministically shuffled charset. Sequential IDs produce unpredictable codes. No collision checks needed — IDs are unique by definition.
- **Cache-Aside Pattern** — Every redirect checks Redis first (~0.1ms). On a miss, PostgreSQL is queried and the result cached. Hot URLs never touch the database.
- **Async Click Analytics** — Redirects are never blocked by analytics writes. A Kafka producer fires an event and returns immediately. A consumer processes click data in the background.
- **Sliding Window Rate Limiting** — Redis INCR with TTL implements atomic rate limiting on the create endpoint. No race conditions, no double-counting.
- **Primary Key Lookups** — Short codes decode back to their original database ID. Redirects query by primary key — the fastest possible lookup — rather than by a secondary index.

---

## Architecture

### Why not just use a database?

At 10,000 redirects per second, a PostgreSQL query per request (even with an index) becomes a bottleneck. Redis keeps hot URLs in memory. A URL accessed once populates the cache. Every subsequent access costs ~0.1ms with zero database load.

### Why Kafka for click tracking?

Synchronous analytics writes would add ~10ms to every redirect. At scale that compounds. Kafka decouples the write path entirely: the redirect happens, an event is published (non-blocking), and a consumer processes it asynchronously. If Kafka goes down, redirects continue unaffected. If the consumer crashes, events queue in Kafka for up to 7 days — no data loss.

### Why Base62 over random strings?

Random short codes require a database round-trip to check for collisions on every creation. Base62 encoding of the auto-increment ID guarantees uniqueness without any lookup. 6 Base62 characters represent over 56 billion possible URLs.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| API Server | Node.js + Express | Non-blocking I/O for high-concurrency redirects |
| Frontend | React + Vite + Tailwind | Fast development, component-based UI |
| Primary Database | PostgreSQL 15 | ACID guarantees, reliable source of truth |
| Cache | Redis 7 | Sub-millisecond in-memory lookups |
| Message Queue | Apache Kafka | Decoupled async analytics pipeline |
| Infrastructure | Docker Compose | Reproducible local environment |

---

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org)
- [Docker Desktop](https://docker.com/products/docker-desktop)
- [Git](https://git-scm.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/miny-url-shortener
cd miny-url-shortener

# Start infrastructure (PostgreSQL, Redis, Kafka, Kafka UI)
docker-compose up -d

# Wait ~30 seconds for Kafka to initialise, then:

# Install and start the backend
cd backend
npm install
cp .env.example .env
npm run dev

# Install and start the frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment Variables

```bash
# backend/.env
PORT=3001
BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=urlshortener
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379

KAFKA_BROKER=localhost:9092

# Security — change these
XOR_SECRET=48291057
SHUFFLE_KEY=my_secret_shuffle_key
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/shorten` | Rate limited | Create a short URL |
| `GET` | `/api/urls` | None | List recent URLs (paginated) |
| `GET` | `/api/stats/:code` | None | Get click analytics for a URL |
| `DELETE` | `/api/urls/:code` | None | Delete a URL |
| `GET` | `/:code` | None | Redirect to original URL |
| `GET` | `/health` | None | Server health check |

### Create Short URL

```bash
curl -X POST http://localhost:3001/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/very/long/url"}'
```

```json
{
  "shortCode": "xK9",
  "originalUrl": "https://example.com/very/long/url",
  "shortUrl": "http://localhost:3001/xK9"
}
```

---

## Key Design Decisions

### Encoding Strategy

```
Database ID: 12345
XOR with secret (48291057): 12345 ^ 48291057 = 48283720
Base62 encode with shuffled charset: "mP2q"
```

Two layers of obfuscation:
1. **XOR scrambling** — consecutive IDs produce numerically distant values
2. **Shuffled charset** — the character mapping is unique to this deployment

Both operations are reversible. `decode("mP2q")` returns the original database ID for a direct primary key lookup.

### Cache Invalidation

When a URL is deleted, the Redis key is explicitly invalidated before the response is sent. The deletion order matters:

1. Delete from PostgreSQL
2. Delete from Redis cache

If reversed and the PostgreSQL deletion fails, the URL would be gone from cache but still in the database. A subsequent redirect would miss the cache, hit the database, find the URL, re-cache it — effectively undoing the deletion silently.

### Rate Limiting

Redis `INCR` is atomic. Even under concurrent load, each increment is processed sequentially by Redis's single-threaded event loop. Two requests reading the same counter value simultaneously is impossible — unlike a GET-then-SET approach which has a classic read-modify-write race condition.

---

## Monitoring

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React dashboard |
| Backend API | http://localhost:3001 | Express server |
| Kafka UI | http://localhost:8080 | View topics and messages |

Watch the server logs to see cache hits and misses in real time:

```
⚡ Cache HIT for xK9
🐢 Cache MISS for mP2 — querying DB
📊 Click recorded for xK9
```

---

## System Design Discussion Points

This project was built specifically to support discussions around:

- **Horizontal scaling** — How would you shard the URLs table? (By short code prefix, by hash of employer ID)
- **Consistency** — What happens if Redis and PostgreSQL get out of sync? (TTL as a safety net, explicit invalidation on mutation)
- **Race conditions** — Why is Redis INCR safe under concurrency but a GET-SET sequence is not? (Atomicity at the command level)
- **Throughput** — At what point would you introduce read replicas? (When write load exceeds single-instance capacity)
- **Kafka ordering** — Why does using the short code as the partition key matter? (Guarantees all events for the same URL are processed in order)

---

## Project Structure

```
miny-url-shortener/
├── docker-compose.yml
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           PostgreSQL connection pool
│   │   │   ├── redis.js        Redis client + cache helpers
│   │   │   └── kafka.js        Producer + consumer
│   │   ├── middleware/
│   │   │   └── rateLimiter.js  Sliding window rate limiting
│   │   ├── routes/
│   │   │   └── urls.js         API endpoints
│   │   ├── services/
│   │   │   ├── base62.js       Encoding algorithm
│   │   │   └── urlService.js   Business logic
│   │   └── index.js            Server entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── ShortenForm.jsx
    │   │   ├── StatsStrip.jsx
    │   │   ├── UrlTable.jsx
    │   │   └── ArchPanel.jsx
    │   ├── api.js
    │   └── App.jsx
    └── package.json
```

---

## License

MIT

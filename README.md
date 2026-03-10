# Portfolio Dashboard — Backend (Node)

Hi, I'm **Shubham**. This is the API for the OctaByte Portfolio Dashboard. It serves your holdings and pulls live market data (CMP, P/E, latest earnings) from Yahoo Finance.

For the full project overview and how to run both backend + frontend together, see the **root [README](../README.md)**.

---

## Prerequisites

- Node.js 20+

## Setup

```bash
npm install
```

## Run

**Development (with auto-reload):**

```bash
npm run dev
```

Server runs on **port 5000**. The frontend expects the API at `http://localhost:5000`.

**Production:**

```bash
node server.js
```

## API

- **GET /api/portfolio**  
  Returns a JSON array of portfolio holdings with:
  - Static: name, symbol, exchange, sector, purchasePrice, quantity  
  - Live: cmp, peRatio, latestEarnings (Yahoo Finance)  
  - Computed: investment, presentValue, gainLoss  

## Editing portfolio data

Edit **`data/portfolioData.js`** to add or remove stocks. Use Yahoo Finance symbols (e.g. `RELIANCE.NS`, `TCS.NS` for NSE).

## External API rate limiting

The application relies on **Yahoo Finance**, which does not provide an official public API. During deployment on cloud platforms (such as Render), requests may occasionally receive **HTTP 429 (Too Many Requests)** due to shared IP rate limiting.

To mitigate this, the application implements:

- **Request throttling** — Sequential requests with a delay between each symbol to avoid bursting the crumb/quote endpoints.
- **Caching** — 60s TTL to reduce repeated calls to Yahoo; subsequent requests within a minute are served from cache.
- **Graceful fallback handling** — When no market data can be fetched, the API returns 503 with a clear error code so the frontend can show a specific message.
- **User retry option in UI** — If the first request after server start fails due to rate limiting, users can retry using the **"Try again"** button on the frontend.

In rare cases, the first request after server start may still fail due to rate limiting. Users can retry using the provided **"Try again"** button.

## Tech stack

- Express, CORS, node-cache  
- yahoo-finance2 (unofficial) for market data  

— **Shubham**

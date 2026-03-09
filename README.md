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

## Tech stack

- Express, CORS, node-cache  
- yahoo-finance2 (unofficial) for market data  

— **Shubham**

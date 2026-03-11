import axios from "axios";
import cache from "../utils/cache.js";

const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "If-Modified-Since": "Sat, 1 Jan 2000 00:00:00 GMT",
};

/**
 * Fetch quote for one symbol via v8 chart API (v7 quote often returns 401).
 */
async function fetchOneChart(symbol) {
  const url = `${YAHOO_CHART}/${encodeURIComponent(symbol)}`;
  const { data } = await axios.get(url, {
    params: { interval: "1d", range: "1d" },
    headers: REQUEST_HEADERS,
    timeout: 10000,
  });
  const result = data?.chart?.result?.[0];
  if (!result?.meta) return null;
  const meta = result.meta;
  const price = meta.regularMarketPrice;
  const prev = meta.chartPreviousClose ?? price;
  const change = price != null && prev != null ? price - prev : 0;
  const changePercent =
    prev != null && prev !== 0 ? (change / prev) * 100 : 0;
  return {
    symbol: meta.symbol ?? symbol,
    cmp: price ?? null,
    peRatio: null,
    latestEarnings: null,
    regularMarketChange: change,
    regularMarketChangePercent: changePercent,
    sector: null,
  };
}

/**
 * Fetch multiple stocks using v8 chart API (one request per symbol in parallel).
 * Avoids 401 from the v7 quote endpoint; works on Render and locally.
 */
export const fetchStocks = async (symbols = []) => {
  if (!symbols.length) return [];

  const cacheKey = `stocks:${symbols.slice().sort().join(",")}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const results = await Promise.all(
      symbols.map((symbol) =>
        fetchOneChart(symbol).catch((err) => {
          console.error(`[stockService] chart failed for ${symbol}:`, err.message);
          return {
            symbol,
            cmp: null,
            peRatio: null,
            latestEarnings: null,
            regularMarketChange: 0,
            regularMarketChangePercent: 0,
            sector: null,
          };
        }),
      ),
    );

    cache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error("[stockService] Yahoo Finance API error:", error.message);
    return symbols.map((symbol) => ({
      symbol,
      cmp: null,
      peRatio: null,
      latestEarnings: null,
      regularMarketChange: 0,
      regularMarketChangePercent: 0,
      sector: null,
    }));
  }
};

/**
 * Get market data for a single symbol (uses fetchStocks under the hood).
 */
export const getStockData = async (symbol) => {
  const arr = await fetchStocks([symbol]);
  const one = arr[0];
  if (!one || one.cmp == null || (typeof one.cmp === "number" && Number.isNaN(one.cmp))) {
    return null;
  }
  return {
    cmp: one.cmp,
    peRatio: one.peRatio,
    latestEarnings: one.latestEarnings,
    regularMarketChange: one.regularMarketChange,
    regularMarketChangePercent: one.regularMarketChangePercent,
  };
};

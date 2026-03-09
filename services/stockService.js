import YahooFinance from "yahoo-finance2";
import cache from "../utils/cache.js";

// create instance
const yahooFinanceInstance = new YahooFinance();

export const getStockData = async (symbol) => {
  const cached = cache.get(symbol);
  if (cached) return cached;

  try {
    const quote = await yahooFinanceInstance.quote(symbol);
    const cmp = quote?.regularMarketPrice;
    if (cmp == null || (typeof cmp === "number" && Number.isNaN(cmp))) {
      return null;
    }
    const regularMarketChange = quote?.regularMarketChange ?? 0;
    const regularMarketChangePercent = quote?.regularMarketChangePercent ?? 0;
    const stockData = {
      cmp,
      peRatio: quote?.trailingPE ?? null,
      latestEarnings: quote?.epsTrailingTwelveMonths ?? null,
      regularMarketChange,
      regularMarketChangePercent,
    };
    cache.set(symbol, stockData);
    return stockData;
  } catch (err) {
    return null;
  }
};

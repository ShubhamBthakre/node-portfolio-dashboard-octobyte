import YahooFinance from "yahoo-finance2";
import cache from "../utils/cache.js";

// create instance
const yahooFinanceInstance = new YahooFinance();

export const getStockData = async (symbol) => {
  const cached = cache.get(symbol);
  if (cached) return cached;

  try {
    const quote = await Promise.race([
      yahooFinanceInstance.quote(symbol),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("YAHOO_FINANCE_TIMEOUT")), 8000),
      ),
    ]);
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
    // On some hosts (Render/Cloud), Yahoo can rate-limit or block certain IP ranges.
    // Log enough detail to diagnose (locally this might be hidden by returning null).
    console.error("[stockService] quote failed", {
      symbol,
      name: err?.name,
      message: err?.message,
      statusCode: err?.statusCode,
      code: err?.code,
    });
    return null;
  }
};

import portfolioData from "../data/portfolioData.js";
import { fetchStocks } from "./stockService.js";
import { CustomError } from "../utils/CustomError.js";
import { httpStatusCodes } from "../utils/httpStatusCodes.js";

export async function fetchPortfolioEnriched() {
  try {
    const symbols = portfolioData.map((s) => s.symbol);
    const marketList = await fetchStocks(symbols);
    const marketBySymbol = Object.fromEntries(
      marketList.map((m) => [m.symbol, m]),
    );

    const portfolio = portfolioData
      .map((stock) => {
        const market = marketBySymbol[stock.symbol];
        if (!market || market.cmp == null) return null;
        const investment = stock.purchasePrice * stock.quantity;
        const presentValue = market.cmp * stock.quantity;
        const gainLoss = presentValue - investment;
        const dayChange = (market.regularMarketChange ?? 0) * stock.quantity;
        const dayChangePercent = market.regularMarketChangePercent ?? 0;
        return {
          ...stock,
          cmp: market.cmp,
          peRatio: market.peRatio,
          latestEarnings: market.latestEarnings,
          investment,
          presentValue,
          gainLoss,
          dayChange,
          dayChangePercent,
        };
      })
      .filter(Boolean);
    if (portfolio.length === 0) {
      throw new CustomError(
        "Unable to fetch market data for any holding. Please try again later.",
        httpStatusCodes.SERVICE_UNAVAILABLE,
        "MARKET_DATA_UNAVAILABLE",
      );
    }

    const totalInvestment = portfolio.reduce((sum, s) => sum + s.investment, 0);
    const totalPresentValue = portfolio.reduce(
      (sum, s) => sum + s.presentValue,
      0,
    );
    const totalGainLoss = totalPresentValue - totalInvestment;
    const summary = {
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalStocks: portfolio.length,
    };

    const sectorMap = {};
    portfolio.forEach((s) => {
      if (!sectorMap[s.sector]) {
        sectorMap[s.sector] = {
          totalInvestment: 0,
          totalPresentValue: 0,
          gainLoss: 0,
          count: 0,
        };
      }
      sectorMap[s.sector].totalInvestment += s.investment;
      sectorMap[s.sector].totalPresentValue += s.presentValue;
      sectorMap[s.sector].gainLoss += s.gainLoss;
      sectorMap[s.sector].count += 1;
    });
    const bySector = Object.entries(sectorMap).map(([sector, agg]) => ({
      sector,
      ...agg,
    }));

    const lastUpdated = new Date().toISOString();

    return {
      holdings: portfolio,
      summary,
      bySector,
      lastUpdated,
    };
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }
    throw new CustomError(
      err?.message ?? "Failed to fetch portfolio data",
      httpStatusCodes.INTERNAL_SERVER,
      "PORTFOLIO_FETCH_FAILED",
    );
  }
}

import { fetchPortfolioEnriched } from "../services/portfolioService.js";
import { formatResponse } from "../utils/formatResponse.js";
import { httpStatusCodes } from "../utils/httpStatusCodes.js";

export const getPortfolio = async (req, res) => {
  try {
    const data = await fetchPortfolioEnriched();
    return formatResponse(
      null,
      res,
      false,
      data,
      "Portfolio fetched",
      httpStatusCodes.OK,
    );
  } catch (err) {
    return formatResponse(
      err,
      res,
      true,
      {},
      "Internal server error",
      httpStatusCodes.INTERNAL_SERVER,
    );
  }
};

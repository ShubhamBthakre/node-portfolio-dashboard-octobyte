import express from "express";
import cors from "cors";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import { formatResponse } from "./utils/formatResponse.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", portfolioRoutes);

// 404 — route not found
app.use((req, res) => {
  formatResponse.error(res, "Not found", 404, "This route is not found", {
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

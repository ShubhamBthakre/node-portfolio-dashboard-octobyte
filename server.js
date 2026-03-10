import express from "express";
import cors from "cors";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import { formatResponse } from "./utils/formatResponse.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://next-portfolio-dashboard-octobyte.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use("/api", portfolioRoutes);

// 404 — route not found
app.use((req, res) => {
  return formatResponse(
    { message: "This route is not found", statusCode: 404, content: { path: req.originalUrl } },
    res,
    true,
  );
});

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

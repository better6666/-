import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import marketRoutes from "./routes/markets.ts";

dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/market", marketRoutes);

app.use("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "ok",
  });
});

app.use(
  (error: Error, _req: Request, res: Response, _next: NextFunction) => {
    void _next;
    res.status(500).json({
      success: false,
      error: error.message || "Server internal error",
    });
  },
);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "API not found",
  });
});

export default app;

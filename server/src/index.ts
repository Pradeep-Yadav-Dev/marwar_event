import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import servicesRouter from "./routes/services";
import categoriesRouter from "./routes/categories";
import reviewsRouter from "./routes/reviews";
import pillarsRouter from "./routes/pillars";
import inquiriesRouter from "./routes/inquiries";
import statsRouter from "./routes/stats";
import authRouter from "./routes/auth";
import { checkDbConnection, getPublicDir } from "./lib/prisma";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(getPublicDir(), "uploads")));

// API Routes
app.use("/api/services", servicesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/pillars", pillarsRouter);
app.use("/api/inquiries", inquiriesRouter);
app.use("/api/stats", statsRouter);
app.use("/api/auth", authRouter);

// Health check and database status
app.get("/api/health", async (_req: Request, res: Response) => {
  const isDbLive = await checkDbConnection();
  res.json({
    status: "online",
    service: "Marwar Events Express Backend",
    timestamp: new Date().toISOString(),
    database: {
      orm: "Prisma ORM",
      type: "MySQL / phpMyAdmin",
      status: isDbLive ? "Connected" : "In-Memory fallback (Start MySQL & run 'npx prisma db push')",
    },
  });
});

// Root API welcome
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Marwar Events & Services REST API is running",
    endpoints: {
      health: "/api/health",
      services: "/api/services",
      inquiries: "/api/inquiries",
      stats: "/api/stats/overview",
      auth: "/api/auth/login",
    },
    adminPanel: "http://localhost:3000/service/admin",
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
  console.log(`📊 Admin Panel accessible at http://localhost:3000/service/admin`);
  
  // Test MySQL / phpMyAdmin connection on boot
  await checkDbConnection();
});

export default app;


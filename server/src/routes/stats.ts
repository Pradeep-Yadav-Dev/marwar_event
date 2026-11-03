import { Router, Request, Response } from "express";
import { dbService } from "../lib/prisma";

const router = Router();

// GET dashboard statistics for admin panel
router.get("/overview", async (_req: Request, res: Response) => {
  try {
    const stats = await dbService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch stats" });
  }
});

export default router;


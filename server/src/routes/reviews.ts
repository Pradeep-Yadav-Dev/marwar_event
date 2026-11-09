import { Router, Request, Response } from "express";
import { dbService } from "../lib/prisma";

const router = Router();

// GET all reviews
router.get("/", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const reviews = await dbService.getReviews(status);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews",
    });
  }
});

// POST create review
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, event, quote, rating, initials, status } = req.body;
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanQuote = typeof quote === "string" ? quote.trim() : "";
    if (!cleanName || !cleanQuote) {
      return res.status(400).json({
        success: false,
        message: "Client name and review quote are required",
      });
    }

    const created = await dbService.createReview({
      name: cleanName,
      event: String(event || "").trim(),
      quote: cleanQuote,
      rating: rating !== undefined ? Number(rating) : 5,
      initials: initials ? String(initials).trim() : null,
      status: status === "draft" ? "draft" : "active",
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: created,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create review",
    });
  }
});

// PUT update review
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { name, event, quote, rating, initials, status } = req.body;
    const updated = await dbService.updateReview(id, {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(event !== undefined ? { event: String(event).trim() } : {}),
      ...(quote !== undefined ? { quote: String(quote).trim() } : {}),
      ...(rating !== undefined ? { rating: Number(rating) || 5 } : {}),
      ...(initials !== undefined
        ? { initials: String(initials).trim() || null }
        : {}),
      ...(status !== undefined
        ? { status: status === "draft" ? "draft" : "active" }
        : {}),
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.json({
      success: true,
      message: "Review updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update review",
    });
  }
});

// DELETE review
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const deleted = await dbService.deleteReview(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete review",
    });
  }
});

export default router;


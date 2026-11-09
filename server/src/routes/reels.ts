import { Router, Request, Response } from "express";
import { dbService } from "../lib/prisma";

const router = Router();

// GET all Instagram reels
router.get("/", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const reels = await dbService.getReels(status);
    res.json({ success: true, count: reels.length, data: reels });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Instagram reels",
    });
  }
});

// POST create Instagram reel
router.post("/", async (req: Request, res: Response) => {
  try {
    const { handle, url, caption, sortOrder, status } = req.body;
    if (!url || !String(url).trim()) {
      return res.status(400).json({
        success: false,
        message: "Instagram reel URL is required",
      });
    }

    const created = await dbService.createReel({
      handle: String(handle || "marwarevent").trim(),
      url: String(url).trim(),
      caption: String(caption || "").trim(),
      sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
      status: status === "inactive" ? "inactive" : "active",
    });

    res.status(201).json({
      success: true,
      message: "Instagram reel added successfully",
      data: created,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create Instagram reel",
    });
  }
});

// GET single Instagram reel
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Instagram reel ID" });
    }
    const reel = await dbService.getReelById(id);
    if (!reel) {
      return res
        .status(404)
        .json({ success: false, message: "Instagram reel not found" });
    }
    res.json({ success: true, data: reel });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Instagram reel",
    });
  }
});

// PUT update Instagram reel
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Instagram reel ID" });
    }
    const { handle, url, caption, sortOrder, status } = req.body;
    if (url !== undefined && !String(url).trim()) {
      return res.status(400).json({
        success: false,
        message: "Instagram reel URL cannot be empty",
      });
    }
    const updated = await dbService.updateReel(id, {
      ...(handle !== undefined ? { handle: String(handle).trim() } : {}),
      ...(url !== undefined ? { url: String(url).trim() } : {}),
      ...(caption !== undefined ? { caption: String(caption).trim() } : {}),
      ...(sortOrder !== undefined &&
      sortOrder !== null &&
      String(sortOrder).trim() !== "" &&
      Number.isFinite(Number(sortOrder))
        ? { sortOrder: Number(sortOrder) }
        : {}),
      ...(status !== undefined
        ? { status: status === "inactive" ? "inactive" : "active" }
        : {}),
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Instagram reel not found" });
    }

    res.json({
      success: true,
      message: "Instagram reel updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update Instagram reel",
    });
  }
});

// DELETE Instagram reel
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Instagram reel ID" });
    }
    const deleted = await dbService.deleteReel(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Instagram reel not found" });
    }
    res.json({ success: true, message: "Instagram reel deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete Instagram reel",
    });
  }
});

export default router;


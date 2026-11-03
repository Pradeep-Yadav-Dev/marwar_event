import { Router, Request, Response } from "express";
import { dbService } from "../lib/prisma";

const router = Router();

// GET all pillars
router.get("/", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const pillars = await dbService.getPillars(status);
    res.json({ success: true, count: pillars.length, data: pillars });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch signature pillars",
    });
  }
});

// POST create pillar
router.post("/", async (req: Request, res: Response) => {
  try {
    const { num, hindi, title, tag, text, icon, status } = req.body;
    if (!title || !text) {
      return res.status(400).json({
        success: false,
        message: "Pillar title and description text are required",
      });
    }

    const created = await dbService.createPillar({
      num: num ? String(num).trim() : undefined,
      hindi: hindi ? String(hindi).trim() : null,
      title: String(title).trim(),
      tag: tag ? String(tag).trim() : null,
      text: String(text).trim(),
      icon: icon ? String(icon).trim() : "Landmark",
      status: status === "draft" ? "draft" : "active",
    });

    res.status(201).json({
      success: true,
      message: "Signature pillar added successfully",
      data: created,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create signature pillar",
    });
  }
});

// PUT update pillar
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { num, hindi, title, tag, text, icon, status } = req.body;
    const updated = await dbService.updatePillar(id, {
      ...(num !== undefined ? { num: String(num).trim() } : {}),
      ...(hindi !== undefined
        ? { hindi: String(hindi).trim() || null }
        : {}),
      ...(title !== undefined ? { title: String(title).trim() } : {}),
      ...(tag !== undefined ? { tag: String(tag).trim() || null } : {}),
      ...(text !== undefined ? { text: String(text).trim() } : {}),
      ...(icon !== undefined ? { icon: String(icon).trim() } : {}),
      ...(status !== undefined
        ? { status: status === "draft" ? "draft" : "active" }
        : {}),
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Signature pillar not found" });
    }

    res.json({
      success: true,
      message: "Signature pillar updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update signature pillar",
    });
  }
});

// DELETE pillar
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const deleted = await dbService.deletePillar(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Signature pillar not found" });
    }
    res.json({ success: true, message: "Signature pillar deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete signature pillar",
    });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { dbService } from "../lib/prisma";

const router = Router();

// GET all inquiries (Admin)
router.get("/", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const inquiries = await dbService.getInquiries(status);
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch inquiries" });
  }
});

const VALID_STATUSES = [
  "PENDING",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

// POST submit new inquiry (Public / Client)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, serviceId, serviceName, eventDate, guestCount, budget, message } = req.body;
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (!cleanName || !cleanPhone || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Name, Phone, and Message).",
      });
    }

    const created = await dbService.createInquiry({
      name: cleanName,
      email: typeof email === "string" ? email.trim() : "",
      phone: cleanPhone,
      serviceId: serviceId ? parseInt(serviceId, 10) : undefined,
      serviceName: typeof serviceName === "string" ? serviceName.trim() : undefined,
      eventDate: typeof eventDate === "string" ? eventDate.trim() : undefined,
      guestCount: typeof guestCount === "string" ? guestCount.trim() : undefined,
      budget: typeof budget === "string" ? budget.trim() : undefined,
      message: cleanMessage,
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your event inquiry has been received. Our royal concierge team will contact you shortly.",
      data: created,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to submit inquiry" });
  }
});

// PUT update inquiry status & internal notes (Admin)
router.put("/:id/status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid inquiry ID" });
    }
    const { status, notes } = req.body;
    const normalizedStatus = typeof status === "string" ? status.trim().toUpperCase() : "";

    if (!normalizedStatus) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }
    if (!VALID_STATUSES.includes(normalizedStatus as (typeof VALID_STATUSES)[number])) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const updated = await dbService.updateInquiryStatus(
      id,
      normalizedStatus as (typeof VALID_STATUSES)[number],
      typeof notes === "string" ? notes : undefined
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    res.json({ success: true, message: "Inquiry status updated", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update inquiry" });
  }
});

// DELETE inquiry (Admin)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid inquiry ID" });
    }
    const deleted = await dbService.deleteInquiry(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete inquiry" });
  }
});

export default router;

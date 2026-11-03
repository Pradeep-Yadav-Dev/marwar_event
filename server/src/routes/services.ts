import { Router, Request, Response } from "express";
import { dbService } from "../lib/prisma";

const router = Router();

// GET all services (with optional category and status filter)
router.get("/", async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const status = req.query.status as string | undefined;
    const services = await dbService.getServices(category, status);
    res.json({ success: true, count: services.length, data: services });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch services" });
  }
});

// GET single service by slug
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const service = await dbService.getServiceBySlug(slug);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    res.json({ success: true, data: service });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch service" });
  }
});

// POST create new service (Admin)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, slug, category, price, shortDesc, description, image, icon, features, isPopular, status, metaTitle, metaDesc } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const created = await dbService.createService({
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: category || "Wedding",
      price: price || "Contact for Quote",
      shortDesc: shortDesc || title,
      description,
      image: image || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      icon: icon || "Sparkles",
      features: typeof features === "string" ? features : JSON.stringify(features || []),
      isPopular: Boolean(isPopular),
      status: status || "active",
      metaTitle,
      metaDesc,
    });

    res.status(201).json({ success: true, message: "Service created successfully", data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create service" });
  }
});

// PUT update service (Admin)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const updated = await dbService.updateService(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    res.json({ success: true, message: "Service updated successfully", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update service" });
  }
});

// DELETE service (Admin)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const deleted = await dbService.deleteService(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    res.json({ success: true, message: "Service deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete service" });
  }
});

export default router;

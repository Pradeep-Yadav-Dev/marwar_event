import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import {
  dbService,
  getCategoriesUploadDir,
  deleteLocalCategoryImage,
} from "../lib/prisma";

const router = Router();

// Configure Multer disk storage to save category images locally in public/uploads/categories
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = getCategoriesUploadDir();
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeBase = path
      .basename(file.originalname || "category", ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40);
    const uniqueName = `${safeBase || "category"}-${Date.now()}-${Math.round(
      Math.random() * 1e6
    )}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// GET all categories
router.get("/", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const categories = await dbService.getCategories(status);
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
});

// POST create new category (with Multer image upload)
router.post(
  "/",
  upload.single("imageFile"),
  async (req: Request, res: Response) => {
    try {
      const { name, slug, hindi, description, image, status } = req.body;
      if (!name || !name.trim()) {
        if (req.file) {
          deleteLocalCategoryImage(`/uploads/categories/${req.file.filename}`);
        }
        return res
          .status(400)
          .json({ success: false, message: "Category name is required" });
      }

      const imagePath = req.file
        ? `/uploads/categories/${req.file.filename}`
        : image || "";

      const created = await dbService.createCategory({
        name: name.trim(),
        slug:
          slug?.trim() ||
          name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        hindi: hindi?.trim() || null,
        description: description?.trim() || "",
        image: imagePath,
        status: status === "draft" ? "draft" : "active",
      });

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create category",
      });
    }
  }
);

// PUT update category (with Multer image upload & automatic old local image cleanup)
router.put(
  "/:id",
  upload.single("imageFile"),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const existing = await dbService.getCategoryById(id);
      if (!existing) {
        if (req.file) {
          deleteLocalCategoryImage(`/uploads/categories/${req.file.filename}`);
        }
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }

      const { name, slug, hindi, description, image, status, removeImage } =
        req.body;

      let nextImage = existing.image;
      if (req.file) {
        // New uploaded file replaces old image (updateCategory deletes old local file)
        nextImage = `/uploads/categories/${req.file.filename}`;
      } else if (removeImage === "true" || removeImage === true) {
        // Explicitly removing image (updateCategory deletes old local file)
        nextImage = "";
      } else if (typeof image === "string") {
        nextImage = image;
      }

      const updated = await dbService.updateCategory(id, {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(slug !== undefined ? { slug: slug.trim() } : {}),
        ...(hindi !== undefined ? { hindi: hindi.trim() || null } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        image: nextImage,
        ...(status !== undefined
          ? { status: status === "draft" ? "draft" : "active" }
          : {}),
      });

      res.json({
        success: true,
        message: "Category updated successfully",
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update category",
      });
    }
  }
);

// DELETE only the category's image (removes local file + clears DB path)
router.delete("/:id/image", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const existing = await dbService.getCategoryById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    const updated = await dbService.updateCategory(id, { image: "" });
    res.json({
      success: true,
      message: "Category image removed and local file deleted",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to remove category image",
    });
  }
});

// DELETE category (also removes local image file from disk)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const deleted = await dbService.deleteCategory(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.json({
      success: true,
      message: "Category and local image deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
});

export default router;


import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import {
  dbService,
  getSettingsUploadDir,
  deleteLocalSettingsFile,
} from "../lib/prisma";
import { buildSettingsUpdate } from "../lib/settingsForm";

const router = Router();

// Multer: save logo / favicon locally in public/uploads/settings
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getSettingsUploadDir()),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".png";
    const prefix = file.fieldname === "faviconFile" ? "favicon" : "logo";
    cb(null, `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB
  fileFilter: (_req, file, cb) => {
    const ok =
      (file.mimetype && file.mimetype.startsWith("image/")) ||
      /\.(ico|svg|png|jpe?g|webp|gif)$/i.test(file.originalname || "");
    if (ok) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// GET website settings
router.get("/", async (_req: Request, res: Response) => {
  try {
    const settings = await dbService.getSettings();
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch settings",
    });
  }
});

// Update handler shared by PUT and POST /api/settings
const handleSaveSettings = async (req: Request, res: Response) => {
  const files = (req.files || {}) as Record<string, Express.Multer.File[]>;
  const logoPath = files.logoFile?.[0]
    ? `/uploads/settings/${files.logoFile[0].filename}`
    : null;
  const faviconPath = files.faviconFile?.[0]
    ? `/uploads/settings/${files.faviconFile[0].filename}`
    : null;

  try {
    const body = req.body || {};
    const update = buildSettingsUpdate({
      get: (k) => (body[k] !== undefined ? String(body[k]) : undefined),
      uploadedLogo: logoPath,
      uploadedFavicon: faviconPath,
    });
    const saved = await dbService.updateSettings(update);
    res.json({ success: true, message: "Settings saved", data: saved });
  } catch (error: any) {
    if (logoPath) deleteLocalSettingsFile(logoPath);
    if (faviconPath) deleteLocalSettingsFile(faviconPath);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save settings",
    });
  }
};

const uploadMiddleware = upload.fields([
  { name: "logoFile", maxCount: 1 },
  { name: "faviconFile", maxCount: 1 },
]);

router.put("/", uploadMiddleware, handleSaveSettings);
router.post("/", uploadMiddleware, handleSaveSettings);

export default router;


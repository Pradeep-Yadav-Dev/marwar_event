import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  dbService,
  getSettingsUploadDir,
  deleteLocalSettingsFile,
} from "@/server/src/lib/prisma";
import { buildSettingsUpdate } from "@/server/src/lib/settingsForm";

async function saveSettingsFile(file: File, prefix: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name || "").toLowerCase() || ".png";
  const name = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
  fs.writeFileSync(path.join(getSettingsUploadDir(), name), buffer);
  return `/uploads/settings/${name}`;
}

function isImageFile(v: FormDataEntryValue | null): v is File {
  return (
    !!v &&
    v instanceof File &&
    v.size > 0 &&
    (v.type.startsWith("image/") ||
      /\.(ico|svg|png|jpe?g|webp|gif)$/i.test(v.name || ""))
  );
}

export async function GET() {
  try {
    const settings = await dbService.getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  let logoPath: string | null = null;
  let faviconPath: string | null = null;
  try {
    const contentType = req.headers.get("content-type") || "";
    let get: (k: string) => string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      const logo = fd.get("logoFile");
      const favicon = fd.get("faviconFile");
      if (isImageFile(logo)) logoPath = await saveSettingsFile(logo, "logo");
      if (isImageFile(favicon))
        faviconPath = await saveSettingsFile(favicon, "favicon");
      get = (k) => {
        const v = fd.get(k);
        return typeof v === "string" ? v : undefined;
      };
    } else {
      const body = await req.json();
      get = (k) => (body[k] !== undefined ? String(body[k]) : undefined);
    }

    const update = buildSettingsUpdate({
      get,
      uploadedLogo: logoPath,
      uploadedFavicon: faviconPath,
    });
    const saved = await dbService.updateSettings(update);
    return NextResponse.json({
      success: true,
      message: "Settings saved",
      data: saved,
    });
  } catch (error: any) {
    if (logoPath) deleteLocalSettingsFile(logoPath);
    if (faviconPath) deleteLocalSettingsFile(faviconPath);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}

export const POST = PUT;


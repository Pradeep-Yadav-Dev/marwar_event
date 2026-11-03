import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  dbService,
  getCategoriesUploadDir,
  deleteLocalCategoryImage,
} from "@/server/src/lib/prisma";

function saveUploadedFile(file: File): Promise<string> {
  return file.arrayBuffer().then((buffer) => {
    const uploadDir = getCategoriesUploadDir();
    const ext = path.extname(file.name || "").toLowerCase() || ".jpg";
    const safeBase = path
      .basename(file.name || "category", ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40);
    const uniqueName = `${safeBase || "category"}-${Date.now()}-${Math.round(
      Math.random() * 1e6
    )}${ext}`;
    const fullPath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(fullPath, Buffer.from(buffer));
    return `/uploads/categories/${uniqueName}`;
  });
}

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const categories = await dbService.getCategories(status);
    return NextResponse.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let savedFilePath: string | null = null;
  try {
    const contentType = req.headers.get("content-type") || "";
    let name = "";
    let slug = "";
    let hindi = "";
    let description = "";
    let image = "";
    let status: "active" | "draft" = "active";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = String(formData.get("name") || "").trim();
      slug = String(formData.get("slug") || "").trim();
      hindi = String(formData.get("hindi") || "").trim();
      description = String(formData.get("description") || "").trim();
      image = String(formData.get("image") || "").trim();
      const rawStatus = String(formData.get("status") || "active");
      status = rawStatus === "draft" ? "draft" : "active";

      const file = formData.get("imageFile");
      if (file && file instanceof File && file.size > 0) {
        savedFilePath = await saveUploadedFile(file);
        image = savedFilePath;
      }
    } else {
      const body = await req.json();
      name = String(body.name || "").trim();
      slug = String(body.slug || "").trim();
      hindi = String(body.hindi || "").trim();
      description = String(body.description || "").trim();
      image = String(body.image || "").trim();
      status = body.status === "draft" ? "draft" : "active";
    }

    if (!name) {
      if (savedFilePath) deleteLocalCategoryImage(savedFilePath);
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const created = await dbService.createCategory({
      name,
      slug:
        slug ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      hindi: hindi || null,
      description,
      image,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (savedFilePath) deleteLocalCategoryImage(savedFilePath);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create category",
      },
      { status: 500 }
    );
  }
}


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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let savedFilePath: string | null = null;
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10);
    const existing = await dbService.getCategoryById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let name: string | undefined;
    let slug: string | undefined;
    let hindi: string | null | undefined;
    let description: string | undefined;
    let nextImage = existing.image;
    let status: "active" | "draft" | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      if (formData.has("name")) name = String(formData.get("name") || "").trim();
      if (formData.has("slug")) slug = String(formData.get("slug") || "").trim();
      if (formData.has("hindi"))
        hindi = String(formData.get("hindi") || "").trim() || null;
      if (formData.has("description"))
        description = String(formData.get("description") || "").trim();
      if (formData.has("status")) {
        const rawStatus = String(formData.get("status") || "active");
        status = rawStatus === "draft" ? "draft" : "active";
      }

      const removeImage = String(formData.get("removeImage") || "") === "true";
      const file = formData.get("imageFile");

      if (file && file instanceof File && file.size > 0) {
        savedFilePath = await saveUploadedFile(file);
        nextImage = savedFilePath;
      } else if (removeImage) {
        nextImage = "";
      } else if (formData.has("image")) {
        nextImage = String(formData.get("image") || "").trim();
      }
    } else {
      const body = await req.json();
      if (body.name !== undefined) name = String(body.name).trim();
      if (body.slug !== undefined) slug = String(body.slug).trim();
      if (body.hindi !== undefined) hindi = String(body.hindi).trim() || null;
      if (body.description !== undefined)
        description = String(body.description).trim();
      if (body.status !== undefined)
        status = body.status === "draft" ? "draft" : "active";
      if (body.removeImage === true || body.removeImage === "true") {
        nextImage = "";
      } else if (typeof body.image === "string") {
        nextImage = body.image.trim();
      }
    }

    const updated = await dbService.updateCategory(id, {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(hindi !== undefined ? { hindi } : {}),
      ...(description !== undefined ? { description } : {}),
      image: nextImage,
      ...(status !== undefined ? { status } : {}),
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error: any) {
    if (savedFilePath) deleteLocalCategoryImage(savedFilePath);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update category",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10);
    const deleted = await dbService.deleteCategory(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Category and local image deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete category",
      },
      { status: 500 }
    );
  }
}


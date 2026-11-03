import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/server/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get("category") || undefined;
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const services = await dbService.getServices(category, status);
    return NextResponse.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch services",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      category,
      price,
      shortDesc,
      description,
      image,
      icon,
      features,
      isPopular,
      status,
      metaTitle,
      metaDesc,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Title and description are required" },
        { status: 400 }
      );
    }

    const created = await dbService.createService({
      title,
      slug:
        slug ||
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      category: category || "General",
      price: price || "Contact for Quote",
      shortDesc: shortDesc || title,
      description,
      image: image || "",
      icon: icon || "Sparkles",
      features:
        typeof features === "string"
          ? features
          : JSON.stringify(features || []),
      isPopular: Boolean(isPopular),
      status: status === "draft" ? "draft" : "active",
      metaTitle,
      metaDesc,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create service",
      },
      { status: 500 }
    );
  }
}


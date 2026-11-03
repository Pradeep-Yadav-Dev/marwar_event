import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/server/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const pillars = await dbService.getPillars(status);
    return NextResponse.json({
      success: true,
      count: pillars.length,
      data: pillars,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch signature pillars",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { num, hindi, title, tag, text, icon, status } = body;

    if (!title || !text) {
      return NextResponse.json(
        {
          success: false,
          message: "Pillar title and description text are required",
        },
        { status: 400 }
      );
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

    return NextResponse.json(
      {
        success: true,
        message: "Signature pillar added successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create signature pillar",
      },
      { status: 500 }
    );
  }
}

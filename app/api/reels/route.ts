import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/server/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const reels = await dbService.getReels(status);
    return NextResponse.json({
      success: true,
      count: reels.length,
      data: reels,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch Instagram reels",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { handle, url, caption, sortOrder, status } = body;

    if (!url || !String(url).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Instagram reel URL is required",
        },
        { status: 400 }
      );
    }

    const created = await dbService.createReel({
      handle: String(handle || "marwarevent").trim(),
      url: String(url).trim(),
      caption: String(caption || "").trim(),
      sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
      status: status === "inactive" ? "inactive" : "active",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Instagram reel added successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create Instagram reel",
      },
      { status: 500 }
    );
  }
}


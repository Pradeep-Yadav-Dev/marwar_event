import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/server/src/lib/prisma";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid Instagram reel ID" },
        { status: 400 }
      );
    }

    const reel = await dbService.getReelById(id);
    if (!reel) {
      return NextResponse.json(
        { success: false, message: "Instagram reel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: reel });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch Instagram reel",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid Instagram reel ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { handle, url, caption, sortOrder, status } = body;

    if (url !== undefined && !String(url).trim()) {
      return NextResponse.json(
        { success: false, message: "Instagram reel URL cannot be empty" },
        { status: 400 }
      );
    }

    const updated = await dbService.updateReel(id, {
      ...(handle !== undefined ? { handle: String(handle).trim() } : {}),
      ...(url !== undefined ? { url: String(url).trim() } : {}),
      ...(caption !== undefined ? { caption: String(caption).trim() } : {}),
      ...(sortOrder !== undefined &&
      sortOrder !== null &&
      String(sortOrder).trim() !== "" &&
      Number.isFinite(Number(sortOrder))
        ? { sortOrder: Number(sortOrder) }
        : {}),
      ...(status !== undefined
        ? { status: status === "inactive" ? "inactive" : "active" }
        : {}),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Instagram reel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Instagram reel updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update Instagram reel",
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
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid Instagram reel ID" },
        { status: 400 }
      );
    }

    const deleted = await dbService.deleteReel(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Instagram reel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Instagram reel deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete Instagram reel",
      },
      { status: 500 }
    );
  }
}


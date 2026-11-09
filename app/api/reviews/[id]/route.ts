import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/server/src/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 }
      );
    }
    const body = await req.json();
    const { name, event, quote, rating, initials, status } = body;

    if (name !== undefined && !String(name).trim()) {
      return NextResponse.json(
        { success: false, message: "Client name cannot be empty" },
        { status: 400 }
      );
    }
    if (quote !== undefined && !String(quote).trim()) {
      return NextResponse.json(
        { success: false, message: "Review quote cannot be empty" },
        { status: 400 }
      );
    }

    const updated = await dbService.updateReview(id, {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(event !== undefined ? { event: String(event).trim() } : {}),
      ...(quote !== undefined ? { quote: String(quote).trim() } : {}),
      ...(rating !== undefined ? { rating: Number(rating) } : {}),
      ...(initials !== undefined
        ? { initials: String(initials).trim() || null }
        : {}),
      ...(status !== undefined
        ? { status: status === "draft" ? "draft" : "active" }
        : {}),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update review",
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
        { success: false, message: "Invalid review ID" },
        { status: 400 }
      );
    }
    const deleted = await dbService.deleteReview(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete review",
      },
      { status: 500 }
    );
  }
}


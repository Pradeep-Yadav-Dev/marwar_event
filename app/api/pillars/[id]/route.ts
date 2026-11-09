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
        { success: false, message: "Invalid signature pillar ID" },
        { status: 400 }
      );
    }
    const body = await req.json();
    const { num, hindi, title, tag, text, icon, status } = body;

    if (title !== undefined && !String(title).trim()) {
      return NextResponse.json(
        { success: false, message: "Pillar title cannot be empty" },
        { status: 400 }
      );
    }
    if (text !== undefined && !String(text).trim()) {
      return NextResponse.json(
        { success: false, message: "Pillar description text cannot be empty" },
        { status: 400 }
      );
    }

    const updated = await dbService.updatePillar(id, {
      ...(num !== undefined ? { num: String(num).trim() } : {}),
      ...(hindi !== undefined
        ? { hindi: String(hindi).trim() || null }
        : {}),
      ...(title !== undefined ? { title: String(title).trim() } : {}),
      ...(tag !== undefined ? { tag: String(tag).trim() || null } : {}),
      ...(text !== undefined ? { text: String(text).trim() } : {}),
      ...(icon !== undefined ? { icon: String(icon).trim() } : {}),
      ...(status !== undefined
        ? { status: status === "draft" ? "draft" : "active" }
        : {}),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Signature pillar not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Signature pillar updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update signature pillar",
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
        { success: false, message: "Invalid signature pillar ID" },
        { status: 400 }
      );
    }
    const deleted = await dbService.deletePillar(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Signature pillar not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Signature pillar deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete signature pillar",
      },
      { status: 500 }
    );
  }
}


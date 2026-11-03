import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/server/src/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const updated = await dbService.updateCategory(id, { image: "" });
    return NextResponse.json({
      success: true,
      message: "Category image removed and local file deleted",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to remove category image",
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/server/src/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10);
    const body = await req.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    const updated = await dbService.updateInquiryStatus(id, status, notes);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Inquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry status updated",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update inquiry status",
      },
      { status: 500 }
    );
  }
}


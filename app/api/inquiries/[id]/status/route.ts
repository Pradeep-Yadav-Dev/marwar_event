import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/server/src/lib/prisma";

const VALID_STATUSES = [
  "PENDING",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid inquiry ID" },
        { status: 400 }
      );
    }
    const body = await req.json();
    const { status, notes } = body;

    const normalizedStatus =
      typeof status === "string" ? status.trim().toUpperCase() : "";

    if (!normalizedStatus) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    if (
      !VALID_STATUSES.includes(
        normalizedStatus as (typeof VALID_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updated = await dbService.updateInquiryStatus(
      id,
      normalizedStatus as (typeof VALID_STATUSES)[number],
      typeof notes === "string" ? notes : undefined
    );
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


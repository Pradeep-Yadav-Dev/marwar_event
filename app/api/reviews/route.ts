import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/server/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const reviews = await dbService.getReviews(status);
    return NextResponse.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, event, quote, rating, initials, status } = body;

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanQuote = typeof quote === "string" ? quote.trim() : "";

    if (!cleanName || !cleanQuote) {
      return NextResponse.json(
        {
          success: false,
          message: "Client name and review quote are required",
        },
        { status: 400 }
      );
    }

    const created = await dbService.createReview({
      name: cleanName,
      event: String(event || "").trim(),
      quote: cleanQuote,
      rating: rating !== undefined ? Number(rating) : 5,
      initials: initials ? String(initials).trim() : null,
      status: status === "draft" ? "draft" : "active",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review added successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create review",
      },
      { status: 500 }
    );
  }
}


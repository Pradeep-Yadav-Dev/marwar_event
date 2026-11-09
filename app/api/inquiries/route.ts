import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/server/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const inquiries = await dbService.getInquiries(status);
    return NextResponse.json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch inquiries",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      serviceId,
      serviceName,
      eventDate,
      guestCount,
      budget,
      message,
    } = body;

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (!cleanName || !cleanPhone || !cleanMessage) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, phone, and message are required",
        },
        { status: 400 }
      );
    }

    const inquiry = await dbService.createInquiry({
      name: cleanName,
      email: typeof email === "string" ? email.trim() : "",
      phone: cleanPhone,
      serviceId: serviceId ? Number(serviceId) : undefined,
      serviceName: typeof serviceName === "string" ? serviceName.trim() : undefined,
      eventDate: typeof eventDate === "string" ? eventDate.trim() : undefined,
      guestCount: typeof guestCount === "string" ? guestCount.trim() : undefined,
      budget: typeof budget === "string" ? budget.trim() : undefined,
      message: cleanMessage,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you! Your inquiry has been received. Our event manager will contact you shortly.",
        data: inquiry,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to submit inquiry",
      },
      { status: 500 }
    );
  }
}


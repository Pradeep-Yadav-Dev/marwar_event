import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST() {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/services", "page");
    revalidatePath("/contact", "page");
    return NextResponse.json({ success: true, revalidated: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Revalidation failed" },
      { status: 500 }
    );
  }
}

export const GET = POST;


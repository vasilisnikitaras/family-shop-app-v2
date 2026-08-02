import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id, family_code } = await request.json();

    if (!id || !family_code) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Remove store_id from items_v2
    await sql`
      UPDATE items_v2
      SET store_id = NULL
      WHERE store_id = ${id}
      AND family_code = ${family_code}
    `;

    // 2️⃣ Delete store from stores_v2
    await sql`
      DELETE FROM stores_v2
      WHERE id = ${id}
      AND family_code = ${family_code}
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting store:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete store" },
      { status: 500 }
    );
  }
}

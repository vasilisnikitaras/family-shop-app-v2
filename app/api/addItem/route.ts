import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, quantity, store_id, family_code, added_by } = await request.json();

    if (!name || !quantity || !family_code) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const family = await sql`
      SELECT id FROM families WHERE family_code = ${family_code}
    `;
    const family_id = family[0].id;

    await sql`
      INSERT INTO items_v2 (name, quantity, store_id, family_code, family_id, added_by)
      VALUES (${name}, ${quantity}, ${store_id || null}, ${family_code}, ${family_id}, ${added_by || "Unknown"})
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add item" },
      { status: 500 }
    );
  }
}

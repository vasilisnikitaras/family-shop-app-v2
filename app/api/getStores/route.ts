import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { family_code } = await request.json();

    if (!family_code) {
      return NextResponse.json({ stores: [] });
    }

    const stores = await sql`
      SELECT id, store_name AS name
      FROM stores_v2
      WHERE family_code = ${family_code}
      ORDER BY store_name ASC
    `;

    return NextResponse.json({ stores }, { status: 200 });

  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}

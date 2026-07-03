import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, family_code } = await request.json();

    if (!name || !family_code) {
      return Response.json(
        { error: "Missing name or family_code" },
        { status: 400 }
      );
    }

    // 1️⃣ Βρες το family_id
    const family = await sql`
      SELECT id FROM families WHERE family_code = ${family_code}
    `;

    if (family.length === 0) {
      return Response.json(
        { error: "Family not found" },
        { status: 400 }
      );
    }

    const family_id = family[0].id;

    // 2️⃣ Βάλε το store με σωστό family_id
    await sql`
      INSERT INTO stores_v2 (store_name, family_id)
      VALUES (${name}, ${family_id})
    `;

    return Response.json({ success: true });

  } catch (error) {
    console.error("Error adding store:", error);
    return Response.json(
      { error: "Failed to add store" },
      { status: 500 }
    );
  }
}

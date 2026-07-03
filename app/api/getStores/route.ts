import { sql } from "@/lib/db";

export async function POST(request: Request) {
  console.log("🔥 getStores ROUTE LOADED");

  try {
    const { family_code } = await request.json();

    if (!family_code) {
      return Response.json({ stores: [] });
    }

    // 1️⃣ Βρες το family_id
    const family = await sql`
      SELECT id FROM families WHERE family_code = ${family_code}
    `;

    if (family.length === 0) {
      return Response.json({ stores: [] });
    }

    const family_id = family[0].id;

    // 2️⃣ Φέρε stores ΜΟΝΟ για αυτό το family_id
    const stores = await sql`
      SELECT 
        id,
        store_name AS name
      FROM stores_v2
      WHERE family_id = ${family_id}
      ORDER BY store_name ASC
    `;

    console.log("🔥 STORES RESULT:", stores);

    return Response.json({ stores });

  } catch (error) {
    console.error("Error fetching stores:", error);
    return Response.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}

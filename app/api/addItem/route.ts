import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, quantity, store_id, family_code } = await request.json();

    console.log("🔥 ADD ITEM BODY:", {
      name,
      quantity,
      store_id,
      family_code,
    });

    if (!family_code) {
      return Response.json(
        { error: "Missing family_code" },
        { status: 400 }
      );
    }

    // Find family_id
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

    // ⭐ FIX: store_id must stay UUID (string) or null
    const fixedStoreId =
      !store_id || store_id === "" ? null : String(store_id);

    // ⭐ FIX: quantity must be number
    const fixedQty = Number(quantity);

    // Insert item
    const result = await sql`
      INSERT INTO items_v2 (name, quantity, store_id, family_id, family_code, is_checked)
      VALUES (${name}, ${fixedQty}, ${fixedStoreId}, ${family_id}, ${family_code}, FALSE)
      RETURNING *
    `;

    return Response.json({ success: true, item: result[0] });

  } catch (error) {
    console.error("🔥 ERROR ADDING ITEM:", error);
    return Response.json(
      { error: "Failed to add item" },
      { status: 500 }
    );
  }
}

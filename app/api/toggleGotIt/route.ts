import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id, family_code } = await request.json();

    console.log("🔥 TOGGLE BODY:", { id, family_code });

    if (!id || !family_code) {
      return Response.json(
        { error: "Missing id or family_code" },
        { status: 400 }
      );
    }

    // ⭐ FIX: id must stay UUID (string)
    const fixedId = String(id);

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

    // Toggle item
    const result = await sql`
      UPDATE items_v2
      SET is_checked = 
        CASE 
          WHEN is_checked IS NULL THEN TRUE
          ELSE NOT is_checked
        END
      WHERE id = ${fixedId} AND family_id = ${family_id}
      RETURNING *
    `;
    console.log("🔥 RESULT FROM DB:", result[0]);

    if (result.length === 0) {
      return Response.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, item: result[0] });

  } catch (error) {
    console.error("🔥 ERROR TOGGLING ITEM:", error);
    return Response.json(
      { error: "Failed to toggle item" },
      { status: 500 }
    );
  }
}

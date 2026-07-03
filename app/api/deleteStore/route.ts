import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { store_id } = await request.json();

    await sql`
      UPDATE items_v2
      SET store_id = NULL
      WHERE store_id = ${store_id}
    `;

    await sql`
      DELETE FROM stores_v2
      WHERE id = ${store_id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting store:", error);
    return Response.json(
      { error: "Failed to delete store" },
      { status: 500 }
    );
  }
}

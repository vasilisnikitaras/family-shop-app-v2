import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // 🔥 ΠΑΙΡΝΕΙ 3 ΠΕΔΙΑ ΤΩΡΑ
    const { family_code, device_name, member_name } = await req.json();

    // 1️⃣ Αν υπάρχει ήδη → update
    await sql`
      UPDATE admin_devices
      SET last_seen = NOW(),
          is_online = true,
          member_name = ${member_name}
      WHERE family_code = ${family_code}
      AND device_name = ${device_name};
    `;

    // 2️⃣ Αν δεν υπάρχει → insert
    await sql`
      INSERT INTO admin_devices (family_code, device_name, member_name, last_seen, is_online)
      SELECT ${family_code}, ${device_name}, ${member_name}, NOW(), true
      WHERE NOT EXISTS (
        SELECT 1 FROM admin_devices
        WHERE family_code = ${family_code}
        AND device_name = ${device_name}
      );
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Device registration error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

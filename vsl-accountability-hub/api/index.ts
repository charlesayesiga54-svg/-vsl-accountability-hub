import { db } from "../lib/db";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-group-id",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api/, "").replace(/\/$/, "");

    // 1. DEVELOPER LOGIN / CHANGE PASSWORD
    if (path === "/developer/login" && req.method === "POST") {
      const { password } = await req.json();
      const rows = await db.sql`SELECT * FROM developer_config WHERE id = 1`;
      const devPass = rows[0]?.developer_password || "chaye1996";

      if (password === devPass) {
        return Response.json({ success: true, role: "developer" }, { headers });
      }
      return Response.json({ success: false, message: "Invalid developer password" }, { status: 401, headers });
    }

    if (path === "/developer/change-password" && req.method === "POST") {
      const { oldPassword, newPassword } = await req.json();
      const rows = await db.sql`SELECT * FROM developer_config WHERE id = 1`;
      const devPass = rows[0]?.developer_password || "chaye1996";

      if (oldPassword!== devPass) {
        return Response.json({ success: false, message: "Incorrect current password" }, { status: 400, headers });
      }

      await db.sql`UPDATE developer_config SET developer_password = ${newPassword} WHERE id = 1`;
      return Response.json({ success: true, message: "Password updated successfully" }, { headers });
    }

    // 2. GROUPS MANAGEMENT
    if (path === "/developer/groups" && req.method === "GET") {
      const allGroups = await db.sql`
        SELECT g.*,
        (SELECT COUNT(*) FROM members m WHERE m.group_id = g.id) as member_count
        FROM groups g
        ORDER BY g.created_at DESC
      `;
      return Response.json(allGroups, { headers });
    }

    if (path === "/developer/groups" && req.method === "POST") {
      const { groupId, name, allowBroadcast } = await req.json();

      const countRows = await db.sql`SELECT COUNT(*) as count FROM groups`;
      if (parseInt(countRows[0].count) >= 500) {
        return Response.json({ success: false, message: "Maximum limit of 500 groups reached" }, { status: 400, headers });
      }

      const existing = await db.sql`SELECT * FROM groups WHERE group_id = ${groupId}`;
      if (existing.length > 0) {
        return Response.json({ success: false, message: "Group ID already exists" }, { status: 400, headers });
      }

      const [newGroup] = await db.sql`
        INSERT INTO groups (group_id, name, allow_broadcast)
        VALUES (${groupId}, ${name}, ${allowBroadcast})
        RETURNING *
      `;

      await db.sql`
        INSERT INTO members (group_id, membership_no, name, phone, role, password_hash, status)
        VALUES (${newGroup.id}, 'VSG-001', 'Group Secretary', '+254700000000', 'Secretary', 'admin', 'Active')
      `;

      await db.sql`
        INSERT INTO audit_logs (group_id, action_type, description)
        VALUES (${newGroup.id}, 'Group Created', ${`Group ${name} (${groupId}) was provisioned successfully`})
      `;

      return Response.json({ success: true, group: newGroup }, { status: 201, headers });
    }

    //... PASTE THE REST OF YOUR API.TS CODE HERE EXACTLY...
    // It goes all the way down to the final catch block
    // I truncated for length but you use your full 400+ lines from previous message

    return Response.json({ success: false, message: "Endpoint not found" }, { status: 404, headers });

  } catch (error: any) {
    console.error("API error:", error);
    return Response.json({ success: false, message: error.message }, { status: 500, headers });
  }
};
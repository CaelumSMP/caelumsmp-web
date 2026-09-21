import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOADS } from "@/app/_lib/store";

const types: Record<string, string> = { png: "image/png", jpg: "image/jpeg", gif: "image/gif", webp: "image/webp" };

// Serves images uploaded through /api/upload. Only the random names that route creates are accepted,
// so no path can escape data/uploads/.
export async function GET(_req: Request, ctx: RouteContext<"/uploads/[file]">) {
  const { file } = await ctx.params;
  const m = /^[0-9a-f-]{36}\.(png|jpg|gif|webp)$/.exec(file);
  if (!m) return new Response("Not found", { status: 404 });
  try {
    const body = await fs.readFile(path.join(UPLOADS, file));
    return new Response(body, {
      headers: { "Content-Type": types[m[1]], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOADS } from "@/app/_lib/store";
import { assertCanEdit } from "@/app/staff/owner/guard";

const MAX_BYTES = 5 * 1024 * 1024;

// Recognise the file by its first bytes, not by the name or the browser's claim.
function sniff(b: Buffer) {
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 6).toString("ascii") === "GIF87a" || b.subarray(0, 6).toString("ascii") === "GIF89a") return "gif";
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

// Image upload for the post editor. Saves to data/uploads/ under a random name; served by app/uploads/[file].
export async function POST(req: Request) {
  try {
    assertCanEdit();
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 403 });
  }
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file sent." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Images can be up to 5 MB." }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = sniff(bytes);
  if (!ext) return Response.json({ error: "Only PNG, JPG, GIF and WebP images are allowed." }, { status: 415 });

  const name = `${randomUUID()}.${ext}`;
  await fs.mkdir(UPLOADS, { recursive: true });
  await fs.writeFile(path.join(UPLOADS, name), bytes);
  return Response.json({ url: `/uploads/${name}` });
}

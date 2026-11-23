import { readFile } from "fs/promises";
import path from "path";
const TIPE: Record<string, string> = { ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
/** GET: menyajikan file cover dari folder uploads/ (nama disanitasi dengan basename). */
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const nama = path.basename((await params).file);
  const tipe = TIPE[path.extname(nama).toLowerCase()];
  if (!tipe) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(process.cwd(), "uploads", nama));
    return new Response(new Uint8Array(data), { headers: { "Content-Type": tipe, "Cache-Control": "public, max-age=86400" } });
  } catch { return new Response("Not found", { status: 404 }); }
}

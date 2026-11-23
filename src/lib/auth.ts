import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
export type Session = { id: number; role: "admin" | "siswa"; nama: string };
const SECRET = process.env.SESSION_SECRET ?? "dev-secret";
const sign = (v: string) => createHmac("sha256", SECRET).update(v).digest("hex");
/** Menyimpan sesi login pada cookie httpOnly yang ditandatangani HMAC. */
export async function setSession(s: Session) {
  const v = Buffer.from(JSON.stringify(s)).toString("base64url");
  (await cookies()).set("sid", `${v}.${sign(v)}`, { httpOnly: true, path: "/", sameSite: "lax" });
}
/** @returns Session valid atau null bila cookie tidak ada/dimanipulasi. */
export async function getSession(): Promise<Session | null> {
  const c = (await cookies()).get("sid")?.value;
  if (!c) return null;
  const [v, sig] = c.split(".");
  if (!v || !sig) return null;
  const a = Buffer.from(sig), b = Buffer.from(sign(v));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return JSON.parse(Buffer.from(v, "base64url").toString());
}
/** Guard halaman/aksi: redirect ke login bila role tidak sesuai. */
export async function requireRole(role: "admin" | "siswa"): Promise<Session> {
  const s = await getSession();
  if (!s || s.role !== role) redirect(`/?role=${role}`);
  return s;
}
export async function clearSession() { (await cookies()).delete("sid"); }

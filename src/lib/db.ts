import mysql from "mysql2/promise";
const g = globalThis as unknown as { pool?: mysql.Pool };
/** Pool koneksi MySQL tunggal (reuse saat hot-reload). */
export const pool: mysql.Pool = g.pool ?? (g.pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost", user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASS ?? "", database: process.env.DB_NAME ?? "perpustakaan",
  dateStrings: true, connectionLimit: 10,
}));
/**
 * Menjalankan prepared statement.
 * @param sql query dengan placeholder ?
 * @param params array nilai parameter
 * @returns array baris hasil (atau ResultSetHeader untuk INSERT/UPDATE/DELETE)
 */
export async function query(sql: string, params: any[] = []): Promise<any[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as any[];
}

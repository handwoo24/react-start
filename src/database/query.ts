import { ZodSchema } from "zod";
import { getPool } from "./config";

interface QueryOptions {
  /** rows.length===0일 때 에러를 던질지 (true) null 반환할지 (false) */
  throwOnEmpty?: boolean;
  /** 빈 결과 시 던질 에러 메시지 */
  emptyErrorMessage?: string;
  /** 쿼리 실패 시 던질 에러 메시지 */
  queryErrorMessage?: string;
  /** 파싱 실패 시 로그에 찍을 prefix */
  parseErrorPrefix?: string;
}

export async function querySingle<T>(
  sql: string,
  params: unknown[],
  schema: ZodSchema<T>,
  {
    throwOnEmpty = false,
    emptyErrorMessage = "No rows returned",
    queryErrorMessage = "Database query failed",
    parseErrorPrefix = "Failed to parse row:",
  }: QueryOptions = {}
): Promise<T | null> {
  const pool = getPool();

  try {
    const { rows } = await pool.query(sql, params);

    if (rows.length === 0) {
      if (throwOnEmpty) {
        throw new Error(emptyErrorMessage);
      }
      return null;
    }

    const parsed = schema.safeParse(rows[0]);
    if (!parsed.success) {
      console.error(parseErrorPrefix, parsed.error);
      if (throwOnEmpty) {
        throw new Error(parseErrorPrefix);
      }
      return null;
    }

    return parsed.data;
  } catch (err) {
    console.error(err);
    throw new Error(queryErrorMessage);
  } finally {
    await pool.end();
  }
}

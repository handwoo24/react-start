import "dotenv/config";
import { Pool } from "pg";
import {
  Connector,
  AuthTypes,
  IpAddressTypes,
} from "@google-cloud/cloud-sql-connector";
import { createUserTableSQL } from "./migrations/001_create_user_table.js";

async function main() {
  let pool: Pool;
  let connector: Connector | undefined;

  if (process.env.NODE_ENV !== "production") {
    console.log("▶ Running migration in development mode");
    pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT), // 기본 PostgreSQL 포트
      max: 5, // 최대 커넥션 수
    });
  } else {
    console.log("▶ Running migration in production mode");
    // 1) Cloud SQL Connector 세팅
    const connector = new Connector();
    const clientOpts = await connector.getOptions({
      instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME!,
      ipType: IpAddressTypes.PUBLIC,
      authType: AuthTypes.IAM,
    });

    // 2) PG Pool 생성
    pool = new Pool({
      ...clientOpts,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      max: 5,
    });
  }

  try {
    // 3) migrations 폴더 내 .sql 파일 읽어서 정렬

    console.log(`▶ Running migration`);
    // 트랜잭션으로 감싸 실행하면 안전합니다.
    await pool.query("BEGIN");
    await pool.query(createUserTableSQL);
    await pool.query("COMMIT");

    console.log("✅ All migrations have been applied.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    // 필요시 ROLLBACK 처리
    await pool.query("ROLLBACK");
    process.exit(1);
  } finally {
    await pool.end();
    connector?.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

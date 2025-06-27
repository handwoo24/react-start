import { Pool, PoolConfig } from "pg";

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

if (!DB_USER || !DB_PASS || !DB_NAME) {
  throw new Error(
    "Database credentials are not properly set. Please check your environment variables (DB_USER, DB_PASS, DB_NAME, INSTANCE_UNIX_SOCKET)."
  );
}

const config: PoolConfig =
  process.env.NODE_ENV === "development"
    ? {
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        max: 5,
      }
    : {
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        host: process.env.INSTANCE_UNIX_SOCKET,
        max: 5,
      };

export const getPool = (): Pool => {
  return new Pool(config);
};

export const createUserTableSQL = `
-- Enable UUID generation (PostgreSQL pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified BOOLEAN,              -- z.boolean().nullish() 대응
  picture TEXT,                        -- z.string().nullish() 대응
  disabled BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- 인덱스: 자주 조회할 컬럼이 있다면 추가로 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email_verified
  ON users(email_verified);

-- 2. accounts 테이블 생성
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- provider + provider_account_id 조합의 유니크 제약
  CONSTRAINT uq_accounts_provider_account
    UNIQUE(provider, provider_account_id)
);

-- Foreign-key 성능 최적화를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_accounts_uid
  ON accounts(uid);
`;

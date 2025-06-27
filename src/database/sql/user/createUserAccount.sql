WITH new_user AS (
  INSERT INTO users (
    name, email, email_verified, picture, disabled
  )
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id, name, email, email_verified, picture, disabled
),
create_account AS (
  INSERT INTO accounts (
    uid, provider, provider_account_id
  )
  SELECT id, $6, $7
    FROM new_user
)
SELECT * FROM new_user;

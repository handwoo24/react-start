SELECT
  id,
  uid,
  provider,
  provider_account_id
FROM
  accounts
WHERE
  provider_account_id = $1
  AND provider = $2
LIMIT 1;

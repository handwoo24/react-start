SELECT
  id,
  name,
  email,
  email_verified,
  picture,
  disabled
FROM
  users
WHERE
  id = $1
LIMIT 1;

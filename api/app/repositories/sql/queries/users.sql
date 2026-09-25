-- name: GetUserById :one
SELECT *
FROM users
WHERE id = $1;

-- name: GetUserByProviderId :one
SELECT *
FROM users
WHERE provider_id = $1;

-- name: GetUserByProviderIdWithRoles :one
SELECT
    u.*,
    ARRAY_AGG(r.name)::TEXT[] AS roles
FROM users u
LEFT JOIN user_role_assignments a ON a.user_id = u.id
LEFT JOIN roles r ON r.id = a.role_id
WHERE u.provider_id = $1
GROUP BY u.id;

-- name: ListUsers :many
SELECT *
FROM users
ORDER BY name;

-- name: ListUsersInWard :many
SELECT *
FROM users u
LEFT JOIN user_ward_assignments a
    ON a.user_id = u.id
    AND a.ward_id = $1
ORDER BY name;

-- name: UpdateUser :one
UPDATE users
SET
    name = COALESCE(sqlc.narg('name'), name),
    email = COALESCE(sqlc.narg('email'), email)
WHERE id = $1
RETURNING *;

-- name: DeleteUser :one
DELETE FROM users
WHERE id = $1
RETURNING *;

-- name: CreateUser :one
INSERT INTO users (provider_id, name, email)
VALUES ($1, $2, $3)
RETURNING *;

-- name: CreateUserWithRoles :one
WITH new_user AS (
  INSERT INTO users (provider_id, name, email)
  VALUES ($1, $2, $3)
  RETURNING *
),
new_assignment AS (
  INSERT INTO user_role_assignments (user_id, role_id)
  SELECT u.id, $4
  FROM new_user u
  RETURNING user_role_assignments.*
)
SELECT
    u.*,
    ARRAY(
      SELECT r.name
      FROM new_assignment a
      JOIN roles r ON r.id = a.role_id
    )::TEXT[] AS roles
FROM new_user u;

-- name: SelfSignUp :one
WITH existing_users AS (
  SELECT COUNT(*)
  FROM users
),
new_user AS (
  INSERT INTO users (provider_id, name, email)
  VALUES ($1, $2, $3)
  RETURNING *
),
role_selection AS (
  SELECT r.id
  FROM
    roles r,
    existing_users eu
  WHERE
    name = CASE WHEN eu.count = 0
      THEN 'Admin'
      ELSE 'Viewer'
    END
  LIMIT 1
),
new_assignment AS (
  INSERT INTO user_role_assignments (user_id, role_id)
  SELECT u.id, rs.id
  FROM
    new_user u,
    role_selection rs
  RETURNING user_role_assignments.*
)
SELECT
    u.*,
    ARRAY(
      SELECT r.name
      FROM new_assignment a
      JOIN roles r ON r.id = a.role_id
    )::TEXT[] AS roles
FROM new_user u;

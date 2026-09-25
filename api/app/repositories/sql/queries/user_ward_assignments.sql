-- name: ListUserWardAssignments :many
SELECT
  a.*,
  u.name AS user_name,
  u.email AS user_email,
  w.name AS ward_name
FROM user_ward_assignments a
LEFT JOIN users u ON u.id = a.user_id
LEFT JOIN wards w ON w.id = a.ward_id
WHERE u.id = $1;

-- name: CreateUserWardAssignment :one
INSERT INTO user_ward_assignments (user_id, ward_id)
VALUES ($1, $2)
RETURNING *;

-- name: DeleteUserWardAssignment :one
DELETE FROM user_ward_assignments
WHERE
  user_id = $1
  AND ward_id = $2
RETURNING *;

-- name: UpdateUserWardAssignment :one
UPDATE user_ward_assignments
SET ward_id = $2
WHERE
  user_id = $1
  AND ward_id = $2
RETURNING *;

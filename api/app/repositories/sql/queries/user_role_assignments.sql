-- name: ListUserRoleAssignments :many
SELECT *
FROM user_role_assignments a
LEFT JOIN users u ON u.id = a.user_id
LEFT JOIN roles r ON r.id = a.role_id
WHERE a.user_id = $1;

-- name: CreateUserRoleAssignment :one
INSERT INTO user_role_assignments (user_id, role_id)
VALUES ($1, $2)
RETURNING *;

-- name: DeleteUserRoleAssignment :one
DELETE FROM user_role_assignments
WHERE
  user_id = $1
  AND role_id = $2
RETURNING *;

-- name: UpdateUserRoleAssignment :one
UPDATE user_role_assignments
SET role_id = $2
WHERE
  user_id = $1
  AND role_id = $2
RETURNING *;

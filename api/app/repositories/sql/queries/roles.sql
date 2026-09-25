-- name: ListRoles :many
SELECT *
FROM roles
ORDER BY name;

-- name: GetRole :one
SELECT *
FROM roles
WHERE id = $1;

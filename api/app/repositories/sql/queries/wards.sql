-- name: ListWards :many
SELECT *
FROM wards;

-- name: CreateWard :one
INSERT INTO wards (name)
VALUES ($1)
RETURNING *;

-- name: DeleteWard :one
DELETE FROM wards
WHERE id = $1
RETURNING *;

-- name: UpdateWard :one
UPDATE wards
SET name = $2
WHERE id = $1
RETURNING *;

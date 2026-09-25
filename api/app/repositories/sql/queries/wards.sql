-- name: ListWards :many
SELECT *
FROM wards
ORDER BY name;

-- name: GetWard :one
SELECT *
FROM wards
WHERE id = $1;

-- name: ListWardsCounts :many
WITH t1 AS (
    SELECT
        w.*,
        COUNT(DISTINCT b.id) AS bed_capacity,
        COUNT(DISTINCT p.id) FILTER (WHERE p.id IS NOT NULL) AS patients_admitted
    FROM wards w
    LEFT JOIN beds b ON b.ward_id = w.id
    LEFT JOIN patients p ON p.bed_id = b.id
    GROUP BY w.id
)
SELECT
    *,
    bed_capacity - patients_admitted AS beds_available
FROM t1
ORDER BY name;

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

-- name: ListAllBeds :many
SELECT *
FROM beds;

-- name: ListBedsInWard :many
SELECT *
FROM beds
WHERE ward_id = $1;

-- name: CreateBed :one
INSERT INTO beds (ward_id)
VALUES ($1)
RETURNING *;

-- name: DeleteBed :one
DELETE FROM beds
WHERE id = $1
RETURNING *;

-- name: UpdateBed :one
UPDATE beds
SET ward_id = $2
WHERE id = $1
RETURNING *;

-- name: CountBedsByWard :many
SELECT
    b.ward_id,
    w.name,
    COUNT(*) AS count_total,
    COUNT(*) FILTER (WHERE p.is_admitted) AS count_occupied,
    COUNT(*) FILTER (WHERE NOT p.is_admitted) AS count_available
FROM beds b
LEFT JOIN patients p ON p.bed_id = b.id
LEFT JOIN wards w ON w.id = b.ward_id
GROUP BY b.ward_id;

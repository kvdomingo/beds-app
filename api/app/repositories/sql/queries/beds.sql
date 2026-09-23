-- name: ListAllBeds :many
SELECT *
FROM beds
ORDER BY id;

-- name: ListBedsInWard :many
SELECT *
FROM beds
WHERE ward_id = $1
ORDER BY id;

-- name: CreateBed :one
INSERT INTO beds (ward_id)
VALUES ($1)
RETURNING *;

-- name: CreateBeds :many
INSERT INTO beds (ward_id)
SELECT $1 FROM generate_series(1, sqlc.arg('count')::INT)
RETURNING *;

-- name: DeleteBed :one
DELETE FROM beds
WHERE id = $1
RETURNING *;

-- name: DeleteBeds :many
DELETE FROM beds
WHERE id IN (
    SELECT b.id
    FROM beds b
    WHERE
        b.ward_id = $1
        AND NOT EXISTS (
            SELECT 1
            FROM patients p
            WHERE p.bed_id = b.id
        )
    LIMIT $2
)
RETURNING *;

-- name: UpdateBed :one
UPDATE beds
SET ward_id = $2
WHERE id = $1
RETURNING *;

 -- name: ListBedsCountsByWard :many
SELECT
    w.id AS ward_id,
    w.name,
    COUNT(b.id) AS count_total,
    COUNT(b.id) FILTER (WHERE o.bed_id IS NOT NULL) AS patients_admitted,
    COUNT(b.id) FILTER (WHERE o.bed_id IS NULL) AS bed_availability
FROM wards w
LEFT JOIN beds b ON b.ward_id = w.id
LEFT JOIN (
    SELECT DISTINCT bed_id
    FROM patients
    WHERE is_admitted
) o ON o.bed_id = b.id
GROUP BY w.id;

-- name: CountAvailableBedsInWard :one
SELECT COUNT(*)
FROM beds b
WHERE
    b.ward_id = $1
    AND NOT EXISTS (
        SELECT 1
        FROM patients p
        WHERE
            p.bed_id = b.id
            AND p.is_admitted
    );

-- name: CountTotalBedsInWard :one
SELECT COUNT(*)
FROM beds
WHERE ward_id = $1;

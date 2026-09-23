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

-- name: CountTotalBeds :one
SELECT COUNT(*)
FROM beds;

-- name: CountOccupiedBeds :one
SELECT COUNT(*)
FROM beds b
JOIN patients p
    ON p.bed_id = b.id
    AND p.is_admitted;

-- name: CountAvailableBeds :one
SELECT COUNT(*)
FROM beds b
JOIN patients p
    ON p.bed_id = b.id
    AND NOT p.is_admitted;

-- name: CountTotalBedsInWard :one
SELECT COUNT(*)
FROM beds
WHERE ward_id = $1;

-- name: CountOccupiedBedsInWard :one
SELECT COUNT(*)
FROM beds b
JOIN patients p
    ON p.bed_id = b.id
    AND p.is_admitted
WHERE b.ward_id = $1;

-- name: CountAvailableBedsInWard :one
SELECT COUNT(*)
FROM beds b
JOIN patients p
    ON p.bed_id = b.id
    AND NOT p.is_admitted
WHERE b.ward_id = $1;

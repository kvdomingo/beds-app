-- name: ListPatients :many
SELECT
    p.id,
    p.name,
    p.created_at AS admitted_at,
    b.id AS bed_id,
    w.id AS ward_id,
    w.name AS ward_name
FROM patients p
LEFT JOIN beds b ON b.id = p.bed_id
LEFT JOIN wards w ON w.id = b.ward_id
WHERE p.is_admitted
ORDER BY p.created_at;


-- name: CheckInPatient :one
INSERT INTO patients (name, bed_id, is_admitted)
VALUES ($1, $2, TRUE)
RETURNING *;

-- name: CheckOutPatient :one
UPDATE patients
SET is_admitted = FALSE
WHERE id = $1
RETURNING *;

-- name: MovePatient :one
UPDATE patients
SET bed_id = $2
WHERE id = $1
RETURNING *;

-- name: GetPatient :one
SELECT *
FROM patients
WHERE id = $1;

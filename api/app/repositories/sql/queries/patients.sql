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

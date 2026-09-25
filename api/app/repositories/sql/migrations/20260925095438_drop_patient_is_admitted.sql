-- migrate:up
DELETE FROM patients
WHERE NOT is_admitted;

ALTER TABLE patients
  DROP COLUMN is_admitted;

CREATE UNIQUE INDEX patients__bed_id_ix
  ON patients (bed_id);

-- migrate:down
ALTER TABLE patients
  ADD COLUMN is_admitted BOOLEAN NOT NULL DEFAULT TRUE;

CREATE UNIQUE INDEX patients__bed_id_ix
  ON patients (bed_id)
  WHERE is_admitted;

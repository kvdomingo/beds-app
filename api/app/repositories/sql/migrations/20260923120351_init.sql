-- migrate:up
CREATE EXTENSION IF NOT EXISTS pg_idkit;

ALTER FUNCTION idkit_ulid_generate() IMMUTABLE;

CREATE TABLE wards (
  id TEXT PRIMARY KEY GENERATED ALWAYS AS (idkit_ulid_generate()) STORED,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE beds (
  id TEXT PRIMARY KEY GENERATED ALWAYS AS (idkit_ulid_generate()) STORED,
  ward_id TEXT NOT NULL REFERENCES wards (id)
);

CREATE TABLE users (
  id TEXT PRIMARY KEY GENERATED ALWAYS AS (idkit_ulid_generate()) STORED,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE patients (
  id TEXT PRIMARY KEY GENERATED ALWAYS AS (idkit_ulid_generate()) STORED,
  name TEXT NOT NULL,
  bed_id TEXT NOT NULL REFERENCES beds (id),
  is_admitted BOOLEAN NOT NULL DEFAULT TRUE
);


-- migrate:down
DROP TABLE patients;
DROP TABLE users;
DROP TABLE beds;
DROP TABLE wards;

-- migrate:up
CREATE TABLE user_ward_assignments (
  created_at TIMESTAMPTZ NOT NULL GENERATED ALWAYS AS (IMMUTABLE_NOW()) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  ward_id TEXT NOT NULL REFERENCES wards (id) ON DELETE CASCADE,

  PRIMARY KEY (user_id, ward_id)
);
CREATE TRIGGER user_ward_assignments__updated_at
  BEFORE UPDATE ON user_ward_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX user_ward_assignments__user_id_ix
  ON user_ward_assignments (user_id);
CREATE INDEX user_ward_assignments__ward_id_ix
  ON user_ward_assignments (ward_id);

-- migrate:down
DROP TABLE user_ward_assignments;

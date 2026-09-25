-- migrate:up
CREATE TABLE roles (
  id TEXT PRIMARY KEY DEFAULT idkit_ulid_generate(),
  created_at TIMESTAMPTZ NOT NULL GENERATED ALWAYS AS (IMMUTABLE_NOW()) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE
);
CREATE TRIGGER roles__updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO roles (name)
VALUES
  ('Admin'),
  ('Member'),
  ('Viewer')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE user_role_assignments (
  created_at TIMESTAMPTZ NOT NULL GENERATED ALWAYS AS (IMMUTABLE_NOW()) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles (id) ON DELETE CASCADE,

  PRIMARY KEY (user_id, role_id)
);
CREATE TRIGGER user_role_assignments__updated_at
  BEFORE UPDATE ON user_role_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX user_role_assignments__user_id_ix
  ON user_role_assignments (user_id);
CREATE INDEX user_role_assignments__role_id_ix
  ON user_role_assignments (role_id);

-- migrate:down
DROP TABLE user_role_assignments;
DROP TABLE roles;

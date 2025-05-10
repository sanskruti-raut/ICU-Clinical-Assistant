-- Add a test user (password is 'password' hashed with bcryptjs)
INSERT INTO users (email, password_hash, role, created_at)
VALUES
  ('admin@vitalwatch.com', '$2a$10$3euPi1qeKUiYwTGQI5QQgeEzfQgf9q8YXV8hCOuZm07MTqjEuZbHm', 'admin', NOW());

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert a test admin user (password is 'password123')
INSERT INTO users (email, password_hash, role)
VALUES (
  'admin@vitalwatch.com', 
  '$2a$10$YdRAcKYDEX0HnHt6D6.QJeDVBNwKPqT0kQ.KZx5pYgJGFj3EgQqO2', 
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Insert a test doctor user (password is 'password123') 
INSERT INTO users (email, password_hash, role)
VALUES (
  'doctor@vitalwatch.com',
  '$2a$10$YdRAcKYDEX0HnHt6D6.QJeDVBNwKPqT0kQ.KZx5pYgJGFj3EgQqO2',
  'doctor'
)
ON CONFLICT (email) DO NOTHING;

-- Insert a test nurse user (password is 'password123')
INSERT INTO users (email, password_hash, role)
VALUES (
  'nurse@vitalwatch.com',
  '$2a$10$YdRAcKYDEX0HnHt6D6.QJeDVBNwKPqT0kQ.KZx5pYgJGFj3EgQqO2',
  'nurse'
)
ON CONFLICT (email) DO NOTHING;

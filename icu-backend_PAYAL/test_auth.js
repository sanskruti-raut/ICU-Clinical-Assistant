const bcrypt = require('bcryptjs');
const pool = require('./db');

async function testAuth() {
  try {
    // Test with admin user
    const email = 'admin@vitalwatch.com';
    const password = 'password123';
    
    console.log('Testing authentication for:', email);
    
    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log('User not found!');
      return;
    }
    
    const user = result.rows[0];
    console.log('User found:', user.email, user.role);
    console.log('Stored hash:', user.password_hash);
    
    // Test password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('Password matches:', isMatch);
    
    // Create a new hash for comparison
    const newHash = await bcrypt.hash(password, 10);
    console.log('New hash for password123:', newHash);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testAuth();

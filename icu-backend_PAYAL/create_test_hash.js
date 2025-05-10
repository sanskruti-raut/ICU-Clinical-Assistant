const bcrypt = require('bcryptjs');

async function createHash() {
  const password = 'password123';
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Test the hash
  const isMatch = await bcrypt.compare(password, hash);
  console.log('Password matches hash:', isMatch);
}

createHash();

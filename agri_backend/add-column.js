const mysql = require('mysql2');

// Create connection 
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'agri_db'
});

console.log('Adding missing blockchain_account column to users table...\n');

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to agri_db database');
  
  // First, check current table structure
  connection.query('DESCRIBE users', (err, results) => {
    if (err) {
      console.error('❌ Error describing users table:', err.message);
      connection.end();
      return;
    }
    
    console.log('\n📋 Current users table structure:');
    console.table(results);
    
    // Check if blockchain_account column already exists
    const hasBlockchainAccount = results.some(row => row.Field === 'blockchain_account');
    
    if (hasBlockchainAccount) {
      console.log('\n✅ blockchain_account column already exists!');
      connection.end();
      return;
    }
    
    // Add the missing blockchain_account column
    const alterQuery = 'ALTER TABLE users ADD COLUMN blockchain_account VARCHAR(255) AFTER role';
    
    connection.query(alterQuery, (err, results) => {
      if (err) {
        console.error('❌ Error adding blockchain_account column:', err.message);
      } else {
        console.log('\n✅ Successfully added blockchain_account column!');
        
        // Show updated structure
        connection.query('DESCRIBE users', (err, results) => {
          if (err) {
            console.error('❌ Error describing updated table:', err.message);
          } else {
            console.log('\n📋 Updated users table structure:');
            console.table(results);
          }
          connection.end();
        });
      }
    });
  });
});
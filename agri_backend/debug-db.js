const mysql = require('mysql2');

// Create connection with the same config as your main app
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'agriculture_db'
});

console.log('Testing database connection and table structure...\n');

// Test 1: Check if we can connect
connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to database');
  
  // Test 2: Show current database
  connection.query('SELECT DATABASE() as current_db', (err, results) => {
    if (err) {
      console.error('❌ Error getting current database:', err.message);
    } else {
      console.log('📍 Current database:', results[0].current_db);
    }
    
    // Test 3: Describe the users table structure
    connection.query('DESCRIBE users', (err, results) => {
      if (err) {
        console.error('❌ Error describing users table:', err.message);
      } else {
        console.log('\n📋 Users table structure:');
        console.table(results);
      }
      
      // Test 4: Show existing users
      connection.query('SELECT * FROM users LIMIT 3', (err, results) => {
        if (err) {
          console.error('❌ Error selecting from users:', err.message);
        } else {
          console.log('\n👥 Sample users data:');
          console.table(results);
        }
        
        // Test 5: Try the problematic insert query
        const testQuery = "INSERT INTO users (username, email, password, role, blockchain_account) VALUES ('test_user', 'test@test.com', 'test123', 'farmer', NULL)";
        connection.query(testQuery, (err, results) => {
          if (err) {
            console.error('\n❌ INSERT failed:', err.message);
            console.log('🔍 SQL that failed:', testQuery);
          } else {
            console.log('\n✅ INSERT successful! New user ID:', results.insertId);
            // Clean up test data
            connection.query('DELETE FROM users WHERE username = "test_user"', () => {
              console.log('🧹 Cleaned up test data');
            });
          }
          
          connection.end();
        });
      });
    });
  });
});
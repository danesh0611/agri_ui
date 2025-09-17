
import express from 'express';
import sql from 'mssql';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:3000',
    'https://agri-trace-mu.vercel.app',
    'https://agri-ui.vercel.app'
  ],
  credentials: true
}));
app.use(bodyParser.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Agriculture Backend API is running!', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: 'Not tested yet' });
});

// SQL Server connection configuration
const config = {
  server: process.env.DB_SERVER || 'ledgerlegends.database.windows.net',
  user: process.env.DB_USER || 'ledgerlegends',
  password: process.env.DB_PASSWORD || 'Chakra*2006',
  database: process.env.DB_NAME || 'regdetails',
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Global connection pool
let pool = null;

// Initialize connection pool
async function initializePool() {
  try {
    console.log('Initializing SQL Server connection pool...');
    pool = await sql.connect(config);
    console.log('Connected to SQL Server successfully');
    
    // Create table if not exists
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL,
        password NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'distributor', 'retailer')),
        created_at DATETIME DEFAULT GETDATE()
      )
    `);
    console.log('Users table ready');
    return true;
  } catch (err) {
    console.error('SQL Server connection error:', err);
    pool = null;
    return false;
  }
}

// Initialize on startup and start server only after connection is ready
async function startServer() {
  console.log('Starting server initialization...');
  const connected = await initializePool();
  
  if (!connected) {
    console.error('Failed to connect to database. Retrying in 5 seconds...');
    setTimeout(startServer, 5000);
    return;
  }
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Start the server
startServer();

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Validate role
  const validRoles = ['farmer', 'distributor', 'retailer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  try {
    if (!pool) {
      throw new Error('Database not connected');
    }
    
    const request = pool.request();
    request.input('username', sql.NVarChar, username);
    request.input('email', sql.NVarChar, email);
    request.input('password', sql.NVarChar, password);
    request.input('role', sql.NVarChar, role);
    
    const result = await request.query('INSERT INTO users (username, email, password, role) VALUES (@username, @email, @password, @role)');
    res.json({ success: true, userId: result.rowsAffected[0] });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  
  try {
    if (!pool) {
      throw new Error('Database not connected');
    }
    
    const request = pool.request();
    request.input('email', sql.NVarChar, email);
    request.input('password', sql.NVarChar, password);
    
    const result = await request.query('SELECT * FROM users WHERE email = @email AND password = @password');
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Optionally, do not send password back
    const user = { ...result.recordset[0] };
    delete user.password;
    res.json({ success: true, user });
  } catch (err) {
    console.error('Login query error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

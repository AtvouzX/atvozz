const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let pool;

async function createPool() {
	pool = mysql.createPool({
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
	});

	// Test the connection
	try {
		const connection = await pool.getConnection();
		console.log('Database connected successfully');
		connection.release();
	}
	catch (error) {
		console.error('Database connection failed:', error);
		throw error;
	}
}

async function initDatabase() {
	try {
		const schemaPath = path.join(__dirname, '..', 'schema.sql');
		const schema = fs.readFileSync(schemaPath, 'utf8');

		// Split schema into individual statements
		const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

		for (const statement of statements) {
			if (statement.trim()) {
				await query(statement);
			}
		}

		console.log('Database schema initialized successfully');
	}
	catch (error) {
		console.error('Failed to initialize database schema:', error);
		throw error;
	}
}

async function getPool() {
	if (!pool) {
		await createPool();
	}
	return pool;
}

async function query(sql, params = []) {
	const dbPool = await getPool();
	const [rows] = await dbPool.execute(sql, params);
	return rows;
}

async function closePool() {
	if (pool) {
		await pool.end();
		console.log('Database connection pool closed');
	}
}

module.exports = {
	createPool,
	getPool,
	query,
	closePool,
	initDatabase,
};
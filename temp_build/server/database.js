const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Vercel/Neon connections
    }
});

pool.on('connect', () => {
    // console.log('Connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Initialize the Database Table
const initDB = async () => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS complaints (
            id SERIAL PRIMARY KEY,
            ticket_id TEXT UNIQUE,
            citizen_name TEXT,
            citizen_phone TEXT,
            citizen_email TEXT,
            citizen_gender TEXT,
            citizen_address TEXT,
            citizen_pincode TEXT,
            area TEXT,
            locality TEXT,
            street_name TEXT,
            specific_location TEXT,
            category TEXT,
            title TEXT,
            is_anonymous BOOLEAN,
            text TEXT,
            normalized_text TEXT,
            department TEXT,
            priority_score INTEGER,
            severity_label TEXT,
            estimated_resolution_time TEXT,
            sla_risk BOOLEAN,
            location TEXT,
            status TEXT,
            slaDeadline TIMESTAMP,
            isSlaBreachWarning BOOLEAN,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log('Postgres Complaints table ready.');
    } catch (err) {
        console.error('Error creating table:', err.message);
    }
};

initDB();

const insertComplaint = async (complaint) => {
    const {
        ticket_id, citizen_name, citizen_phone, citizen_email, citizen_gender,
        citizen_address, citizen_pincode, area, locality, street_name,
        specific_location, category, title, is_anonymous, text, 
        normalized_text, department, priority_score, severity_label, 
        estimated_resolution_time, sla_risk, location, status,
        slaDeadline, isSlaBreachWarning
    } = complaint;

    const query = `INSERT INTO complaints (
        ticket_id, citizen_name, citizen_phone, citizen_email, citizen_gender,
        citizen_address, citizen_pincode, area, locality, street_name,
        specific_location, category, title, is_anonymous, text, 
        normalized_text, department, priority_score, severity_label, 
        estimated_resolution_time, sla_risk, location, status,
        slaDeadline, isSlaBreachWarning
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
        $11, $12, $13, $14, $15, $16, $17, $18, $19, 
        $20, $21, $22, $23, $24, $25
    ) RETURNING id`;

    const values = [
        ticket_id, citizen_name, citizen_phone, citizen_email, citizen_gender,
        citizen_address, citizen_pincode, area, locality, street_name,
        specific_location, category, title, is_anonymous, text, 
        normalized_text, department, priority_score, severity_label, 
        estimated_resolution_time, sla_risk, location, status,
        slaDeadline, isSlaBreachWarning
    ];

    const res = await pool.query(query, values);
    return res.rows[0].id;
};

const getAllComplaints = async () => {
    const res = await pool.query(`SELECT * FROM complaints ORDER BY timestamp DESC`);
    return res.rows; // Postgres natively returns true/false for BOOLEAN columns
};

const getComplaintByTicketId = async (ticketId) => {
    const res = await pool.query(`SELECT * FROM complaints WHERE ticket_id = $1`, [ticketId]);
    return res.rows.length > 0 ? res.rows[0] : null;
};

const updateComplaintStatus = async (ticketId, status, isSlaBreachWarning) => {
    let query, params;
    if (isSlaBreachWarning !== undefined) {
        query = `UPDATE complaints SET status = $1, isSlaBreachWarning = $2 WHERE ticket_id = $3`;
        params = [status, isSlaBreachWarning, ticketId];
    } else {
        query = `UPDATE complaints SET status = $1 WHERE ticket_id = $2`;
        params = [status, ticketId];
    }
    const res = await pool.query(query, params);
    return res.rowCount;
};

const getCriticalComplaints = async () => {
    const query = `
        SELECT * FROM complaints 
        WHERE status != 'RESOLVED' 
        AND isSlaBreachWarning = true
        ORDER BY slaDeadline ASC
    `;
    const res = await pool.query(query);
    return res.rows;
};

const getDashboardStats = async () => {
    const complaints = await getAllComplaints();
    const critical = await getCriticalComplaints();
    
    return {
        total: complaints.length,
        open: complaints.filter(c => c.status === 'OPEN').length,
        inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolved: complaints.filter(c => c.status === 'RESOLVED').length,
        criticalQueue: critical
    };
};

module.exports = {
  db: pool,
  insertComplaint,
  getAllComplaints,
  getComplaintByTicketId,
  updateComplaintStatus,
  getCriticalComplaints,
  getDashboardStats
};

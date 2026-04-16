const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'complaints.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create the complaints table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        slaDeadline DATETIME,
        isSlaBreachWarning BOOLEAN,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating table', err.message);
        } else {
            console.log('Complaints table ready.');
        }
    });
  }
});

// Helper functions for easy querying
const insertComplaint = (complaint) => {
  const {
      ticket_id, citizen_name, citizen_phone, citizen_email, citizen_gender,
      citizen_address, citizen_pincode, area, locality, street_name,
      specific_location, category, title, is_anonymous, text, 
      normalized_text, department, priority_score, severity_label, 
      estimated_resolution_time, sla_risk, location, status,
      slaDeadline, isSlaBreachWarning
  } = complaint;

  return new Promise((resolve, reject) => {
      const query = `INSERT INTO complaints (
          ticket_id, citizen_name, citizen_phone, citizen_email, citizen_gender,
          citizen_address, citizen_pincode, area, locality, street_name,
          specific_location, category, title, is_anonymous, text, 
          normalized_text, department, priority_score, severity_label, 
          estimated_resolution_time, sla_risk, location, status,
          slaDeadline, isSlaBreachWarning
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.run(query, [
          ticket_id, citizen_name, citizen_phone, citizen_email, citizen_gender,
          citizen_address, citizen_pincode, area, locality, street_name,
          specific_location, category, title, is_anonymous, text, 
          normalized_text, department, priority_score, severity_label, 
          estimated_resolution_time, sla_risk, location, status,
          slaDeadline, isSlaBreachWarning
      ], function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
      });
  });
};

const getAllComplaints = () => {
  return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM complaints ORDER BY timestamp DESC`, [], (err, rows) => {
          if (err) return reject(err);
          // sqlite returns 0/1 for boolean, map back to true/false
          const formatted = rows.map(r => ({
              ...r,
              sla_risk: r.sla_risk === 1
          }));
          resolve(formatted);
      });
  });
};

const getComplaintByTicketId = (ticketId) => {
  return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM complaints WHERE ticket_id = ?`, [ticketId], (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);
          resolve({
              ...row,
              sla_risk: row.sla_risk === 1
          });
      });
  });
};

const updateComplaintStatus = (ticketId, status, isSlaBreachWarning) => {
  return new Promise((resolve, reject) => {
      let query = `UPDATE complaints SET status = ? WHERE ticket_id = ?`;
      let params = [status, ticketId];

      if (isSlaBreachWarning !== undefined) {
          query = `UPDATE complaints SET status = ?, isSlaBreachWarning = ? WHERE ticket_id = ?`;
          params = [status, isSlaBreachWarning, ticketId];
      }

      db.run(query, params, function(err) {
          if (err) return reject(err);
          resolve(this.changes);
      });
  });
};

const getCriticalComplaints = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM complaints 
            WHERE status != 'RESOLVED' 
            AND isSlaBreachWarning = 1
            ORDER BY slaDeadline ASC
        `;
        db.all(query, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
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
  db,
  insertComplaint,
  getAllComplaints,
  getComplaintByTicketId,
  updateComplaintStatus,
  getCriticalComplaints,
  getDashboardStats
};

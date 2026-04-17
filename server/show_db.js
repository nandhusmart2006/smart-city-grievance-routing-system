const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./complaints.db');

console.log("\n==========================================================");
console.log("   🛡️ TACTICAL GRIEVANCE DATABASE (RAW SQL QUERY) 🛡️");
console.log("==========================================================\n");

db.all("SELECT ticket_id, department, priority_score as pts, status, title FROM complaints ORDER BY timestamp DESC LIMIT 10", [], (err, rows) => {
    if (err) {
        console.error("Database Error:", err.message);
    } else {
        console.table(rows);
        console.log("\n✅ Database connected successfully. Displaying top 10 recent vectors.\n");
    }
    db.close();
});

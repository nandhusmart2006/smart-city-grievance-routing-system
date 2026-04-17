const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server', 'complaints.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("🕒 Current UTC from SQLite:", "Unknown");
    db.get("SELECT datetime('now') AS now, datetime('now', '+4 hours') AS limitTime", (err, row) => {
        console.log("Current Time (UTC):", row.now);
        console.log("Critical Limit (UTC):", row.limitTime);
        
        db.all("SELECT ticket_id, slaDeadline FROM complaints", (err, rows) => {
            console.log("\nAll Slas in DB:");
            rows.forEach(r => {
                console.log(`${r.ticket_id}: ${r.slaDeadline}`);
            });

            db.all(`SELECT * FROM complaints WHERE status != 'RESOLVED' AND datetime(slaDeadline) <= datetime('now', '+4 hours')`, (err, rows) => {
                console.log("\nCritical Queue Result (with datetime normalization):", rows.length);
                rows.forEach(r => console.log(`- ${r.ticket_id}`));
            });
        });
    });
});

db.close();

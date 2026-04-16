const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'complaints.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("🛠️ Starting database migration...");
    
    db.run("ALTER TABLE complaints ADD COLUMN slaDeadline DATETIME", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("ℹ️ Column 'slaDeadline' already exists.");
            } else {
                console.error("❌ Error adding slaDeadline:", err.message);
            }
        } else {
            console.log("✅ Added column 'slaDeadline'.");
        }
    });

    db.run("ALTER TABLE complaints ADD COLUMN isSlaBreachWarning BOOLEAN", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("ℹ️ Column 'isSlaBreachWarning' already exists.");
            } else {
                console.error("❌ Error adding isSlaBreachWarning:", err.message);
            }
        } else {
            console.log("✅ Added column 'isSlaBreachWarning'.");
        }
    });

    console.log("🏁 Migration attempt finished.");
});

db.close();

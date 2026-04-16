const { insertComplaint, db } = require('./backend/database');

const realisticComplaints = [
    // --- CRITICAL QUEUE (Less than 4 hours remaining) ---
    {
        text: "Live electrical spark from damaged transformer near Metro Station.",
        department: "Electricity",
        priority_score: 10,
        severity_label: "Critical",
        offsetHours: 1 // SLA Deadline in 1 hour
    },
    {
        text: "Major sewage overflow flooding the main market entrance.",
        department: "Sanitation",
        priority_score: 9,
        severity_label: "Critical",
        offsetHours: 2 // SLA Deadline in 2 hours
    },
    {
        text: "Gas leak smell reported near the community hospital kitchen.",
        department: "Public Safety",
        priority_score: 10,
        severity_label: "Critical",
        offsetHours: 3 // SLA Deadline in 3 hours
    },
    // --- NOMINAL / HIGH PRIORITY ---
    {
        text: "Multiple potholes on the bypass causing traffic congestion.",
        department: "Roads",
        priority_score: 8,
        severity_label: "High",
        offsetHours: 10
    },
    {
        text: "Street lights not functioning for the last 3 blocks on Park Avenue.",
        department: "Electricity",
        priority_score: 7,
        severity_label: "High",
        offsetHours: 18
    },
    {
        text: "Public drinking water fountain is broken and leaking.",
        department: "Water",
        priority_score: 6,
        severity_label: "Medium",
        offsetHours: 20
    },
    {
        text: "Garbage collection missed for the entire 5th Sector this week.",
        department: "Sanitation",
        priority_score: 5,
        severity_label: "Medium",
        offsetHours: 24
    },
    {
        text: "Illegal parking blocking the fire hydrant on 10th Cross.",
        department: "Roads",
        priority_score: 9,
        severity_label: "Critical",
        offsetHours: 8
    },
    {
        text: "Drainage blockage causing stagnant water in front of Govt School.",
        department: "Sanitation",
        priority_score: 8,
        severity_label: "High",
        offsetHours: 12
    },
    {
        text: "Low voltage issues across the Residential Block C.",
        department: "Electricity",
        priority_score: 4,
        severity_label: "Medium",
        offsetHours: 36
    },
    {
        text: "Abandoned vehicle on the service road near the flyover.",
        department: "Roads",
        priority_score: 3,
        severity_label: "Low",
        offsetHours: 40
    },
    {
        text: "Park benches broken in the South City Park.",
        department: "Water", // Using diverse depts for test
        priority_score: 2,
        severity_label: "Low",
        offsetHours: 48
    },
    {
        text: "Water supply pressure is extremely low in high-rise apartments.",
        department: "Water",
        priority_score: 5,
        severity_label: "Medium",
        offsetHours: 24
    },
    {
        text: "Persistent noise from construction site after 10 PM.",
        department: "Roads",
        priority_score: 4,
        severity_label: "Medium",
        offsetHours: 30
    },
    {
        text: "Damaged manhole cover on the sidewalk of 7th Avenue.",
        department: "Sanitation",
        priority_score: 9,
        severity_label: "Critical",
        offsetHours: 6
    }
];

const names = ["Anita Rao", "Rajesh Kumar", "Siddharth Jain", "Priya Sharma", "Vikram Singh", "Deepa Patel"];
const baseLat = 12.9716;
const baseLng = 77.5946;

const generateTicketId = () => 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase();

async function seed() {
    console.log("🏙️ Initializing SmartCity.OS Data Injection...");
    
    // Clear existing data for a fresh pitch demo
    await new Promise((resolve) => db.run("DELETE FROM complaints", resolve));
    console.log("🧹 Previous nodal data purged.");

    for (const data of realisticComplaints) {
        const now = new Date();
        const slaDeadline = new Date(now.getTime() + (data.offsetHours * 60 * 60 * 1000));
        
        const complaint = {
            ticket_id: generateTicketId(),
            citizen_name: names[Math.floor(Math.random() * names.length)],
            citizen_phone: "9876543" + Math.floor(Math.random() * 999),
            citizen_email: "citizen" + Math.floor(Math.random() * 100) + "@smartcity.gov",
            citizen_gender: "Other",
            citizen_address: "Sector " + Math.floor(Math.random() * 10) + ", Smart City",
            citizen_pincode: "560001",
            area: "Smart City Main",
            locality: "Uptown",
            street_name: "Avenue " + Math.floor(Math.random() * 20),
            specific_location: "Near Landmark " + Math.floor(Math.random() * 5),
            category: "Grievance",
            title: data.text.split(' ').slice(0, 3).join(' ') + "...",
            is_anonymous: false,
            text: data.text,
            normalized_text: `AI Processed: ${data.text}`,
            department: data.department,
            priority_score: data.priority_score,
            severity_label: data.severity_label,
            estimated_resolution_time: `${data.offsetHours} Hours`,
            sla_risk: data.priority_score >= 8,
            location: `${baseLat + (Math.random() - 0.5) * 0.05},${baseLng + (Math.random() - 0.5) * 0.05}`,
            status: "OPEN",
            slaDeadline: slaDeadline.toISOString(),
            isSlaBreachWarning: data.offsetHours < 4
        };

        try {
            await insertComplaint(complaint);
            console.log(`✅ Injected ${complaint.ticket_id} | SLA: ${data.offsetHours}h | Dept: ${data.department}`);
        } catch (err) {
            console.error(`❌ Failed to inject ${complaint.ticket_id}:`, err.message);
        }
    }

    console.log("🚀 Data injection complete. 15 grievances online. 3 items in Critical Queue.");
    process.exit(0);
}

seed();

const { insertComplaint } = require('./database');

// Tamil Nadu cities and their coordinates for realistic demo data
const dummyComplaints = [
    // === CRITICAL QUEUE (SLA < 4h) ===
    {
        ticket_id: 'TKT-CH01TN',
        text: 'Major sewage overflow flooding the main market entrance.',
        normalized_text: 'AI Processed: Major sewage overflow flooding the main market entrance.',
        department: 'Sanitation',
        priority_score: 10,
        severity_label: 'Critical',
        estimated_resolution_time: '2 Hours',
        sla_risk: true,
        location: '13.0827,80.2707', // Chennai - T. Nagar
        citizen_name: 'Priya Sharma',
        citizen_phone: '9876543247',
        area: 'Smart City Main',
        locality: 'T. Nagar',
        citizen_address: 'Sector 7, Smart City',
        citizen_pincode: '600017',
        specific_location: 'Near T. Nagar Market Entrance',
        category: 'Grievance',
        title: 'Damage',
        status: 'OPEN',
        isSlaBreachWarning: 1
    },
    {
        ticket_id: 'TKT-MD02TN',
        text: 'Broken water main pipe near Meenakshi Temple, water wasting for 6 hours.',
        normalized_text: 'AI Processed: Critical water main rupture near temple area causing significant wastage.',
        department: 'Water Supply',
        priority_score: 10,
        severity_label: 'Critical',
        estimated_resolution_time: '2 Hours',
        sla_risk: true,
        location: '9.9195,78.1193', // Madurai
        citizen_name: 'Karthik Murugan',
        citizen_phone: '9876543201',
        area: 'Madurai South',
        locality: 'Temple Area',
        citizen_address: '45, West Masi Street',
        citizen_pincode: '625001',
        specific_location: 'Near Meenakshi Amman Temple',
        category: 'Water Stagnation',
        title: 'Broken Water Main',
        status: 'OPEN',
        isSlaBreachWarning: 1
    },
    {
        ticket_id: 'TKT-CB03TN',
        text: 'Entire RS Puram ward has no power since midnight. Transformer exploded.',
        normalized_text: 'AI Processed: Complete power failure in RS Puram ward due to transformer explosion.',
        department: 'Electricity',
        priority_score: 9,
        severity_label: 'Critical',
        estimated_resolution_time: '4 Hours',
        sla_risk: true,
        location: '11.0168,76.9558', // Coimbatore
        citizen_name: 'Anitha Rajan',
        citizen_phone: '9876543202',
        area: 'Coimbatore Central',
        locality: 'RS Puram',
        citizen_address: '12, DB Road',
        citizen_pincode: '641002',
        specific_location: 'Near RS Puram Bus Stand',
        category: 'Street Light',
        title: 'Major Power Outage',
        status: 'OPEN',
        isSlaBreachWarning: 1
    },

    // === STANDARD PRIORITY ===
    {
        ticket_id: 'TKT-TJ04TN',
        text: 'Large pothole on Thanjavur Main Road causing accidents.',
        normalized_text: 'AI Processed: Hazardous pothole on main road requires immediate road repair.',
        department: 'Roads',
        priority_score: 7,
        severity_label: 'High',
        estimated_resolution_time: '24 Hours',
        sla_risk: false,
        location: '10.7870,79.1378', // Thanjavur
        citizen_name: 'Senthil Kumar',
        citizen_phone: '9876543203',
        area: 'Thanjavur Central',
        locality: 'Palace Area',
        citizen_address: '78, South Main Street',
        citizen_pincode: '613001',
        specific_location: 'Near Big Temple Junction',
        category: 'Road and Footpath',
        title: 'Dangerous Pothole',
        status: 'OPEN',
        isSlaBreachWarning: 0
    },
    {
        ticket_id: 'TKT-SL05TN',
        text: 'Garbage piled up near Salem bus stand for 4 days.',
        normalized_text: 'AI Processed: Prolonged garbage accumulation near bus stand creating public health hazard.',
        department: 'Sanitation',
        priority_score: 6,
        severity_label: 'High',
        estimated_resolution_time: '12 Hours',
        sla_risk: false,
        location: '11.6643,78.1460', // Salem
        citizen_name: 'Lakshmi Devi',
        citizen_phone: '9876543204',
        area: 'Salem Town',
        locality: 'Bus Stand Area',
        citizen_address: '23, Cherry Road',
        citizen_pincode: '636007',
        specific_location: 'Salem New Bus Stand',
        category: 'Garbage',
        title: 'Garbage Pileup',
        status: 'OPEN',
        isSlaBreachWarning: 0
    },
    {
        ticket_id: 'TKT-TC06TN',
        text: 'Street lights not working on Cantonment Road, Trichy.',
        normalized_text: 'AI Processed: Non-functional street lighting on Cantonment Road affecting pedestrian safety.',
        department: 'Electricity',
        priority_score: 5,
        severity_label: 'Medium',
        estimated_resolution_time: '48 Hours',
        sla_risk: false,
        location: '10.7905,78.7047', // Tiruchirappalli
        citizen_name: 'Ramesh Babu',
        citizen_phone: '9876543205',
        area: 'Trichy Cantonment',
        locality: 'Cantonment',
        citizen_address: '56, Cantonment Main Road',
        citizen_pincode: '620001',
        specific_location: 'Near Central Bus Stand',
        category: 'Street Light',
        title: 'Street Light Outage',
        status: 'IN_PROGRESS',
        isSlaBreachWarning: 0
    },
    {
        ticket_id: 'TKT-VL07TN',
        text: 'Park playground equipment broken in Vellore Fort area.',
        normalized_text: 'AI Processed: Damaged playground equipment in public park posing child safety risk.',
        department: 'Roads',
        priority_score: 4,
        severity_label: 'Medium',
        estimated_resolution_time: '3 Days',
        sla_risk: false,
        location: '12.9165,79.1325', // Vellore
        citizen_name: 'Deepa Venkatesh',
        citizen_phone: '9876543206',
        area: 'Vellore Fort',
        locality: 'Fort Area',
        citizen_address: '34, Fort Road',
        citizen_pincode: '632004',
        specific_location: 'Near Vellore Fort Garden',
        category: 'Park and Playground',
        title: 'Broken Playground',
        status: 'OPEN',
        isSlaBreachWarning: 0
    },
    {
        ticket_id: 'TKT-ER08TN',
        text: 'Stagnant water breeding mosquitoes near Erode Market.',
        normalized_text: 'AI Processed: Stagnant water accumulation near market area creating mosquito breeding ground.',
        department: 'Sanitation',
        priority_score: 6,
        severity_label: 'High',
        estimated_resolution_time: '24 Hours',
        sla_risk: false,
        location: '11.3410,77.7172', // Erode
        citizen_name: 'Murugan S',
        citizen_phone: '9876543207',
        area: 'Erode Municipal',
        locality: 'Market Area',
        citizen_address: '67, Brough Road',
        citizen_pincode: '638001',
        specific_location: 'Near Erode Central Market',
        category: 'Water Stagnation',
        title: 'Mosquito Breeding',
        status: 'OPEN',
        isSlaBreachWarning: 0
    },
    {
        ticket_id: 'TKT-TN09TN',
        text: 'Public toilet near Tirunelveli Junction in unsanitary condition.',
        normalized_text: 'AI Processed: Public sanitation facility at junction area in severely unsanitary condition.',
        department: 'Sanitation',
        priority_score: 5,
        severity_label: 'Medium',
        estimated_resolution_time: '48 Hours',
        sla_risk: false,
        location: '8.7139,77.7567', // Tirunelveli
        citizen_name: 'Kavitha M',
        citizen_phone: '9876543208',
        area: 'Tirunelveli Junction',
        locality: 'Junction Area',
        citizen_address: '89, High Ground Road',
        citizen_pincode: '627001',
        specific_location: 'Near Tirunelveli Junction Railway Station',
        category: 'Public Toilet',
        title: 'Unsanitary Public Toilet',
        status: 'OPEN',
        isSlaBreachWarning: 0
    },
    {
        ticket_id: 'TKT-KK10TN',
        text: 'Storm water drain clogged near Kanyakumari beach road.',
        normalized_text: 'AI Processed: Blocked storm water drainage near beach road causing flooding risk.',
        department: 'Water Supply',
        priority_score: 7,
        severity_label: 'High',
        estimated_resolution_time: '12 Hours',
        sla_risk: false,
        location: '8.0883,77.5385', // Kanyakumari
        citizen_name: 'Ravi Chandran',
        citizen_phone: '9876543209',
        area: 'Kanyakumari',
        locality: 'Beach Road',
        citizen_address: '12, Beach Road',
        citizen_pincode: '629702',
        specific_location: 'Near Vivekananda Memorial View Point',
        category: 'Storm Water Drains',
        title: 'Clogged Storm Drain',
        status: 'OPEN',
        isSlaBreachWarning: 0
    },
    {
        ticket_id: 'TKT-TT11TN',
        text: 'Road completely washed out after rains near Thoothukudi port.',
        normalized_text: 'AI Processed: Road damage from rain requiring emergency repair near port area.',
        department: 'Roads',
        priority_score: 8,
        severity_label: 'High',
        estimated_resolution_time: '24 Hours',
        sla_risk: false,
        location: '8.7642,78.1348', // Thoothukudi
        citizen_name: 'Selvaraj P',
        citizen_phone: '9876543210',
        area: 'Thoothukudi Port',
        locality: 'Port Area',
        citizen_address: '45, Harbour Road',
        citizen_pincode: '628001',
        specific_location: 'Near V.O.C. Port Trust',
        category: 'Road and Footpath',
        title: 'Washed Out Road',
        status: 'IN_PROGRESS',
        isSlaBreachWarning: 0
    },
    {
        ticket_id: 'TKT-DG12TN',
        text: 'Low water pressure in Dindigul fort area for a week.',
        normalized_text: 'AI Processed: Persistent low water pressure in fort residential area.',
        department: 'Water Supply',
        priority_score: 3,
        severity_label: 'Low',
        estimated_resolution_time: '3 Days',
        sla_risk: false,
        location: '10.3624,77.9695', // Dindigul
        citizen_name: 'Geetha Rani',
        citizen_phone: '9876543211',
        area: 'Dindigul Municipal',
        locality: 'Fort Area',
        citizen_address: '78, Rock Fort Road',
        citizen_pincode: '624001',
        specific_location: 'Near Dindigul Rock Fort',
        category: 'General',
        title: 'Low Water Pressure',
        status: 'OPEN',
        isSlaBreachWarning: 0
    },
    {
        ticket_id: 'TKT-NL13TN',
        text: 'Illegal dumping near Nagapattinam beach causing foul smell.',
        normalized_text: 'AI Processed: Unauthorized waste dumping near coastal area causing environmental concern.',
        department: 'Sanitation',
        priority_score: 6,
        severity_label: 'High',
        estimated_resolution_time: '24 Hours',
        sla_risk: false,
        location: '10.7672,79.8449', // Nagapattinam
        citizen_name: 'Mahalakshmi K',
        citizen_phone: '9876543212',
        area: 'Nagapattinam Coastal',
        locality: 'Beach Road',
        citizen_address: '23, Beach Road',
        citizen_pincode: '611001',
        specific_location: 'Near Nagapattinam Lighthouse',
        category: 'Garbage',
        title: 'Illegal Dumping',
        status: 'OPEN',
        isSlaBreachWarning: 0
    },
    {
        ticket_id: 'TKT-KR14TN',
        text: 'Damaged road near Karaikudi Chettinad palace area.',
        normalized_text: 'AI Processed: Road surface damage in heritage area affecting tourism access.',
        department: 'Roads',
        priority_score: 4,
        severity_label: 'Medium',
        estimated_resolution_time: '48 Hours',
        sla_risk: false,
        location: '10.0681,78.7806', // Karaikudi
        citizen_name: 'Arun Prakash',
        citizen_phone: '9876543213',
        area: 'Karaikudi',
        locality: 'Chettinad',
        citizen_address: '56, Palace Road',
        citizen_pincode: '630001',
        specific_location: 'Near Chettinad Palace',
        category: 'Road and Footpath',
        title: 'Damaged Road',
        status: 'RESOLVED',
        isSlaBreachWarning: 0
    },
    {
        ticket_id: 'TKT-HP15TN',
        text: 'Public health concern: open drain near Hosur IT Park.',
        normalized_text: 'AI Processed: Open drainage near IT park creating sanitation and health hazard.',
        department: 'Sanitation',
        priority_score: 7,
        severity_label: 'High',
        estimated_resolution_time: '12 Hours',
        sla_risk: false,
        location: '12.7409,77.8253', // Hosur
        citizen_name: 'Vijay Kumar R',
        citizen_phone: '9876543214',
        area: 'Hosur IT Corridor',
        locality: 'SIPCOT',
        citizen_address: '90, SIPCOT Main Road',
        citizen_pincode: '635126',
        specific_location: 'Near SIPCOT IT Park Gate',
        category: 'Public Health',
        title: 'Open Drain Hazard',
        status: 'OPEN',
        isSlaBreachWarning: 0
    }
];

async function seed() {
    console.log('🌱 Seeding Tamil Nadu Smart City data...');
    
    const now = new Date();
    
    for (const complaint of dummyComplaints) {
        try {
            // Calculate SLA deadlines
            let slaDeadline;
            if (complaint.isSlaBreachWarning === 1) {
                // Critical: SLA expires in 2-3 hours from now
                slaDeadline = new Date(now.getTime() + (2 + Math.random() * 1) * 60 * 60 * 1000);
            } else {
                // Standard: SLA expires in 24-72 hours
                slaDeadline = new Date(now.getTime() + (24 + Math.random() * 48) * 60 * 60 * 1000);
            }
            
            const complaintWithSla = {
                ...complaint,
                slaDeadline: slaDeadline.toISOString(),
                createdAt: new Date(now.getTime() - Math.random() * 48 * 60 * 60 * 1000).toISOString()
            };

            await insertComplaint(complaintWithSla);
            console.log(`  ✅ ${complaint.ticket_id} → ${complaint.area} (${complaint.locality})`);
        } catch (err) {
            if (err.message.includes('UNIQUE')) {
                console.log(`  ⏭️  ${complaint.ticket_id} already exists, skipping.`);
            } else {
                console.error(`  ❌ Failed: ${complaint.ticket_id}: ${err.message}`);
            }
        }
    }
    console.log('\n🏁 Tamil Nadu seeding complete. 15 grievances across the state.');
    process.exit();
}

seed();

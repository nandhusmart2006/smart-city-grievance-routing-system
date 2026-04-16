const { insertComplaint } = require('../database');
const { processComplaintWithAI } = require('../ai');

// Helper to generate a random 6-character ticket ID
const generateTicketId = () => {
    return 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

/**
 * Handle citizen grievance submission
 * Integrates Google Gemini-2.5-Flash for sub-3-second multilingual triage
 */
const submitGrievance = async (req, res) => {
    try {
        const { 
            text, 
            citizen_name, citizen_phone, citizen_email, citizen_gender,
            citizen_address, citizen_pincode, area, locality, street_name,
            specific_location, category, title, is_anonymous
        } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Complaint text is required.' });
        }

        // 1. Live Gemini AI Triage (Multilingual: English, Hinglish, Tamil)
        const triage = await processComplaintWithAI(text);
        
        // 2. Prepare full complaint object with new SLA fields
        const now = new Date();
        let slaHours = 48; // Default for Priority 1-3
        if (triage.priority_score >= 8) slaHours = 12;
        else if (triage.priority_score >= 4) slaHours = 24;

        const slaDeadline = new Date(now.getTime() + (slaHours * 60 * 60 * 1000));

        const complaintData = {
            ticket_id: generateTicketId(),
            citizen_name: citizen_name || null,
            citizen_phone: citizen_phone || null,
            citizen_email: citizen_email || null,
            citizen_gender: citizen_gender || null,
            citizen_address: citizen_address || null,
            citizen_pincode: citizen_pincode || null,
            area: area || null,
            locality: locality || null,
            street_name: street_name || null,
            specific_location: specific_location || null,
            category: category || null,
            title: title || null,
            is_anonymous: !!is_anonymous,
            text: text,
            normalized_text: triage.normalized_text,
            department: triage.department,
            priority_score: triage.priority_score,
            severity_label: triage.severity_label,
            estimated_resolution_time: triage.estimated_resolution_time,
            sla_risk: triage.sla_risk,
            location: specific_location || area || null,
            status: 'OPEN',
            slaDeadline: slaDeadline.toISOString(),
            isSlaBreachWarning: false
        };

        // 3. Store in SQLite Database
        await insertComplaint(complaintData);

        // 4. Return response to frontend
        res.status(201).json({
            message: 'Grievance registered and triaged successfully',
            data: complaintData
        });

    } catch (error) {
        console.error('Core Triage Engine Failure:', error);
        res.status(500).json({ error: 'System processing error during triage.' });
    }
};

module.exports = {
    submitGrievance
};

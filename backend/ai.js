const { GoogleGenAI, Type } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

/**
 * Modernized AI Triage Prompt for gemini-2.5-flash
 */
const SYSTEM_PROMPT = `
Act as a Smart City Triage AI. Read this citizen complaint. 
It may be in English, Hinglish, or transliterated Tamil. 
Output ONLY a valid JSON object with: 
- 'assignedDepartment' (Must be one of: Roads, Water, Electricity, Sanitation)
- 'priorityScore' (Number 1-10 based on urgency)
- 'ackMessage' (A friendly auto-reply acknowledging the specific issue)
`;

const processComplaintWithAI = async (text) => {
    // Standard Fallback Data
    const fallback = {
        normalized_text: "AI Processing offline. Manual triage assigned.",
        department: "General",
        priority_score: 5,
        severity_label: "Medium",
        estimated_resolution_time: "48 Hours",
        sla_risk: false
    };

    if (!ai) return fallback;
    
    try {
        const fullPrompt = `${SYSTEM_PROMPT}\n\nComplaint Text: "${text}"`;
        
        const result_response = await ai.getGenerativeModel({ model: "gemini-2.0-flash" }).generateContent(fullPrompt);
        const responseText = result_response.response.text();
        
        // Robust JSON extraction (removes markdown backticks if present)
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const result = JSON.parse(cleanJson);
        
        // Validation & Normalization
        const deptMap = ["Roads", "Water", "Electricity", "Sanitation"];
        const department = deptMap.includes(result.assignedDepartment) ? result.assignedDepartment : "Other";
        const priority = parseInt(result.priorityScore) || 5;

        return {
            normalized_text: result.ackMessage || `Acknowledged: ${text.substring(0, 50)}...`,
            department: department,
            priority_score: priority,
            severity_label: priority >= 8 ? "Critical" : priority >= 5 ? "High" : "Medium",
            estimated_resolution_time: priority >= 8 ? "12 Hours" : "48 Hours",
            sla_risk: priority >= 8
        };
    } catch (error) {
        console.error("Gemini AI Triage failed (Falling back):", error.message);
        return fallback;
    }
};

module.exports = { processComplaintWithAI };

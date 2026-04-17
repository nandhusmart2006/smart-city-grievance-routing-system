const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

/**
 * AI Triage Prompt
 */
const SYSTEM_PROMPT = `
Act as a Smart City Triage AI. Read this citizen complaint. 
It may be in English, Hinglish, or transliterated Tamil. 
Output ONLY a valid JSON object with: 
- 'assignedDepartment' (Must be one of: Roads, Water, Electricity, Sanitation, Pollution)
- 'priorityScore' (Number 1-10 based on urgency)
- 'ackMessage' (A friendly auto-reply acknowledging the specific issue)
`;

// Models to try in order
const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Smart local keyword-based triage when Gemini API is unavailable.
 * Analyzes complaint text for department routing and urgency keywords.
 */
function localKeywordTriage(text) {
    const lower = text.toLowerCase();

    // Department classification via keyword matching
    const deptRules = [
        { dept: 'Water', keywords: ['water', 'pipe', 'tap', 'leak', 'flood', 'drain', 'sewage', 'stagnant', 'borewell', 'tank', 'supply', 'overflow', 'thanni', 'gutter', 'plumbing', 'drinking', 'pumping', 'drainage', 'motor', 'pump', 'scarcity', 'contamination', 'sewer', 'manhole', 'irrigation', 'puddle', 'spill', 'choked', 'pipeline', 'valve', 'hydrant', 'metro water', 'lorry', 'kuyava', 'oorani', 'kulam', 'kaalvaay', 'puzhudhi', 'kudineer', 'sinnakan', 'sump', 'canwater', 'salt water', 'hard water', 'RO', 'tap leak', 'pipe burst', 'underground pipe', 'water logging', 'waterlogged', 'lake', 'pond', 'தண்ணீர்', 'குடிநீர்', 'குழாய்', 'கசிவு', 'வெள்ளம்', 'கால்வாய்', 'குளம்', 'பஞ்சம்', 'குடிநீர் பற்றாக்குறை', 'குழாய் உடைப்பு', 'சாக்கடை நீர் கலப்பு', 'கழிவுநீர்', 'சேறு', 'ஆழ்துளை கிணறு', 'மோட்டார் பழுது', 'mootr', 'boremotor'] },
        { dept: 'Electricity', keywords: ['power', 'electric', 'light', 'street light', 'transformer', 'cable', 'wire', 'voltage', 'outage', 'blackout', 'dark', 'current', 'eb', 'shock', 'spark', 'pole', 'bulb', 'minsaaram', 'short circuit', 'fuse', 'meter', 'tangedco', 'live wire', 'electrocution', 'fluctuation', 'dim', 'powercut', 'board', 'tripped', 'high tension', 'HT line', 'LT line', 'substation', 'inverter', 'UPS', 'DG', 'generator', 'switch', 'socket', 'plug', 'panel', 'main board', 'mcb', 'mccb', 'earth', 'grounding', 'lighting', 'tube light', 'led', 'low voltage', 'மின்சாரம்', 'மின்வெட்டு', 'மின்கம்பம்', 'மின்மாற்றி', 'பல்ப', 'ஷாக்', 'மின்வயர்', 'மின் கசிவு', 'தீப்பொறி', 'மின் தடையால்', 'மின்சாரம் இல்லை', 'இருட்டு', 'மின் ஒயர்கள்', 'currentbila', 'current illa'] },
        { dept: 'Roads', keywords: ['road', 'pothole', 'footpath', 'bridge', 'crack', 'tar', 'pavement', 'traffic', 'signal', 'divider', 'highway', 'accident', 'street', 'crossing', 'speed breaker', 'asphalt', 'caved', 'uneven', 'dug', 'trench', 'mud', 'gravel', 'concrete', 'lane', 'jam', 'signboard', 'blind spot', 'intersection', 'zebra', 'salai', 'theru', 'vazhi', 'paadhai', 'flyover', 'subway', 'underpass', 'overbridge', 'NH', 'SH', 'state highway', 'national highway', 'bypass', 'ring road', 'service road', 'toll', 'toll plaza', 'barricade', 'paving', 'macadam', 'சாலை', 'குழி', 'பள்ளம்', 'பாலம்', 'தெரு', 'வழி', 'போக்குவரத்து', 'மோசமான சாலை', 'சேதமடைந்த சாலை', 'போக்குவரத்து நெரிசல்', 'விபத்துப்பகுதி', 'பள்ளங்கள்', 'சாலை விபத்து', 'theru vilakku'] },
        { dept: 'Sanitation', keywords: ['garbage', 'waste', 'toilet', 'clean', 'smell', 'dump', 'trash', 'mosquito', 'rat', 'pest', 'health', 'sanit', 'sweeping', 'dustbin', 'kuppai', 'stink', 'filth', 'clogged', 'hygiene', 'sweep', 'rubbish', 'litter', 'plastic', 'dead animal', 'foul', 'unhygienic', 'stench', 'disease', 'feces', 'defecation', 'urine', 'spitting', 'koovam', 'saakkadai', 'kazhivu', 'restroom', 'urinal', 'public toilet', 'bio toilet', 'e-toilet', 'swachh', 'swachh bharat', 'corporation worker', 'sweeper', 'scavenger', 'scavenging', 'drain block', 'drain choke', 'cesspool', 'குப்பை', 'சாக்கடை', 'சுகாதாரம்', 'கழிவு', 'கழிப்பறை', 'கொசு', 'துர்நாற்றம்', 'சுத்தம் இல்லை', 'கழிவுநீர் தேக்கம்', 'டெங்கு கொசுக்கள்', 'எலிகள் தொல்லை', 'குப்பைத் தொட்டி', 'kazhivuneer', 'kosu', 'saakkadai adaippu'] },
        { dept: 'Pollution', keywords: ['pollution', 'smoke', 'dust', 'noise', 'air', 'emission', 'factory', 'chemical', 'smog', 'pollute', 'toxic', 'fumes', 'burning', 'loud', 'sound', 'haze', 'ash', 'soot', 'industrial', 'music', 'speaker', 'dj', 'exhaust', 'gas leak', 'carbon', 'particles', 'particulate', 'maasu', 'pugai', 'sathtum', 'kuchal', 'crackers', 'firecrackers', 'festival noise', 'loudspeaker', 'horn', 'honking', 'vehicular emission', 'tailpipe', 'effluent', 'discharge', 'soil', 'dust storm', 'construction dust', 'cement dust', 'brick kiln', 'மாசு', 'புகை', 'சத்தம்', 'காற்று', 'மாசுபாடு', 'துர்நாற்றம்', 'கரும் புகை', 'மூச்சுத் திணறல்', 'தொழிற்சாலை கழிவு', 'கடுமையான சத்தம்', 'நச்சு காற்று', 'muchuthinaral', 'olimaasu'] },
    ];

    let department = 'General';
    let maxHits = 0;
    for (const rule of deptRules) {
        const hits = rule.keywords.filter(k => lower.includes(k)).length;
        if (hits > maxHits) {
            maxHits = hits;
            department = rule.dept;
        }
    }

    // Priority scoring via urgency keywords
    const criticalWords = ['burst', 'explod', 'flood', 'collapse', 'danger', 'accident', 'emergency', 'fire', 'death', 'injur', 'urgent', 'critical', 'broken main', 'spark', 'shock', 'toxic', 'save', 'help', 'gas', 'fatal', 'bleeding', 'hospital', 'trapped', 'electrocuted', 'dying', 'poison', 'unconscious', 'threat to life', 'murder', 'bomb', 'terror', 'attack', 'weapon', 'gun', 'knife', 'blood', 'dead body', 'corpse', 'drowning', 'suffocat', 'choking', 'ஆபத்து', 'விபத்து', 'மரணம்', 'தீ', 'வெடிப்பு', 'ரத்தம்', 'உயிர்', 'உயிருக்கு ஆபத்து', 'மின்சாரம் பாய்ந்து', 'தண்ணீரில் மூழ்கி', 'கொடூரமான', 'கத்திக்குத்து', 'வெடிவிபத்து', 'uyir aabathu', 'current adichuruchu'];
    const highWords = ['broken', 'damage', 'block', 'overflow', 'no power', 'no water', 'pile', 'not working', 'hazard', 'unsafe', 'stink', 'severe', 'heavy', 'smell', 'fast', 'leaking heavily', 'foul', 'disease', 'dengue', 'malaria', 'outbreak', 'huge', 'terrible', 'worst', 'stop', 'blocked', 'fallen tree', 'crashed', 'extreme', 'dangerous', 'risky', 'perilous', 'precarious', 'collapsing', 'leaning', 'falling', 'crashing', 'smashing', 'shattering', 'snapping', 'tearing', 'ripping', 'சேதம்', 'உடைந்தது', 'நோய்', 'காய்ச்சல்', 'டெங்கு', 'உடனே', 'மிகவும்', 'அவசரம்', 'சுவாசிக்க', 'விழுந்து', 'udane', 'avasaram', 'vegu seekiram', 'udanjiruchu'];
    const mediumWords = ['complaint', 'issue', 'problem', 'concern', 'request', 'need', 'repair', 'clean', 'fix', 'dirty', 'bad', 'maintain', 'check', 'delay', 'slow', 'pending', 'poor', 'irregular', 'sometimes', 'weak', 'missing', 'annoying', 'bothersome', 'disturbing', 'irritating', 'frustrating', 'inconvenient', 'troublesome', 'pesky', 'nagging', 'persistent', 'continuous', 'frequent', 'பிரச்சனை', 'கோரிக்கை', 'பழுது', 'சரிசெய்', 'எப்பொழுதும்', 'தினமும்', 'நீண்ட நாட்களாக', 'eppozhudhum', 'adhigama', 'prachanai'];

    let priority = 4; // default
    if (criticalWords.some(w => lower.includes(w))) priority = 9;
    else if (highWords.some(w => lower.includes(w))) priority = 7;
    else if (mediumWords.some(w => lower.includes(w))) priority = 5;

    const ackMessage = `Your ${department.toLowerCase()} issue has been registered and routed to the ${department} Department. Priority: ${priority}/10. Our team will address this promptly.`;

    return {
        normalized_text: ackMessage,
        department,
        priority_score: priority,
        severity_label: priority >= 8 ? "Critical" : priority >= 5 ? "High" : "Medium",
        estimated_resolution_time: priority >= 8 ? "4 Hours" : priority >= 5 ? "24 Hours" : "48 Hours",
        sla_risk: priority >= 8
    };
}

const processComplaintWithAI = async (text) => {
    if (!ai) {
        console.warn("⚠️  GEMINI_API_KEY not set. Using local keyword triage.");
        return localKeywordTriage(text);
    }
    
    const fullPrompt = `${SYSTEM_PROMPT}\n\nComplaint Text: "${text}"`;

    // Try each model in the fallback chain
    for (const model of MODELS) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                console.log(`🧠 Trying ${model} (attempt ${attempt + 1})...`);
                
                const response = await Promise.race([
                    ai.models.generateContent({
                        model: model,
                        contents: fullPrompt,
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('TimeoutExceeded')), 800))
                ]);
                
                const responseText = response.text;
                const cleanJson = responseText.replace(/```json|```/g, '').trim();
                const result = JSON.parse(cleanJson);
                
                const deptMap = ["Roads", "Water", "Electricity", "Sanitation", "Pollution"];
                const department = deptMap.includes(result.assignedDepartment) ? result.assignedDepartment : "Other";
                const priority = parseInt(result.priorityScore) || 5;

                console.log(`✅ AI Triage (${model}): ${department} | Priority ${priority}/10`);

                return {
                    normalized_text: result.ackMessage || `Acknowledged: ${text.substring(0, 50)}...`,
                    department,
                    priority_score: priority,
                    severity_label: priority >= 8 ? "Critical" : priority >= 5 ? "High" : "Medium",
                    estimated_resolution_time: priority >= 8 ? "12 Hours" : "48 Hours",
                    sla_risk: priority >= 8
                };
            } catch (error) {
                const msg = error.message || '';
                if (msg.includes('Unexpected') || msg.includes('JSON')) {
                    console.error(`❌ ${model} JSON parse failed. Retrying...`);
                    continue; 
                }
                console.warn(`⚠️ Network/Limit hit (${msg.substring(0,30)}...). Fast-failing instantly.`);
                return localKeywordTriage(text); 
            }
        }
    }

    // All AI models exhausted — use smart local triage (NOT a dumb fallback)
    console.warn("⚠️ All AI models exhausted. Using local keyword triage.");
    return localKeywordTriage(text);
};

module.exports = { processComplaintWithAI };

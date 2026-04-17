const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

console.log("🚀 [HACKATHON DEMO MODE INITIALIZED] 🚀");

// 1. Start Node.js Backend Server
console.log("-> Starting Smart City Node.js Backend Engine...");
const serverProcess = spawn('node', ['index.js'], { 
    cwd: path.join(__dirname, 'server'), 
    stdio: 'inherit' 
});

// 2. Automagically find the correct IP Address
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '10.0.2.2';
}

const myIp = getLocalIp();
console.log(`\n======================================================`);
console.log(`📱 MAGIC DETECTED! Your backend IP is configured to ${myIp}`);
console.log(`======================================================\n`);

// 3. Inject it straight into the React Native Mobile App
const apiFilePath = path.join(__dirname, 'citizen-mobile', 'src', 'api.js');
let apiCode = fs.readFileSync(apiFilePath, 'utf8');
apiCode = apiCode.replace(/const API_URL = .*/, `const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://${myIp}:5000';`);
fs.writeFileSync(apiFilePath, apiCode, 'utf8');

// 4. Start the Mobile App
console.log("-> Launching Citizen Mobile App (Android/iOS via Expo)...");
console.log("-> Just scan the HUGE QR code below with the Expo Go app!\n");

const mobileProcess = spawn('npx.cmd', ['expo', 'start'], { 
    cwd: path.join(__dirname, 'citizen-mobile'), 
    stdio: 'inherit' 
});

// Handling shutdowns neatly
process.on('SIGINT', () => {
    console.log("Shutting down Hacker Demo...");
    serverProcess.kill('SIGINT');
    mobileProcess.kill('SIGINT');
    process.exit();
});

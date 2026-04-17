const os = require('os');
const fs = require('fs');
const { spawn } = require('child_process');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '10.0.2.2'; // Fallback to Android Emulator IP
}

const myIp = getLocalIp();
console.log(`\n================================`);
console.log(`🚀 Auto-Configuring App!`);
console.log(`📡 Detected Local Database IP: ${myIp}`);
console.log(`================================\n`);

// Write the IP to api.js directly
const apiFilePath = './src/api.js';
let apiCode = fs.readFileSync(apiFilePath, 'utf8');

// Replace the fallback or existing IP with the detected one
// Searching for const API_URL = ...
apiCode = apiCode.replace(/const API_URL = .*/, `const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://${myIp}:5000';`);

fs.writeFileSync(apiFilePath, apiCode, 'utf8');

console.log('✅ Configuration Saved! Starting Expo Android Dev Server...\n');
console.log('📱 IMPORTANT: Just scan the QR code with your phone using Expo Go.');

const expoStart = spawn('npx.cmd', ['expo', 'start'], { stdio: 'inherit' });

expoStart.on('close', (code) => {
    console.log(`Expo process exited with code ${code}`);
});

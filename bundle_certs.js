const fs = require('fs');
const cert = fs.readFileSync('certs/IEAT-CA-2026/cert.crt', 'utf8');
const intm = fs.readFileSync('certs/IEAT-CA-2026/Intemediate.crt', 'utf8');
const root = fs.readFileSync('certs/IEAT-CA-2026/root.crt', 'utf8');
fs.writeFileSync('certs/IEAT-CA-2026/fullchain.pem', cert + '\n' + intm + '\n' + root);
console.log('Successfully bundled fullchain.pem');

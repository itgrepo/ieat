const { JSDOM, VirtualConsole } = require('jsdom');
const virtualConsole = new VirtualConsole();
virtualConsole.on("log", (...args) => console.log(...args));
virtualConsole.on("jsdomError", (error) => console.error("JSDOM Error:", error));
virtualConsole.on("error", (...args) => console.error(...args));

const fs = require('fs');
const jsCode = fs.readFileSync('/Users/natthawutjantakul/git_ieat/sso-portal/dist/assets/index-W-MZ7qbv.js', 'utf8');

const dom = new JSDOM(`<!DOCTYPE html><body><div id="app"></div><script type="module">${jsCode}</script></body>`, {
  runScripts: "dangerously",
  virtualConsole
});

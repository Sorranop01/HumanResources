#!/usr/bin/env node
/**
 * Step 2: Disable Third-Party MCP Servers
 * Run this if Step 1 didn't fix the issue
 */
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.env.HOME, '.claude.json');

// Read config
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Third-party MCP servers to disable
const thirdPartyServers = ['firebase', 'gemini', 'puppeteer', 'knowledge-graph'];

console.log('🔧 Step 2: Disabling Third-Party MCP Servers\n');

// Create backup if not exists
const backupPath = path.join(__dirname, 'mcp-servers-backup.json');
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, JSON.stringify(config.mcpServers, null, 2), 'utf8');
  console.log(`✅ Backup saved to: ${backupPath}\n`);
}

// Disable third-party servers
let disabledCount = 0;
thirdPartyServers.forEach((name) => {
  if (config.mcpServers[name]) {
    delete config.mcpServers[name];
    console.log(`  ❌ Disabled: ${name}`);
    disabledCount++;
  }
});

console.log(`\n✅ Disabled ${disabledCount} third-party MCP servers`);
console.log('\n💡 Remaining servers:');
Object.keys(config.mcpServers).forEach((name) => {
  console.log(`  ✅ ${name}`);
});

// Write back
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

console.log('\n📝 Next steps:');
console.log('  1. Restart Claude Code');
console.log('  2. Test with /mcp');
console.log('  3. If it works → one of the third-party servers has invalid schema');
console.log('  4. To restore all: node mcp-restore.cjs');

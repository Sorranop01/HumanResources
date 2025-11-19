#!/usr/bin/env node
/**
 * Step 1: Disable Custom Built MCP Servers
 * This will help identify if one of your custom servers has invalid schema
 */
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.env.HOME, '.claude.json');

// Read config
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Custom built MCP servers to disable
const customServers = ['console-mcp', 'memory', 'code-summarizer', 'memory-cache'];

console.log('🔧 Step 1: Disabling Custom Built MCP Servers\n');

// Create backup
const backupPath = path.join(__dirname, 'mcp-servers-backup.json');
fs.writeFileSync(backupPath, JSON.stringify(config.mcpServers, null, 2), 'utf8');
console.log(`✅ Backup saved to: ${backupPath}\n`);

// Disable custom servers
let disabledCount = 0;
customServers.forEach((name) => {
  if (config.mcpServers[name]) {
    delete config.mcpServers[name];
    console.log(`  ❌ Disabled: ${name}`);
    disabledCount++;
  }
});

console.log(`\n✅ Disabled ${disabledCount} custom MCP servers`);
console.log('\n💡 Remaining servers:');
Object.keys(config.mcpServers).forEach((name) => {
  console.log(`  ✅ ${name}`);
});

// Write back
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

console.log('\n📝 Next steps:');
console.log('  1. Restart Claude Code');
console.log('  2. Test with /mcp');
console.log('  3. If it works → one of the custom servers has invalid schema');
console.log('  4. If still fails → run mcp-debug-2-disable-third-party.cjs');
console.log('  5. To restore all: node mcp-restore.cjs');

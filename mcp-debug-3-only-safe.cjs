#!/usr/bin/env node
/**
 * Step 3: Keep Only Known-Safe MCP Servers
 * This keeps only official @modelcontextprotocol servers
 */
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.env.HOME, '.claude.json');

// Read config
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Only keep these safe servers
const safeServers = ['sequential-thinking', 'filesystem'];

console.log('🔧 Step 3: Keeping Only Known-Safe MCP Servers\n');

// Create backup if not exists
const backupPath = path.join(__dirname, 'mcp-servers-backup.json');
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, JSON.stringify(config.mcpServers, null, 2), 'utf8');
  console.log(`✅ Backup saved to: ${backupPath}\n`);
}

// Store backup of current servers
const currentServers = { ...config.mcpServers };

// Remove all except safe servers
Object.keys(config.mcpServers).forEach((name) => {
  if (!safeServers.includes(name)) {
    delete config.mcpServers[name];
    console.log(`  ❌ Disabled: ${name}`);
  }
});

console.log('\n💡 Remaining servers:');
Object.keys(config.mcpServers).forEach((name) => {
  console.log(`  ✅ ${name}`);
});

// Write back
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

console.log('\n📝 Next steps:');
console.log('  1. Restart Claude Code');
console.log('  2. Test - should work with just these 2 servers');
console.log('  3. To restore all: node mcp-restore.cjs');
console.log('  4. Then add servers back one-by-one to find the problem');

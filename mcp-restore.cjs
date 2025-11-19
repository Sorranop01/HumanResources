#!/usr/bin/env node
/**
 * Restore All MCP Servers from Backup
 */
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.env.HOME, '.claude.json');
const backupPath = path.join(__dirname, 'mcp-servers-backup.json');

console.log('🔄 Restoring MCP Servers from Backup\n');

// Check if backup exists
if (!fs.existsSync(backupPath)) {
  console.log('❌ No backup file found!');
  console.log(`   Expected at: ${backupPath}`);
  process.exit(1);
}

// Read config and backup
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

// Restore servers
config.mcpServers = backup;

// Write back
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

console.log('✅ Restored all MCP servers:\n');
Object.keys(backup).forEach((name) => {
  console.log(`  ✅ ${name}`);
});

console.log('\n📝 Next steps:');
console.log('  1. Restart Claude Code');
console.log('  2. All 10 servers should be back');

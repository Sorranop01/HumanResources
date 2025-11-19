# MCP Server Setup Guide

## Current Status ✅

Your MCP configuration has been cleaned up. Currently enabled servers:
- ✅ **Gemini** - AI model integration (working)
- ✅ **Puppeteer** - Browser automation (working)

## Issues Fixed 🔧

The following servers were causing connection failures and have been temporarily disabled:

1. **Firebase MCP** - Missing dependency error
2. **Filesystem MCP** - Connection timeout (slow npx download)
3. **Knowledge-graph MCP** - Connection timeout (slow npx download)
4. **Sequential-thinking** - Connection timeout
5. **Local servers** - Not built or missing

All problematic configurations have been backed up to `.mcp.backup.json`

---

## How to Re-enable MCP Servers

### Option 1: Install MCP Servers Globally (Recommended)

This avoids timeout issues by pre-installing packages.

**Choose one method:**

#### Method A: Using npm (Easiest - works immediately)
```bash
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-memory
npm install -g @modelcontextprotocol/server-sequential-thinking
```

#### Method B: Using pnpm (Recommended, but requires setup)
```bash
# First time only: setup pnpm global bin directory
pnpm setup
# Then restart your terminal

# After setup, install packages
pnpm add -g @modelcontextprotocol/server-filesystem
pnpm add -g @modelcontextprotocol/server-memory
pnpm add -g @modelcontextprotocol/server-sequential-thinking
```

**Note:** For global packages, npm and pnpm work the same. Use whichever is easier for you.

Then update `.mcp.json` to use global commands:

```json
{
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "command": "mcp-server-filesystem",
      "args": ["/Users/sorranopkhanonvech/Desktop/HumanResources"],
      "env": {}
    },
    "knowledge-graph": {
      "type": "stdio",
      "command": "mcp-server-memory",
      "args": [],
      "env": {}
    }
  }
}
```

### Option 2: Fix Firebase MCP Server

The Firebase MCP has a broken dependency. Use your local firebase installation:

```json
{
  "mcpServers": {
    "firebase": {
      "type": "stdio",
      "command": "firebase",
      "args": ["mcp"],
      "env": {
        "FIRESTORE_PROJECT": "human-b4c2c",
        "FIRESTORE_DATABASE": "(default)",
        "FIRESTORE_EMULATOR_HOST": "localhost:8888",
        "FIREBASE_AUTH_EMULATOR_HOST": "localhost:9099",
        "FIREBASE_STORAGE_EMULATOR_HOST": "localhost:9199"
      }
    }
  }
}
```

### Option 3: Increase Timeout

If you still want to use `npx`, you can increase the MCP timeout:

```bash
export MCP_TIMEOUT=120000  # 2 minutes
```

Then restart Claude Code.

---

## Building Local MCP Servers

If you want to re-enable the local MCP servers, you need to build them first:

### Console MCP
```bash
cd console_mcp
pnpm install
pnpm run build
```

### Memory Server
```bash
cd memory-server
pnpm install
pnpm run build
```

### Code Summarizer
```bash
cd code-summarizer
pnpm install
pnpm run build
```

### Memory Cache
```bash
cd ib-mcp-cache-server
pnpm install
pnpm run build
```

---

## Testing MCP Servers

After making changes to `.mcp.json`, restart Claude Code and check:

```bash
# In Claude Code CLI
/mcp
```

You should see all servers with "connected" status.

---

## Quick Reference: Working Configuration

Minimal working config (current):

```json
{
  "mcpServers": {
    "gemini": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@el-el-san/gemini-mcp"],
      "env": {
        "GEMINI_API_KEY": "AIzaSyABkqJ4j9reJzwNPnQvgnDxIvlChsIdLL4"
      }
    },
    "puppeteer": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "env": {}
    }
  }
}
```

---

## Troubleshooting

### Server fails with "connection timeout"
- Pre-install the package globally (see Option 1)
- Or increase MCP_TIMEOUT environment variable

### Server fails with "Cannot find module"
- Check if the local server is built (`pnpm run build`)
- Verify the path in `.mcp.json` is correct

### Firebase MCP fails
- Use local `firebase` command instead of `npx firebase-tools`
- Make sure firebase-tools is installed: `npm install -g firebase-tools` or `pnpm add -g firebase-tools` (after pnpm setup)

---

## Files

- `.mcp.json` - Current (working) MCP configuration
- `.mcp.backup.json` - Backup of all servers with issue details
- `MCP-SETUP.md` - This guide

---

**Need help?** Check the MCP logs in:
```
~/Library/Caches/claude-cli-nodejs/-Users-sorranopkhanonvech-Desktop-HumanResources/mcp-logs-*/
```

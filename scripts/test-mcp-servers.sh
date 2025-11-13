#!/bin/bash
# MCP Servers Health Check Script
# Version: 1.0.0

echo "🔍 Testing MCP Servers Installation..."
echo "======================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_mcp() {
  local name=$1
  local package=$2

  echo -n "Testing $name... "
  if npx -y "$package" --version &> /dev/null || npx -y "$package" --help &> /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
    return 0
  else
    echo -e "${RED}✗ Failed${NC}"
    return 1
  fi
}

# Test local servers
test_local() {
  local name=$1
  local path=$2

  echo -n "Testing $name... "
  if [ -f "$path" ]; then
    echo -e "${GREEN}✓ OK${NC} (file exists)"
    return 0
  else
    echo -e "${RED}✗ Failed${NC} (file not found)"
    return 1
  fi
}

echo "📦 NPM-based MCP Servers:"
echo "-------------------------"
test_mcp "filesystem" "@modelcontextprotocol/server-filesystem"
test_mcp "github" "@modelcontextprotocol/server-github"
test_mcp "sequential-thinking" "@modelcontextprotocol/server-sequential-thinking"
test_mcp "puppeteer" "@modelcontextprotocol/server-puppeteer"
test_mcp "postgres" "@modelcontextprotocol/server-postgres"
test_mcp "firebase" "firebase-mcp-server"
test_mcp "gemini" "@modelcontextprotocol/server-gemini"
test_mcp "google-maps" "@modelcontextprotocol/server-google-maps"
test_mcp "sentry" "@sentry/mcp-server"
test_mcp "knowledge-graph" "@modelcontextprotocol/server-memory"
test_mcp "brave-search" "@modelcontextprotocol/server-brave-search"
test_mcp "slack" "@modelcontextprotocol/server-slack"

echo ""
echo "📁 Local MCP Servers:"
echo "--------------------"
test_local "console-mcp" "./console_mcp/build/index.js"
test_local "memory-server" "./memory-server/build/index.js"

echo ""
echo "🔧 Node.js Info:"
echo "---------------"
echo -n "Node version: "
node --version
echo -n "NPM version: "
npm --version

echo ""
echo "======================================="
echo "✅ MCP Health Check Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Copy .vscode/settings.template.json to .vscode/settings.json"
echo "2. Add your API keys and tokens"
echo "3. Reload VS Code (Cmd+Shift+P > Developer: Reload Window)"
echo "4. Test with Claude Code"
echo ""

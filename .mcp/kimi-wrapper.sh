#!/bin/bash
export KIMI_API_KEY="sk-y7tFbdd9Gr4rEMYu4E3zhW6PzEntfle8uX2yvGse2m7RJOzL"
export KIMI_API_BASE="https://api.moonshot.cn/v1"
exec node "$(dirname "$0")/kimi-mcp-server.js" "$@"

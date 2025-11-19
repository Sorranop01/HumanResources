# MCP Servers for Claude CLI

## Installed Servers

### 1. Gemini MCP
- **Provider:** Google AI
- **Model:** Gemini (various versions)
- **Location:** `.mcp/gemini-wrapper.sh`

### 2. Kimi K2-Thinking MCP ✨
- **Provider:** Moonshot AI
- **Model:** Kimi K2-Thinking (moonshot-v1 series)
- **Location:** `.mcp/kimi-wrapper.sh`, `.mcp/kimi-mcp-server.js`
- **API Key:** Configured in wrapper script

## Using Kimi K2-Thinking

Kimi K2-Thinking เป็น AI model จาก Moonshot AI ที่เชี่ยวชาญด้าน:
- 🧠 Deep reasoning และ complex problem-solving
- 📊 Structured analysis และ step-by-step thinking
- 🇹🇭 รองรับภาษาไทยได้ดีมาก
- 📚 Context window ขนาดใหญ่ (8k, 32k, 128k tokens)

### Available Tools

#### 1. `kimi_chat`
ใช้สำหรับการสนทนาและถามคำถามทั่วไป

```
Can you use kimi_chat to analyze this code pattern?
```

**Parameters:**
- `message` (required): ข้อความที่ต้องการส่งไปยัง Kimi
- `model` (optional): เลือก model (`moonshot-v1-8k`, `moonshot-v1-32k`, `moonshot-v1-128k`)
- `temperature` (optional): ความสร้างสรรค์ในการตอบ (0.0-1.0, default: 0.3)

#### 2. `kimi_analyze`
ใช้สำหรับการวิเคราะห์เชิงลึกและแก้ปัญหาที่ซับซ้อน

```
Use kimi_analyze to review the architecture of this system
```

**Parameters:**
- `task` (required): งานวิเคราะห์ที่ต้องการ
- `context` (optional): ข้อมูลเพิ่มเติมหรือบริบท

### Example Usage in Claude CLI

1. **วิเคราะห์ code pattern:**
```
Can you use kimi_analyze to examine the RBAC implementation in this codebase?
```

2. **แก้ปัญหา TypeScript errors:**
```
Use kimi_chat to help debug this TypeScript type error
```

3. **รีวิว architecture:**
```
Use kimi_analyze with context about our Firebase setup to review the data model
```

## How It Works

1. Claude CLI เชื่อมต่อกับ Kimi MCP server
2. คุณสามารถขอให้ Claude ใช้ Kimi เป็น "second opinion" หรือ "specialized tool"
3. Kimi จะทำงานควบคู่กับ Claude ในการวิเคราะห์และตอบคำถาม

## Configuration Files

```
.mcp/
├── kimi-wrapper.sh          # Wrapper script with API key
├── kimi-mcp-server.js       # MCP server implementation
├── package.json             # Dependencies
├── node_modules/            # @modelcontextprotocol/sdk
└── README.md                # This file
```

## API Key Security

⚠️ **IMPORTANT:** API key ถูกเก็บไว้ใน `kimi-wrapper.sh`
- ไฟล์นี้ควรถูก gitignore แล้ว
- ห้ามแชร์หรือ commit API key ลง git repository
- ถ้าต้องการเปลี่ยน API key ให้แก้ไขใน `kimi-wrapper.sh`

## Restart Claude CLI

หลังจากติดตั้งเสร็จ ให้รีสตาร์ท Claude CLI:

```bash
# Exit current session
exit

# Start new session
claude-cli
```

จากนั้นตรวจสอบว่า Kimi MCP เชื่อมต่อสำเร็จ:

```bash
/mcp
```

คุณควรเห็น `kimi` server ในรายการพร้อมสถานะ "connected"

## Troubleshooting

### Server ไม่เชื่อมต่อ
```bash
# ตรวจสอบ MCP logs
ls -la ~/Library/Caches/claude-cli-nodejs/*/mcp-logs-*/

# ทดสอบ server โดยตรง
cd .mcp
node kimi-mcp-server.js
```

### API Key ไม่ถูกต้อง
- ตรวจสอบ API key ใน `kimi-wrapper.sh`
- ตรวจสอบว่า API key ยังใช้งานได้

### Dependencies หาย
```bash
cd .mcp
pnpm install
```

## Documentation

- [Kimi API Docs](https://platform.moonshot.cn/docs)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Claude CLI](https://claude.com/claude-code)

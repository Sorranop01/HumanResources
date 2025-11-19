#!/usr/bin/env node

// Small helper to clean your local Claude Code Router config (~/.claude-code-router/config.json)
// - ลบ provider ชื่อ "gemini"
// - ถ้า APIKEY เดิมเท่ากับ gemini.api_key ให้ลบ (ตั้งเป็นค่าว่าง) เพื่อให้ Router ไม่ต้องใช้ API key
// - เปลี่ยน Router.* ที่อ้างถึง "gemini,..." ให้ไปใช้ Kimi แทน

const fs = require('fs');
const path = require('path');

const home = process.env.HOME || process.env.USERPROFILE;
if (!home) {
  console.error('ไม่พบ HOME environment variable');
  process.exit(1);
}

const configPath = path.join(home, '.claude-code-router', 'config.json');

if (!fs.existsSync(configPath)) {
  console.error(`ไม่พบไฟล์ config: ${configPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(configPath, 'utf8');
let config;
try {
  config = JSON.parse(raw);
} catch (e) {
  console.error('อ่าน config.json ไม่ได้ (JSON ไม่ถูกต้อง)');
  console.error(e.message);
  process.exit(1);
}

const providers = config.Providers || config.providers || [];
const gemini = providers.find((p) => p.name === 'gemini');

if (!gemini) {
  console.log('✅ ไม่มี provider ชื่อ "gemini" อยู่แล้ว ไม่ต้องแก้');
  process.exit(0);
}

// สำรองไฟล์ก่อน
const backupPath = `${configPath}.${new Date().toISOString().replace(/[:.]/g, '-')}.bak`;
fs.copyFileSync(configPath, backupPath);
console.log(`📦 สำรองไฟล์เดิมไว้ที่: ${backupPath}`);

// ลบ gemini provider ออก
config.Providers = providers.filter((p) => p.name !== 'gemini');

// ถ้า APIKEY เดิมเท่ากับ gemini.api_key ให้ลบ (ตั้งเป็นค่าว่าง)
if (config.APIKEY && gemini.api_key && config.APIKEY === gemini.api_key) {
  config.APIKEY = '';
  console.log('🔑 ลบ APIKEY เดิมที่เป็น Gemini key ออกแล้ว (ตอนนี้ Router ไม่ต้องใช้ API key)');
}

// ปรับ Router mapping ให้ใช้ Kimi อย่างเดียว
config.Router = config.Router || {};
const kimiDefault = 'kimi,moonshot-v1-32k';
const kimiLight = 'kimi,moonshot-v1-8k';
const kimiHeavy = 'kimi,moonshot-v1-128k';

const keys = ['default', 'background', 'think', 'longContext', 'webSearch', 'image'];
for (const key of keys) {
  const val = config.Router[key];
  if (typeof val === 'string' && val.startsWith('gemini,')) {
    if (['background', 'webSearch'].includes(key)) {
      config.Router[key] = kimiLight;
    } else if (['think', 'longContext'].includes(key)) {
      config.Router[key] = kimiHeavy;
    } else {
      config.Router[key] = kimiDefault;
    }
  }
}

if (!config.Router.kimiReasoning) {
  config.Router.kimiReasoning = kimiHeavy;
}

fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
console.log(`✅ เขียน config ใหม่แล้ว: ${configPath}`);
console.log('🎯 ตอนนี้ router จะไม่ใช้ Gemini แล้ว เหลือแค่ Kimi (และ provider อื่นที่คุณตั้งเอง)');

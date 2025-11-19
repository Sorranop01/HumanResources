#!/usr/bin/env node

/**
 * Kimi K2-Thinking MCP Server
 * Provides integration with Moonshot AI's Kimi K2-Thinking model
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_API_BASE = process.env.KIMI_API_BASE || 'https://api.moonshot.cn/v1';

if (!KIMI_API_KEY) {
  console.error('Error: KIMI_API_KEY environment variable is required');
  process.exit(1);
}

class KimiMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'kimi-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'kimi_chat',
          description: 'Chat with Kimi K2-Thinking model. Use this for complex reasoning, analysis, and Thai language tasks. Kimi excels at deep thinking and structured problem-solving.',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'The message to send to Kimi K2-Thinking model',
              },
              model: {
                type: 'string',
                description: 'The Kimi model to use (default: moonshot-v1-128k)',
                enum: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
              },
              temperature: {
                type: 'number',
                description: 'Temperature for response generation (0.0-1.0, default: 0.3)',
                minimum: 0,
                maximum: 1,
              },
            },
            required: ['message'],
          },
        },
        {
          name: 'kimi_analyze',
          description: 'Use Kimi K2-Thinking for deep analysis and reasoning. Best for complex problems requiring step-by-step thinking.',
          inputSchema: {
            type: 'object',
            properties: {
              task: {
                type: 'string',
                description: 'The analysis task or problem to solve',
              },
              context: {
                type: 'string',
                description: 'Additional context or background information',
              },
            },
            required: ['task'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === 'kimi_chat') {
          return await this.handleKimiChat(args);
        } else if (name === 'kimi_analyze') {
          return await this.handleKimiAnalyze(args);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async callKimiAPI(messages, model = 'moonshot-v1-128k', temperature = 0.3) {
    const response = await fetch(`${KIMI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Kimi API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from Kimi';
  }

  async handleKimiChat(args) {
    const { message, model = 'moonshot-v1-128k', temperature = 0.3 } = args;

    const messages = [
      {
        role: 'system',
        content: 'You are Kimi K2-Thinking, an AI assistant developed by Moonshot AI. You excel at deep reasoning, analysis, and problem-solving. Provide thoughtful, well-structured responses.',
      },
      {
        role: 'user',
        content: message,
      },
    ];

    const result = await this.callKimiAPI(messages, model, temperature);

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  async handleKimiAnalyze(args) {
    const { task, context } = args;

    const systemPrompt = `You are Kimi K2-Thinking, an advanced AI model specialized in deep analysis and structured reasoning.

When analyzing problems:
1. Break down the problem into components
2. Consider multiple perspectives
3. Think step-by-step
4. Provide clear reasoning
5. Offer actionable insights

Provide thorough, well-structured analysis.`;

    const userPrompt = context
      ? `Context: ${context}\n\nTask: ${task}`
      : task;

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    const result = await this.callKimiAPI(messages, 'moonshot-v1-128k', 0.3);

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Kimi MCP server running on stdio');
  }
}

const server = new KimiMCPServer();
server.run().catch(console.error);

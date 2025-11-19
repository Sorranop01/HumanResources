# MCP Servers Usage Guide for Claude CLI

This document explains how to use the configured MCP (Model Context Protocol) servers in the **Human Resources** project when working with **Claude CLI**.  
Each MCP server has a clear purpose and specific usage scenarios.

---

## Overview

The Human Resources project uses **10 MCP servers** to enhance development productivity and data management.  
Each server is specialized for a different type of task:

1. `filesystem` – Project files and folders
2. `knowledge-graph` – Knowledge graph and relationships
3. `sequential-thinking` – Step-by-step deep reasoning
4. `console-mcp` – Logging and debugging via a custom console
5. `memory` – Long-term project memory and context
6. `code-summarizer` – Code/document summarization with Gemini
7. `memory-cache` – Caching frequently used data
8. `firebase` – Access to Firebase services and emulators
9. `gemini` – Direct access to Gemini AI
10. `puppeteer` – Web scraping & browser automation

---

## 1. `filesystem` (mcp-server-filesystem)

**Purpose:**  
Manage files and folders inside the project repository.

**Use when you need to:**

- Read, write, modify, or delete files in the project
- Explore the folder structure
- Create new files or directories
- Search for files within the project

**Example prompts:**

- "Read the `package.json` file."
- "Create a `src/components` folder."
- "Show the full folder structure."
- "Edit the `README.md` file."

**Root path:**  
`/Users/sorranopkhanonvech/Desktop/HumanResources`

---

## 2. `knowledge-graph` (mcp-server-memory)

**Purpose:**  
Store and manage knowledge as a **knowledge graph** (entities and relations).

**Use when you need to:**

- Record relationships between different pieces of information (entities and relations)
- Build and maintain a knowledge graph about the project
- Track connections between features, modules, and components
- Query complex, relationship-based knowledge

**Example prompts:**

- "Record that `UserComponent` uses Firebase Auth."
- "Show all relationships related to Authentication."
- "Create a new entity for `PayrollModule`."

---

## 3. `sequential-thinking` (mcp-server-sequential-thinking)

**Purpose:**  
Perform **step-by-step reasoning** for complex problems.

**Use when you need to:**

- Solve complex problems that require multi-step analysis
- Plan system architecture
- Design code structure before implementation
- Debug issues that require careful, structured thinking

**Example prompts:**

- "Analyze how to refactor the database structure."
- "Plan how to split the monorepo into microservices."
- "Analyze performance issues in this query."

---

## 4. `console-mcp` (Custom Console Logger)

**Purpose:**  
Log and debug via a custom console, including decision traces.

**Use when you need to:**

- Log Claude's actions and operations
- Debug and trace system behavior
- Keep a history of changes and decisions during development

**Example usage:**

- Automatically log steps during problem solving
- Track the steps taken to fix a bug
- Record refactoring history

**Log directory:**  
`/Users/sorranopkhanonvech/Desktop/HumanResources/logs`

---

## 5. `memory` (Custom Memory Server)

**Purpose:**  
Store **context and long-term memory** across sessions.

**Use when you need to:**

- Remember information across multiple sessions
- Store project preferences and settings
- Record important decisions and their reasoning
- Keep best practices discovered during development

**Example prompts:**

- "Remember that we use TypeScript strict mode."
- "Store the project's naming conventions."
- "Save the common API endpoint patterns."

---

## 6. `code-summarizer` (Custom Code Summarizer + Gemini)

**Purpose:**  
Summarize code and documentation using **Gemini AI**.

**Use when you need to:**

- Summarize long and complex code files
- Auto-generate documentation from code
- Analyze large codebases or modules
- Create high-level overviews of different modules

**Example prompts:**

- "Summarize the code in the `src/services` folder."
- "Generate documentation for `AuthService`."
- "Analyze the structure of the Firebase Functions code."

**Notes:**

- Uses **Google Gemini API** internally for analysis.

---

## 7. `memory-cache` (IB MCP Cache Server)

**Purpose:**  
Cache frequently used data to **reduce token usage** and repeated work.

**Use when you need to:**

- Frequently read the same documents or files
- Store database schemas that are referenced often
- Cache configuration data that rarely changes
- Avoid re-reading the same large files repeatedly

**Example usage:**

- Cache `package.json`, `tsconfig.json`, or other key config files
- Cache Firebase schemas
- Cache API documentation that is referenced frequently

> 💡 **Best Practice:**  
> Use `memory-cache` together with `filesystem` to reduce token costs and repeated I/O.

---

## 8. `firebase` (Firebase MCP Server)

**Purpose:**  
Connect to and manage **Firebase services** (via emulators in this setup).

**Use when you need to:**

- Manage Firestore data (CRUD operations)
- Work with Firebase Authentication
- Manage files in Firebase Storage
- Test against Firebase Emulators instead of production

**Example prompts:**

- "Read data from the `users` collection."
- "Create a new document in Firestore."
- "Check authenticated users in the emulator."
- "Upload a file to Firebase Storage."

**Configuration:**

- **Project:** `human-b4c2c`
- **Database:** `(default)`

**Emulators:**

- Firestore: `localhost:8888`
- Auth: `localhost:9099`
- Storage: `localhost:9199`

---

## 9. `gemini` (@el-el-san/gemini-mcp)

**Purpose:**  
Access **Gemini AI** directly via MCP.

**Use when you need to:**

- Get additional AI analysis from Gemini
- Use Gemini-specific capabilities (e.g., multimodal, some vision tasks)
- Compare outputs from multiple AI systems
- Use Gemini where it may be more suitable than Claude

**Example usage:**

- Analyze diagrams or mockups (when supported)
- Process multimodal inputs
- Leverage Gemini-specific strengths for some tasks

---

## 10. `puppeteer` (@modelcontextprotocol/server-puppeteer)

**Purpose:**  
Web scraping and **browser automation** using Puppeteer.

**Use when you need to:**

- Frequently fetch content from external documentation websites
- Automatically test web applications
- Capture screenshots of websites or UI components
- Extract data from external web pages

**Example prompts:**

- "Fetch Firebase documentation from firebase.google.com."
- "Test the login flow on the web application."
- "Capture a screenshot of the UI components for review."
- "Extract the API reference from this documentation page."

> 💡 **Best Practices:**
>
> - Use `puppeteer` together with `memory-cache` to cache fetched documentation.
> - Cache frequently used docs to reduce token usage and repeated scraping.

---

## Token Usage Optimization Strategies

### 1. Cache Documentation (Puppeteer + Memory-Cache)

1. Use `puppeteer` to fetch documentation the first time.
2. Store the processed content in `memory-cache` for reuse.
3. Avoid re-fetching and re-parsing the same docs repeatedly.

### 2. Summarize Code, Then Cache (Code-Summarizer + Memory-Cache)

1. Use `code-summarizer` to summarize large or complex files.
2. Store the summary in `memory-cache`.
3. Refer to the cached summary instead of reading the full file each time.

### 3. Knowledge Graph for Relationships (Knowledge-Graph)

1. Use `knowledge-graph` to store project structure and dependencies.
2. Reduce the need to re-explore files for relationship questions.
3. Query relationships directly instead of scanning multiple files.

### 4. Memory for Long-Term Context (Memory)

1. Use `memory` to store decisions, patterns, and conventions.
2. Avoid repeating the same explanations across sessions.
3. Gradually build up a project-specific knowledge base.

---

## Recommended Workflows by Task Type

### A. Developing a New Feature

- **`sequential-thinking`** – Plan architecture and design steps.
- **`knowledge-graph`** – Check existing dependencies and relations.
- **`filesystem`** – Create files and implement code.
- **`firebase`** – Test behavior against Firebase emulators.
- **`memory`** – Store important design decisions and conventions.

---

### B. Refactoring Code

- **`code-summarizer`** – Analyze the current code structure.
- **`sequential-thinking`** – Plan refactoring steps.
- **`filesystem`** – Apply changes to the codebase.
- **`memory-cache`** – Cache summaries and key structures for reuse.

---

### C. Debugging Issues

- **`console-mcp`** – Inspect logs and debug information.
- **`sequential-thinking`** – Reason through the problem step by step.
- **`firebase`** – Check actual data in Firestore/Auth/Storage.
- **`filesystem`** – Fix bugs in the relevant files.

---

### D. Studying Documentation

- **`puppeteer`** – Fetch documentation from websites.
- **`memory-cache`** – Cache documentation for repeated use.
- **`gemini`** – Perform advanced analysis if needed.
- **`memory`** – Store key learnings and rules for future sessions.

---

## Important Recommendations

⚠️ **Don’t forget:**

- Use **`memory-cache`** for data that is reused frequently.
- Use **`puppeteer` + `memory-cache`** for documentation pages.
- Use **`code-summarizer`** before repeatedly reading large files.
- Store long-term context and decisions in **`memory`**.

✅ **Best Practices:**

- Plan with **`sequential-thinking`** before major changes.
- Use **`knowledge-graph`** to store project structure and dependencies.
- Log important actions and decisions with **`console-mcp`**.
- Test with **Firebase emulators** via **`firebase`** before touching production.

---

## Quick Reference Table

| MCP Server            | Primary Use Case                    | Helps Reduce Tokens? |
| --------------------- | ----------------------------------- | -------------------- |
| `filesystem`          | Manage project files and folders    | No                   |
| `knowledge-graph`     | Store relationships / project graph | ✅ Yes (structure)   |
| `sequential-thinking` | Complex, multi-step reasoning       | No                   |
| `console-mcp`         | Logging and debugging               | No                   |
| `memory`              | Long-term context and decisions     | ✅ Yes               |
| `code-summarizer`     | Summarize large code & docs         | ✅ Yes               |
| `memory-cache`        | Cache frequently used data          | ✅✅✅ High impact   |
| `firebase`            | Manage Firebase (via emulators)     | No                   |
| `gemini`              | Extra AI via Gemini                 | No (but powerful)    |
| `puppeteer`           | Fetch web docs & UI automation      | ✅✅ With cache      |

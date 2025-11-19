# Claude Workflow Optimization Strategy

This document outlines an optimized workflow for Claude to resolve issues, specifically TypeScript errors, in a more token-efficient manner.

## Previous Method (Inefficient)

1.  **Fix a single error.**
2.  **Run `pnpm typecheck` on the entire project.**
3.  Receive a long list of all remaining errors.
4.  Analyze the list to find the next error to address.
5.  Repeat.

This process was inefficient, consuming a large number of tokens for each small fix due to the repetitive, full-project analysis.

## Optimized Workflow (Current Method)

To significantly reduce token consumption and improve speed, the following workflow has been adopted:

1.  **Baseline Analysis:** Run a full `pnpm typecheck` once to get a comprehensive list of all initial TypeScript errors.
2.  **Batch Fixing:** Analyze the list and group related errors (e.g., all errors within the same file or of a similar type).
3.  **Targeted Validation:** After applying a fix to a specific file, use the `mcp__ide__getDiagnostics` tool with the file's URI. This tool leverages the IDE's real-time language server to instantly confirm if the specific error in that file is resolved, without needing to scan the entire project.
4.  **Periodic Verification:** After resolving a significant batch of errors, run the full `pnpm typecheck` command again to ensure no new issues (regressions) have been introduced in other parts of the codebase.
5.  **Repeat:** Continue this cycle of targeted fixes and periodic full checks until all errors are resolved.

This approach ensures that token-heavy commands are used sparingly, while providing immediate feedback on individual fixes, leading to a faster and more cost-effective development cycle.

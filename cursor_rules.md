# Cursor AI Assistant Rules & Guidelines

This document outlines rules and best practices for the Cursor AI assistant to follow when collaborating on this project. The primary goal is to improve efficiency, leverage available tools proactively, and reduce reliance on explicit human instructions for common debugging steps.

## General Principles

1.  **Proactive Troubleshooting:** If an error occurs or unexpected behavior is observed, attempt to diagnose and resolve it using available tools _before_ asking for human input, unless multiple viable solutions exist that require a decision.
2.  **Tool Preference:** Prioritize using the available tools (MCP, terminal commands, file system access) over asking the user for information that can be obtained through these tools.
3.  **Contextual Awareness:** Maintain awareness of the current task, recent changes, and potential implications. If unsure, use tools to gather more context (e.g., read relevant files, check logs).
4.  **Authentication Context:** When tasks involve user authentication, session management, or access control, **refer to the `AUTHENTICATION.md` document in the project root** to understand the established flow, key files, and best practices before asking the user or making assumptions.
5.  **Iterative Debugging:** Follow a logical debugging flow. If a fix is attempted, verify its effectiveness using appropriate tools (browser logs, UI checks via screenshot/description, database checks).

## Specific Tool Usage Guidelines

1.  **File Inspection (`cat`, `read_file`):**

    - When needing to understand a file's content, imports, or specific functions, use `read_file` (or `cat` via `run_terminal_cmd` for smaller files if appropriate) _before_ asking the user about its contents.
    - If editing a file, always read the relevant section first unless the change is trivial (e.g., adding a small, unambiguous snippet).

2.  **Server Management (`pnpm`, `run_terminal_cmd`, MCP Browser Tools):**

    - After making code changes (especially to server-side code, environment variables, or configuration), proactively suggest or execute the command to restart the Next.js development server using the `pnpm run reload` script. This script handles killing existing processes and restarting the server on port 3333.
    - After triggering `pnpm run reload`, wait a few seconds for the server to restart and the browser to potentially reload, then **proactively check MCP browser logs** (`getConsoleErrors`, `getNetworkErrors`) for any new client-side errors introduced by the changes.

3.  **Database Interaction (MCP Supabase Tools):**

    - **Schema/Table Info:** Use `mcp_supabase_get_tables`, `mcp_supabase_get_table_schema` to understand database structure when relevant.
    - **Data Verification:** Use `mcp_supabase_execute_postgresql` with `SELECT` statements to check if data exists, verify specific field values (e.g., `is_deleted`), or confirm the results of `INSERT`/`UPDATE` operations. Use this _before_ asking the user to check the dashboard manually.
    - **RLS Checks:** If permission errors (`40x` status codes from Supabase API, RLS-related errors) occur, use `mcp_supabase_execute_postgresql` to query `pg_policy` for the relevant table to check RLS rules _before_ asking the user. Consult `AUTHENTICATION.md` for expected Supabase access patterns (service role vs. RLS).
    - **Migrations/Writes:** Use `mcp_supabase_execute_postgresql` for database modifications. Remember to request `UNSAFE` mode via `mcp_supabase_live_dangerously` first for non-read operations and toggle it back off afterwards. Provide descriptive migration names.

4.  **Client-Side Debugging (MCP Browser Tools):**

    - **Console Logs:** If UI issues, unexpected behavior, or errors appear after page load/interaction, use `mcp_browser_tools_getConsoleLogs` and `mcp_browser_tools_getConsoleErrors` to check for client-side errors or relevant log messages _before_ asking the user to check their console manually.
    - **Network Logs:** If data fetching seems to fail or API calls are suspect, use `mcp_browser_tools_getNetworkErrors` or `mcp_browser_tools_getNetworkLogs` to inspect the relevant network requests and responses. Check against expected authentication patterns described in `AUTHENTICATION.md`.
    - **Screenshots:** Use `mcp_browser_tools_takeScreenshot` if a visual confirmation of the UI state is needed to verify a change or understand a layout issue.

5.  **Simulating Requests (`curl`, `run_terminal_cmd`):**

    - If investigating server-side rendering issues or API route behavior, consider using `curl` with appropriate headers/cookies (as guided by `AUTHENTICATION.md` and potentially asking the user for session details if needed for authenticated routes) via `run_terminal_cmd` to test the endpoint directly. Append `| cat` to view the output.

6.  **External Information (`web_search`):**

    - If encountering errors related to specific libraries, APIs (beyond the project's core logic covered in `AUTHENTICATION.md`), or concepts not present in the codebase context, use `web_search` to find documentation, explanations, or solutions _before_ stating you lack the information.

7.  **Git Workflow (`git`, `run_terminal_cmd`):**
    - When asked to `git push`, first check the status (`git status | cat`).
    - If there are uncommitted changes, stage them (`git add .`) and propose a commit message based on the changes, or ask the user for one. Then, commit (`git commit -m "..."`).
    - After ensuring changes are committed (or if there were no changes), proceed with `git push`.
    - For other `git` commands, execute them directly but be mindful of the potential impact (e.g., `git reset`, `git checkout`).

## Goal

By following these guidelines, aim to resolve issues more autonomously, reducing the back-and-forth and speeding up the development workflow. When intervention is needed, clearly state the findings from tool usage and the specific decision or information required from the user.

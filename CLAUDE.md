# Scriptora — Agent Principles

Scriptora generates LinkedIn infographic content automatically using AI.

## Rules
- Always read `directives/` before executing any generation workflow
- Use `execution/` Python scripts for all API calls — never call APIs directly
- Save all generated content to `backend/data/content.json`
- Read topics from `backend/data/topics.json`
- If something fails, log the error and note the learning in the relevant directive
- Never modify topic data without user confirmation
- Always output JSON from execution scripts (stdout = data, stderr = logs)

## Quick Commands
- `/generate` — Generate content for all active topics
- Topics are managed via the React frontend at http://localhost:5173

## Architecture
- `directives/` — Markdown SOPs defining workflows
- `execution/` — Python scripts calling external APIs (OpenAI, Nano Banana, Postiz)
- `backend/` — Express server with cron + JSON storage
- `frontend/` — React UI for topic management + content review

# Elias Arellano Campos Portfolio

Personal portfolio site for Elias Arellano Campos, focused on AI engineering, deep learning, GenAI, and production-facing ML work.

This repo contains:
- A static portfolio site built with plain HTML/CSS
- A Vercel serverless function for the live portfolio agent
- Project visuals, screenshots, and resume assets
- Deployment notes for running the agent with a server-side API key

## Overview

The site highlights five core projects:
- EEG Seizure Detection
- Fraud Detection System
- Amazon Review Opinion Search Engine
- F1 Driver Recognition
- RAG Document Q&A Agent

It also includes a live chat experience in the "Ask the agent" section. The chat UI sends messages to `/api/chat`, and the serverless function forwards those messages to a supported LLM provider. In the current setup, Vercel is connected to Groq through environment variables.

## Tech Stack

- Frontend: HTML, CSS, vanilla JavaScript
- Hosting: Vercel
- Backend endpoint: Vercel Serverless Function
- LLM providers supported: Groq, Google Gemini, Anthropic
- Current live setup: Groq API via `GROQ_API_KEY`

## Live Agent Architecture

Current request flow:

`Browser -> /api/chat -> Vercel serverless function -> Groq API`

Important details:
- The API key is not exposed to the browser
- Provider selection happens in `api/chat.js`
- The frontend only calls `/api/chat`
- A 4-message limit is enforced in the UI and re-checked server-side

## Project Structure

```text
.
├── api/
│   └── chat.js
├── assets/
│   ├── Elias_Arellano_Campos_Resume.pdf
│   ├── eeg-seizure-trace.png
│   ├── f1-recognition-demo.png
│   └── rag-tennis-demo.png
├── screenshots/
├── uploads/
├── index.html
├── styles.css
├── visuals.css
├── DEPLOY.md
└── .env.example
```

## Key Files

- `index.html`
  Main portfolio page, layout, content, and frontend chat behavior.

- `styles.css`
  Core site styling and layout rules.

- `visuals.css`
  Additional visual styling for project diagrams and presentation components.

- `api/chat.js`
  Serverless endpoint that selects a provider and sends chat requests to the configured LLM API.

- `DEPLOY.md`
  Deployment instructions for Vercel.

- `.env.example`
  Example environment variable names for local reference and setup documentation.

## Environment Variables

The serverless function supports these variables:

### Recommended

- `GROQ_API_KEY`
- `AGENT_PROVIDER=groq`
- `GROQ_MODEL=llama-3.3-70b-versatile`

### Optional alternatives

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `ANTHROPIC_API_KEY`

See `.env.example` for the expected names.

## Deployment

This repo is intended to deploy on Vercel.

Basic flow:
1. Push the repo to GitHub
2. Import the repo into Vercel
3. Add the environment variable `GROQ_API_KEY`
4. Optionally set `AGENT_PROVIDER=groq`
5. Redeploy

Detailed instructions are in `DEPLOY.md`.

## Notes About the Agent

The current portfolio agent is prompt-grounded from a curated knowledge base in `api/chat.js`. It is not a full file-ingestion RAG pipeline inside this repo. That is intentional for a lightweight portfolio deployment:

- simpler deployment
- lower operational cost
- safer server-side API key handling
- predictable answers about Elias's projects and background

## Local Editing

If you are updating the portfolio:
- edit `index.html` for content and frontend behavior
- edit `styles.css` or `visuals.css` for presentation changes
- edit `api/chat.js` for agent prompt, provider logic, limits, or response shaping

If you change the chat limit, keep these values aligned:
- `MAX_MSGS` in `index.html`
- `MAX_USER_TURNS` in `api/chat.js`

## Security

- Do not commit real API keys
- Keep provider keys only in Vercel environment variables
- Use `.env.example` only as a template

## Status

Repository state is clean from a deployment standpoint:
- GitHub is connected
- Vercel deployment is active
- Groq-backed live agent is working
- Environment variable documentation has been added

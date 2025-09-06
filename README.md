# Soweto GOD MODE Autonomous AI Agent

## Overview

**Soweto** is an autonomous developer AI agent operating in GOD MODE. It instantly interprets any request—from a vague idea to a precise command—and executes with relentless precision. Soweto is your ultimate technical co-pilot, with mastery in universal code generation, full-stack architecture, and digital automation. 

Soweto now supports multiple AI providers:
- **OpenAI (GPT-4o, GPT-4, GPT-3.5, etc.)**
- **Anthropic Claude**
- **Google Gemini**
- **OpenRouter**
- **Minimax**
- **Locally hosted models** (Ollama, LM Studio, GGUF, etc.)

## Features

- Responsive chat UI for natural conversation
- Autonomous agent actions & proactive suggestions
- Universal code generation, debugging, refactoring
- Full-stack app scaffolding (frontend, backend, database)
- Digital automation (browser, API, pipelines, CI/CD)
- Proactive optimization and self-starting conversations
- Flexible choice of AI provider via simple configuration

## Quickstart

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/soweto-godmode-agent.git
cd soweto-godmode-agent
npm install # Installs dependencies for both client and server workspaces
```

### 2. Backend Setup

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Create a `.env` file by copying the example:
    ```bash
    cp .env.example .env
    ```
3.  Open the `.env` file and add your API keys for the desired AI providers (Jules, OpenAI). If you are using Ollama, ensure the `OLLAMA_API_URL` is correct.

### 3. Running the Backend

To start the backend server, run the following command from the `server` directory:

```bash
npm start
```

The server will start on port 3001 by default.

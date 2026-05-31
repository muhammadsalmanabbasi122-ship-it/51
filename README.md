<div align="center">
  <br/>
  <img src="https://raw.githubusercontent.com/zaindispatcher14-arch/HTML-Creator-App/main/artifacts/mobile/assets/images/icon.png" alt="HTML Creator Logo" width="90" height="90" style="border-radius: 20px"/>
  <h1>✨ HTML Creator</h1>
  <p><strong>AI-Powered HTML Website Generator — Describe it. Get it. Copy it.</strong></p>
  <br/>

  <p>
    <img src="https://img.shields.io/badge/react_native-0.81-61DAFB?logo=react&logoColor=white" alt="React Native"/>
    <img src="https://img.shields.io/badge/expo-54-000020?logo=expo&logoColor=white" alt="Expo"/>
    <img src="https://img.shields.io/badge/express-5-000000?logo=express&logoColor=white" alt="Express"/>
    <img src="https://img.shields.io/badge/typescript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License"/>
  </p>

  <br/>
  <img src="https://raw.githubusercontent.com/zaindispatcher14-arch/HTML-Creator-App/main/.github/screenshots/banner.png" alt="App Preview" width="100%" style="border-radius: 16px"/>
  <br/><br/>
</div>

---

## 📱 Overview

HTML Creator is a **mobile-first application** that lets you generate complete, production-ready HTML pages using AI. Just describe what you want — a bakery landing page, a developer portfolio, an e-commerce shop — and get beautiful, responsive HTML code instantly.

Built with **React Native (Expo)** and powered by **OpenRouter AI (Kimi K2)**, with an **Express 5** backend.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI HTML Generation** | Describe any website and get polished HTML with inline CSS via OpenRouter AI |
| ⚡ **Real-time Typing Effect** | Watch the code being typed out character by character |
| 💬 **Community Chat** | Real-time messaging with online presence indicators |
| 📋 **Copy & Export** | One-tap copy generated HTML to clipboard |
| 📚 **Chat History** | All your AI conversations are saved and replayable |
| 🎨 **Beautiful UI** | Dark/light theme with smooth animations |
| 🌐 **Live Preview** | Community gallery of generated HTML pages |
| 📱 **Cross-Platform** | iOS, Android, and Web |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) ≥ 9
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- An [OpenRouter API key](https://openrouter.ai/)

### Installation

```bash
# Clone the repo
git clone https://github.com/zaindispatcher14-arch/HTML-Creator-App.git
cd HTML-Creator-App

# Install dependencies
pnpm install

# Set up environment variables
export OPENROUTER_API_KEY="your_key_here"
export EXPO_PUBLIC_DOMAIN="localhost:3000"
```

### Run the API Server

```bash
pnpm --filter @workspace/api-server run dev
```

### Run the Mobile App

```bash
pnpm --filter @workspace/mobile run dev
```

---

## 🏗️ Project Structure

```
HTML-Creator-App/
├── artifacts/
│   ├── api-server/          # Express 5 backend
│   │   └── src/routes/
│   │       ├── ai.ts        # AI generation (OpenRouter + fallback)
│   │       ├── chat.ts      # Community chat API
│   │       └── health.ts    # Health check
│   ├── mobile/              # React Native (Expo) app
│   │   ├── app/(tabs)/
│   │   │   ├── ai.tsx       # AI Generator screen
│   │   │   ├── community.tsx# Community chat screen
│   │   │   ├── index.tsx    # Home dashboard
│   │   │   ├── profile.tsx  # Profile & settings
│   │   │   └── help.tsx     # Help & Support
│   │   ├── lib/             # Shared utilities
│   │   │   └── chatHistory.ts  # Chat persistence
│   │   └── contexts/        # React contexts
│   └── mockup-sandbox/      # Component preview
├── lib/                     # Shared libraries
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-spec/            # OpenAPI specification
│   ├── api-zod/             # Zod validation schemas
│   └── db/                  # Database layer (Drizzle)
├── package.json
└── pnpm-workspace.yaml
```

---

## 🧠 How It Works

1. **You describe** a website you want (e.g., "A landing page for a bakery")
2. **The app sends** your prompt to the Express API server
3. **The server calls** OpenRouter AI (Kimi K2) with a system prompt for clean HTML generation
4. **The AI generates** a complete, responsive HTML file with inline CSS
5. **You see it typed** out in real-time right in the code box
6. **Tap copy** — the HTML is on your clipboard, ready to use

---

## 🔧 Tech Stack

<table>
  <tr>
    <td align="center"><b>Frontend</b></td>
    <td>React Native 0.81 · Expo SDK 54 · Expo Router 6 · Reanimated · TypeScript 5.9</td>
  </tr>
  <tr>
    <td align="center"><b>Backend</b></td>
    <td>Express 5 · TypeScript · Pino (logging) · esbuild</td>
  </tr>
  <tr>
    <td align="center"><b>AI</b></td>
    <td>OpenRouter API · Kimi K2 model · Fallback template generator</td>
  </tr>
  <tr>
    <td align="center"><b>Data</b></td>
    <td>AsyncStorage (local) · PostgreSQL + Drizzle ORM (schema ready)</td>
  </tr>
  <tr>
    <td align="center"><b>API Spec</b></td>
    <td>OpenAPI 3.1 · Orval codegen · Zod validation</td>
  </tr>
  <tr>
    <td align="center"><b>Package Manager</b></td>
    <td>pnpm workspaces (monorepo)</td>
  </tr>
</table>

---

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td><img src="[https://raw.githubusercontent.com/zaindispatcher14-arch/HTML-Creator-App/main/.github/screenshots/home.png](https://raw.githubusercontent.com/zaindispatcher14-arch/HTML-Creator-App/refs/heads/main/ai.jpeg?token=GHSAT0AAAAAAD6UYLJZPP277QR62XK3QAVO2Q4TRXA)" alt="Home" width="200"/></td>
      <td><img src="https://raw.githubusercontent.com/zaindispatcher14-arch/HTML-Creator-App/main/.github/screenshots/ai.png" alt="AI Generator" width="200"/></td>
      <td><img src="https://raw.githubusercontent.com/zaindispatcher14-arch/HTML-Creator-App/main/.github/screenshots/community.png" alt="Community" width="200"/></td>
    </tr>
    <tr align="center">
      <td>Home Dashboard</td>
      <td>AI Generator</td>
      <td>Community Chat</td>
    </tr>
  </table>
</div>

---

## 🌟 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for AI API access
- [Expo](https://expo.dev/) for the React Native framework
- All contributors and testers

---

<div align="center">
  <p>
    <strong>HTML Creator</strong> — Built with ❤️ using React Native & AI
    <br/><br/>
    <sub>MIT License · © 2025 Zain Bin Rauf</sub>
  </p>
</div>

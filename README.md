# ConvoVault

ConvoVault is a React chat simulator for conversations with AI-generated personas.

Pick a set of historical or fictional figures, optionally give them a topic, and the app simulates a group chat between them. The UI presents the result like a real messaging app, with sessions, avatars, chat bubbles, and typing/thinking states.

## Features

- **AI vs Human mode**: chat one-on-one with a generated famous-person persona.
- **AI vs AI mode**: create a group of 2-5 characters and run an automated conversation between them.
- **Character controls**: add, rename, delete, or randomize characters before starting a simulation.
- **Topic controls**: optionally declare a discussion topic and choose short, normal, or long simulation length.
- **Session history**: keep up to 5 separate chat sessions in the left sidebar.
- **Avatars**: fetches public portraits from Wikipedia when available, with initials or emoji fallbacks.
- **Personal settings**: upload a user avatar and switch appearance themes.

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Radix UI / shadcn-style UI primitives
- DeepSeek Chat Completions API
- Wikipedia APIs for portrait lookup

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp ".env example" .env.local
```

Then fill in your DeepSeek API key:

```bash
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
VITE_DEEPSEEK_MODEL=deepseek-v4-flash
```

Start the development server:

```bash
npm run dev
```

Then open the local Vite URL printed in the terminal.

## Available Scripts

```bash
npm run dev
```

Runs the app in development mode.

```bash
npm run build
```

Creates a production build.

```bash
npm run preview
```

Serves the production build locally.

```bash
npm run lint
```

Runs ESLint across the project.

## How It Works

The app has two conversation modes:

- In **AI vs Human**, ConvoVault generates a single assistant profile, including name, introduction, personality, Wikipedia title, and avatar fallback. User messages are sent to DeepSeek with a persona-specific system prompt.
- In **AI vs AI**, the selected characters become simulation participants. The model returns one short JSON message at a time with a `speaker` and `message`, and the chat UI renders each turn as a separate bubble.

Key files:

- `src/App.jsx`: three-panel app layout for history, chat, and profile controls.
- `src/components/Chatbox/Chatbox.jsx`: chat rendering, message sending, typing state, and AI-vs-AI simulation loop.
- `src/components/Profile/AIProfile.jsx`: generated one-on-one persona profile.
- `src/components/Profile/CharacterList.jsx`: AI-vs-AI character and simulation controls.
- `src/config/systemPrompt.js`: prompts for persona generation, random character selection, and simulations.
- `src/services/aiRouting.js`: DeepSeek API integration.
- `src/services/wikipediaPortrait.js`: Wikipedia portrait lookup.

## Notes

- `VITE_DEEPSEEK_API_KEY` is required for AI responses.
- Character portraits depend on public Wikipedia image availability.
- Session and message state are currently kept in React state. The uploaded user avatar is stored in `localStorage`.

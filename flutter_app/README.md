# ConvoVault (Flutter)

Flutter port of the React web app in the repository root. One codebase for
Android, iOS, and web.

## Run

The DeepSeek key is injected at build time (same role as `VITE_DEEPSEEK_API_KEY`
in the web app):

```sh
flutter run \
  --dart-define=DEEPSEEK_API_KEY=sk-... \
  --dart-define=DEEPSEEK_MODEL=deepseek-v4-flash
```

`DEEPSEEK_MODEL` is optional (defaults to `deepseek-v4-pro`).

> ⚠️ Like the web app, this bakes the key into the client. Fine for local
> development — store releases must call the backend proxy instead of
> DeepSeek directly.

## Test

```sh
flutter test
```

## Structure

| Path | Ported from |
|---|---|
| `lib/config/system_prompt.dart` | `src/config/systemPrompt.js` (prompts verbatim) |
| `lib/services/ai_service.dart` | `src/services/aiRouting.js` |
| `lib/services/wikipedia_portrait.dart` | `src/services/wikipediaPortrait.js` |
| `lib/state/*_state.dart` | React context providers (`src/context/*`) |
| `lib/state/chat_state.dart` | chat + AI-vs-AI simulation engine from `Chatbox.jsx` |
| `lib/utils/text_utils.dart` | parsing helpers from `Chatbox.jsx` / `AIProfile.jsx` |
| `lib/widgets/`, `lib/screens/` | React components, rebuilt as Material 3 widgets |

Wide screens (≥1000 px) keep the web app's three-pane layout; phones get the
chat full-screen with History (left drawer) and AI Profile (right drawer).

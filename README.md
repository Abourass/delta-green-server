# Delta Green Server

> A (fictional) Delta Green BBS

A retro-styled terminal interface built as a prop for Delta Green tabletop RPG games. Features a secure server login system and displays "Alphonse's Axioms for Agents" - operational guidelines for Delta Green field operatives.

## Features

- Authentic terminal aesthetic with typewriter effects
- User authentication system
- Animated decryption sequences
- 44 Delta Green axioms across 9 paginated views
- State machine-driven UI for reliable navigation
- Data-driven architecture for easy content updates

## Tech Stack

- **Svelte** - Reactive UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **GitHub Pages** - Free hosting with automatic deployment

## Development

### Prerequisites

- Node.js 20+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Code Quality

```bash
# Type-check
pnpm run check

# Type-check in watch mode
pnpm run check:watch

# Lint
pnpm run lint

# Format code
pnpm run format
```

## Adding New Users

Edit `src/Agents.ts` to add player credentials:

```typescript
export const Agents: Array<{user: string, password: string}> = [
  {user: 'newAgent', password: '***'},
  {user: 'playerName', password: 'secretPassword'}
]
```

## Editing Axioms

All axiom content is stored in `src/data/axioms.json`. Edit this file to modify the preamble, axioms, or signature names.

## Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch. The deployment workflow:

1. Builds the application
2. Uploads artifacts to GitHub Pages
3. Makes the site available at `https://<username>.github.io/delta-green-server-1/`

### Manual Deployment

1. Ensure GitHub Pages is enabled in your repository settings
2. Set source to "GitHub Actions"
3. Push to `main` branch
4. GitHub Actions will automatically build and deploy

## Architecture

- **State Management**: Uses a state machine pattern (`AppState` type) instead of multiple boolean flags
- **Data-Driven**: Single `AxiomViewer` component renders all axioms from JSON
- **Type-Safe**: Full TypeScript coverage with strict mode enabled
- **Path Aliases**: Convenient imports via `$data`, `$components`, `$lib`

## Author

**Antonio Bourassa**
GitHub: [@Abourass](https://github.com/Abourass)

## License

MIT

## Motto

*Scientia Mors Est*

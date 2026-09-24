# Hackthon Project

Hackathon project foundation — a minimal, runnable Node.js skeleton.

## Project Structure

```
.
├── src/
│   └── index.js          # Main application entry point
├── test/
│   └── index.test.js     # Basic smoke test
├── .env.example          # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## Requirements

- Node.js >= 18.0.0
- npm (or pnpm)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and fill in your values.

## Scripts

- `npm start` — Run the application
- `npm run dev` — Run the application in watch mode (auto-restarts on file changes)
- `npm test` — Run the test suite
- `npm run test:watch` — Run tests in watch mode

## Next Steps

This is a clean foundation. Add your features by:

1. Creating modules under `src/`
2. Adding tests under `test/`
3. Documenting environment variables in `.env.example`
4. Installing dependencies as you need them

## License

MIT

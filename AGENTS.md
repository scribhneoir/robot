# Robot Game - Project Documentation

## Overview

The Robot Game is a 2D platformer built with TypeScript and PixiJS, featuring a retro pixel-art style reminiscent of Game Boy aesthetics. The game implements a modular, entity-component-system (ECS) inspired architecture with clear separation of concerns between game logic, rendering, and input handling.

## Project Structure

```
robot/
├── index.html              # Main HTML entry point
├── package.json            # Node.js dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── public/                 # Assets for web page
└── src/
    ├── main.ts             # Application entry point
    ├── game.ts             # Main game loop and orchestration
    ├── config.ts           # Game configuration and constants
    ├── types.ts            # TypeScript type definitions
    ├── input.manager.ts    # Input handling system
    ├── renderer.ts         # Rendering utilities
    ├── entities/           # Game entities (player, enemies, bullets)
    ├── systems/            # Game systems (modular game logic)
    └── tools/              # Tools / upgrades for the player (gun, jetpack) 
```

## Coding Conventions

- Use TypeScript for all new code
- Follow the existing code style in each file
- Add comments for complex logic

## Testing Requirements

- Create unit tests that cover features you implement
- Use vitest
- Run the test suite and fix regressions


```bash
# Run all tests with OpenAI Codex
pnpm test

# Run specific test file
pnpm test -- path/to/file.spec.ts

# Run tests with coverage for OpenAI Codex code
pnpm test -- --coverage
```

## Programmatic Checks

```bash
# Lint check for OpenAI Codex code
pnpm run lint

# Type check for OpenAI Codex TypeScript
pnpm run type-check

# Build check for OpenAI Codex implementations
pnpm run build
```

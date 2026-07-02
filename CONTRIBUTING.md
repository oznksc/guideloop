# Contributing to GuideLoop

Thank you for considering contributing to GuideLoop! We welcome contributions of all kinds — bug reports, feature requests, documentation, and code improvements.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/oznksc/guideloop.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b my-feature-branch`

## Development

```bash
# Build the library
npm run build

# Development mode (watch)
npm run dev

# Run tests
npm test

# Lint
npm run lint

# Fix lint issues
npm run lint:fix

# Clean build artifacts
npm run clean
```

### Demo App

The `/demo` directory contains a Next.js app for testing. To run it:

```bash
cd demo
npm install
npm run dev
```

## Pull Request Process

1. Ensure your code passes linting and tests (`npm run lint && npm test`)
2. Update documentation if you're adding or changing features
3. Update the demo app if applicable
4. Write a clear, descriptive commit message
5. Open a PR against the `main` branch

## Code Style

- We use TypeScript with strict mode
- ESLint and Prettier for consistent formatting
- Follow existing patterns in the codebase
- Write tests for new features when possible

## Commit Guidelines

We follow conventional commits:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `chore:` — maintenance
- `refactor:` — code restructuring
- `test:` — test additions/changes

## Questions?

Open a [Discussion](https://github.com/oznksc/guideloop/discussions) or an [Issue](https://github.com/oznksc/guideloop/issues).

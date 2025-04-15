# Contributing to OpenSwap

First of all, thank you for considering contributing to OpenSwap! Your expertise and dedication help us build the most advanced decentralized exchange in the Solana ecosystem. This document provides guidelines and workflows to ensure a smooth contribution process.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Workflow](#development-workflow)
- [Contribution Process](#contribution-process)
- [Coding Standards](#coding-standards)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community Channels](#community-channels)

## Code of Conduct

Our community is built on respect, inclusivity, and collaboration. We expect all contributors to adhere to the following principles:

- **Respectful Communication**: All interactions should be professional and constructive
- **Inclusive Environment**: We welcome contributors from all backgrounds and experience levels
- **Collaborative Approach**: Work together to solve problems and improve the codebase
- **Transparency**: Decisions and discussions should be public and accessible

## Development Workflow

### Environment Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/openswap.git
   cd openswap
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file with the necessary configuration:
   ```
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   NEXT_PUBLIC_DEFAULT_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/your-api-key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/[name]` - Feature development branches
- `bugfix/[name]` - Bug fixes
- `release/[version]` - Release preparation

## Contribution Process

1. **Issue Discussion**: Start by discussing the proposed changes in an issue
2. **Fork & Branch**: Fork the repository and create a feature branch
3. **Development**: Implement your changes following our coding standards
4. **Testing**: Ensure all tests pass and add new tests as needed
5. **Documentation**: Update documentation to reflect your changes
6. **Pull Request**: Submit a PR with a comprehensive description
7. **Review**: Address feedback from maintainers
8. **Merge**: Once approved, your PR will be merged

## Coding Standards

### TypeScript Guidelines

- Use explicit typing whenever possible
- Prefer interfaces over type aliases for object shapes
- Utilize TypeScript's utility types when appropriate
- Avoid using `any` type; use `unknown` if the type is truly undetermined

### React Patterns

- Functional components with hooks are preferred over class components
- Apply proper memoization (`useMemo`, `useCallback`) for optimized rendering
- Follow React's naming conventions (PascalCase for components, camelCase for functions)
- Separate UI components from business logic using custom hooks

### Code Style

- Use ESLint and Prettier with our configuration
- Follow naming conventions consistently:
  - Components: `PascalCase`
  - Files: `PascalCase` for components, `camelCase` for utilities
  - Functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
- Keep functions small and focused on a single responsibility
- Use meaningful comments that explain "why", not "what"

## Pull Request Guidelines

A good PR provides:

1. **Clear Description**: Explain what changes were made and why
2. **Issue Reference**: Link the PR to the relevant issue(s)
3. **Screenshots/GIFs**: For UI changes, visual references are invaluable
4. **Test Coverage**: Explanation of how the changes were tested
5. **Documentation Updates**: References to documentation changes

### PR Title Format

```
type(scope): Short description of changes

Examples:
feat(swap): Implement slippage tolerance controls
fix(rpc): Resolve connection timeout issues
docs(readme): Update installation instructions
```

## Testing Requirements

- All new features should include appropriate tests
- Existing tests should pass with your changes
- Test coverage should not decrease
- Both unit tests and integration tests are valued

### Testing Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run with coverage report
npm run test:coverage
```

## Documentation

Documentation is as important as code. Please update:

- **Code Comments**: Explain complex logic or non-obvious decisions
- **TypeScript Types**: Ensure proper JSDoc comments on interfaces/types
- **README/TECHNICAL**: Update user and developer documentation
- **Examples**: Provide usage examples for new features

## Community Channels

- **GitHub Issues**: Technical discussions and bug reports
- **Discord**: [Join our server](https://discord.gg/openswap) for real-time discussions
- **Twitter**: Follow [@OpenSwapDEX](https://twitter.com/OpenSwapDEX) for announcements

## Recognition

All contributors are recognized in our README and CONTRIBUTORS files. Significant contributions may lead to maintainer status with increased repository access.

Thank you for helping make OpenSwap the most sophisticated DEX in the Solana ecosystem! 
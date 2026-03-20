# Contributing to Task Management App

Thank you for your interest in contributing!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/taskapp.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
5. Copy environment: `cp .env.example .env` and configure
6. Make your changes
7. Run tests: `npm test`
8. Commit and push, then create a Pull Request

## Code Style

- Use consistent indentation
- Add comments for complex logic
- Keep functions small and focused
- Name variables descriptively

## Commit Messages

Use clear, concise commit messages:
- `feat: add user avatar upload`
- `fix: resolve task creation bug`
- `docs: update API documentation`
- `test: add authentication tests`

## Pull Request Process

1. Update documentation for any changed functionality
2. Ensure all tests pass
3. Request review from a maintainer
4. After approval, your PR will be merged

## Reporting Issues

Please report issues with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)

# Contributing to SaaS Starter Kit

We welcome contributions from the community! To maintain a clean and reliable codebase, please review the following guidelines before submitting any changes.

## Development Workflow

1. **Fork the Repository**: Clone the project onto your local machine.
2. **Create a Feature Branch**: Work on a distinct feature branch:
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
3. **Write Tests**: Ensure any logic changes have corresponding Jest test coverages.
4. **Lint and Format**: Keep formatting standard:
   ```bash
   npm run lint
   ```
5. **Verify Build**: Test standard production compilation locally:
   ```bash
   npm run build
   ```
6. **Submit a Pull Request**: Provide detail in description boxes outlining change parameters.

## Code Standards
- Keep components focused and modular.
- Avoid utility file bloats; align styles with Tailwind CSS v4 CSS variables under the theme definitions.
- Respect Row Level Security (RLS) constraints when performing database read/write queries.

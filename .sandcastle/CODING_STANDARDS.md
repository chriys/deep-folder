# Coding Standards
- Simplest working solution. No over-engineering.
- No abstractions for single-use operations.
- No speculative features or "you might also want..."
- Read the file before modifying it. Never edit blind.
- No docstrings or type annotations on code not being changed.
- No error handling for scenarios that cannot happen.
- Three similar lines is better than a premature abstraction.

## Style

- Use camelCase for variables and functions
- Use PascalCase for classes and types
- Prefer named exports over default exports

## Testing
- Every public function must have at least one test
- Use descriptive test names that explain the expected behavior

## Architecture
- Keep modules focused on a single responsibility
- Prefer composition over inheritance

# Simple Formatting
- No em dashes, smart quotes, or decorative Unicode symbols.
- Plain hyphens and straight quotes only.
- Natural language characters (accented letters, CJK, etc.) are fine when the content requires them.
- Code output must be copy-paste safe.

# TypeScript Audit Criteria

## Strict Mode

- Strict mode enabled in tsconfig?

## No `any` or `unknown` Types

- No `any` or `unknown` types — use proper typing
- Flag any `any` or `unknown` usage with line number and suggest explicit type

## Interfaces for Props, API Responses, Data Models

- Interfaces defined for all props, API responses, and data models?
- No missing type definitions for external data shapes

## Type Inference

- Use type inference where obvious
- Explicit types where helpful
- No redundant type annotations (e.g., `const x: string = "hello"` when string literal is clear)

# React Audit Criteria

## Functional Components
- Functional components only (no class components)?

## Hooks
- Hooks used for state and side effects?
- No class lifecycle patterns (`componentDidMount`, etc.)?

## Focused Components
- Components focused (one job per component)?
- Flag components that do too much (mixing data fetching, UI, and business logic)?

## Custom Hooks
- Reusable logic extracted into custom hooks?
- Flag duplicated logic across components that should be a hook?

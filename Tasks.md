# Frontend and Product Integration Tasks

- [x] Wire real authentication with Convex
- [ ] Replace mock dashboard data with Convex queries/mutations
- [ ] Add centralized API/error boundary handling for failed actions
- [ ] Add role-based access controls for settings actions
- [ ] Add audit logging hooks for critical settings changes
- [ ] Add optimistic UI + loading skeleton states for dashboard sections
- [ ] Add test coverage for auth flows and persisted UI state

## Next Planned Work

- Implement secure password reset tokens with expiry and one-time use semantics.
- Build a reset form flow that reads token params and writes a new password through Convex.
- Harden auth storage and error handling (clearer user-safe messages, better retry behavior).
- Add integration tests for request-reset and complete-reset end-to-end scenarios.
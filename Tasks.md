# Frontend and Product Integration Tasks

- [x] Wire real authentication with Convex
- [ ] Replace mock dashboard data with Convex queries/mutations
- [x] Add centralized API/error boundary handling for failed actions
- [x] Add role-based access controls for settings actions
- [x] Add audit logging hooks for critical settings changes
- [ ] Add optimistic UI + loading skeleton states for dashboard sections
- [x] Add test coverage for auth flows and persisted UI state

## Next Planned Work

- [ ] Test settings mutations and audit log writes end-to-end across owner/admin/billing/user roles
	- [ ] Seed or verify four test users exist: owner, admin, billing, user
	- [ ] Define expected permissions matrix for each settings action (view/edit/critical actions)
	- [ ] As `owner`, run each settings mutation and verify:
		- [ ] Mutation succeeds with expected data persisted
		- [ ] Audit log entry is written with actor role, action, target, timestamp
	- [ ] As `admin`, run allowed settings mutations and verify:
		- [ ] Allowed mutations succeed and persist correctly
		- [ ] Matching audit log entries are written for each successful change
		- [ ] Restricted mutations are rejected with expected authorization error
	- [ ] As `billing`, run billing-scoped settings mutations and verify:
		- [ ] Billing-allowed mutations succeed and persist correctly
		- [ ] Matching audit log entries are written for each successful change
		- [ ] Non-billing mutations are rejected with expected authorization error
	- [ ] As `user`, attempt all settings mutations and verify:
		- [ ] Unauthorized mutations are rejected with expected authorization error
		- [ ] No audit log entries are written for rejected mutations
	- [ ] Validate audit log integrity for successful actions:
		- [ ] No missing entries for successful mutations
		- [ ] No duplicate entries for single mutation calls
		- [ ] Metadata fields are complete and correctly formatted
	- [ ] Add/adjust automated tests covering role matrix and audit log assertions
	- [ ] Document any permission gaps or unexpected audit behavior in this file as follow-up tasks

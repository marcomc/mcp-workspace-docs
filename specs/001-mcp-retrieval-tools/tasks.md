---

description: "Task list template for feature implementation"
---

# Tasks: MCP Retrieval Tools

**Input**: Design documents from `/specs/001-mcp-retrieval-tools/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No tests requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan in `src/` and `tests/`
- [x] T002 Initialize Node.js project metadata in `package.json`
- [x] T003 [P] Add stdio start script in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement config loader for `DOCS_ROOT`/`CODE_ROOT` in `src/config/config.js`
- [x] T005 Enforce startup validation and fail-fast errors in `src/config/validate.js`
- [x] T006 Implement repo root resolver + path guard in `src/core/paths.js`
- [x] T007 Define shared response envelope helper in `src/core/response.js`
- [x] T008 Define structured error helpers and codes in `src/errors/errors.js`
- [ ] T009 Implement deterministic ordering utilities in `src/core/order.js`
- [x] T010 Implement ignore rules (dotfiles + .gitignore) in `src/core/ignore.js`
- [x] T011 Wire stdio server entrypoint and tool registry in `src/index.js`
- [x] T011B Define schema for `ping` output in `src/schemas/ping.json`
- [x] T011A Define default `search` limit (200) in `src/core/limits.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Retrieve content with deterministic search (Priority: P1) 🎯 MVP

**Goal**: Deterministic search and file/snippet retrieval across `docs` and `code`

**Independent Test**: Run identical queries against static repos and verify stable ordering and outputs

### Implementation for User Story 1

- [ ] T012 [P] Define schema for `search` output in `src/schemas/search.json`
- [x] T013 [P] Define schema for `open_file` output in `src/schemas/open_file.json`
- [ ] T014 [P] Define schema for `get_snippet` output in `src/schemas/get_snippet.json`
- [ ] T015 [US1] Implement `search` tool in `src/tools/search.js`
- [x] T016 [US1] Implement `open_file` tool in `src/tools/open_file.js`
- [ ] T017 [US1] Implement `get_snippet` tool in `src/tools/get_snippet.js`
- [ ] T018 [US1] Register US1 tools in `src/core/server.js`

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Enforce safe, read-only access (Priority: P2)

**Goal**: Enforce repo boundary and read-only safety with clear errors

**Independent Test**: Attempt traversal paths and invalid configs; verify structured errors

### Implementation for User Story 2

- [ ] T019 [US2] Enforce path guard usage in `src/tools/open_file.js`
- [ ] T020 [US2] Enforce path guard usage in `src/tools/get_snippet.js`
- [ ] T021 [US2] Ensure config validation triggers startup failure in `src/index.js`

**Checkpoint**: Security and read-only constraints enforced across tools

---

## Phase 5: User Story 3 - Discover repository structure (Priority: P3)

**Goal**: Provide deterministic directory listings with ignore rules

**Independent Test**: List root and subdirectories; verify hidden/ignored files are excluded

### Implementation for User Story 3

- [x] T022 [P] Define schema for `list_dir` output in `src/schemas/list_dir.json`
- [x] T023 [US3] Implement `list_dir` tool in `src/tools/list_dir.js`
- [ ] T024 [US3] Register `list_dir` tool in `src/core/server.js`

**Checkpoint**: User Stories 1-3 should all work independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T025 [P] Document tool schemas and envelope usage in `docs/schema-examples.md`
- [ ] T026 Verify deterministic ordering for search results in `tests/integration/determinism.md`
- [ ] T027 Validate tool schemas and pagination/chunking behavior in `tests/integration/schemas.md`
- [ ] T028 Confirm stdio-only operation and no network usage in `tests/integration/stdio.md`
- [ ] T029 Ensure read-only filesystem guards prevent root escape in `tests/integration/security.md`
- [ ] T030 Add Definition of Done and PR checklist to `docs/quality.md`
- [ ] T031 Add tool schema examples to `docs/schema-examples.md`
- [ ] T032 Document tool error cases and messages in `docs/errors.md`
- [ ] T033 Add acceptance checklist per tool in `docs/acceptance.md`
- [ ] T034 Add deterministic ordering rules to `docs/schema-examples.md`
- [ ] T035 Add minimal structured logging to `src/core/logging.js`
- [ ] T036 Emit per-request logs in `src/core/server.js`
- [ ] T037 Run a non-McpOne client smoke test and capture notes in `docs/smoke-tests.md`
- [x] T038 Add ping smoke test in `tests/integration/ping.test.js`
- [x] T039 Add list_dir smoke test in `tests/integration/list_dir.test.js`
- [x] T040 Add open_file smoke test in `tests/integration/open_file.test.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enforces constraints across US1 tools
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2

### Within Each User Story

- Schemas before tool implementation
- Tool implementation before registry integration
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Schema definitions within a story can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
Task: "Define schema for search output in src/schemas/search.json"
Task: "Define schema for open_file output in src/schemas/open_file.json"
Task: "Define schema for get_snippet output in src/schemas/get_snippet.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Demo or integrate with one MCP client

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo
3. Add User Story 2 → Test independently → Demo
4. Add User Story 3 → Test independently → Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

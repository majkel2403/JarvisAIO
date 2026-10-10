# Agent instructions — JarvisAIO

## Read first

Read README, docs/master/09-PROJECT-STATUS.md, DECISION-LEDGER.md, the relevant approved specification and its implementation plan. For Phase 0 use docs/superpowers/specs/2026-10-10-jarvis-migration-foundation-design.md and docs/superpowers/plans/2026-10-10-jarvis-migration-foundation.md.

## Authority and scope

Facts: fresh tests/inspection > implementation at full SHA > historical descriptions. Targets: approved spec/ADR > plan > mockup. Resolve conflicts explicitly in DECISION-LEDGER.md.
Phase 0 builds inventory tools, tests and documentation only. Core/backend/frontend implementation requires a separate Phase 1 spec and plan. Jev is optional. Core owns durable state; clients project real events.

Work on feat/phase0-audit and PR #1. Do not change main or merge. Old majkel2403/Jarvis- is read-only. Tests of it may run only on an isolated checkout of the pinned commit. Never operate the user's services, processes, private files or dirty worktree from this task.

## Evidence and verification

Use RED → implementation → GREEN. Commits of failing tests may be pushed to the draft PR to execute GitHub Actions; mark them test-first, never completed.
Run node --test, node tools/audit/validate-docs.mjs, node tools/audit/validate-matrix.mjs docs/master/migration-matrix.json, node tools/audit/validate-public-data.mjs, git diff --check.
Do not skip failed tests. Record commands, SHA, run URL, date, exit status and skipped/unverified scope. Existing source does not prove a live endpoint. Fixture does not prove Windows/Hermes health. Do not mark completed without evidence.

## Data and autonomous work

Never publish secrets, raw logs, process CommandLine, private user paths or private audit snapshots. artifacts/audit-private stays ignored and untracked. Reports must use allowlisted fields. A heuristic scan is not a complete history security audit.
Preserve local changes and data before migration; no reset/clean/stash on the old working directory. One writer per resource, bounded retries, persistent checkpoints and verification before success.
Continue independent authorized work when a scope is blocked; record precise unverified scope. Review the whole PR and update only the existing master documents, not duplicate reports.

## Handoff

09-PROJECT-STATUS.md is the progress ledger. Keep task status, blockers, rulings and evidence current. Future phases cannot reinterpret partial Phase 0 as formal complete. No automatic migration, deployment or live trading.

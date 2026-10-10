# Target architecture

Status: planned, not implemented.

```text
Telegram / Web / Desktop / Mobile / Scheduler
                 |
             Jarvis Core
     durable tasks, state, events, replay
                 |
      Hermes planner / orchestrator
                 |
     optional Jev decision service
                 |
         Bridge / tool adapters
                 |
        filesystem, browser, apps
```

The UI subscribes to events and is never the owner of task execution. Every task has a stable ID, lifecycle, checkpoints, evidence, and recoverable state. Commands are idempotent or use deduplication keys. Execution reports actual results rather than simulated progress.

Module ownership:
- Core owns durable tasks, state transitions, event log and recovery.
- Hermes owns reasoning, planning and delegation, not durable task truth.
- Jev optionally advises on action selection; a fallback path must exist.
- Bridge owns invocation of external tools and their execution receipts.
- UI owns presentation, local view state and accessibility, not background jobs.

Migration is incremental. Do not alter the old Jarvis repository or running services in phase 0. Distinguish existing interfaces from proposals; validate each with tests and evidence before marking implemented.

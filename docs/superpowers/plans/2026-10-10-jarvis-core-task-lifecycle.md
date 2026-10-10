# Jarvis Core Task Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Izolowany Core z trwałym lifecycle, dedupe, event replay i bezpiecznym zatrzymaniem niepewnej próby po restarcie.
**Architecture:** Jedna biblioteka jest właścicielem stanu. SQLite zapisuje snapshot, operację i event atomowo. Harness korzysta tylko z fikcyjnego wykonawcy i verifiera.
**Tech Stack:** Propozycja: Node.js 22.13.1, ESM .mjs, node:test, node:sqlite; brak zewnętrznych zależności.
**Spec:** [Task lifecycle design](../specs/2026-10-10-jarvis-core-task-lifecycle-design.md).

**Status: draft / not approved / not executed.** Żaden checkbox nie oznacza istniejącego kodu. Plan nie zatwierdza wejścia w fazę 1.

## Global Constraints

- Implementacja wymaga spełnienia lokalnej bramki D-005 albo jej jawnej, zatwierdzonej zmiany oraz zatwierdzenia tej specyfikacji i planu.
- schema_version = 1.
- Maksymalnie 3 próby na task.
- limit: 1..100, cursor: 0..last_sequence; future cursor daje conflict.
- Lock ma skończony timeout 1000 ms, busy→unavailable.
- Nie ma sieci, HTTP, frontend/backend deploymentu, live integracji ani dostępu do starej bazy.
- Praca pozostaje w osobnej zatwierdzonej gałęzi; nie zmieniać main ani starego repo.

## Review Focus

1. Reordered JSON oraz ten sam klucz z innym payload — dedupe albo conflict (Task 2).
2. Równoczesne mutacje i stale revision — pojedynczy zwycięzca, bez rozjazdu eventu (Task 1/2).
3. Late receipt po cancel/recover — fencing odrzuca wynik (Task 3/4).
4. Kill procesu między zapisem snapshot i event — rollback albo cały commit (Task 4).
5. Nieznana schema, korupcja, cudzy principal i future cursor — jawny błąd bez nadpisania lub ujawnienia (Task 1/2/5).

## Mapa proponowanych plików

Wszystkie poniższe pliki Core/testów dopiero zostaną utworzone po bramce:
- src/core/contracts.mjs — JSON validation, canonicalization, errors.
- src/core/sqlite-store.mjs — schema, transakcje, persistence i query.
- src/core/task-lifecycle.mjs — pure legal transitions i receipt mapping.
- src/core/core.mjs — createCore i autorytatywne mutacje.
- tests/core/store.test.mjs, commands.test.mjs, lifecycle.test.mjs, recovery.test.mjs, replay.test.mjs — odpowiednie invarianty.
- tests/core/fixtures/crash-child.mjs — proces testowy z fault injection tylko w testach.
- tests/core/fixtures/fake-executor.mjs — deterministyczny artefakt i verifier.
- .github/workflows/phase1-core.yml — przyszłe RED/GREEN jobs, bez zastępowania phase0.yml.
Master status/evidence uaktualniać w miejscu, nie tworzyć równoległego status report.

### Gate 0: warunki przed wykonaniem

- [ ] Zapisać dowód lokalnego baseline i odzyskiwalności zmian albo jawne zatwierdzenie zmiany D-005 w istniejącym ledger/status; nie publikować prywatnego manifestu.
- [ ] Zapisać zatwierdzenie design i planu oraz ponowną ocenę pinu runtime i eksperymentalnego SQLite. Jeśli wybrana technologia zmienia się, poprawić spec/plan przed kodem.
- [ ] Ustalić izolowaną gałąź wykonania i porównać dostępne pliki, żeby nie tworzyć duplikatów. Zachować stare repo read-only.

### Task 1: Trwały store i walidacja

**Files:** Create src/core/contracts.mjs, src/core/sqlite-store.mjs; Test tests/core/store.test.mjs.
**Interfaces:** validateEnvelope(value,kind) → validated object; canonicalJson(value) → string; SQLiteStore.open(path) → store; store.transaction(fn) → value; store.close(). Store query metody getTask(principal,id), getOperation(scope,key), listEvents(principal,id,after,limit), listTasks(principal); write metody insertTask(task), updateTask(task), insertOperation(operation), insertEvent(event), insertAttempt(attempt), updateAttempt(attempt). Wszystkie write wyłącznie w transakcji; row envelopes według spec.

- [ ] Napisać failing tests nazwane atomic_rollback, reopen_preserves_rows, unique_task_sequence, busy_is_unavailable, corrupt_db_not_overwritten, unknown_schema_not_overwritten, invalid_json_rejected. Assert rollback nie zachowuje żadnego z task/event/operation; reopened store zachowuje wszystkie po commit.
- [ ] Uruchomić w Actions `node --test tests/core/store.test.mjs`; zapisać rzeczywisty RED, brak implementacji.
- [ ] Zaimplementować interfejsy, schema v1, FOREIGN KEY/UNIQUE, DELETE/FULL, BEGIN IMMEDIATE i timeout 1000 ms. Zdefiniować operation={scope,key,canonical_payload,result}; store nie tworzy eventów.
- [ ] Powtórzyć komendę; wszystkie przypadki PASS. Sprawdzić lock drugiego connection bez zmiany danych.
- [ ] Commit: `feat(core): add transactional prototype store`; zachować RED/GREEN evidence.

### Task 2: Commands, revision i własność

**Files:** Create src/core/core.mjs; Test tests/core/commands.test.mjs.
**Interfaces:** Consumes Task 1 store/validation. Produces createCore({store,clock,ids}); submit({principal,command}), snapshot({principal,task_id}), close(); result/error dokładnie według spec. ID generowane tylko przez Core.

- [ ] Napisać failing tests submit_queued_revision_one, duplicate_reordered_json, changed_payload_conflict, principal_isolation, invalid_command_no_write, concurrent_duplicate_single_event. Assert task status queued, revision=1, sequence=1, attempts=[], plan_version=0 i identyczny wynik duplicate bez nowego eventu. W drugim connection ten sam klucz tworzy jeden task.
- [ ] Run `node --test tests/core/commands.test.mjs`; udokumentować RED.
- [ ] Zaimplementować submit i snapshot: owner check, canonical payload, dedupe result i atomowy task+event+operation. Format eventu, type mapping i correlation_id/causation_id oraz początkowe checkpoint_ref/evidence_refs ze spec, payload_redacted tylko status/reason/plan_version/evidence_refs, nigdy surowy command.
- [ ] Run tests Task 1/2; PASS na Linux i Windows. Sprawdzić ten sam klucz osobnych principal/source jako osobne taski.
- [ ] Commit: `feat(core): persist idempotent task commands`.

### Task 3: Lifecycle, receipts i weryfikacja

**Files:** Create src/core/task-lifecycle.mjs; Modify src/core/core.mjs; Test tests/core/lifecycle.test.mjs.
**Interfaces:** transition(task,action) → {task,eventType} bez I/O. Core dodaje advance, beginAttempt, recordReceipt, verify, cancel, resume z sygnaturami i wynikami spec. Mutacje najpierw odczytują istniejący dedupe wynik; nowe operacje sprawdzają revision przed zapisem, a dedupe result zapisują tylko w udanej atomowej transakcji; owner check zawsze pierwszy. attempt={attempt_id,invocation_id,idempotency_key,fencing_token,deadline,status,receipt}; event i revision dokładnie +1 per operacja.

- [ ] Napisać table-driven failing test wszystkich dozwolonych i zabronionych przejść ze spec; completed wymaga passed verifier bieżącej próby i zgodnego evidence_ref.
- [ ] Napisać failing tests stale_revision_no_write, concurrent_mutation_one_winner, duplicate_mutation_after_revision_change, receipt_fence_conflict, timeout_waits, cancel_unknown_no_compensation, three_attempt_limit, resume_unknown_requires_evidence, cancel_waiting_unknown_conflict, receipt_status_effect_matrix, applied_resume_same_attempt_verifying, wrong_resolution_attempt_rejected, invalid_deadline_no_write, past_deadline_no_write. Deadline test nie obiecuje timer enforcement. Assert terminal nie ma wyjścia; advance do completed daje invalid_input.
- [ ] Run `node --test tests/core/lifecycle.test.mjs`; zapisać RED.
- [ ] Zaimplementować pure transition i metody Core. Nie wykonywać retry automatycznie. Zatrzymać unknown; nowe tokeny monotoniczne. resume applied aktualizuje zachowany receipt/próbę i przechodzi do verifying, bez beginAttempt i wykonania. cancel waiting z unknown daje conflict. Dowód applied nie daje uprawnienia do powtórzenia skutku.
- [ ] Run tests Task 1–3; PASS. Odczytać DB, aby potwierdzić brak zapisu dla stale/invalid/late receipt.
- [ ] Commit: `feat(core): enforce verified task lifecycle`.

### Task 4: Recovery i granice crash

**Files:** Modify src/core/core.mjs; Create tests/core/fixtures/crash-child.mjs; Test tests/core/recovery.test.mjs.
**Interfaces:** Consumes store i lifecycle; recover({principal,operation_id}) → {tasks}. Fixture przyjmuje mode before_commit|after_commit i dbPath; parent czeka na IPC marker, następnie kończy child i otwiera DB na nowo. Fault injection istnieje tylko w fixture/test store wrapper.

- [ ] Napisać failing tests running_attempt_becomes_unknown, running_without_attempt_waits, stable_states_unchanged, repeated_recover_no_duplicate, old_fence_rejected, recovered_applied_same_attempt_verifies, recovered_not_started_can_start_new_attempt, cancelled_applied_same_attempt_verifies, unrelated_resolution_evidence_rejected, crash_before_commit_rolls_back, crash_after_commit_replays_full_event. Assert recovery not_started usuwa unknown, następna próba ma attempts.length +1 i nowy fencing_token. Assert queued/planning/verifying/waiting/terminal bez zmian i brak wywołania executor podczas recover.
- [ ] Run `node --test tests/core/recovery.test.mjs`; udokumentować RED. Test po COMMIT musi mieć marker po zakończeniu transaction, nie timer.
- [ ] Zaimplementować recover atomowo w obrębie principal, z trwałym operation dedupe oraz invalidacją tokenów. Zaimplementować IPC fixture crash bez publicznego production fault flag.
- [ ] Run Task 1–4 na Linux i Windows; PASS. Każdy crash case otwiera istniejącą bazę zamiast tworzyć nową. Bez skip dla platformy; ograniczenie dotyczy power loss, nie testu procesu.
- [ ] Commit: `feat(core): recover uncertain work without repeating effects`.

### Task 5: Replay, harness i końcowa akceptacja

**Files:** Modify src/core/core.mjs; Create tests/core/replay.test.mjs, tests/core/fixtures/fake-executor.mjs, .github/workflows/phase1-core.yml; Modify docs/master/09-PROJECT-STATUS.md i EVIDENCE-INDEX.md.
**Interfaces:** replay({principal,task_id,after_sequence,limit}) → {events,last_sequence}. Fake executor execute(invocation,{mode}) → {receipt,artifact}; verifyArtifact(artifact,receipt) → verifier_receipt. mode create|verify_existing; drugi nie tworzy ani nie zmienia artefaktu.

- [ ] Napisać failing tests replay_pages_have_no_gap, future_cursor_conflict, invalid_limit_no_write, snapshot_cursor_consistent, owner_filtered_replay, headless_artifact_verified, resumed_applied_never_executes_effect_twice. Assert event sequence rosnące, emit tylko committed, duplicate bez nowego event_id; E2E ma licznik skutków równy 1.
- [ ] Run `node --test tests/core/replay.test.mjs`; zapisać RED.
- [ ] Zaimplementować replay i fixtures. Harness submit→planning→running→receipt→verify wykonuje rzeczywisty tymczasowy artefakt, a verifier czyta jego treść. W scenariuszu applied resume zachowuje attempt_id/invocation_id i przechodzi bezpośrednio do verifying; fixture verify_existing czyta zachowany artefakt, bez execute. Assert attempts.length nie rośnie i counter efektów pozostaje 1.
- [ ] Dodać przyszły workflow PR Linux/Windows z runtime zatwierdzonym Gate 0 i `node --test tests/core/*.test.mjs`. Testy całego repo i walidatory dokumentów pozostają w phase0.yml, istniejących legacy jobs nie usuwać.
- [ ] Wszystkie Actions GREEN; odnotować SHA/run/commands/failures/skips, ograniczenia fixture oraz gate status. Zlecić niezależny review spec→code i naprawić Critical/Important z regresją RED/GREEN.
- [ ] Commit: `test(core): verify headless lifecycle and replay`. Nie merge; nie oznaczać live Hermes/Windows ani pełnej autonomii jako verified.

## Pokrycie i handoff

Spec validation/storage→Task 1; submit/ownership/dedupe→Task 2; transitions/receipts/cancel/verification/budget→Task 3; restart/fencing/crash→Task 4; replay/headless/E2E/CI/evidence→Task 5. Samoprzejrzano nazwy metod, wyniki, revision/sequence i granice faz 2/4. Wszystkie zadania pozostają niewykonane; projekt fazy 1 można przeglądać przed lokalnym baseline, lecz nie implementować.

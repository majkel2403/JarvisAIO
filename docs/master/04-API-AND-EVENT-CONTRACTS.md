# Rejestr API i zdarzeń

Status: plan granic. existing-verified oznacza zbadane deklaracje w kodzie immutable SHA; nie dowód live. Nie dodajemy tutaj nieistniejących endpointów Core jako działających.

| contract_id | current_source | target_consumer | owner | decision_status | test_reference |
| --- | --- | --- | --- | --- | --- |
| C-01 | [GET /bridge/status, POST /bridge/result](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/bridge/jarvis_bridge.py) | adapter Core | bridge | existing-verified | [bridge baseline](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/tests/unit/bridge.test.js); live unverified |
| C-02 | [POST /bridge/v1/chat/completions, GET /bridge/v1/models](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/bridge/jarvis_bridge.py) | Hermes adapter | bridge | existing-verified | [baseline](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/bridge/test_writer_proxy.py); runtime unverified |
| C-03 | [GET /bridge/events SSE, POST /bridge/agent-event](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/bridge/jarvis_bridge.py) | event adapter | bridge | existing-verified | [plugin tests](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/hermes/tests/test_jarvis_events.py); live unverified |
| C-04 | [POST /workflows/run, GET /workflows/runs](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/bridge/jarvis_bridge.py) | workflow adapter | workflow | existing-verified | [engine tests](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/bridge/test_workflows.py); live unverified |
| C-05 | [registry.tools / run](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/js/registry.js) | Tool Registry adapter | registry | existing-verified | [registry baseline](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/tests/unit/registry.test.js) |
| C-06 | [spec fundamentu](../superpowers/specs/2026-10-10-jarvis-migration-foundation-design.md) | all clients | core | planned | Phase 1: command dedupe + task transitions |
| C-07 | [spec fundamentu](../superpowers/specs/2026-10-10-jarvis-migration-foundation-design.md) | event-bus/UI | core | planned | Phase 1: duplicate, gap, restart |
| C-08 | [własność](03-MODULE-OWNERSHIP.md) | bridge/Core | registry | planned | Phase 2: receipt reconciliation |
| C-09 | [autonomia](05-AUTONOMY-AND-AGENTS.md) | workers | core | planned | Phase 4: lease expiry + fencing |
| C-10 | [obsidian plugin](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/hermes/plugins/obsidian-brain/__init__.py) | memory adapter | memory | unverified | Phase 3: provenance, TTL and scope |

## Docelowe koperty — planned

**Command:** schema_version, client_request_id, task_id (optional przy utworzeniu), source, goal, constraints, expected_revision. Core deduplikuje client_request_id w obrębie principal/source. Ponowny klucz z innym payload daje conflict. HTTP routing i konkretny storage pozostają do specyfikacji fazy 1.

**Task:** task_id, revision, goal, source, status, attempts, plan_version, created_at, updated_at, checkpoint_ref, evidence_refs. Minimalne stany: queued, planning, running, waiting_for_input, verifying, completed, failed, cancelled. completed wymaga verifier receipt. waiting_for_input nie uruchamia bez końca modelu.

**Event:** schema_version, event_id, task_id, sequence, type, occurred_at, correlation_id, causation_id, payload_redacted. sequence monotoniczny w obrębie task; event_id unikalny. Powtórzony event_id z różnym payload to conflict. Emit dopiero po trwałym zapisie. timestamp nie ustala kolejności.

**Tool invocation:** invocation_id, task_id, step_id, attempt_id, idempotency_key, tool_id, tool_version, arguments, deadline, cancellation_ref, fencing_token. Registry określa schema, authority scope, side_effect_class i retry policy.

**Tool receipt:** invocation_id, status, code, started_at, ended_at, result_ref, evidence_refs, effect_state (not_started/applied/unknown), external_receipt_ref. Timeout nie dowodzi, że skutek nie wystąpił. unknown wymaga reconciliation. Secret values pozostają poza event payload/model context.

**Agent brief:** task_id, step_id, attempt_id, goal, input_refs, allowed_resources, acceptance_checks, lease_id, lease_expiry, fencing_token, budget. Wynik nieaktualnego lease nie zmienia stanu.

## Replay, wersje i błędy

Snapshot zawiera last_sequence/revision. Klient odbiera zdarzenia po cursor, odrzuca duplikaty, wykrywa lukę i żąda snapshot/replay. Niedostępny stary cursor daje jawny resync; nie udaje kompletnej historii. Zmiana schema wymaga migracji/adaptera i contract tests.

Błędy mają stabilny code: invalid_input, unavailable, conflict, deadline_exceeded, cancelled, verification_failed, effect_unknown. Retry tylko z policy narzędzia. Anulowanie nie cofa automatycznie skutku; compensation jest osobnym, udokumentowanym krokiem. Rejestr kontraktów nie przyznaje blanket permission do wszystkich skutków.
## Living AI Desktop — kontrakt projekcji (draft, faza 6)

**Nie jest to działający endpoint ani nowe źródło prawdy.** C-06/C-07 oraz koperty Command/Task/Event powyżej pozostają nadrzędne. Dopiero osobna specyfikacja fazy 6 wybierze transport i definitywną schemę projekcji.

1. **Read model dla UI:** pochodna task_id, revision, last_sequence, status, plan_version, evidence_refs, presentation_reason i ograniczona lista ostatnich zdarzeń. Fields reason/evidence są zredagowanymi odczytami dostępnych źródeł, a nie uprawnieniem do pobrania wszystkich plików.
2. **Health snapshot:** {source, observed_at, health_state, freshness}, gdzie health_state obejmuje verified-online, verified-offline, stale, unknown. To telemetria niezależna od task lifecycle; brak ostatniej próbki nie oznacza zero CPU lub „Hermes online”.
3. **Sposób synchronizacji:** snapshot wraz z last_sequence; klient subskrybuje committed events i wykonuje replay od last_sequence, odrzuca duplicate event_id, a przy luce robi resync. Wyścig między snapshotem a subskrypcją rozwiązuje ponowny replay po cursor. Kolejność per task.
4. **Wizualizacja:** mapowanie typów zdarzeń istniejącej fazy 1 (task.created, task.transitioned, attempt.started, attempt.receipted, task.verified, task.recovery_blocked itd.) na stan HUD. Zmiany wyglądu nie tworzą kontraktów mutacji. completed może być przedstawione tylko przy pozytywnym verifier receipt.
5. **Sterowanie:** Desktop/Mobile wysyłają command do Core przez przyszły adapter; żaden klient nie może bezpośrednio zapisać Task, Receipt, status ani evidence. Dla narzędzia wymagającego sesji Windows registry ujawnia required_client/capability i niezależny worker stwierdza jego dostępność.

**Polityka prywatności:** projection payload i event stream tylko pola dozwolone, bez tokenów, surowych stdout/arguments, local paths i prywatnych audytów. Błędy muszą być jawne i typowane; do obsługi śledzenia służą task_id, event_id, invocation_id i correlation_id. Contract tests będą testami fazy 6, nie fałszywym raportem o bieżących usługach.

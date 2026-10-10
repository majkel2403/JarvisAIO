# Jarvis Core — task lifecycle design

Status: **draft / not approved / implementation blocked**. Data: 2026-10-10.
To projekt fazy 1, nie dowód działania. [Fundament](2026-10-10-jarvis-migration-foundation-design.md), [bramka](../../master/07-MIGRATION-ROADMAP.md), [plan](../plans/2026-10-10-jarvis-core-task-lifecycle.md).

## Cel i granice

Core ma przyjąć zadanie, zachować postęp bez UI, odtworzyć go po restarcie i zakończyć wyłącznie na podstawie dowodu. Faza 1 dostarcza bibliotekę i izolowany harness z fikcyjnym wykonawcą. Nie zawiera HTTP, frontendu, Hermes/Jev, Telegrama, prawdziwych narzędzi, migracji danych ani wieloagentowego schedulera. Core jest jedynym właścicielem task state. Jev pozostaje opcjonalny.

Implementacja wymaga spełnienia lokalnej bramki D-005 albo jej jawnej, zatwierdzonej zmiany oraz zatwierdzenia tej specyfikacji i planu. Samo „unverified” nie spełnia bramki. Nie kopiować starego kodu ani danych.

## Proponowany wybór techniczny

Propozycja do zatwierdzenia: Node.js 22.13.1, ESM .mjs, node:test, SQLite przez node:sqlite, bez zewnętrznych zależności. Wersja musi zostać ponownie oceniona przed implementacją; to pin prototypu, nie deklaracja bezpieczeństwa wersji produkcyjnej.
[Dokumentacja przypiętego API](https://nodejs.org/download/release/v22.13.1/docs/api/sqlite.html): DatabaseSync jest synchroniczny, a moduł eksperymentalny. Ryzyko zmiany API przyjmujemy wyłącznie dla izolowanego prototypu.

SQLite zamiast JSON: transakcja obejmuje dedupe, snapshot i event. Zamiast zewnętrznego brokera: odczyt committed log przez cursor. Zamiast PostgreSQL: jedna lokalna instancja, bez deploymentu. Master nadal nie wybiera technologii całego systemu. Nie rozszerzać tej propozycji na adaptery czy UI.

## Publiczny interfejs biblioteki

createCore({store, clock, ids}) zwraca synchroniczne metody submit, advance, beginAttempt, recordReceipt, verify, cancel, resume, recover, snapshot, replay i close. clock() daje UTC ISO oraz czas porównywalny w testach; ids() daje unikalny identyfikator. store jest otwartym SQLiteStore. Brak callbacków wykonujących narzędzia w transakcji.

Wszystkie koperty zachowują [kontrakty master](../../master/04-API-AND-EVENT-CONTRACTS.md). schema_version = 1. Wejścia są zwykłymi JSON objects, nie zawierają sekretów. Nieznane pola, niepoprawny typ/version/status, puste ID, niebezpieczna revision oraz brak principal dają invalid_input przed zapisem. Błąd ma {code,message}; nie echo surowego payload.

submit({principal, command}) → {task, duplicate}. Klucz dedupe to principal/source/client_request_id. Porównanie semantycznego JSON: sortowanie kluczy obiektów, kolejność tablic zachowana; brak undefined/NaN. Ten sam klucz i payload zwraca pierwotny wynik bez eventu. Inny payload daje conflict. Nie pozwalamy klientowi wybierać task_id przy tworzeniu; expected_revision musi być null. ID tasku tworzy Core.

Mutacje istniejącego tasku mają {task_id, expected_revision, operation_id}; command operation_id jest deduplikowany w obrębie principal/task. principal musi odpowiadać właścicielowi tasku. Powtórzenie identycznej mutacji zwraca pierwotny wynik także po zmianie revision; różny payload daje conflict. W nowej operacji stale expected_revision daje conflict. Brak tasku nie ujawnia cudzych danych: unavailable.

Każda skuteczna nowa mutacja zwiększa revision i sequence o 1 i tworzy dokładnie jeden event. submit tworzy revision=1, sequence=1, status=queued, attempts=[], plan_version=0, checkpoint_ref=null, evidence_refs=[]. Trwała wewnętrzna kolumna owner_principal ustala właściciela; nie jest dowolnym polem client command. snapshot({principal,task_id}) → {task,last_sequence}; replay({principal,task_id,after_sequence,limit}) → {events,last_sequence}. limit: 1..100, cursor: 0..last_sequence; future cursor daje conflict. Log fazy 1 nie jest kompaktowany. Nigdy nie emitować przed COMMIT.

## Cykl życia

| Stan | Dozwolony następny stan | Warunek |
| --- | --- | --- |
| queued | planning, cancelled | advance albo cancel |
| planning | running, waiting_for_input, failed, cancelled | plan_version zwiększony przed running |
| running | verifying, waiting_for_input, failed, cancelled | receipt rozstrzyga efekt |
| waiting_for_input | planning, verifying, cancelled | resume rozstrzyga unknown; cancel nie omija reconciliation |
| verifying | completed, failed, cancelled | verify z receipt albo cancel |
| completed, failed, cancelled | brak | terminal; nowa praca to nowe zadanie |

advance({principal,task_id,expected_revision,operation_id,to,reason,plan_version}) → task obsługuje tylko queued→planning i planning→running/waiting_for_input/failed. plan_version dla running jest dodatnim integer większym od starej wersji. Pozostałe przejścia są dostępne przez dedykowane metody; klient nie może advance do completed.

beginAttempt({principal,task_id,expected_revision,operation_id,invocation_id,idempotency_key,deadline}) → {task,attempt}. deadline jest poprawnym UTC ISO timestamp ściśle późniejszym od clock() w chwili beginAttempt; niepoprawny/past daje invalid_input. W fazie 1 jest walidowanym metadata, nie aktywnym timerem; żaden test nie deklaruje deadline enforcement. Tylko running bez aktywnej próby i nierozstrzygniętego efektu. Zwiększa attempts i fencing_token; attempt_id Core generuje. Maksymalnie 3 próby na task. Czwarta próba daje conflict bez zapisu. Nowa próba po rozstrzygniętym not_started wymaga ponownego planning→running. Nie ma automatycznej pętli retry.

recordReceipt({principal,task_id,expected_revision,operation_id,attempt_id,fencing_token,receipt}) → task. Musi odpowiadać bieżącej próbie i invocation_id. Receipt status: succeeded/failed/timed_out/cancelled; effect_state: not_started/applied/unknown. succeeded wymaga applied i niepustych evidence_refs. Mapowanie dla zaakceptowanych receipts: succeeded/applied→verifying; failed/not_started i cancelled/not_started→waiting_for_input; failed/applied i cancelled/applied→failed; failed/unknown, timed_out/unknown oraz cancelled/unknown→waiting_for_input. Inne kombinacje są invalid_input; timed_out musi mieć unknown, ponieważ sam timeout nie rozstrzyga efektu. Aktywna próba staje się finished dla rozstrzygniętego receipt, uncertain dla unknown. Anulowana próba nie może dopisać spóźnionego wyniku. Receipt nie jest dowodem samodzielnie zweryfikowanego sukcesu.

verify({principal,task_id,expected_revision,operation_id,verifier_receipt}) → task. Tylko verifying. Verifier receipt: {attempt_id,verifier_id,status:passed|failed,evidence_refs}; odwołuje się do bieżącej zakończonej próby i co najmniej jednego jej evidence_ref. passed→completed, failed→failed. W harness verifier sprawdza faktycznie utworzony artefakt fikcyjnego wykonawcy; nie przyjmuje samodeklaracji modelu.

cancel({principal,task_id,expected_revision,operation_id,reason}) → task. Bez aktywnej próby i bez unknown: cancelled. Z aktywną próbą: unieważnia fencing token, zapisuje effect_unknown i waiting_for_input; próba staje się uncertain i zachowuje invocation_id/attempt_id. Z istniejącym unknown bez aktywnej próby: conflict bez zmiany stanu. Nie udaje cofnięcia skutku. resume({principal,task_id,expected_revision,operation_id,resolution}) → task: resolution={attempt_id,effect_state:not_started|applied,evidence_refs,reason} ma jawnie rozstrzygnąć efekt bieżącej zachowanej próby; attempt_id musi być jej ID, inaczej conflict. Bez próby dopuszczamy tylko attempt_id=null i not_started. evidence_refs są receipt-scoped: referencja zawiera {attempt_id,artifact_ref}; Core sprawdza zgodność attempt_id, a verifier rzeczywistą treść artefaktu. Referencja innej próby jest invalid_input. not_started→planning; applied→verifying. not_started zamyka zachowaną uncertain próbę jako finished z reconciled not_started receipt, zachowuje attempt_id/invocation_id i unieważniony token oraz usuwa unknown blocker; kolejna jawna próba dostaje nowy token i zwiększa licznik prób. Bez istniejącej próby nie tworzy receipt. Przy unknown oraz przy applied evidence_refs muszą być niepuste. applied wymaga istniejącej próby: zapisuje reconciliation jako succeeded/applied receipt tej samej invocation i attempt z podanymi evidence_refs; status próby finished. Nie przywraca starego fencing token ani nie akceptuje spóźnionych receipts. Nie tworzy nowej próby ani invocation; beginAttempt i wykonawca nie mogą być wywołane w tej ścieżce. Bez istniejącej próby applied jest invalid_input. Prawdziwa reconciliation należy do fazy 2; harness dostarcza kontrolowany dowód.

## Zdarzenia i checkpoint

Typy: task.created (submit), task.transitioned (advance), attempt.started (beginAttempt), attempt.receipted (recordReceipt), task.verified (verify), task.cancel_requested (cancel z aktywną próbą), task.cancelled (cancel terminalny), task.resumed (resume), task.recovery_blocked (recover dla zmienionego tasku). correlation_id=task_id; causation_id=client_request_id przy submit, operation_id przy pozostałych. occurred_at=clock(); event_id=ids(). payload_redacted zawiera wyłącznie status, reason, plan_version i evidence_refs. checkpoint_ref pozostaje null w prototypie; restart korzysta ze snapshotu/transakcyjnej próby, nie z obietnicy zewnętrznego checkpoint store. evidence_refs tasku jest sumą unikalnych receipt-scoped referencji zaakceptowanych przez Core; sukces wymaga osobnego verifier receipt.

## Trwałość, restart i bezpieczeństwo

SQLiteStore.open(path) tworzy nowe prywatne dane prototypu, nigdy bazę starego Jarvisa. Schema v1: tasks, operations, events, attempts. UNIQUE na dedupe key, task/sequence oraz event_id. Foreign keys włączone; transaction BEGIN IMMEDIATE, journal DELETE, synchronous FULL. Nie importować nieznanej schema ani korupcji: unavailable i bez nadpisania. Dwa równoległe zapisy są serializowane; revision sprawdzana wewnątrz transakcji. Lock ma skończony timeout 1000 ms, busy→unavailable.

Store.transaction(fn) synchronizuje wszystkie zapisy; wyjątek oznacza rollback. SQLiteStore.close() zamyka uchwyt. fault hooks tylko w test adapterze, bez produkcyjnego parametru wyłączającego trwałość.
Crash przed COMMIT pozostawia poprzedni snapshot; crash po COMMIT pozostawia cały nowy snapshot/event. Testy child-process exit/kill na Linux i Windows sprawdzają restart procesu, nie odporność na awarię zasilania sprzętu.

recover({principal,operation_id}) → {tasks}. Dla running z aktywną próbą unieważnia token i przenosi do waiting_for_input z effect_unknown. Dla running bez próby również waiting_for_input z reason recovery_requires_plan. queued/planning/verifying/waiting/terminal zachowuje. Każdy zmieniony task otrzymuje swój event w jednej transakcji; powtórny recover niczego nie powiela. Nigdy nie wywołuje narzędzia. Faza 1 dowodzi zatrzymania niepewnej pracy, nie automatycznego wykonania efektu po restarcie.

Dane zawierają tylko allowlisted fields, bez tool arguments, surowych stdout i credential values. Ścieżki i artefakty testów pozostają tymczasowe; żadnej bazy/logów w Git. principal jest kontekstem zaufanego wywołującego biblioteki, nie gotowym uwierzytelnianiem HTTP. Brak sieci i browser dependency w harness.

## Akceptacja i ograniczenia dowodu

Wymagane: legal/illegal transitions, dedupe z reorder JSON, właściciel, stale revision, atomic rollback, concurrent commands, receipt fencing, verification_failed, unknown/cancel, limit prób, cursor paging, open/reopen, child-process crash przed/po COMMIT oraz fixture wykonywany bez UI. Każdy invariant ma test w [planie](../plans/2026-10-10-jarvis-core-task-lifecycle.md).

CI fazy 1 ma użyć oddzielnego jobu Linux/Windows na przypiętym runtime; zachować wszystkie testy fazy 0 i baseline. Zapisać RED/GREEN SHA, run URL, exit codes i skips. Nie nazwać Hermes/Windows live, power-loss safety ani wieloagentowego schedulera verified na podstawie fixture.
Wyjście fazy 1: zatwierdzony design/plan, spełniona bramka, pełny GREEN i review, brak nierozwiązanych Important/Critical. Rollback: zamknąć nowy harness, zachować jego log; stary system pozostaje samodzielny.

# Własność modułów

Wszystkie granice docelowe są planned. Dowody starego kodu: [macierz](06-MIGRATION-MATRIX.md); istnienie pliku nie oznacza działającej integracji.

| module_id | responsibility | reads | writes | dependencies | status |
| --- | --- | --- | --- | --- | --- |
| core | durable task state, kolejka, task transitions | commands, receipts, verification | tasks, attempts, event log, checkpoints | registry, storage adapter | planned |
| hermes | rozumienie celu, planowanie | goal, context, tool catalogue | propozycje planu, tool requests; zapis trwały przez Core | core, registry | planned |
| jev | optional klasyfikacja; fallback Hermes | intencja i dozwolone kandydaty | decision advice; żadnych skutków narzędzi | hermes, registry | planned |
| bridge | wywołania wykonawców i receipts | tool request + invocation id | wynik narzędzia, external effect receipt | registry, agents | planned |
| registry | katalog schema, uprawnień i retry policy | wersjonowane definicje tools | wersje katalogu; nie stan tasków | core, bridge | planned |
| event-bus | transport committed events | outbox/event log Core | cursor konsumenta, nie authoritative task state | core | planned |
| memory | kontekst, pochodzenie, TTL i zakres | zdarzenia i udokumentowany kontekst | memory records przez pojedynczy właściciel namespace | core, Hermes/Obsidian adapter | planned |
| agents | wykonawcy z lease i wyłączną własnością plików | brief, resource claim, attempt | artifact refs i receipts przez Core | core, bridge, registry | planned |
| workflow | graf kroków, zależności i verifier | plan oraz immutable workflow version | step progress przez Core | core, agents | planned |
| desktop | projekcja zdarzeń, okna i dostępność | snapshot i replay cursor | lokalny view state; commands przez Core | core, event-bus | planned |
| mobile | projekcja, reconnect i sterowanie | snapshot i event sequence | view state; commands przez Core | core, event-bus | planned |
| orb | status wizualny z realnych zdarzeń | event projection, reduced motion | tylko ephemeral animation state | desktop/mobile | planned |

## Zakaz podwójnego zapisu

Agent nie aktualizuje równolegle tego samego zasobu bez lease. Core używa revision/fencing token do odrzucenia wyniku spóźnionego workera. Writer Memory nie nadpisuje plików Obsidian z innego adaptera bez ustalenia własności i wersji. Worker zapisuje artefakt w swoim workspace, a publikacja wyniku wymaga verifiera i resource claim.

Własność starego stanu jest rozdzielona: core.js/localStorage, store.js/IndexedDB, workflow_engine.py/pliki. Nowy Core nie importuje tych magazynów automatycznie. Adapter migracji musi mieć format, backup, test porównawczy i rollback.

## Interfejsy odpowiedzialności

Core→Hermes: task snapshot i plan request. Hermes→Core: plan proposal. Core→Agent/Bridge: immutable brief i tool invocation. Bridge→Core: receipt. Core→Memory: record z provenance. Core→Event Bus→UI: committed event i snapshot. Dokładne kontrakty określa [rejestr](04-API-AND-EVENT-CONTRACTS.md).
## Living AI Desktop — uszczegółowienie granic (projekt 2026-10-11)

Nie dodajemy nowych właścicieli task state ani równoległego event busa. Ta sekcja doprecyzowuje **już istniejące** moduły z tabeli:

| Istniejący module_id | Dodatkowa odpowiedzialność Living Desktop | Czego nie może robić |
| --- | --- | --- |
| core | autorytatywny snapshot, revision, event sequence, dowody | renderować HUD i przechowywać układu okien |
| event-bus | fan-out utrwalonych eventów, cursory i replay adaptera | aktualizować task.status poza Core |
| desktop | składać projekcje zdarzeń/telemetrii, zarządzać dock, oknami, trybem UI | oznaczać ukończenia i wykonywać bezpośrednio narzędzi |
| mobile | konsumpcja tej samej projekcji, kompaktowy układ i komendy | zakładać dostępny zalogowany pulpit Windows |
| orb | wyłącznie efemeryczna animacja stanów; reduced motion | emitować fakty, receipts i zapisywać lifecycle |
| bridge | capabilities Desktop i receipts ze źródła skutków | uznawać animację/klik za dowód sukcesu |
| workflow | zależności kroków i verifier, zgodnie z Core | własny globalny task log |
| memory | semantyczny kontekst i provenance | udawać historię prób i receipts |

Trzy rozdzielone strumienie: (1) **committed task events** przez Core/event-bus, (2) **health/telemetry** ze znanym źródłem/czasem świeżości, (3) **local view preferences** zapisane przez klienta. Własność każdej nowej zmiennej musi należeć dokładnie do jednej z tych kategorii. Renderery nie mają prawa do własnej kopii autorytatywnego stanu. Stare localStorage/IndexedDB podlegają planowanej migracji i testom porównawczym, nie automatycznemu importowi.

# Roadmapa i bramki

| Faza | Zależności i zakres | Dowód do wyjścia | Rollback |
| --- | --- | --- | --- |
| 0 | Audyt remote/local, dokumenty, testy i konflikty | CI, manifest, zachowanie lokalnych zmian, runtime evidence/unverified | stare repo i dane nienaruszone |
| 1 | Spec/plan Core; wyniki fazy 0 | task lifecycle, event log, duplicate commands, recovery fixtures | nowy Core wyłączony, stary system samodzielny |
| 2 | Core i rejestr kontraktów; Bridge/tools adapters | schema, receipts, timeout unknown, reconciliation | wyłącz adapter; zachowaj receipts |
| 3 | Core i ownership pamięci | eksport/import, provenance, TTL, scope, odczyt backupu | przywróć zweryfikowany snapshot; stary writer |
| 4 | Core, adapters, pamięć; workflow i agenci | lease expiry, fencing, delegacja, failed-test repair, budżety | zatrzymaj nowe lease, zachowaj task log |
| 5 | Hermes i tool catalogue; optional Jev | shadow eval PL, kalibracja i niezawodny fallback | wyłącz Jev; Hermes wykonuje podstawowe zadania |
| 6 | committed events i snapshot/replay; Desktop/Mobile/Orb | reconnect, dostępność, 390x844, real events, performance | wyłącz nowy renderer, stary UI niezależny |
| 7 | osobne specyfikacje laboratoriów | izolowane dane, symulacja/paper trading, provenance | wyłącz lab bez skutków dla Core |

Każda faza 1–7 otrzymuje osobną zatwierdzoną specyfikację, plan, RED/GREEN, review i acceptance gate. Roadmapa nie jest zgodą na implementację.

## Kryteria wejścia w fazę 1

Wymagane: spójne dokumenty master; zielone walidatory i testy; każdy krytyczny moduł ze ścieżką/SHA/status; konflikty z jawnymi decyzjami; brak publikowanych sekretów; aktualny lokalny manifest i odzyskiwalne niezapisane zmiany albo formalnie zatwierdzona zmiana bramki. Sama adnotacja unverified nie jest takim zatwierdzeniem.

Można przygotować projekt specyfikacji lifecycle bez dostępu live. Lokalna bramka została spełniona dowodem E-10: manifest i odtworzenie kodu/Git. Nie rozpoczynamy implementacji ani migracji kodu/danych bez zatwierdzonej specyfikacji i planu fazy 1. Ignorowane dane runtime potrzebują osobnej bramki fazy 3. Jev optional i brak nowego UI nie blokują zaprojektowania Core.

## Obserwacja i wycofanie

Migracja jest przełączana na jedną zdolność. Nowy i stary writer nie działają równocześnie na tych samych danych. Porównanie baseline→target obejmuje dane i skutki, nie tylko wygląd. W razie regresji zatrzymujemy nowy writer, rozstrzygamy skutki, odtwarzamy backup i wracamy do starej zdolności. Usunięcie starego kodu jest osobnym zadaniem po obserwacji.

## Przygotowanie fazy 1

[Projekt lifecycle Core](../superpowers/specs/2026-10-10-jarvis-core-task-lifecycle-design.md) i [plan wykonania](../superpowers/plans/2026-10-10-jarvis-core-task-lifecycle.md) są draft. Opisują izolowany prototyp, trwały zapis, dedupe, receipt verification i recovery bez powtarzania niepewnego skutku. Nie zmieniają bramki D-005 ani nie zatwierdzają wyboru technologii całego systemu.
## Living AI Desktop — ścieżka wdrożenia zgodna z fazami 0–7 (design 2026-10-11)

Użytkownik zatwierdził **kierunek architektury** local-first Core + żywy read-only pulpit. Specyfikacja szczegółowa znajduje się w istniejącym [02-TARGET-ARCHITECTURE.md](02-TARGET-ARCHITECTURE.md#living-ai-desktop--specyfikacja-projektowa-2026-10-11) i wymaga odrębnego przeglądu przed przygotowaniem planu implementacji tego zakresu.

- **Brama 1:** niezależny Core z task/event/snapshot/replay i restart fixtures; obecny projekt lifecycle pozostaje draft. Żadnego wymagania uruchomienia Orb, React ani Hermesa live w tej fazie.
- **Brama 2:** adaptery Registry/Bridge, receipts i reconciliation z udowodnionym kontrolowanym skutkiem; UI nie jest wymagany.
- **Bramy 3–5:** zachować dotychczasową migrację pamięci, agentów i Jeva, bez dodatkowych właścicieli zadań.
- **Brama 6:** dopiero tutaj zintegrowany Living Desktop, Process Log, telemetria, Orb i mobile; weryfikować real events, snapshot/replay, scenariusze bez karty, ograniczony ruch i 390×844.
- **Brama 7:** dopiero po osobnych projektach laboratoria, Semantic Zoom i cyfrowy bliźniak. Prototypy wizualne na fixtures nie są dowodem integracji.

Rollback GUI oznacza wyłączenie nowego renderera przy zachowaniu zapisów Core. Rollback adaptera wymaga rozstrzygnięcia niepewnych efektów przed przełączeniem writer; never dual-writer. Dokumentacja Live Desktop nie oznacza zgody na merge, implementację ani migrację starego repo.

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

Można przygotować projekt specyfikacji lifecycle bez dostępu live. Nie rozpoczynamy implementacji ani kopiowania kodu/danych, dopóki bramka nie przejdzie. Faza 0 pozostaje partial/blocked w zakresie lokalnego baseline. Jev optional i brak nowego UI nie blokują zaprojektowania Core.

## Obserwacja i wycofanie

Migracja jest przełączana na jedną zdolność. Nowy i stary writer nie działają równocześnie na tych samych danych. Porównanie baseline→target obejmuje dane i skutki, nie tylko wygląd. W razie regresji zatrzymujemy nowy writer, rozstrzygamy skutki, odtwarzamy backup i wracamy do starej zdolności. Usunięcie starego kodu jest osobnym zadaniem po obserwacji.

# Stan projektu — faza 0

Status: **partial / blocked formal acceptance**. Wykonano cały dostępny zakres siedmiu zadań. Nowy Core, backend i frontend: planned, nie zaimplementowane.
Data: 2026-10-10. Gałąź: feat/phase0-audit. [PR #1](https://github.com/majkel2403/JarvisAIO/pull/1).

## Co wykonano

| Zadanie planu | Wynik dostępnego zakresu | Ograniczenie |
| --- | --- | --- |
| 1 | read-only Git manifest, redakcja, upstream metadata, index fingerprints, Unicode/rename/worktree i error tests | lokalny HEAD/worktree/dirty baseline unverified |
| 2 | read-only PowerShell inspector i allowlisted fixture; zabezpieczony prywatny output | Windows/Hermes live oraz PS 5.1 unverified |
| 3 | current state, źródła prawdy, SHA, evidence index i gateway conflict | lokalne zmiany oraz ich recovery snapshots unverified |
| 4 | kompletna wizja, trzy MVP scenarios, architektura i module ownership | docelowe zdolności planned |
| 5 | API/events, receipts, dedupe, delegacja, leases, persistence i recovery | docelowe kontrakty planned |
| 6 | 16-module matrix, pełny remote source inventory, validator i roadmapa | migracja kodu/data nie rozpoczęta |
| 7 | AGENTS, acceptance gate, status, README, docs/security validators, Actions i niezależny review | formalne complete blokuje lokalny baseline |

## Testy i dowody

[Run po poprawkach review](https://github.com/majkel2403/JarvisAIO/actions/runs/38074893649).
Testowany kod fazy 0: 804de815012ba3d5488dad42bbd3268bacfddf40.
Baseline starego kodu: 9713065f4489a168f3b0cf041ee8fd9c9f84eb94.

- Faza 0: **34 pass, 0 fail, 0 skipped** na Linux i Windows.
- Walidatory docs, matrix i public data: exit 0 na obu systemach.
- Committed PR diff whitespace check: exit 0.
- Stare Node unit: **369 pass / 0 fail**.
- Python unit: **32 pass / 3 deselected integrations**.
- Web-agent: **2 pass / 12 skipped**, brak vendor jev-voice-browser.
- Typecheck i generated catalogs: exit 0.
- Smoke Chromium: exit 0, końcowy job success. Cały run ma 6/6 jobs success.

Pełne komendy, daty, SHA, exit codes i review: [EVIDENCE-INDEX](EVIDENCE-INDEX.md).
Wcześniejsze RED runs nie są ukryte: regresje najpierw wykazały błędy, które naprawiono. Brak Critical w review. Important poprawione i objęte RED→GREEN: read-only index, ignored output/symlink guard, matrix status/source/decision oraz malformed types. Minor: PR opis, committed diff check i zapis dowodów uaktualnione. Odłożone usterki review: brak.

## Niezweryfikowane i blokery

- Lokalny HEAD, branch, worktrees, relacja z origin, niezapisane zmiany i odzyskiwalne snapshoty: brak dostępu w dozwolonym GitHub-only zakresie. Historyczne fb74cb1 i 19 zmian nie są aktualnym pomiarem.
- Hermes live, Windows, gateway identity/profile, autostart, Hermes cron, Telegram i Obsidian vault unverified.
- 12 skipped web-agent tests i 3 wyłączone integracje Pythona nie są zaliczone jako pass.
- Pełny audit historii/binariów i ustawień GitHub unverified; public data check jest heurystyczny.
- Docelowe API, autonomia i nowy Core są planned, bez deklaracji działania.

## Rulings i koszt

1. GitHub branch/Actions zastępują lokalny worktree wyłącznie w dostępnym audycie; koszt: brak formalnego lokalnego baseline.
2. RED commits na draft PR umożliwiają Actions; koszt: przejściowo czerwone runs, main pozostaje nienaruszony.
3. Istniejących testów Task 1 nie kasujemy, żeby udawać brak eksportu. Dodano rzeczywiste regresje i obserwowano RED→GREEN; koszt: oryginalny RED z poprzedniej sesji pozostaje unverified.
4. Stary kod testujemy na immutable izolowanym checkout; koszt: wyniki nie dowodzą stanu komputera użytkownika.
5. Istniejące szkice aktualizujemy w miejscu; nie tworzono duplikatów. [Dziennik](DECISION-LEDGER.md).

## Czy można zacząć fazę 1?

**Można przygotować osobną specyfikację lifecycle. Nie można jeszcze rozpocząć implementacji Jarvis Core.**
Brakuje lokalnego manifestu i dowodu odzyskiwalności niezapisanych zmian, wymaganych przez zatwierdzony fundament. unverified nie zastępuje dowodu i nie jest zgodą na obejście bramki. Jev optional; UI nie jest właścicielem trwałego task state.

Jedno następne zadanie poza bieżącym zakresem: uzyskać bezpieczny lokalny manifest i potwierdzenie zachowania zmian w osobno dozwolonym środowisku. Ten checkpoint nie uruchamia operacji Windows ani nie wymaga kolejnej decyzji w tej sesji.

PR pozostaje draft, bez merge. Main JarvisAIO i stary Jarvis nie zostały zmienione.

## Kontynuacja — projekt fazy 1

Przygotowano [draft specyfikacji Core](../superpowers/specs/2026-10-10-jarvis-core-task-lifecycle-design.md) i [draft planu](../superpowers/plans/2026-10-10-jarvis-core-task-lifecycle.md). Zakres: lifecycle, SQLite transaction proposal, dedupe, receipts, replay i restart fixtures. Żaden krok implementacyjny nie został wykonany. Wybór runtime/storage jest propozycją do zatwierdzenia, nie decyzją master. D-005 oraz unverified zakres fazy 0 pozostają bez zmian. Niezależny review: brak Critical; trzy Important poprawiono w spec/plan (applied bez ponownego wykonania, pełna macierz receipts/cancel, reconciliation związana z attempt). Minor doprecyzowano: kolejność odczytu dedupe/zapisu, deadline metadata, event types i checkpoint. To review dokumentacji, nie dowód działania Core. Wyniki Actions dla końcowego SHA są w PR.

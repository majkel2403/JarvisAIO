# Stan projektu — faza 0

Status: **partial / blocked formal acceptance**. Nowy Core, backend i frontend: planned, nie zaimplementowane.
Data: 2026-10-10. Gałąź: feat/phase0-audit. [PR #1](https://github.com/majkel2403/JarvisAIO/pull/1).

| Zadanie planu | Wykonany zakres | Dowód / ograniczenie |
| --- | --- | --- |
| 1 | manifest, redakcja remote, rename/worktree, Unicode CLI, missing repo | RED 4/6 → GREEN 6/6 w Actions; lokalny manifest unverified |
| 2 | read-only PowerShell i allowlisted fixture | RED brak skryptu → GREEN 7/7; live Windows unverified |
| 3 | current state, źródła, konflikt 8642/8643 | RED 7 pass/2 fail → następny run 9 pass; lokalne zmiany unverified |
| 4 | wizja, MVP, architektura i module ownership | RED 9 pass/2 fail → następny run 11 pass; wszystkie zdolności planned |
| 5 | API/event boundaries i autonomy design | RED 11 pass/2 fail → następny run 13 pass |
| 6 | 16-row matrix, pinned source inventory, validator i roadmapa | test-first i implementacja zapisane; final CI pending |
| 7 | AGENTS, acceptance/status i docs validator | test-first i implementacja zapisane; final CI/review pending |

## Dowody

[Indeks](EVIDENCE-INDEX.md) zawiera RED/GREEN i źródła. [Baseline](https://github.com/majkel2403/JarvisAIO/actions/runs/38074228011): Node unit 369 pass, web-agent 2 pass/12 skipped; Python 32 pass/3 deselected; typecheck/generated catalogs i browser smoke pass. To izolowany remote commit, nie aktualny komputer użytkownika.

Końcowe CI i niezależny review są jeszcze pending; ten checkpoint nie oznacza zakończenia.

## Blokery i niezweryfikowany zakres

- Brak dostępu w autoryzowanym GitHub-only zakresie do lokalnego HEAD, worktree, dirty files i odzyskiwalnych snapshotów. Historyczne fb74cb1 i 19 zmian nie zastępują świeżego manifestu.
- Hermes live, Windows, gateway/profile, autostart, cron, Telegram i Obsidian vault unverified.
- Web agent: 12 skipped z powodu brakującego jev-voice-browser vendor; Python: 3 deselected integracje. Live acceptance nie przeprowadzono.
- Pełny security audit historii, binariów i konfiguracji GitHub unverified; nowy skan jest heurystyczny.

## Rulings i koszt

GitHub branch/Actions zastępują lokalny worktree tylko w zakresie dostępnego audytu; koszt: formalne complete pozostaje zablokowane. RED commits są publikowane na draft PR w celu uruchomienia CI; koszt: przejściowe czerwone runs. Istniejące szkice aktualizowane w miejscu. Stary baseline immutable i isolated; bez zmian starego repo. Pełny dziennik: [DECISION-LEDGER](DECISION-LEDGER.md).

## Faza 1

Można przygotować jej osobną specyfikację. **Nie można jeszcze rozpocząć implementacji Jarvis Core**: lokalny baseline/recovery gate nie jest spełniony, final CI/review pending. Nie ma zgody na ominięcie tej bramki.

Jedno następne zadanie po tej pracy: uzyskać bezpieczny lokalny manifest i potwierdzenie zachowania niezapisanych zmian w osobnym, dozwolonym zakresie. Ten wpis nie wymaga działania użytkownika w bieżącej sesji i nie uruchamia operacji Windows.

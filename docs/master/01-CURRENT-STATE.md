# Stan obecny — 2026-10-10

captured_at: 2026-10-10T18:00:00Z
source_repo: https://github.com/majkel2403/Jarvis-
head_sha: 9713065f4489a168f3b0cf041ee8fd9c9f84eb94
verification_status: verified (wyłącznie zawartość zdalnego commitu)
evidence_ref: [Indeks dowodów](EVIDENCE-INDEX.md)

## Zakres dowodu

GitHub API potwierdziło zdalny main i pełne drzewo (truncated=false). Ten SHA nie jest lokalnym fb74cb1 z historycznej specyfikacji. Lokalne HEAD, branch, worktree, relacja z origin, niezapisane zmiany i ich odzyskiwalne snapshoty: **unverified**, brak dostępu w dozwolonym zakresie. Historyczne „19 zmian” nie jest aktualnym pomiarem.

| Teza | Źródło w zamrożonym commicie | Status |
| --- | --- | --- |
| Stan główny i okna zapisują się przez localStorage | [js/core.js](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/js/core.js) | verified: analiza kodu, runtime unverified |
| Większe dane używają IndexedDB z fallback localStorage | [js/store.js](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/js/store.js) | verified: analiza kodu |
| Workflow zapisuje run do pliku, ma resume_pending | [bridge/workflow_engine.py](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/bridge/workflow_engine.py) | verified: analiza kodu, restart unverified |
| Wtyczka wysyła zdarzenia przez kolejkę w pamięci i może je zgubić | [jarvis-events](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/hermes/plugins/jarvis-events/__init__.py) | verified: analiza kodu |
| Bridge udostępnia proxy czatu, SSE i wynik narzędzia | [bridge/jarvis_bridge.py](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/bridge/jarvis_bridge.py) | verified: deklaracje w kodzie, endpointy live unverified |
| Obsidian context jest osobną wtyczką | [obsidian-brain](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/hermes/plugins/obsidian-brain/__init__.py) | verified: kod obecny, instalacja i vault unverified |
| Nowy Core istnieje i wykonuje zadania | brak implementacji w JarvisAIO | planned |

## Runtime i testy

Hermes, Windows, Telegram, gateway identity/health, porty, autostart i Hermes cron: **unverified**. Fixture runtime na runnerze nie jest inspekcją komputera użytkownika. Otwarte gniazdo nie potwierdza tożsamości procesu.

Testy fazy 0 wykonuje GitHub Actions na izolowanych runnerach Linux i Windows. Pierwsze 2 testy istniejącego PR przeszły; dodane regresje najpierw wykazały błędy local remote i Unicode CLI, następnie 6/6 przeszło. Task 2: 7/7 z fixture przeszło. Cały workflow nadal czerwony, ponieważ walidatory kolejnych zadań jeszcze nie istnieją. Końcowy checkpoint: [status](09-PROJECT-STATUS.md).

Stare W1–W5 z [17-wdrozenie](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/docs/spec/17-wdrozenie.md) są historycznym planem UI, nie fazami nowej migracji. JSDoc/tsc bez bundlera z [TS-MIGRATION](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/docs/TS-MIGRATION.md) dotyczy starego UI, nie wyboru technologii nowego Core.

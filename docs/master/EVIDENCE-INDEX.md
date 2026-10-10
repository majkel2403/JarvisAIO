# Indeks dowodów

Data inspekcji: 2026-10-10. Repo source: majkel2403/Jarvis-. Baseline code SHA: 9713065f4489a168f3b0cf041ee8fd9c9f84eb94.
[Pełne drzewo źródła](https://github.com/majkel2403/Jarvis-/tree/9713065f4489a168f3b0cf041ee8fd9c9f84eb94).

## Dowody i ich granice

- E-01: [PR #1](https://github.com/majkel2403/JarvisAIO/pull/1): wyłącznie feat/phase0-audit; main i stary projekt nie są celem zapisu.
- E-02: [RED regresji manifestu](https://github.com/majkel2403/JarvisAIO/actions/runs/38073782155): 4 pass, 2 fail (Windows remote, CLI URL).
- E-03: [GREEN manifestu](https://github.com/majkel2403/JarvisAIO/actions/runs/38073820733): node --test 6 pass, 0 fail; późniejszy krok brakującego validate-docs fail.
- E-04: [RED runtime](https://github.com/majkel2403/JarvisAIO/actions/runs/38073836032): brak skryptu, 6 pass, 1 fail.
- E-05: [GREEN runtime fixture](https://github.com/majkel2403/JarvisAIO/actions/runs/38073886758): node --test 7 pass, 0 fail; brak validate-docs nadal powodował czerwony workflow.
- E-06: [stan obecny](01-CURRENT-STATE.md) zawiera odnośniki do kodu i rozróżnia inspekcję kodu od działania.
- E-07: runtime-unification dostępny na dokumentacyjnej gałęzi starego repo, SHA e4ae04e07a4c6a02b024434ae22d2d723cf3309a; nie jest częścią starego main baseline.
- E-08: początkowy zakres GitHub-only nie obejmował local/live; lokalny baseline/recovery został później zweryfikowany w E-10. Hermes health/Telegram live nadal unverified.
- E-09: końcowe wyniki i linki do runów są utrzymywane w [statusie](09-PROJECT-STATUS.md).

## Bezpieczeństwo publikacji

Raporty live tylko artifacts/audit-private (ignorowany). Nigdy publikuj wartości sekretów, task actions, command line, treści prywatnych plików lub zrzutów użytkownika. Publiczne metadane mają allowlistę. Testy używają wyłącznie sztucznych credentiali. Skan automatyczny będzie heurystyczny: brak trafienia nie dowodzi braku każdego sekretu w historii repo. Historia, binaria, konfiguracja kont i stare prywatne pliki: unverified.

## Końcowy zapis weryfikacji — 2026-10-10

Testowany kod fazy 0: **804de815012ba3d5488dad42bbd3268bacfddf40**.
Baseline starego kodu: **9713065f4489a168f3b0cf041ee8fd9c9f84eb94**.
[Run po poprawkach review](https://github.com/majkel2403/JarvisAIO/actions/runs/38074893649).

| Komenda | Repo/SHA | Data UTC / środowisko | Exit | Wynik |
| --- | --- | --- | --- | --- |
| node --test | JarvisAIO / 804de815012ba3d5488dad42bbd3268bacfddf40 | 2026-10-10 18:13:21 / Linux Node 22 | 0 | 34 pass, 0 fail, 0 skipped |
| node --test | JarvisAIO / 804de815012ba3d5488dad42bbd3268bacfddf40 | 2026-10-10 18:13:34 / Windows Node 22, pwsh | 0 | 34 pass, 0 fail, 0 skipped |
| node tools/audit/validate-docs.mjs | JarvisAIO / 804de815012ba3d5488dad42bbd3268bacfddf40 | 2026-10-10 / Linux i Windows | 0 | required files, links, negative fixtures |
| node tools/audit/validate-matrix.mjs docs/master/migration-matrix.json | JarvisAIO / 804de815012ba3d5488dad42bbd3268bacfddf40 | 2026-10-10 / Linux i Windows | 0 | 16 modułów, źródła, statusy, decisions |
| node tools/audit/validate-public-data.mjs | JarvisAIO / 804de815012ba3d5488dad42bbd3268bacfddf40 | 2026-10-10 / Linux i Windows | 0 | heuristic tracked-text scan; no private artifacts tracked |
| git diff --check base-SHA HEAD | JarvisAIO / 804de815012ba3d5488dad42bbd3268bacfddf40 | 2026-10-10 / Linux i Windows | 0 | rzeczywisty committed diff względem PR base |
| node --test tests/unit/*.test.js | Jarvis- / 9713065f4489a168f3b0cf041ee8fd9c9f84eb94 | 2026-10-10 18:13:37 / Linux Node 22 | 0 | 369 pass, 0 fail, 0 skipped |
| node --test integrations/tests/web-agent.test.mjs | Jarvis- / 9713065f4489a168f3b0cf041ee8fd9c9f84eb94 | 2026-10-10 18:13:37 / Linux | 0 | 2 pass, 12 skipped — missing vendor |
| python -m pytest -m unit -v | Jarvis- / 9713065f4489a168f3b0cf041ee8fd9c9f84eb94 | 2026-10-10 / Windows Python 3.11 | 0 | 32 pass, 3 deselected integrations |
| npm run typecheck | Jarvis- / 9713065f4489a168f3b0cf041ee8fd9c9f84eb94 | 2026-10-10 / Linux | 0 | tsc --noEmit |
| node bridge/export-tools.js; node tools/gen-spec.js; git diff --exit-code -- bridge/tools.json docs/spec | Jarvis- / 9713065f4489a168f3b0cf041ee8fd9c9f84eb94 | 2026-10-10 / Linux isolated copy | 0 | generated catalogs unchanged |

| node tests/e2e/smoke.js http://localhost:8090 | Jarvis- / 9713065f4489a168f3b0cf041ee8fd9c9f84eb94 | 2026-10-10 / Linux Chromium, isolated static server | 0 | smoke passed; no live Hermes |

## Review i RED→GREEN

Niezależny reviewer zbadał cały zakres PR względem spec/plan na 9851cfb46c96116d915bc2fd1165672590431142. Nie znalazł Critical. Important: opcjonalny zapis indeksu Git, publikowalna ścieżka audit-private, niedostateczna walidacja matrix evidence/status/decision. Dodatkowo malformed fields powodowały exception.

[RED reprodukcji](https://github.com/majkel2403/JarvisAIO/actions/runs/38074748979), SHA ff59f09c7d55e39097b985c62ff8dbcace98a81b: node --test exit 1, 26 pass / 8 fail.
GREEN po fix: powyższy run, 34 pass / 0 fail na obu systemach.

Regresje: repo-read-only-preserves-index-bytes; repo-cli-rejects-unignored-audit-private-path; runtime-cli-rejects-unignored-audit-private-path; repo-cli-rejects-private-directory-symlink; matrix-invalid-verification-status-and-unpinned-evidence; matrix-malformed-types-never-throw; index fingerprints; nonzero unverified CLI.

Minor review zostały uwzględnione w wymaganym zakresie: committed diff check, aktualizacja PR i kompletny zapis dowodów. Nie ma odłożonych usterek kodu z review. Weryfikacja testów nie zastępuje niedostępnego lokalnego baseline.

Manifest publicznego drzewa JarvisAIO po poprawkach: 34 pliki, truncated=false, 0 plików artifacts/audit-private w Git. Main JarvisAIO nadal 2675baa009460d95c807efdcafa1e515df07f6f4; main Jarvis- nadal 9713065f4489a168f3b0cf041ee8fd9c9f84eb94 (sprawdzono przez GitHub API).

## E-10 — lokalny baseline i scoped recovery, 2026-10-10

Upoważnienie: punkt 1 użytkownika, Remote Desktop Commander; stare repo read-only. Audited scripts pochodzą z JarvisAIO SHA 7b0a70b2e848df82e90d134411620b0d422d0991; Node v24.13.0, Git 2.53.0.windows.1, Windows PowerShell 5.1.26100.9549.
Repo CLI exit 0: captured_at 18:38:25 UTC, HEAD fb74cb16ac65e90b6bb847d28e7e86c97b5c7ede, auto/nowa-petla-2026-10-09, 10 modified/9 untracked, 244 index entries. Upstream absent: relation unverified. Explicit HEAD comparison: 8 ahead/0 behind cached origin/main 9713065f4489a168f3b0cf041ee8fd9c9f84eb94; no fetch.
Trzy worktrees: główny HEAD powyżej; hermes cleanup ec89a237102b3671eb8b73ee46726d7dbb7e615c; migration spec e4ae04e07a4c6a02b024434ae22d2d723cf3309a. Dodatkowe worktrees clean.

Private recovery captured 18:39:00 UTC; final checks 18:42:12 UTC. Bundle SHA256 331a401fac388e72408bbb2c83a9bbf9b1d2ef294ea34ce5549dd926457b2ba7; 2263223 bytes. Pliki snapshotów: 253/236/245. Backup/restore verification exit 0.
Metoda: git --no-optional-locks status --porcelain=v1 -z --untracked-files=all, ls-files --cached --others --exclude-standard -z, HEAD/index SHA256, snapshot kopii regular files i markerów deletion. git bundle create --all do prywatnej kopii, bundle verify oraz porównanie all named refs z list-heads. git clone --no-checkout bundle do trzech osobnych restore copies; przywrócono HEAD/index i snapshot plików. Porównano wszystkie file hashes oraz pełny status -z. Każdy indeksowy blob object dostępny w restore.
Źródło po kopii: HEAD/index/status/refs/content hashes i kompletny path inventory zgodne. Nie stosowano reset/clean/stash ani checkout starego repo. Brak links/junctions/special entries; brak active merge/rebase/sequencer. Pierwsza dodatkowa kontrola odrzuciła REBASE_HEAD jako possible operation; zbadano brak rebase dirs i zachowano cztery dostępne REBASE_HEAD/ORIG_HEAD metadata files z hashami oraz commit object verification. Nie ukryto tej nieudanej kontroli.

Runtime CLI exit 0, captured 18:38:30 UTC: sockets 4000/8651/8642 listening, 8643 absent; 7 scheduled task metadata records (3 Hermes/4 Jarvis). gateway health/profile identity, Hermes cron, Telegram, Obsidian i task correctness unverified. Nie zmieniono konfiguracji i usług.
Granica: reachable refs + indeksy + tracked/nonignored-untracked files oraz zachowane pseudorefs. Ignorowane dane runtime, pełny vault, unreachable Git objects, reflog/cała konfiguracja Git i odzyskiwanie urządzenia poza zakresem. Nie jest to gotowy data-migration backup; faza 3 musi zrobić własny snapshot/test odczytu przed zapisem.
Prywatne dowody znajdują się na komputerze w katalogu backupu o suffixie 20261010-203721, pliki verification.json, metadata-proof.json, refs.txt, snapshot-*/state.json/files.json/repo.json i restore-test copies. Żadnych raw paths, plików lub historii backupu nie opublikowano. Wyniki końcowego CI dla tego checkpointu dokumentów i full SHA w PR #1.

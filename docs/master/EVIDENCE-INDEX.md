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
- E-08: lokalne HEAD/worktree/dirty files, recovery snapshots, Hermes/Telegram/Windows live: unverified, nie zbadano.
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

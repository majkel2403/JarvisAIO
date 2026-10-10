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

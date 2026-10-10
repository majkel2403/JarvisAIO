# Dziennik decyzji i konfliktów

Hierarchia faktów: świeży test/inspekcja > kod w pełnym SHA > historyczny opis. Hierarchia celu: zatwierdzona specyfikacja/ADR > plan > makieta.

| decision_id | sources | preferred_rule | status |
| --- | --- | --- | --- |
| D-001 | [spec gateway 8642](https://github.com/majkel2403/Jarvis-/blob/e4ae04e07a4c6a02b024434ae22d2d723cf3309a/docs/superpowers/specs/2026-10-07-hermes-runtime-unification-design.md), [bridge/restart-gateway.ps1 8643](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/bridge/restart-gateway.ps1) | Docelowo jeden host 8642; 8643 diagnostyczny/historyczny. Nie zmieniamy runtime. | open: stan live unverified |
| D-002 | [core.js](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/js/core.js), [spec fundamentu](../superpowers/specs/2026-10-10-jarvis-migration-foundation-design.md) | Core owns durable task state; UI owns view state. | resolved-with-evidence: granica projektu, wdrożenie planned |
| D-003 | [ADR 0005](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/docs/adr/0005-niepewny-jev-oddaje-hermesowi.md), spec fundamentu | Jev optional, fallback Hermes; brak Jeva nie blokuje MVP. | resolved-with-evidence: docelowa decyzja |
| D-004 | [TS-MIGRATION](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/docs/TS-MIGRATION.md), plan fazy 0 | Stary UI zostaje JSDoc; nie wybieramy frameworka ani bazy nowego Core. | resolved-with-evidence |
| D-005 | spec sekcja 10, plan Acceptance Gate | Lokalny manifest i zachowanie niezapisanych zmian nadal wymagane do formalnego complete. unverified nie zastępuje dowodu. | open |
| D-006 | status „do przeglądu” w spec/plan, instrukcja wykonania użytkownika 2026-10-10 | Bieżące polecenie upoważnia fazę 0; brak zgody na implementację Core, merge lub zmianę starego repo. | resolved-with-evidence |

## Rulings wykonawcy

- GitHub-only: zamiast lokalnego worktree używamy izolowanej gałęzi feat/phase0-audit i runnerów; lokalna inspekcja pozostaje unverified. Koszt: formalna bramka pozostaje częściowa.
- Commity testów RED są konieczne, aby Actions wykonał kod; wymóg „push tylko po green” zastępujemy oznaczeniem test-first i draft PR. Koszt: przejściowo czerwone CI, bez zmian main.
- Istniejących szkiców 00 i 02 nie dublujemy. Aktualizujemy je w miejscu.
- Baseline starego kodu jest uruchamiany na immutable SHA w osobnym checkout, bez konfiguracji i sekretów użytkownika; ewentualne jego błędy raportujemy, starego repo nie poprawiamy.

## Końcowy review — 2026-10-10

Independent review: no Critical. Important naprawiono po reprodukcji: Git optional index locks, private output outside ignored root/symlink escape, verification_status/evidence/decision validation. Malformed matrix fields również objęte regresją. [Dowody RED→GREEN](EVIDENCE-INDEX.md): 26 pass/8 fail → 34 pass/0 fail na obu systemach.

CLI outputs są dopuszczone tylko wewnątrz ignorowanego artifacts/audit-private względem bieżącego repo; git check-ignore jest wymagany, symlink/reparse escape odrzucony. Manifest używa --no-optional-locks i hashy indeksu bez odczytu working-tree contents. Brak upstream nie jest dowodem synchronizacji. Index hashes nie są backupem niezapisanych zmian.

Ruling: nie kasujemy istniejącej implementacji Task 1 tylko po to, by symulować brak eksportu. Wykonano rzeczywiste regresje RED→GREEN; oryginalny RED poprzedniej sesji pozostaje unverified. Koszt: nie odtwarzamy historycznego TDD, ale dowodzimy aktualne behavior.

Minor review uwzględniono w wymaganym zakresie PR/status/evidence oraz committed diff check. Brak odłożonych usterek review. Rulings nie rozszerzają zgody na Core, merge lub stare repo.

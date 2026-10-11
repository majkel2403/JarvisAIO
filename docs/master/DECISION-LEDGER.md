# Dziennik decyzji i konfliktów

Hierarchia faktów: świeży test/inspekcja > kod w pełnym SHA > historyczny opis. Hierarchia celu: zatwierdzona specyfikacja/ADR > plan > makieta.

| decision_id | sources | preferred_rule | status |
| --- | --- | --- | --- |
| D-001 | [spec gateway 8642](https://github.com/majkel2403/Jarvis-/blob/e4ae04e07a4c6a02b024434ae22d2d723cf3309a/docs/superpowers/specs/2026-10-07-hermes-runtime-unification-design.md), [bridge/restart-gateway.ps1 8643](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/bridge/restart-gateway.ps1) | Docelowo jeden host 8642; 8643 diagnostyczny/historyczny. Nie zmieniamy runtime. | open: stan live unverified |
| D-002 | [core.js](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/js/core.js), [spec fundamentu](../superpowers/specs/2026-10-10-jarvis-migration-foundation-design.md) | Core owns durable task state; UI owns view state. | resolved-with-evidence: granica projektu, wdrożenie planned |
| D-003 | [ADR 0005](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/docs/adr/0005-niepewny-jev-oddaje-hermesowi.md), spec fundamentu | Jev optional, fallback Hermes; brak Jeva nie blokuje MVP. | resolved-with-evidence: docelowa decyzja |
| D-004 | [TS-MIGRATION](https://github.com/majkel2403/Jarvis-/blob/9713065f4489a168f3b0cf041ee8fd9c9f84eb94/docs/TS-MIGRATION.md), plan fazy 0 | Stary UI zostaje JSDoc; nie wybieramy frameworka ani bazy nowego Core. | resolved-with-evidence |
| D-005 | spec sekcja 10, plan Acceptance Gate | Lokalny manifest i test odtworzenia trzech worktree: E-10. unverified nie zastępuje dowodu; ignorowane dane runtime poza kopią. | resolved-with-evidence |
| D-006 | status „do przeglądu” w spec/plan, instrukcja wykonania użytkownika 2026-10-10 | Bieżące polecenie upoważnia fazę 0; brak zgody na implementację Core, merge lub zmianę starego repo. | resolved-with-evidence |

## Rulings wykonawcy

- Historyczny GitHub-only ruling, zastąpiony w zakresie lokalnym przez E-10: zamiast lokalnego worktree używamy izolowanej gałęzi feat/phase0-audit i runnerów; lokalna inspekcja pozostaje unverified. Koszt: formalna bramka pozostaje częściowa.
- Commity testów RED są konieczne, aby Actions wykonał kod; wymóg „push tylko po green” zastępujemy oznaczeniem test-first i draft PR. Koszt: przejściowo czerwone CI, bez zmian main.
- Istniejących szkiców 00 i 02 nie dublujemy. Aktualizujemy je w miejscu.
- Baseline starego kodu jest uruchamiany na immutable SHA w osobnym checkout, bez konfiguracji i sekretów użytkownika; ewentualne jego błędy raportujemy, starego repo nie poprawiamy.

## Końcowy review — 2026-10-10

Independent review: no Critical. Important naprawiono po reprodukcji: Git optional index locks, private output outside ignored root/symlink escape, verification_status/evidence/decision validation. Malformed matrix fields również objęte regresją. [Dowody RED→GREEN](EVIDENCE-INDEX.md): 26 pass/8 fail → 34 pass/0 fail na obu systemach.

CLI outputs są dopuszczone tylko wewnątrz ignorowanego artifacts/audit-private względem bieżącego repo; git check-ignore jest wymagany, symlink/reparse escape odrzucony. Manifest używa --no-optional-locks i hashy indeksu bez odczytu working-tree contents. Brak upstream nie jest dowodem synchronizacji. Index hashes nie są backupem niezapisanych zmian.

Ruling: nie kasujemy istniejącej implementacji Task 1 tylko po to, by symulować brak eksportu. Wykonano rzeczywiste regresje RED→GREEN; oryginalny RED poprzedniej sesji pozostaje unverified. Koszt: nie odtwarzamy historycznego TDD, ale dowodzimy aktualne behavior.

Minor review uwzględniono w wymaganym zakresie PR/status/evidence oraz committed diff check. Brak odłożonych usterek review. Rulings nie rozszerzają zgody na Core, merge lub stare repo.

## Lokalna bramka — 2026-10-10

D-005 resolved-with-evidence po osobnym poleceniu punktu 1 i wskazaniu Remote Desktop Commander. Ruling: nowe upoważnienie pozwala na odczyt starego repo i kopię poza nim; nie zmienia zakazu edycji źródła, usług, merge ani implementacji Core. Koszt: prywatny bundle i snapshot zajmują miejsce lokalnie, nie obejmują ignorowanych danych runtime ani unreachable objects.
Ruling: CLI uruchomiono w nowym prywatnym audit-context z własnym git init/.gitignore, ponieważ lokalny JarvisAIO stoi na main bez ignorowanej ścieżki. Nie zmieniono jego main ani starego worktree. Surowe raporty tylko ignored artifacts/audit-private; recovery copy poza repo. Zamiast reset/clean/stash wykorzystano odrębne restore-test copies.
Review ujawnił potrzebę kontroli pełnych inventory, junctions i operation metadata. Kontrole wykonane. REBASE_HEAD bez rebase directories zachowano wraz z ORIG_HEAD i sprawdzono możliwość odczytu obiektów; nie usuwano pozostałości.
D-001 nadal open: gniazdo 8642 nasłuchuje, ale owner identity/health unverified. Faza 0 oznacza komplet fundamentu, nie operacyjną akceptację Hermesa ani zgodę na migrację.
## Decyzja projektowa Living AI Desktop — 2026-10-11

- **D-007 — resolved-with-evidence (design direction):** użytkownik zatwierdził Living AI Desktop z **jednym local-first Core**, Hermesem jako planistą, Bridge jako wykonawcą, optional Jev oraz Desktop/Orb jako projekcją rzeczywistych zdarzeń. Źródło projektu: [wizja](00-VISION.md#living-ai-desktop--zatwierdzony-kierunek-2026-10-11) i [architektura](02-TARGET-ARCHITECTURE.md#living-ai-desktop--specyfikacja-projektowa-2026-10-11). Status dotyczy **kierunku**, nie zatwierdzenia szczegółowej specyfikacji ani wdrożenia.
- **D-008 — open (future technology selection):** React + TypeScript jako kandydat frontendowy, Tauri jako opcjonalna obudowa. Ostateczne decyzje zależą od spec/plan fazy 6; prototypowy pin Node.js/SQLite w draft fazy 1 nie przesądza wyboru technologii całego systemu.
- **D-009 — resolved-with-evidence (scope boundary):** nowa specyfikacja Living Desktop dopisuje ustalenia do istniejących dokumentów, nie zastępuje historycznego Phase 0, nie tworzy drugiego Core i nie zmienia bramek faz 1–7. Przygotowanie dokumentów nie jest zgodą na implementację, PR merge ani edycję starego repo.

Te decyzje są opisem zakresu projektowego. Live możliwości nadal wymagają odrębnych pomiarów i testów.

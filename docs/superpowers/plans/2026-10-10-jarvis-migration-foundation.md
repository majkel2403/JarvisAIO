# JarvisAIO Phase 0 — Inventory and Migration Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Przygotować odtwarzalny audyt obecnego Jarvisa i komplet dokumentów sterujących przyszłą migracją, bez zmieniania starego projektu ani aktywnych usług.

**Architecture:** Dwa narzędzia read-only odczytują stan repozytorium i lokalnego runtime, zapisując surowe raporty poza Git. Dokumenty `docs/master/` zawierają wyłącznie zredagowane, udokumentowane ustalenia; osobna macierz JSON i walidatory zapewniają spójność oraz bramki migracji. Ten plan obejmuje **tylko fazę 0**, nie budowę Core.

**Tech Stack:** Git, Node.js >=20 (`node:test`, `node:assert/strict`), PowerShell na Windows, Markdown, JSON. Zero nowych zewnętrznych zależności.

**Spec:** `docs/superpowers/specs/2026-10-10-jarvis-migration-foundation-design.md`, zatwierdzona przez użytkownika 2026-10-10.

## Global Constraints

- Repo docelowe `majkel2403/JarvisAIO`: lokalnie `$HOME/Desktop/JarvisAIO`. Stare repo `$HOME/Desktop/jarvis-` jest wyłącznie źródłem danych. Skrypty przyjmują `--repo`/`-RepoPath`; bez na sztywno zapisanej nazwy użytkownika.
- Historyczny punkt odniesienia: lokalny `fb74cb1`, gałąź `auto/nowa-petla-2026-10-09`, 19 zmian. Na początku wykonania zapisz **aktualne** HEAD, branch, `git status`, worktree i relację z remote; niczego nie zakładaj.
- **Nigdy** nie stosuj `git reset/clean/stash`, przełączania branch, usuwania plików, zmian konfiguracji, cronów, zabijania/restartu usług, wdrożeń lub kopiowania sekretów ze starego projektu.
- Repo na GitHubie jest publiczne. Surowe raporty, ścieżki użytkownika, ślady środowiska, niebezpieczne nazwy plików i wszystkie wartości kluczy pozostają tylko w ignorowanym katalogu `artifacts/audit-private/`. Dokumentacja w Git może zawierać tylko dane po redakcji.
- Stary projekt ma decyzje `docs/adr/`, `docs/spec/` i `docs/TS-MIGRATION.md`. Docelowy gateway z osobnej specyfikacji Hermesa: **8642**, Bridge **8651**, Site **4000**. **8643** jest historyczne/diagnostyczne, nie zakładaj aktualnego stanu bez odczytu.
- Brak dowodu oznaczaj `unverified`, a planowany interfejs `planned`, nigdy `works`. Nie ogłaszaj nowego Core jako gotowego.
- Każda praca: test RED → minimalna zmiana → test GREEN → `git diff --check` → commit → review. Agent nie modyfikuje starego repo.
- Etap kończy się przeglądem wyników. Fazy 1–7 potrzebują nowych, osobnych specyfikacji i planów.

## Review Focus

1. `repo-redacts-secrets`: credential w remote Git lub `.env` nie może znaleźć się w raporcie.
2. `repo-handles-paths`: Unicode, spacje, untracked i kilka worktree dają prawidłowy spis.
3. `runtime-unknown`: offline/brak dostępu do portu daje `unverified`, nie zmyślone `works`.
4. `decision-ledger-sources`: konflikt 8642/8643 ma oba źródła i status rozstrzygnięcia.
5. `matrix-invalid-row` i `docs-broken-link`: brak pola, zły status lub zepsuty link zwraca błąd, nie sukces.

## File Map

| File | Responsibility |
|---|---|
| `tools/audit/repo-manifest.mjs` | bezpieczny, odtwarzalny spis Git |
| `tools/audit/runtime-inspect.ps1` | wyłącznie odczyt usług i portów |
| `tools/audit/validate-matrix.mjs` | strukturalna kontrola macierzy |
| `tools/audit/validate-docs.mjs` | lokalne linki i wymagane dokumenty |
| `tests/audit/*.test.mjs`, `tests/docs/*.test.mjs` | testy regresyjne |
| `tests/fixtures/runtime-minimal.json` | bezpieczna atrapa środowiska |
| `docs/master/00-VISION.md` | cel, granice produktów, MVP |
| `docs/master/01-CURRENT-STATE.md` | fakty, SHA, data, `unverified` |
| `docs/master/02-TARGET-ARCHITECTURE.md` | granice i przepływ komponentów |
| `docs/master/03-MODULE-OWNERSHIP.md` | własność stanu i zależności |
| `docs/master/04-API-AND-EVENT-CONTRACTS.md` | rejestr kontraktów |
| `docs/master/05-AUTONOMY-AND-AGENTS.md` | autonomia i weryfikacja |
| `docs/master/06-MIGRATION-MATRIX.md` | opis macierzy migracji |
| `docs/master/migration-matrix.json` | maszynowe źródło danych macierzy |
| `docs/master/07-MIGRATION-ROADMAP.md` | kolejność, bramki, rollback |
| `docs/master/08-TEST-AND-ACCEPTANCE.md` | wymagane testy i dowody |
| `docs/master/09-PROJECT-STATUS.md` | jedno źródło bieżącego statusu |
| `docs/master/DECISION-LEDGER.md` | rejestr konfliktów spec/ADR |
| `docs/master/EVIDENCE-INDEX.md` | metody i odnośniki do dowodów |
| `AGENTS.md`, `README.md`, `.gitignore` | reguły agentów, nawigacja, wykluczenia |

---

### Task 1: Bezpieczny manifest starego repozytorium

**Files:**
- Create: `tools/audit/repo-manifest.mjs`
- Create: `tests/audit/repo-manifest.test.mjs`
- Modify: `.gitignore` (dodaj `artifacts/audit-private/`)

**Interfaces:**
- `inspectRepository({ repoDir, includeFileHashes = true }): Promise<RepositorySnapshot>`
- `RepositorySnapshot = {captured_at,git_head,branch,remotes_redacted,worktrees,tracked_changes,untracked_changes,status,errors}`
- CLI `node tools/audit/repo-manifest.mjs --repo "C:/path/to/jarvis-" --out artifacts/audit-private/repo.json`

- [ ] **Step 1: RED test `repo-handles-paths`.** Fixture: tymczasowe repo, zapisany commit, Unicode `plik ł.txt`, modyfikacja śledzonego i jeden plik nieśledzony. Asercje: `assert.equal(report.git_head.length,40)` oraz `assert.equal(report.untracked_changes.length,1)`.
- [ ] **Step 2: RED test `repo-redacts-secrets`.** Remote URL `https://alice:FAKE_SECRET@example.org/org/repo` i plik `.env`. Asercja: `assert.equal(JSON.stringify(report).includes("FAKE_SECRET"),false)`; nie czytaj treści sekretu.
- [ ] **Step 3: Run `node --test tests/audit/repo-manifest.test.mjs`.** Expected FAIL: eksport nie istnieje.
- [ ] **Step 4: Implement Git odczyt: `git rev-parse`, `git status --porcelain=v1 -z --untracked-files=all`, `git worktree list --porcelain` i zredagowane remote. Rozróżniaj rename/modified/untracked, brak origin i brak dostępu. Nie zapisuj pełnych ścieżek w publicznych wynikach.
- [ ] **Step 5: Run test GREEN.** Uruchom CLI na starym repo i porównaj `git status --porcelain` przed/po — zero zmian; pełny JSON tylko w ignorowanym katalogu.
- [ ] **Step 6: `git diff --check`, commit `git add .gitignore tools/audit/repo-manifest.mjs tests/audit/repo-manifest.test.mjs`; `git commit -m "feat(audit): add safe Git inventory"`.

### Task 2: Raport lokalnego runtime bez zmian w usługach

**Files:**
- Create: `tools/audit/runtime-inspect.ps1`
- Create: `tests/fixtures/runtime-minimal.json`
- Create: `tests/audit/runtime-inspect.test.mjs`

**Interfaces:**
- CLI: `powershell.exe -NoProfile -File tools/audit/runtime-inspect.ps1 -OutputPath artifacts/audit-private/runtime.json`
- Fixture mode: `-FixturePath tests/fixtures/runtime-minimal.json`.
- Output: `{captured_at,source,ports,gateway_status,jarvis_services,cron_visibility,errors}`, wpisy mają `status: verified|unverified`.

- [ ] **Step 1: RED test `runtime-unknown`:** w fikcyjnym raporcie port niedostępny ma `assert.equal(report.ports[0].status,"unverified")`. Sprawdź brak pełnego `CommandLine` i sekretów.
- [ ] **Step 2: `node --test tests/audit/runtime-inspect.test.mjs` → FAIL (brak skryptu).
- [ ] **Step 3: Implement `Get-NetTCPConnection` dla 4000,8651,8642,8643; `Get-ScheduledTask` i tylko metadane gateway. Odmowa dostępu = `unverified`. Nie zatrzymuj usług, nie wypisuj `.env` ani argumentów procesów.
- [ ] **Step 4: Test GREEN; wykonaj prywatny raport live, ręcznie potwierdź brak zmian w uruchomionych usługach.
- [ ] **Step 5: `git diff --check` i commit trzech plików Task 2.

### Task 3: Źródła prawdy, stan obecny i rozbieżności

**Files:**
- Create: `docs/master/01-CURRENT-STATE.md`
- Create: `docs/master/DECISION-LEDGER.md`
- Create: `docs/master/EVIDENCE-INDEX.md`
- Create: `tests/docs/current-state.test.mjs`

**Interfaces:** Consumes prywatne raporty Tasks 1–2 i stare `docs/adr/README.md`, `docs/TS-MIGRATION.md`, `docs/spec/17-wdrozenie.md`, spec Hermesa z 2026-10-07. Produces dla każdej tezy `captured_at, source_repo, head_sha, verification_status, evidence_ref`; konflikt ma `decision_id, sources, preferred_rule, status`.

- [ ] **Step 1: RED test `decision-ledger-sources`:** znajdź oba źródła kontraktu 8642/8643 i status `open|resolved-with-evidence`; `current-state-has-sha` sprawdza datę i pełne SHA.
- [ ] **Step 2: `node --test tests/docs/current-state.test.mjs` → FAIL.
- [ ] **Step 3: Sprawdź zawartość starych ADR-ów i realne implementacje; nie kopiuj niezweryfikowanych opisów. Rozróżnij `verified`, `unverified`, `historical`. Aktualną liczbę niezapisanych zmian pobierz z manifestu.
- [ ] **Step 4: Zapisz trzy dokumenty z redakcją prywatnych danych i odnośnikami do konkretnych źródeł/commitów.
- [ ] **Step 5: Test GREEN, ręczny review dowodów, `git diff --check` i commit czterech plików.

### Task 4: Zdefiniowanie wizji i właścicieli modułów

**Files:**
- Create: `docs/master/00-VISION.md`
- Create: `docs/master/02-TARGET-ARCHITECTURE.md`
- Create: `docs/master/03-MODULE-OWNERSHIP.md`
- Create: `tests/docs/architecture.test.mjs`

**Interfaces:** Produces mapa `module_id → responsibility, reads, writes, dependencies, evidence_link`.

- [ ] **Step 1: RED test `core-owns-task-state`:** Core = trwały stan, Hermes = planowanie, Jev = optional, UI = projekcja zdarzeń. `mvp-three-scenarios` musi znaleźć dashboard, Telegram bez karty i restart/wznowienie.
- [ ] **Step 2: `node --test tests/docs/architecture.test.mjs` → FAIL.
- [ ] **Step 3: Opisz cel MVP, granice systemu, schemat przepływu danych i właścicieli zapisów. Nie wybieraj jeszcze frameworka/bazy.
- [ ] **Step 4: Test GREEN, sprawdź zgodność ze specyfikacją i ADR, `git diff --check`, commit czterech plików.

### Task 5: Kontrakty zdarzeń i zasady autonomii

**Files:**
- Create: `docs/master/04-API-AND-EVENT-CONTRACTS.md`
- Create: `docs/master/05-AUTONOMY-AND-AGENTS.md`
- Create: `tests/docs/contracts.test.mjs`

**Interfaces:** `contract_id, current_source, target_consumer, owner, decision_status, test_reference`; `decision_status = existing-verified|planned|unverified`.

- [ ] **Step 1: RED test `contract-status`:** wszystkie kontrakty mają status i źródło; `jev-is-optional` wymaga fallback do Hermesa.
- [ ] **Step 2: `node --test tests/docs/contracts.test.mjs` → FAIL.
- [ ] **Step 3: Zapisz znane interfejsy Bridge, workflow i eventów, w tym planowane `task_id/event_id`, kolejność, idempotencję, wznowienie oraz weryfikację wykonania. Nie wymyślaj istniejących endpointów.
- [ ] **Step 4: Test GREEN, kontrola zgodności, `git diff --check`, commit trzech plików.

### Task 6: Macierz migracji i bramki

**Files:**
- Create: `docs/master/migration-matrix.json`
- Create: `docs/master/06-MIGRATION-MATRIX.md`
- Create: `docs/master/07-MIGRATION-ROADMAP.md`
- Create: `tools/audit/validate-matrix.mjs`
- Create: `tests/docs/migration-gates.test.mjs`

**Interfaces:** `validateMatrix(rows): {valid:boolean,errors:string[]}`. Wymagane pola wiersza: `module_id,capability,old_paths,old_commit,dependencies,owner_of_state,target_boundary,strategy,migration_status,baseline_test,target_test,rollback,evidence_link,decision_adr`. `strategy = reuse|adapter|refactor|replace|defer`.

- [ ] **Step 1: RED `matrix-invalid-row`:** brak `rollback`, zduplikowany `module_id` lub nieznana strategia muszą dawać `assert.equal(result.valid,false)`.
- [ ] **Step 2: `node --test tests/docs/migration-gates.test.mjs` → FAIL.
- [ ] **Step 3: Zaimplementuj walidator; opisz przynajmniej: Core, Hermes, Bridge, narzędzia, workflow, event bus, pamięć/Obsidian, Jev, UI/Desktop, mobile, testy, deployment. Każdy wiersz ma prawdziwą ścieżkę/dowód lub `unverified`, nigdy zgadywane `works`.
- [ ] **Step 4: `06` przedstawia czytelną macierz, `07` opisuje fazy 0–7 z testem, zależnościami i rollback. Dalsze fazy mają osobne bramki spec/plan.
- [ ] **Step 5: Test GREEN, `node tools/audit/validate-matrix.mjs docs/master/migration-matrix.json` → exit 0, `git diff --check`, commit pięciu plików.

### Task 7: AGENTS, checkpoint i test dokumentacji

**Files:**
- Create: `docs/master/08-TEST-AND-ACCEPTANCE.md`
- Create: `docs/master/09-PROJECT-STATUS.md`
- Create: `AGENTS.md`
- Create: `tools/audit/validate-docs.mjs`
- Create: `tests/docs/validate-docs.test.mjs`
- Modify: `README.md`

**Interfaces:** `validateDocs({rootDir}): Promise<{valid:boolean,errors:string[]}>`; sprawdza obowiązkowe pliki i relatywne linki bez sieci.

- [ ] **Step 1: RED `docs-broken-link`:** lokalny link do brakującego pliku daje `assert.equal(result.valid,false)`. `docs-required-files`: brak `06-MIGRATION-MATRIX.md` także daje FAIL.
- [ ] **Step 2: `node --test tests/docs/validate-docs.test.mjs` → FAIL.
- [ ] **Step 3: Zaimplementuj walidator. `08` ustala bezpieczne testy starego kodu wyłącznie na izolowanej kopii zatwierdzonego commitu i wymagany dowód: komenda, data, exit code, liczba błędów, brak dostępu = `unverified`.
- [ ] **Step 4: `AGENTS.md` opisuje hierarchię źródeł i zakaz edycji starego projektu; `09` zawiera dowody, status, blokery i jedno następne zadanie. `README.md` linkuje do dokumentów master i do planu.
- [ ] **Step 5: GREEN — `node --test`; `node tools/audit/validate-docs.mjs`; `node tools/audit/validate-matrix.mjs docs/master/migration-matrix.json`; `git diff --check`. Wszystko exit 0. Na zepsutym fixture walidator ma zwrócić niezerowy exit.
- [ ] **Step 6: Niezależny review całości: 100% krytycznych modułów ma identyfikator, źródło, każdy konflikt ma status, każdy test ma dowód; `artifacts/audit-private` nie może trafić do Git. Jeżeli warunek nie jest spełniony, oznacz fazę `blocked`/`unverified`; commit i push tylko po dowodzie.

## Phase 0 Acceptance Gate

Uznaj fazę 0 za `complete` wyłącznie po świeżym manifeście repo/worktree, dowodach runtime lub wyraźnych `unverified`, zweryfikowaniu krytycznych modułów, udokumentowaniu konfliktów, sprawnej macierzy i testach oraz potwierdzeniu, że prywatne snapshoty nie weszły do Git.

**Po fazie 0 zatrzymaj dalsze wykonanie.** Specyfikacja Core task lifecycle jest osobnym projektem. Nie implementuj Core, UI, tradingu, nowych agentów ani migracji kodu na podstawie tego planu.

## Execution Handoff

Plan jest **do przeglądu**, nie upoważnia jeszcze do wykonania. Po akceptacji wybierz metodę:

- **Subagent-driven (rekomendowane):** osobny wykonawca i reviewer każdego z 7 zadań, końcowy review całej gałęzi; minimalizuje ryzyko niezauważonego błędu w dowodach.
- **Native:** jeden wykonawca po kolei realizuje wszystkie zadania z niezależnym review na końcu; mniej narzutu, słabsza izolacja błędów.

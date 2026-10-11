# Testy i akceptacja

## Polecenia fazy 0

| Komenda | Co dowodzi | Co pozostaje poza zakresem |
| --- | --- | --- |
| node --test | regresje manifestu, fixture runtime i struktura dokumentów | live Windows/Hermes |
| node tools/audit/validate-docs.mjs | obowiązkowe dokumenty, lokalne linki i referencje | treść wszystkich tez, linki zewnętrzne i pełny parser Markdown |
| node tools/audit/validate-matrix.mjs docs/master/migration-matrix.json | schema, statusy, dependencies, źródłowe ścieżki pinned SHA | zdolność live i behavior migration |
| node tools/audit/validate-public-data.mjs | heurystyczny skan tracked text, prywatne snapshoty i typowe credential patterns | kompletna historia, nietypowe sekrety, binaria |
| git diff --check | whitespace errors w runner checkout | poprawność logiki |

CI: Linux i Windows z Node 22. Fixture runtime działa w pwsh; brak dostępu live daje unverified. CLI Windows PowerShell 5.1 uruchomiono lokalnie: exit 0, E-10; health/profile identity nadal unverified. Negative fixtures walidatora muszą dać nonzero exit; poprawne dokumenty exit 0.

## Baseline starego kodu

Tylko izolowana kopia SHA 9713065f4489a168f3b0cf041ee8fd9c9f84eb94, bez konfiguracji i kluczy użytkownika. Node unit, Python unit, static typecheck/catalog generation i browser smoke są osobnymi jobs. Nie uruchamiamy live bridge/Telegram ani testów wymagających osobistego vendor/profile.

Pierwszy pełniejszy baseline: node unit 369 pass/0 fail; web agent 2 pass/12 skipped; Python unit 32 pass/3 deselected; tsc i generowane katalogi exit 0; smoke test Chromium exit 0. [Dowód](https://github.com/majkel2403/JarvisAIO/actions/runs/38074228011). Cały run czerwony z powodu niedokończonych testów fazy 0, nie tych jobs. Pomięcia nie są pass. Log Node zawiera ostrzeżenia z uproszczonego DOM harness; suite exit 0 nie dowodzi braku wszystkich problemów runtime.

## Format dowodu

Każdy wynik: command, captured_at, repository, full head_sha, runner/environment, exit_code, passed/failed/skipped, evidence_ref i ograniczenia. Status job potwierdza exit; pełny log potwierdza liczby. Docelowy test planned nie jest zrealizowanym testem.

## Formalna bramka fazy 0

Pełny lokalny manifest repo/worktree; odzyskiwalne źródła niezacommitowanych zmian; wszystkie krytyczne moduły z ID/ścieżką; konflikty ze statusem; aktualny baseline i review; brak prywatnych snapshotów w Git. Runtime niedostępny oznaczony unverified. Lokalny manifest/snapshoty i test odtworzenia kodu/Git wykonano w E-10. Bramka fundamentu spełniona; nie oznacza operacyjnej akceptacji ani backupu ignorowanych danych runtime.

## Testy fazy 1 i dalszych

Core: duplicate command/event, invalid transition, verifying receipt, event gap replay, restart między skutkiem a receipt, expired lease/fencing, cancellation i reconciliation. Integracje: dashboard, Telegram bez karty i restart bez duplikacji. Testy zapisujące dane wyłącznie na fixture/copy; migracja danych wymaga testu odczytu backupu. Zewnętrzny live acceptance wymaga konkretnego dowodu i osobnego zakresu.
## Żywy pulpit — plan testów odbiorczych (faza 6, planned)

Te scenariusze **nie były jeszcze wykonane**. Wymagają osobnej specyfikacji, planu i wyników CI/live; nie zmieniają osiągniętej akceptacji fazy 0 ani zakresu fazy 1.

| ID | Scenariusz | Oczekiwany, mierzalny dowód |
| --- | --- | --- |
| LD-01 | Nowe polecenie w Desktop, potem zamknięcie karty | jeden task_id w Core; worker kontynuuje kroki niezależne od UI; powrót pokazuje zapisane zdarzenia |
| LD-02 | Telegram przy zamkniętej karcie | zatwierdzona zdolność wykonuje się headless, receipt i wynik docierają kanałem wejścia |
| LD-03 | Restart procesu w trakcie niepewnego skutku | Core zachowuje task, blokuje bezmyślny retry, wymaga reconciliation |
| LD-04 | Duplikaty eventów, luka sequence i reconnect | UI deduplikuje, robi resync i otrzymuje ten sam stan co snapshot źródłowy |
| LD-05 | Niepotwierdzony tool receipt lub verifier failed | nie ma animacji completed; Process Log pokazuje failed/waiting i dowód |
| LD-06 | Zanik Bridge i brak aktywnego Windows Desktop | jawne stale/unknown lub unavailable; zadania niezależne nie zostają zablokowane |
| LD-07 | Orb i Process Log po replay | te same event_id i statusy dają tę samą semantyczną sekwencję; animacje mogą się różnić czasowo |
| LD-08 | WebGL off, reduced motion, wolne urządzenie | sterowanie i komplet informacji działają bez animacji; Core nie wpływa na rendering |
| LD-09 | Mobile 390×844 i desktop, zoom 200% | brak poziomego przewijania kluczowych kontrolek, czytelny status, działanie klawiaturą |
| LD-10 | Telemetria stara lub niedostępna | oznaczenie czasu pomiaru, stale/unknown zamiast wymyślonych liczb |
| LD-11 | Wiele kart równocześnie | ten sam stan z Core; nie ma drugiego writer ani podwójnego skutku |
| LD-12 | Ukończenie z prawdziwym receipt verifiera | zielony stan Orb i completed tylko dla tego task_id, link do evidence |

**Kryterium końcowe:** testy dla idempotencji, odtwarzania, błędów, a11y i responsywności; raport CI zawiera SHA, datę, komendy, exit codes, real skipped/unverified; integracja live ma własny zredagowany dowód i jasno wyliczone ograniczenia. Żaden ekran demo nie potwierdza działania Hermesa live.

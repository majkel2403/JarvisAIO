# JarvisAIO — Jarvis OS

**Osobisty, autonomiczny system AI do wykonywania rzeczywistych zadań na komputerze, w aplikacjach i przez integracje.**

> **Status: faza 0 — fundament dokumentacji i audyt migracji.** To repozytorium nie zawiera jeszcze działającego nowego Jarvis Core. Istniejący [Jarvis-](https://github.com/majkel2403/Jarvis-) pozostaje osobnym, nienaruszonym systemem i źródłem odniesienia.

## Wizja produktu

Jarvis OS nie jest kolejnym chatbotem ani statycznym dashboardem. Użytkownik opisuje cel, a system planuje pracę, deleguje działania, wykonuje je przez narzędzia, testuje rezultat, zapamiętuje postęp i pokazuje **rzeczywiste zdarzenia** w interfejsie. Praca powinna trwać także po zamknięciu karty przeglądarki i dać się wznowić po restarcie.

### Przykładowe zadania

1. **Zbuduj dashboard:** użytkownik zleca stworzenie strony; Hermes planuje, narzędzia wykonują, Core zapisuje stan i wyniki, a UI pokazuje prawdziwy postęp.
2. **Zadanie z Telegrama:** użytkownik wysyła polecenie bez otwartej przeglądarki; backend przyjmuje i prowadzi zadanie niezależnie od UI.
3. **Restart w połowie pracy:** Core odtwarza stan i kontynuuje bez przypadkowego powtarzania skutków operacji.

To są **docelowe scenariusze akceptacyjne**, nie potwierdzenie istniejącej funkcjonalności nowego repo.

## Architektura docelowa

 ```mermaid
flowchart TD
  Inputs["Desktop · Mobile · Telegram · API"] --> Core["Core: trwały stan"]
  Core --> Hermes["Hermes: plan i delegacja"]
  Hermes --> Jev["Jev: opcjonalna porada"]
  Hermes --> Tools["Tool Registry i Bridge"]
  Tools --> Core
  Core --> Events["Committed events"]
  Events --> UI["UI · Orb · grafy"]
```

**Granice odpowiedzialności:**

- **Jarvis Core:** właściciel trwałego stanu zadania, kolejki, zdarzeń, idempotencji, weryfikacji i wznowienia.
- **Hermes:** rozumienie intencji, planowanie, orkiestracja i korzystanie z narzędzi.
- **Jev (TypeSafe):** opcjonalna szybka warstwa decyzji; w razie braku lub niepewności sterowanie wraca do Hermesa.
- **Bridge / Tool Registry:** kontrolowany interfejs do rzeczywistych działań na komputerze i w usługach.
- **Desktop / Mobile / Orb / 3D Graph / Cinematic Engine:** wizualizacja stanu i zdarzeń; nigdy jedyne miejsce przechowywania postępu.
- **Laboratoria (JEV Neural, trading, Orb Lab):** osobne produkty/moduły, rozwijane z własnymi specyfikacjami; nie blokują podstawowego Core.

## Co ma wyróżniać Jarvisa?

**Autonomia z dowodami.** Agent może działać wieloetapowo, ale nie oznacza zadania jako ukończonego bez testu lub innego sprawdzalnego wyniku.

**Trwałość.** Stan pracy nie znika razem z kartą. Po powrocie użytkownik widzi, co naprawdę zaszło.

**Żywy interfejs.** Orb, grafy agentów, animacje i Cinematic Engine reagują na prawdziwe eventy, nie na wymyślone demonstracje.

**Modułowość.** Nowe funkcje i laboratoria mają jasne granice, własność danych i kontrakty integracyjne.

## Etapy realizacji

| Faza | Zakres | Status |
| --- | --- | --- |
| 0 | Audyt starego Jarvisa, źródła prawdy, dokumentacja i macierz migracji | **W toku** |
| 1 | Core: cykl życia zadania, trwały event log, wznowienie | Planowane |
| 2 | Bridge, adaptery i narzędzia | Planowane |
| 3 | Pamięć, dane i kontekst | Planowane |
| 4 | Autonomiczne workflow, delegacja i weryfikacja | Planowane |
| 5 | Opcjonalny Jev i fallback do Hermesa | Planowane |
| 6 | Desktop, Mobile, Orb, grafy i Cinema | Planowane |
| 7 | Laboratoria, symulacje i paper trading | Planowane |

Każda kolejna faza wymaga własnej zatwierdzonej specyfikacji, planu, testów i przeglądu. **Nie przenosimy wszystkiego naraz.**

## Dokumentacja — od czego zacząć

- [Pełna koncepcja i specyfikacja architektury](docs/superpowers/specs/2026-10-10-jarvis-migration-foundation-design.md) — cel, granice systemu, odpowiedzialności, migracja i kryteria sukcesu.
- [Szczegółowy plan fazy 0](docs/superpowers/plans/2026-10-10-jarvis-migration-foundation.md) — siedem zadań, pliki, testy i bramka akceptacji.
- [Wizja i MVP](docs/master/00-VISION.md), [stan obecny](docs/master/01-CURRENT-STATE.md).
- [Architektura](docs/master/02-TARGET-ARCHITECTURE.md), [właściciele](docs/master/03-MODULE-OWNERSHIP.md).
- [Kontrakty](docs/master/04-API-AND-EVENT-CONTRACTS.md), [autonomia](docs/master/05-AUTONOMY-AND-AGENTS.md).
- [Macierz](docs/master/06-MIGRATION-MATRIX.md), [roadmapa](docs/master/07-MIGRATION-ROADMAP.md).
- [Testy i bramka](docs/master/08-TEST-AND-ACCEPTANCE.md), [aktualny status](docs/master/09-PROJECT-STATUS.md).
- [Decyzje](docs/master/DECISION-LEDGER.md), [dowody](docs/master/EVIDENCE-INDEX.md), [AGENTS](AGENTS.md).

## Stan realizacji i zasady

- Repozytorium jest publiczne; nigdy nie commitujemy sekretów ani prywatnych raportów audytu.
- Historyczne opisy nie są dowodem działania. Brak testu oznaczamy jako `unverified`, a funkcję docelową jako `planned`.
- Stary [Jarvis-](https://github.com/majkel2403/Jarvis-) pozostaje bez zmian. Migracja będzie oparta na konkretnych zdolnościach, testach porównawczych i możliwości cofnięcia.
- Kod i testy fazy 0 są rozwijane w gałęzi `feat/phase0-audit`; zmiany nie są automatycznie scalane do `main`.

**Faza 0: partial / formal acceptance blocked.** Dokumentacja i narzędzia są rozwijane oraz weryfikowane przez Actions. Lokalny baseline i odzyskiwalne niezapisane zmiany są unverified. Szczegóły i wyniki: [status](docs/master/09-PROJECT-STATUS.md). Można projektować osobną specyfikację Core; implementacja fazy 1 czeka na bramkę.

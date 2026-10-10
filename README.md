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

```text
Desktop / Mobile / Telegram / Harmonogram / API
                        |
                Jarvis Core
     trwałe zadania • statusy • event log • retry
                        |
               Orkiestracja
                 /         \
              Hermes      Jev (opcjonalny)
            planowanie    szybka klasyfikacja
                 \         /
               Bridge / Tool Registry
                        |
         Windows • WWW • pliki • aplikacje
                        |
             wyniki + weryfikacja
                        |
          zdarzenia -> UI / Orb / Graph
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
- `docs/master/` — docelowe miejsce na wizję, stan obecny, architekturę, kontrakty, macierz i status. **Dokumenty te są dopiero tworzone w fazie 0.**

## Stan realizacji i zasady

- Repozytorium jest publiczne; nigdy nie commitujemy sekretów ani prywatnych raportów audytu.
- Historyczne opisy nie są dowodem działania. Brak testu oznaczamy jako `unverified`, a funkcję docelową jako `planned`.
- Stary [Jarvis-](https://github.com/majkel2403/Jarvis-) pozostaje bez zmian. Migracja będzie oparta na konkretnych zdolnościach, testach porównawczych i możliwości cofnięcia.
- Kod i testy fazy 0 są rozwijane w gałęzi `feat/phase0-audit`; zmiany nie są automatycznie scalane do `main`.

**Obecny cel:** zakończyć fazę 0 i dopiero wtedy zatwierdzić osobną specyfikację nowego Jarvis Core.

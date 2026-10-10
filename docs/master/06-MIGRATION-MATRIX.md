# Macierz migracji

Maszynowe źródło: [migration-matrix.json](migration-matrix.json).
Manifest remote committed files z blob SHA: [source-inventory.json](source-inventory.json).
Baseline: 9713065f4489a168f3b0cf041ee8fd9c9f84eb94. Pełne drzewo odczytane z GitHub, bez lokalnych zmian.

| Moduł | Stare ścieżki | Strategia | Dlaczego | Status migracji |
| --- | --- | --- | --- | --- |
| core | `js/core.js`, `js/store.js` | replace | Stara granica nie zapewnia docelowej trwałości lub własności; zachować zachowanie jako baseline. | planned; runtime unverified |
| hermes | `hermes/HERMES.md`, `bridge/jarvis_bridge.py` | adapter | Izolować istniejącą integrację, zweryfikować zgodność i ownership przed przeniesieniem. | planned; runtime unverified |
| bridge | `bridge/jarvis_bridge.py`, `js/bridge.js` | refactor | Zachować zdolność, usunąć zależność od karty/niestabilnego stanu przez kontrakt Core. | planned; runtime unverified |
| registry | `js/registry.js`, `js/mcp-tool-schema.js`, `bridge/tools.json` | adapter | Izolować istniejącą integrację, zweryfikować zgodność i ownership przed przeniesieniem. | planned; runtime unverified |
| workflow | `bridge/workflow_engine.py`, `workflows/schema.json` | refactor | Zachować zdolność, usunąć zależność od karty/niestabilnego stanu przez kontrakt Core. | planned; runtime unverified |
| event-bus | `js/events.js`, `hermes/plugins/jarvis-events/__init__.py` | replace | Stara granica nie zapewnia docelowej trwałości lub własności; zachować zachowanie jako baseline. | planned; runtime unverified |
| memory | `js/context.js`, `hermes/plugins/obsidian-brain/__init__.py` | adapter | Izolować istniejącą integrację, zweryfikować zgodność i ownership przed przeniesieniem. | planned; runtime unverified |
| agents | `bridge/agents.py`, `bridge/web_task.py` | refactor | Zachować zdolność, usunąć zależność od karty/niestabilnego stanu przez kontrakt Core. | planned; runtime unverified |
| jev | `js/jev-policy.js`, `js/judge.js` | adapter | Izolować istniejącą integrację, zweryfikować zgodność i ownership przed przeniesieniem. | planned; runtime unverified |
| desktop | `js/core.js`, `js/widgets.js`, `js/process.js` | refactor | Zachować zdolność, usunąć zależność od karty/niestabilnego stanu przez kontrakt Core. | planned; runtime unverified |
| mobile | `css/jarvis.css`, `index.html` | refactor | Zachować zdolność, usunąć zależność od karty/niestabilnego stanu przez kontrakt Core. | planned; runtime unverified |
| orb | `js/hud.js`, `js/events.js` | refactor | Zachować zdolność, usunąć zależność od karty/niestabilnego stanu przez kontrakt Core. | planned; runtime unverified |
| cinema | `js/film-scenarios.js`, `js/workflow-cinema.js` | defer | Nie blokuje MVP Core; osobna specyfikacja i późniejsza migracja. | planned; runtime unverified |
| tests | `tests/harness.js`, `tests/unit/registry.test.js` | reuse | Przenieść dopiero po sprawdzeniu licencji, zależności i fixture isolation. | planned; runtime unverified |
| deployment | `.github/workflows/ci.yml`, `.github/workflows/pages.yml` | replace | Stara granica nie zapewnia docelowej trwałości lub własności; zachować zachowanie jako baseline. | planned; runtime unverified |
| labs | `js/chart.js`, `js/apps.js` | defer | Nie blokuje MVP Core; osobna specyfikacja i późniejsza migracja. | planned; runtime unverified |

## Jak czytać statusy

Ścieżka/blob SHA dowodzą obecności kodu. Baseline test dowodzi tylko konkretnego scenariusza. Wszystkie migracje są planned; verification_status unverified dotyczy docelowej zdolności i środowiska live. Żaden wpis nie oznacza zaimplementowanego Core. Wyniki komend: [status](09-PROJECT-STATUS.md).

reuse oznacza kandydat do ponownego użycia; adapter izoluje integrację; refactor przebudowuje granicę; replace zastępuje starą odpowiedzialność; defer odkłada moduł. Wszystkie decyzje są odwracalne przed implementacją.

Każda zdolność ma dependencies, owner_of_state, target_boundary, baseline_test, target_test i rollback. Prywatnych danych nie importujemy. Przed migracją wymagane: aktualny lokalny manifest, zapis niezacommitowanych zmian, backup danych, GREEN starego zachowania i osobny zatwierdzony plan. Jednostka migracji = zdolność użytkownika, nie losowy plik.

Walidator sprawdza pola, pełny SHA, unikalność ID, dependency references, strategie, statusy i ścieżki z pinned inventory. Nie dowodzi działania systemu.

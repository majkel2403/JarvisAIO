# Jarvis OS — wizja i MVP

Status: planned. Ten dokument opisuje produkt docelowy, nie działający nowy system.

## Dla kogo i po co

Dla użytkownika, który chce zlecać całe rezultaty: tworzenie aplikacji, analizę projektu, porządkowanie informacji i wykonywanie pracy w usługach oraz na komputerze. Użytkownik określa cel i granice. Jarvis planuje, wykonuje, sprawdza i zachowuje dowody. Zmniejsza liczbę ręcznych kroków i pozwala wrócić do zadania po przerwie.

Hermes jest mózgiem planowania, Jarvis Core właścicielem trwałego postępu, Bridge wykonawcą narzędzi. Jev pozostaje opcjonalny. UI pokazuje zdarzenia i wyniki; animacja nie jest dowodem wykonania.

## Trzy scenariusze akceptacyjne MVP

1. **dashboard**: zlecenie stworzenia prostego dashboardu daje pliki, wynik testów i dowody. Zamknięcie i ponowne otwarcie karty nie usuwa postępu. UI odtwarza rezultat z Core.
2. **Telegram bez otwartej karty**: wejściowy adapter zapisuje task, worker wykonuje zatwierdzony zakres, verifier sprawdza rezultat, a wynik wraca kanałem wejścia.
3. **restart i wznowienie**: po zatrzymaniu procesu stan i próby pozostają. Operacja odczytowa może zostać powtórzona; zapis ze skutkiem niepewnym podlega reconciliation, nigdy ślepemu retry.

Miara MVP: trzy scenariusze E2E na fixture oraz jedna kontrolowana integracja; brak utraty tasków, brak podwójnych skutków, completed wyłącznie z dowodem. Dopiero kolejne fazy zapewnią pełne integracje.

## Przyszłe możliwości

Wiele agentów może pracować nad rozłącznymi częściami projektu. Workflow może łączyć planowanie, kod, testy i naprawy. Pamięć zachowuje kontekst z pochodzeniem. Desktop i Mobile zapewniają dostęp do tego samego zadania. Orb, graf 3D i Cinematic Engine pokazują realny przebieg. Laboratoria sieci neuronowych, symulacji agentów i paper trading mają osobne cele, dane i specyfikacje.

## Granice

Faza 0 tworzy audyt, kontrakty, testy dokumentacji i macierz migracji. Nie implementuje backendu, frontendu, nowego agenta, live trading ani produkcyjnej migracji. Stary Jarvis działa niezależnie; nie ma automatycznego współdzielenia jego danych. Premium UI i efekty nie blokują Core.
## Living AI Desktop — zatwierdzony kierunek (2026-10-11)

**Status decyzji:** użytkownik zatwierdził kierunek produktu Living AI Desktop. Szczegółowa [specyfikacja architektury](02-TARGET-ARCHITECTURE.md#living-ai-desktop--specyfikacja-projektowa-2026-10-11) jest przedstawiona do przeglądu, nie jest jeszcze zatwierdzonym planem implementacji. Nowy frontend, Core i integracje nadal mają status **planned**.

### Doświadczenie użytkownika

Living AI Desktop to lokalny, żywy pulpit AI. Użytkownik zleca rezultat zamiast pojedynczych kliknięć. Hermes planuje, wykonawcy korzystają z narzędzi, Core zapisuje rzeczywisty postęp, a ekran natychmiast pokazuje potwierdzone zdarzenia. Po zamknięciu i ponownym otwarciu widoku można odtworzyć zadania oraz ich dowody. Kluczowy cel: **praca backendowa nie zależy od otwartej karty**, a widok nie może udawać niezapisanej pracy.

Zachowujemy kompozycję referencyjnego HUD: centralny orb, lewe wskaźniki stanu, prawy Process Log, moduły narzędzi i dolny dock okien. Forma jest środkiem do zrozumienia działania, nie konkurencyjnym silnikiem autonomii. Widoki programowania, agentów i pulpitu mogą adaptować układ; trading i laboratoria są osobnymi późniejszymi projektami.

### Warunki sukcesu Living Desktop

- Polecenie utworzone przez Desktop trafia do Core z identyfikatorem idempotencji; użytkownik widzi prawdziwy status i historię.
- Zamknięcie strony nie anuluje pracy niezależnego workera. Operacje wymagające aktywnego Windows Desktop jawnie czekają na dostępność tej zdolności.
- Po ponownym połączeniu aplikacja uzyskuje spójny snapshot i brakujące zdarzenia, także po utracie sieci i duplikacji komunikatów.
- Ukończenie i efekty triumfu w UI wymagają dowodu verifiera; brak weryfikacji nie staje się sukcesem.
- Na telefonie układ jest czytelny dla 390×844; tryb ograniczonego ruchu nie zmienia wykonania.
- MVP zdefiniowane wyżej pozostaje obowiązującą bramką Core. Nowa warstwa Living Desktop należy przede wszystkim do **fazy 6**, po dostarczeniu zależności faz 1–5.

### Granice tego zatwierdzenia

Zgoda dotyczy **kierunku architektury**, nie implementacji, merge PR, wdrożenia, edycji starego repo ani wyboru frameworka całego systemu. Przygotowanie tej dokumentacji nie zmienia istniejących bramek faz 1–7.

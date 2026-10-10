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

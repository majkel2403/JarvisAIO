# Autonomia, agenci i wznowienie

Status: planned. System ma realizować zatwierdzony cel bez pytania przy każdym odwracalnym kroku. Nie deklarujemy jeszcze pracy nowego Core.

## Pętla wykonania

1. Core zapisuje cel, zakres i kryteria wyniku.
2. Hermes tworzy wersjonowany plan z zależnościami. Jev jest optional: brak, timeout lub niepewność daje fallback do Hermes.
3. Scheduler wybiera gotowy krok i atomowo przydziela lease. Agent otrzymuje brief i workspace.
4. Agent wykonuje narzędzia, oddaje artefakty i receipt; Core przechodzi do verifying.
5. Verifier uruchamia kryteria (test, schema, inspekcja wyniku). Sukces pozwala completed. Porażka zapisuje błąd, dowód i następną ograniczoną próbę.
6. Hermes naprawia przyczynę, ponownie testuje i zapisuje wynik. Przekroczenie budżetu daje failed/waiting_for_input z precyzyjną przyczyną.

## Delegacja i wiele agentów

Planista rozdziela zadania według zależności i deklarowanych write sets. Równolegle wykonujemy wyłącznie rozłączne zasoby. Wspólny plik/branch wymaga jednego writer albo kolejki. Core jest właścicielem parent/child task relation i merge gate; agent nie oznacza całego projektu completed na podstawie własnego komunikatu.

Worker heartbeat odnawia lease; po wygaśnięciu Core stosuje fencing token, żeby stary worker nie nadpisał nowszego wyniku. Resource lock chroni pliki, external effect dedupe chroni wywołania. Sama blokada nie daje exactly-once efektów w zewnętrznej usłudze.

Wykonawca i verifier mogą być różnymi agentami, ale dowodem jest uruchomiony check, nie opinia drugiego modelu. Review kodu sprawdza także brak utraty danych, zależności i rollback.

## Trwała pamięć postępu

Core zapisuje task, plan version, step, attempt, tool receipt, checkpoint i evidence po każdej granicy trwałości. Memory przechowuje długotrwały kontekst z source, timestamp, scope, TTL i consent metadata; nie zastępuje task log. Szczegóły providerów i bazy pozostają do fazy 1/3.

Checkpoint nie zawiera sekretów ani pełnych argumentów prywatnych komend w publicznym logu. Evidence może być prywatnym reference. Sesja modelu może się skończyć; kolejny worker rekonstruuje brief z trwałego stanu zamiast zgadywać z rozmowy.

## Restart, retry i naprawa

Po restarcie Core odtwarza tasky i nieaktualne lease. Kroki bez skutków można powtórzyć z budżetem i backoff. Zapis ze statusem applied nie wykonuje się ponownie. Timeout/effect unknown kieruje do reconciliation: sprawdzenie external receipt albo rezultatu. Brak sposobu rozstrzygnięcia daje waiting_for_input, bez ślepego retry.

Ograniczenia: max attempts, deadline, token/tool budget, concurrency i cancel signal zapisane w task/attempt. Waiting nie zużywa stale modelu. Retry zachowuje przyczynę i ostatni failed test; identyczne ponowienia bez nowej hipotezy kończą budżet.

## Praca bez UI

Backend worker, scheduler i adapters działają bez karty. UI odczytuje snapshot/replay. Narzędzia zależne od Desktop jawnie deklarują required_client; reszta działa niezależnie. Task nie staje się completed, gdy animacja dobiegnie końca.

## Dowody autonomii wymagane w następnych fazach

Restart pomiędzy tool effect a receipt; utrata odpowiedzi; podwójny command; expiry lease i spóźniony worker; dwaj agenci zapisujący jeden plik; failed test → poprawka → green; brak Jeva; zamknięty UI; cancellation po skutku. Każdy przypadek wymaga logu i testu, a live Hermes pozostaje unverified w fazie 0.

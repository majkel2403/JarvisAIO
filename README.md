# JarvisAIO

Nowe, niezależne repozytorium dla docelowej architektury **Jarvis All-in-One**.

## Cel

Zbudować autonomiczny, modułowy Jarvis OS bez przepisywania wszystkiego naraz. Istniejący [Jarvis-](https://github.com/majkel2403/Jarvis-) pozostaje źródłem do inwentaryzacji, porównywania zachowań i kontrolowanej migracji.

## Zasady

- **Najpierw dokumenty, potem kod.** Nie implementujemy modułów bez zaakceptowanej specyfikacji i planu.
- **Hermes** planuje i wykonuje zadania; **Jev** jest opcjonalnym szybkim routerem decyzji.
- **Jarvis Core** odpowiada za trwały stan, zadania, narzędzia, zdarzenia, weryfikację i wznowienie po awarii.
- **Desktop, Orb, grafy, Cinematic Engine i Mobile** są klientami prawdziwych zdarzeń, nie atrapami.
- **Jedna migracja = jedna sprawdzona zdolność**, testy, przegląd i punkt cofnięcia.
- Nie kopiujemy automatycznie kodu starego projektu ani jego sekretów.

## Aktualny etap

**Faza 0 — dokumentacja i inwentaryzacja.** Repo jest nowym fundamentem. Nie zawiera jeszcze kodu aplikacji ani produkcyjnego backendu.

Projekt specyfikacji do przeglądu: [Fundament migracji](docs/superpowers/specs/2026-10-10-jarvis-migration-foundation-design.md).

## Następne kroki

Po zatwierdzeniu formalnej specyfikacji przygotujemy w Superpowers szczegółowy plan inwentaryzacji i dokumentacji. Dopiero po jego weryfikacji rozpocznie się implementacja pojedynczych modułów.

> Stary Jarvis i jego lokalne niezapisane zmiany pozostają nienaruszone.

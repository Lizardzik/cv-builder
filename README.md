# CV Builder AI

Aplikacja internetowa typu SPA dedykowana dla branży IT, umożliwiająca tworzenie, zarządzanie oraz automatyczne dostosowywanie życiorysów zawodowych pod konkretne oferty pracy. System wykorzystuje modele językowe Google Gemini do ekstrakcji danych z plików PDF, optymalizacji treści pod kątem systemów ATS (Applicant Tracking System) oraz redagowania sekcji opisowych.

## Główne Funkcjonalności

- **Inteligentny import z PDF**: Ekstrakcja danych z istniejących dokumentów CV za pomocą LLM, automatyczna normalizacja numerów telefonów, poziomów językowych (CEFR) i usuwanie duplikatów linków.
- **Dopasowanie do ofert pracy (ATS Matcher)**: Analiza treści ogłoszenia o pracę i porównanie z profilem kandydata. System wylicza procentowy wskaźnik dopasowania, wskazuje brakujące słowa kluczowe, generuje dedykowane podsumowanie zawodowe oraz sugeruje optymalizację wpisów.
- **Zarządzanie wariantami CV**: Tworzenie i przełączanie się między wieloma wersjami dokumentu (dostosowanymi pod konkretne firmy lub stanowiska) bez utraty danych bazowych.
- **Asystent wpisów (AI Redaktor)**: Przekształcanie roboczych notatek w zwięzłe, zorientowane na rezultaty punkty w sekcjach doświadczenia i projektów.
- **Automatyczna generacja umiejętności**: Sugerowanie zestawu kompetencji technicznych na podstawie opisu stanowisk, zrealizowanych projektów i wykształcenia.
- **Wektorowy eksport do PDF**: Renderowanie dokumentów A4 bezpośrednio z wykorzystaniem natywnego silnika druku przeglądarki, gwarantujące zachowanie warstwy tekstowej dla skanerów ATS oraz wsparcie dla aktywnych hiperłączy.
- **Dynamiczne skalowanie A4**: Automatyczne i proporcjonalne dostosowywanie rozmiaru czcionki oraz odstępów w zależności od objętości danych, zapobiegające niekontrolowanemu przenoszeniu treści na drugą stronę.

## Architektura i Stack Technologiczny

Aplikacja została zbudowana w oparciu o podział na warstwę prezentacji (Frontend) oraz serwer pośredniczący (Backend Proxy).

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Formularze i walidacja**: React Hook Form, Zod
- **Stylizowanie**: Tailwind CSS, shadcn/ui, Lucide React
- **Przechowywanie danych**: LocalStorage (persystencja wariantów i motywów)

### Backend
- **Środowisko uruchomieniowe**: Node.js, Express, TypeScript
- **Integracja AI**: Google Gen AI SDK (Gemini API)
- **Obsługa plików i walidacja**: Multer, pdf-parse
- **Wydajność i bezpieczeństwo**: Express Rate Limit, in-memory caching z hashowaniem SHA-256

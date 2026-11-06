import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import rateLimit from "express-rate-limit";
import crypto from "node:crypto";
import { PDFParse } from "pdf-parse";
import { normalizeParsedCV } from "./utils/cvNormalizer.js";
import { newRequestId, log, withTimeout } from "./utils/logger.js";
import { getFromCache, saveToCache } from "./utils/cache.js";
import {
  cvSchemaResponse,
  skillsSchemaResponse,
  jobMatchSchemaResponse,
} from "./schemas/geminiSchemas.js";
import {
  AVAILABLE_MODELS,
  hasApiKey,
  generateWithModelFallback,
} from "./services/geminiService.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = process.env.FRONTEND_URL || "http://localhost:5173";
      if (
        !origin ||
        origin === allowed ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Zablokowane przez CORS"));
      }
    },
  })
);

app.use(express.json({ limit: "10mb" }));

const MAX_FILE_SIZE_MB = 8;
const MAX_TEXT_CHARS = 20000;
const PDF_PARSE_TIMEOUT_MS = 15000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Dozwolone są wyłącznie pliki PDF."));
      return;
    }
    cb(null, true);
  },
});

const uploadSingle = upload.single("pdf");

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Zbyt wiele prób w krótkim czasie. Odczekaj chwilę przed kolejną próbą.",
  },
});

function handleAiError(res: express.Response, error: any, fallbackMessage: string) {
  if (error.name === "TimeoutError") {
    return res.status(504).json({ error: error.message });
  }
  if (error.status === 503) {
    return res.status(503).json({
      error: "Serwery modeli są chwilowo przeciążone. Odczekaj kilkanaście sekund i spróbuj ponownie.",
    });
  }
  if (error.status === 429) {
    return res.status(429).json({
      error: "Przekroczono limit zapytań (Quota). Odczekaj chwilę przed kolejną próbą.",
    });
  }
  const status =
    error.status && error.status >= 400 && error.status < 600
      ? error.status
      : 500;
  return res.status(status).json({
    error: error.message || fallbackMessage,
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", models: AVAILABLE_MODELS });
});

app.post("/api/parse-cv", aiLimiter, (req, res) => {
  const reqId = newRequestId();
  const requestStart = Date.now();
  log(reqId, ">>> nowy request /api/parse-cv");

  uploadSingle(req, res, async (uploadErr: any) => {
    if (uploadErr) {
      if (uploadErr.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: `Plik jest za duży (maksymalnie ${MAX_FILE_SIZE_MB} MB).`,
        });
      }
      return res
        .status(400)
        .json({ error: uploadErr.message || "Błąd wczytywania pliku." });
    }

    let clientAborted = false;
    res.on("close", () => {
      if (!res.writableFinished) {
        clientAborted = true;
        log(reqId, "!!! klient rozłączył się przed otrzymaniem odpowiedzi");
      }
    });

    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nie przesłano pliku PDF." });
      }

      if (!hasApiKey()) {
        return res.status(500).json({
          error: "Brak klucza GEMINI_API_KEY w pliku .env.",
        });
      }

      const isRealPdf = req.file.buffer.subarray(0, 4).toString() === "%PDF";
      if (!isRealPdf) {
        return res.status(400).json({
          error: "Przesłany plik nie jest prawidłowym dokumentem PDF.",
        });
      }

      const parser = new PDFParse({ data: req.file.buffer });
      const pdfData = await withTimeout(
        parser.getText(),
        PDF_PARSE_TIMEOUT_MS,
        `Parsowanie PDF nie zakończyło się w ciągu ${PDF_PARSE_TIMEOUT_MS / 1000}s.`
      );
      await parser.destroy().catch(() => undefined);
      let extractedText = pdfData.text;

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({
          error: "Nie udało się odczytać tekstu z tego pliku. Upewnij się, że nie jest to sam skan.",
        });
      }

      if (extractedText.length > MAX_TEXT_CHARS) {
        extractedText = extractedText.slice(0, MAX_TEXT_CHARS);
      }

      if (clientAborted) return;

      const contentHash = crypto
        .createHash("sha256")
        .update(extractedText)
        .digest("hex");
      const cached = getFromCache(contentHash);
      if (cached) {
        log(reqId, "trafienie w cache - zwracam wynik");
        return res.json(cached);
      }

      const response = await generateWithModelFallback(
        (modelName) => ({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Jesteś precyzyjnym systemem ATS do parsowania CV. 
Przeanalizuj poniższy tekst i wyodrębnij WSZYSTKIE dostępne informacje do schematu JSON.

Ścisłe reguły formatowania:
1. personalInfo: Wyodrębnij imię, nazwisko, stanowisko (jobTitle), email, telefon (sam numer), miasto, kod pocztowy, linki (linkedin, github, portfolio).
2. experience: Każde stanowisko jako osobny element z: company, position, startDate (format MM.RRRR), endDate (format MM.RRRR lub słowo 'Obecnie').
3. projects: Projekty z: name, role, technologies, url, description.
4. education: Wszystkie szkoły i uczelnie z: school, degree, startDate (MM.RRRR), endDate (MM.RRRR lub 'Obecnie').
5. skills: Wyodrębnij wyłącznie umiejętności techniczne, narzędzia lub kompetencje zawodowe. NIE umieszczaj tutaj nazw stanowisk ani firm.
6. languages: Dla każdego języka określ poziom w formacie: 'A1', 'A2', 'B1', 'B2', 'C1', 'C2' lub 'Ojczysty'.
7. courses: Wszystkie kursy i certyfikaty.
8. summary: Przepisz sekcję podsumowania zawodowego, jeśli występuje.

Treść dokumentu CV:
${extractedText}`,
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: cvSchemaResponse,
            maxOutputTokens: 4096,
          },
        }),
        reqId
      );

      if (clientAborted) return;

      if (!response.text) {
        throw new Error("Model zwrócił pustą odpowiedź.");
      }

      const rawParsed = JSON.parse(response.text);
      const parsedData = normalizeParsedCV(rawParsed);

      const isComplete =
        (Array.isArray(parsedData.experience) && parsedData.experience.length > 0) ||
        (Array.isArray(parsedData.education) && parsedData.education.length > 0) ||
        (Array.isArray(parsedData.skills) && parsedData.skills.length > 0);

      if (isComplete) {
        saveToCache(contentHash, parsedData);
      }

      log(reqId, `<<< SUKCES /api/parse-cv (${Date.now() - requestStart}ms)`);
      res.json(parsedData);
    } catch (error: any) {
      if (clientAborted) return;
      log(reqId, `<<< BŁĄD /api/parse-cv: ${error.message}`);
      handleAiError(res, error, "Wystąpił błąd podczas analizowania CV.");
    }
  });
});

app.post("/api/suggest-skills", aiLimiter, async (req, res) => {
  const reqId = newRequestId();
  const requestStart = Date.now();
  log(reqId, ">>> nowy request /api/suggest-skills");

  try {
    const {
      experience = [],
      projects = [],
      education = [],
      currentSkills = [],
      targetRole = "",
      language = "pl",
    } = req.body;

    const expText = experience
      .map((e: any) => `- Stanowisko: ${e.position} | Firma: ${e.company}`)
      .join("\n");

    const projText = projects
      .map((p: any) => `- Projekt: ${p.name} | Stack: ${p.technologies}\n  Opis: ${p.description || "Brak"}`)
      .join("\n");

    const currentSkillsList = currentSkills
      .map((s: any) => s.name)
      .filter(Boolean)
      .join(", ");

    const isEnglish = language === "en";

    const contextText = `
Stanowisko docelowe: ${targetRole || "Doradca Klienta / IT Specjalista"}
Język dokumentu: ${isEnglish ? "Angielski (English)" : "Polski"}

--- DOŚWIADCZENIE ---
${expText || "Brak"}

--- PROJEKTY ---
${projText || "Brak"}

--- OBECNIE DODANE UMIEJĘTNOŚCI ---
${currentSkillsList || "Brak"}
    `.trim();

    const response = await generateWithModelFallback(
      (modelName) => ({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Jesteś ekspertem ds. rekrutacji. Wygeneruj zestaw 8-10 umiejętności do CV w języku: ${isEnglish ? "ANGIELSKIM" : "POLSKIM"}.

Zasady (ŚCIŚLE PRZESTRZEGAJ):
1. SPÓJNOŚĆ JĘZYKOWA: Nie mieszaj języków w umiejętnościach miękkich i obsługowych.
   - Jeśli język to POLSKI: używaj polskich pojęć (np. "Obsługa klienta", "Rozliczanie transakcji finansowych", "Komunikacja z klientem", "Praca w zespole").
   - Jeśli język to ANGIELSKI: wszystkie pojęcia po angielsku (np. "Customer Service", "Financial Transaction Processing", "Teamwork").
2. Układ umiejętności:
   - Część 1: Umiejętności praktyczne, komercyjne i operacyjne (np. Obsługa klienta, Obsługa kasy fiskalnej, Rozliczanie transakcji, MS Office, Terminale płatnicze).
   - Część 2: Umiejętności zyskiwane z technologii (np. Rozwiązywanie problemów, Konfiguracja sprzętu PC, Narzędzia AI).
3. Pomijaj duplikaty znajdujące się już na liście: ${currentSkillsList}
4. Zwróć wyłącznie tablicę JSON ze stringami.

Dane do analizy:
${contextText}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: skillsSchemaResponse,
        },
      }),
      reqId
    );

    if (!response.text) {
      throw new Error("Model zwrócił pustą odpowiedź.");
    }

    const suggestedSkills: string[] = JSON.parse(response.text);
    log(reqId, `<<< SUKCES /api/suggest-skills (${Date.now() - requestStart}ms)`);
    res.json({ skills: suggestedSkills });
  } catch (error: any) {
    log(reqId, `<<< BŁĄD /api/suggest-skills: ${error.message}`);
    handleAiError(res, error, "Nie udało się wygenerować umiejętności.");
  }
});

app.post("/api/generate-summary", aiLimiter, async (req, res) => {
  const reqId = newRequestId();
  const requestStart = Date.now();
  log(reqId, ">>> nowy request /api/generate-summary");

  try {
    const { personalInfo, experience = [], projects = [], education = [], skills = [] } = req.body;

    const targetRole = personalInfo?.jobTitle || "Doradca Klienta";
    const contextText = `
Stanowisko docelowe, na które aplikuję: ${targetRole}

Doświadczenie zawodowe (bez szczegółowych opisów):
${experience.map((e: any) => `- ${e.position} w ${e.company}`).join("\n")}

Edukacja:
${education.map((e: any) => `- ${e.school} (${e.degree || ""})`).join("\n")}

Umiejętności:
${skills.map((s: any) => s.name).filter(Boolean).join(", ")}
    `.trim();

    const response = await generateWithModelFallback(
      (modelName) => ({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Napisz profesjonalne podsumowanie zawodowe w 1. osobie po polsku (3-4 zdania).

BARDZO WAŻNA ZASADA PRAWDOMÓWNOŚCI:
Kandydat NIE pracuje i NIE pracował jeszcze jako "${targetRole}". Posiada doświadczenie w pracy handlowej/kasjera (kontakt z ludźmi) oraz zaplecze edukacyjne/techniczne (React, C#, systemy IT, narzędzia AI).
NIE pisz np. "Jestem doradcą klienta z doświadczeniem...". 
Zamiast tego napisz np. "Praktyk w obszarze bezpośredniej obsługi klienta z zapleczem technologicznym..." lub "Osoba z doświadczeniem w obsłudze konsumentów oraz silnym zapleczem w zakresie nowych technologii...".

Struktura podsumowania:
1. Zdanie 1: Kim jestem (praktyk obsługi / osoba z doświadczeniem handlowym i zapleczem technicznym).
2. Zdanie 2: Jakie technologie, narzędzia (np. AI/LLM, MS Office) lub umiejętności wykorzystuję w codziennej pracy i rozwiązywaniu problemów.
3. Zdanie 3-4: Czego szukam w nowej pracy – wyraźna chęć rozwoju na stanowisku "${targetRole}", łącząca bezpośredni kontakt z klientem z doradztwem technicznym i wdrażaniem rozwiązań cyfrowych.

Zasady:
- Pisz konkretnie, naturalnie, bez sztucznych przymiotników typu "ambitny", "kluczowy".
- Zwróć sam czysty tekst bez cudzysłowów i znaczników markdown.

Dane:
${contextText}`,
              },
            ],
          },
        ],
      }),
      reqId
    );

    const summaryText = response.text?.trim() || "";
    if (!summaryText) {
      throw new Error("Model zwrócił pusty tekst.");
    }

    log(reqId, `<<< SUKCES /api/generate-summary (${Date.now() - requestStart}ms)`);
    res.json({ summary: summaryText });
  } catch (error: any) {
    log(reqId, `<<< BŁĄD /api/generate-summary: ${error.message}`);
    handleAiError(res, error, "Nie udało się wygenerować podsumowania.");
  }
});

app.post("/api/match-job", aiLimiter, async (req, res) => {
  const reqId = newRequestId();
  const requestStart = Date.now();
  log(reqId, ">>> nowy request /api/match-job");

  try {
    const { cvData, jobDescription } = req.body;

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 20) {
      return res.status(400).json({
        error: "Treść ogłoszenia jest za krótka do przeprowadzenia analizy.",
      });
    }

    const candidateContext = JSON.stringify({
      targetJobTitle: cvData?.personalInfo?.jobTitle,
      summary: cvData?.summary,
      skills: (cvData?.skills || []).map((s: any) => s.name),
      experience: (cvData?.experience || []).map((e: any) => ({ position: e.position, company: e.company })),
      projects: (cvData?.projects || []).map((p: any) => ({ name: p.name, technologies: p.technologies })),
      education: (cvData?.education || []).map((ed: any) => ({ school: ed.school, degree: ed.degree })),
      courses: (cvData?.courses || []).map((c: any) => c.name),
      interests: (cvData?.interests || []).map((i: any) => i.name),
    });

    const response = await generateWithModelFallback(
      (modelName) => ({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Jesteś ekspertem rekrutacji i systemów ATS. Porównaj profil kandydata z treścią ogłoszenia o pracę.

Zadania:
1. companyName: Wyciągnij nazwę firmy z ogłoszenia (jeśli brak, wpisz "Firma").
2. targetJobTitle: Wyciągnij dokładną nazwę stanowiska z ogłoszenia.
3. matchScore: Oceń dopasowanie w skali 0-100.
4. matchingSkills: Wymień umiejętności z ogłoszenia, które kandydat posiada w CV (np. obsługa klienta, znajomość MS Office, rozwiązywanie problemów).
5. missingSkills: Wymień słowa kluczowe z ogłoszenia, których brakuje w CV kandydata (maks. 8).
6. tailoredSummary: Napisz nowe podsumowanie zawodowe (3-4 zdania, w 1. osobie po polsku). Łącz w nim realne doświadczenie handlowe kandydata oraz jego zaplecze techniczne z wymaganiami tej konkretnej oferty. PAMIĘTAJ: Nie pisz, że kandydat pracował już na tym stanowisku docelowym – napisz, że posiada doświadczenie w obsłudze i chce je rozwijać na tym stanowisku.
7. actionableAdvice: Podaj 3 zwięzłe, konkretne rady pod tę ofertę.

Profil kandydata:
${candidateContext}

Treść ogłoszenia o pracę:
${jobDescription.slice(0, 10000)}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: jobMatchSchemaResponse,
          maxOutputTokens: 2048,
        },
      }),
      reqId
    );

    if (!response.text) {
      throw new Error("Model zwrócił pustą odpowiedź.");
    }

    const matchResult = JSON.parse(response.text);
    log(reqId, `<<< SUKCES /api/match-job (${Date.now() - requestStart}ms)`);
    res.json(matchResult);
  } catch (error: any) {
    log(reqId, `<<< BŁĄD /api/match-job: ${error.message}`);
    handleAiError(res, error, "Nie udało się przeanalizować dopasowania oferty.");
  }
});

app.post("/api/parse-readme", aiLimiter, async (req, res) => {
  const reqId = newRequestId();
  const requestStart = Date.now();
  log(reqId, ">>> nowy request /api/parse-readme");

  try {
    const { readmeText } = req.body;

    if (!readmeText || typeof readmeText !== "string" || readmeText.trim().length < 10) {
      return res.status(400).json({
        error: "Wklej najpierw treść pliku README lub opis projektu.",
      });
    }

    const response = await generateWithModelFallback(
      (modelName) => ({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Jesteś ekspertem rekrutacji. Przeanalizuj treść z README i przekształć ją na BARDZO ZWIĘZŁY wpis do CV.

Zasady:
1. name: Krótka nazwa rynkowa (np. "Fullstack AI CV Builder").
2. technologies: 5-7 najważniejszych technologii po przecinku.
3. description: Dokładnie 2-3 krótkie podpunkty HTML (<ul><li>...</li></ul>). Każdy punkt to zwięzłe zdanie skupione na rozwiązaniu technicznym.

Treść README:
${readmeText.slice(0, 8000)}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      }),
      reqId
    );

    if (!response.text) {
      throw new Error("Model zwrócił pustą odpowiedź.");
    }

    const result = JSON.parse(response.text);
    log(reqId, `<<< SUKCES /api/parse-readme (${Date.now() - requestStart}ms)`);
    res.json(result);
  } catch (error: any) {
    log(reqId, `<<< BŁĄD /api/parse-readme: ${error.message}`);
    handleAiError(res, error, "Nie udało się przeanalizować opisu projektu.");
  }
});

app.post("/api/enhance-description", aiLimiter, async (req, res) => {
  const reqId = newRequestId();
  const requestStart = Date.now();
  log(reqId, ">>> nowy request /api/enhance-description");

  try {
    const { text, contextTitle = "", contextSubtitle = "" } = req.body;

    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return res.status(400).json({
        error: "Wpisz najpierw krótką notatkę lub kilka słów o tym, co robiłeś.",
      });
    }

    const response = await generateWithModelFallback(
      (modelName) => ({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Przekształć poniższe robocze notatki w profesjonalne podpunkty do CV (od 2 do 4 podpunktów HTML).
Kontekst pozycji: ${contextTitle} ${contextSubtitle ? `(${contextSubtitle})` : ""}

Zasady:
- Skup się na konkretach i rezultatach.
- Zwróć WYŁĄCZNIE czystą listę HTML w formacie <ul><li>Punkt 1</li><li>Punkt 2</li></ul>.

Notatki:
${text}`,
              },
            ],
          },
        ],
      }),
      reqId
    );

    const rawHtml = (response.text || "")
      .replace(/```html/gi, "")
      .replace(/```/g, "")
      .trim();

    if (!rawHtml) {
      throw new Error("Model zwrócił pustą odpowiedź.");
    }

    log(reqId, `<<< SUKCES /api/enhance-description (${Date.now() - requestStart}ms)`);
    res.json({ html: rawHtml });
  } catch (error: any) {
    log(reqId, `<<< BŁĄD /api/enhance-description: ${error.message}`);
    handleAiError(res, error, "Nie udało się ulepszyć opisu.");
  }
});

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDistPath = path.resolve(currentDir, "../../dist");

app.use(express.static(frontendDistPath));

app.get(/(.*)/, (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serwer proxy działa na porcie ${PORT}`);
});
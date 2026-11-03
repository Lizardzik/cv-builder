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
2. experience: Każde stanowisko jako osobny element z: company, position, startDate (format MM.RRRR), endDate (format MM.RRRR lub słowo 'Obecnie'), description (sformatowane jako lista HTML <ul><li>...</li></ul>).
3. projects: Projekty programistyczne lub własne realizacje z: name, role, technologies, url, description.
4. education: Wszystkie szkoły i uczelnie z: school, degree, startDate (MM.RRRR), endDate (MM.RRRR lub 'Obecnie').
5. skills: Wyodrębnij wyłącznie technologie, języki programowania, narzędzia lub kompetencje zawodowe. NIE umieszczaj tutaj nazw stanowisk ani firm.
6. languages: Dla każdego języka określ poziom w formacie: 'A1', 'A2', 'B1', 'B2', 'C1', 'C2' lub 'Ojczysty'.
7. courses: Wszystkie kursy, certyfikaty i szkolenia.
8. summary: Jeśli w CV znajduje się podsumowanie zawodowe lub sekcja 'O mnie', przepisz ją.

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
    const { experience = [], projects = [], education = [], currentSkills = [] } = req.body;

    const hasData =
      (Array.isArray(experience) && experience.some((e: any) => e.company || e.position || e.description)) ||
      (Array.isArray(projects) && projects.some((p: any) => p.name || p.technologies || p.description)) ||
      (Array.isArray(education) && education.some((e: any) => e.school || e.degree));

    if (!hasData) {
      return res.status(400).json({
        error: "Uzupełnij najpierw opisy w doświadczeniu, projektach lub edukacji.",
      });
    }

    const expText = experience
      .map((e: any) => `- Stanowisko: ${e.position} | Firma: ${e.company}\n  Opis obowiązków i użytych technologii:\n  ${e.description || "Brak opisu"}`)
      .join("\n\n");

    const projText = projects
      .map((p: any) => `- Projekt: ${p.name} | Stack: ${p.technologies}\n  Opis realizacji:\n  ${p.description || "Brak opisu"}`)
      .join("\n\n");

    const eduText = education
      .map((e: any) => `- ${e.school}, ${e.degree}`)
      .join("\n");

    const currentSkillsList = currentSkills
      .map((s: any) => s.name)
      .filter(Boolean)
      .join(", ");

    const contextText = `
--- DOŚWIADCZENIE ZAWODOWE (ANALIZUJ DOKŁADNIE TREŚĆ OPISÓW) ---
${expText}

--- PROJEKTY (ANALIZUJ DOKŁADNIE TREŚĆ OPISÓW I STACK) ---
${projText}

--- EDUKACJA ---
${eduText}

--- OBECNIE DODANE UMIEJĘTNOŚCI (NIE REPETUJ ICH) ---
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
                text: `Jesteś analitykiem technicznym CV. Przeanalizuj SZCZEGÓŁOWO podane opisy obowiązków, zrealizowane zadania i technologie z sekcji Doświadczenie oraz Projekty.

Zadanie:
Wyciągnij i zasugeruj 6-12 konkretnych, rynkowych umiejętności (np. nazwy frameworków, bibliotek, baz danych, wzorców projektowych, metodologii lub narzędzi), które bezpośrednio wynikają z treści opisów kandydata, a nie zostały jeszcze dodane do jego listy.

Wymagania:
- Skup się na twardych umiejętnościach wynikających z opisów działań i osiągnięć kandydata.
- Zwróć wyłącznie tablicę JSON ze stringami.

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

    const contextText = `
Stanowisko docelowe: ${personalInfo?.jobTitle || "Nie podano"}
Doświadczenie:
${experience.map((e: any) => `- ${e.position} w ${e.company}: ${e.description}`).join("\n")}
Projekty:
${projects.map((p: any) => `- ${p.name} (${p.technologies}): ${p.description}`).join("\n")}
Edukacja:
${education.map((e: any) => `- ${e.degree} na ${e.school}`).join("\n")}
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
                text: `Napisz naturalne, konkretne podsumowanie zawodowe (3-4 zdania, w 1. osobie po polsku) na podstawie poniższych danych. Zwróć sam tekst bez cudzysłowów.\n\nDane:\n${contextText}`,
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
      jobTitle: cvData?.personalInfo?.jobTitle,
      summary: cvData?.summary,
      skills: (cvData?.skills || []).map((s: any) => s.name),
      experience: cvData?.experience || [],
      projects: cvData?.projects || [],
      education: cvData?.education || [],
    });

    const response = await generateWithModelFallback(
      (modelName) => ({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Jesteś technicznym rekruterem IT i ekspertem systemów ATS. Porównaj profil kandydata z treścią ogłoszenia o pracę.

Zadania:
1. companyName: Wyciągnij nazwę firmy z ogłoszenia (jeśli brak, wpisz "Firma").
2. targetJobTitle: Wyciągnij dokładną nazwę stanowiska z ogłoszenia.
3. matchScore: Oceń dopasowanie w skali 0-100.
4. matchingSkills: Wymień umiejętności z ogłoszenia, które kandydat już posiada w CV lub projektach.
5. missingSkills: Wymień konkretne technologie, narzędzia i słowa kluczowe z ogłoszenia, których brakuje w CV kandydata (maksymalnie 8 najważniejszych).
6. tailoredSummary: Napisz nowe, naturalne podsumowanie zawodowe (3-4 zdania, w 1. osobie po polsku), łączące prawdziwe doświadczenie i projekty kandydata z wymaganiami tego ogłoszenia. Nie zmyślaj faktów.
7. actionableAdvice: Podaj 3 krótkie, konkretne wskazówki, co kandydat powinien podkreślić w opisie swoich projektów lub doświadczenia pod tę ofertę.

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
                text: `Przekształć poniższe robocze notatki kandydata w profesjonalne, konkretne punkty do CV (od 2 do 4 podpunktów).
Kontekst pozycji: ${contextTitle} ${contextSubtitle ? `(${contextSubtitle})` : ""}

Zasady:
- Używaj rzeczowników odczasownikowych lub czasowników dokonanych (np. "Zaprojektowanie i wdrożenie...", "Optymalizacja...", "Obsługa...").
- Skup się na konkretach, technologiach i praktycznym rezultacie bez sztucznych przymiotników.
- Zwróć WYŁĄCZNIE czystą listę HTML w formacie <ul><li>Punkt 1</li><li>Punkt 2</li></ul> bez znaczników markdown i bez dodatkowego tekstu.

Notatki kandydata:
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
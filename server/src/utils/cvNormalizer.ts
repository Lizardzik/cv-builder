function normalizeLanguageLevel(rawLevel?: string): string {
  if (!rawLevel) return "B2";
  const val = rawLevel.trim().toLowerCase();

  if (val.includes("ojczyst") || val.includes("native") || val.includes("macierz")) return "Ojczysty";
  if (val.includes("c2") || val.includes("biegł") || val.includes("proficient")) return "C2";
  if (val.includes("c1") || val.includes("zaawansowan") || val.includes("advanced")) return "C1";
  if (val.includes("b2") || val.includes("wyższy średni") || val.includes("upper")) return "B2";
  if (val.includes("b1") || val.includes("średnio") || val.includes("intermediate")) return "B1";
  if (val.includes("a2") || val.includes("podstawow") || val.includes("elementary")) return "A2";
  if (val.includes("a1") || val.includes("początkuj") || val.includes("beginner")) return "A1";

  return "B2";
}

function normalizeEndDate(rawDate?: string): string {
  const cleaned = (rawDate || "").trim();
  const lower = cleaned.toLowerCase();
  if (
    !cleaned ||
    lower.includes("obecnie") ||
    lower.includes("teraz") ||
    lower.includes("current") ||
    lower.includes("present")
  ) {
    return "Obecnie";
  }
  return cleaned;
}

export function normalizeParsedCV(rawData: any): Record<string, any> {
  if (!rawData || typeof rawData !== "object") return {};
  const cleaned = { ...rawData };

  if (cleaned.personalInfo) {
    if (cleaned.personalInfo.phone) {
      let rawPhone = String(cleaned.personalInfo.phone)
        .replace(/\+48\s?/, "")
        .replace(/\D/g, "");
      if (rawPhone.length >= 9) {
        rawPhone = rawPhone.slice(-9).replace(/(\d{3})(?=\d)/g, "$1 ").trim();
      }
      cleaned.personalInfo.phone = rawPhone;
    }

    const githubUrl = (cleaned.personalInfo.github || "").trim().toLowerCase();
    const linkedinUrl = (cleaned.personalInfo.linkedin || "").trim().toLowerCase();

    if (Array.isArray(cleaned.personalInfo.customLinks)) {
      const seenUrls = new Set<string>();
      if (githubUrl) seenUrls.add(githubUrl);
      if (linkedinUrl) seenUrls.add(linkedinUrl);

      cleaned.personalInfo.customLinks = cleaned.personalInfo.customLinks.filter(
        (link: any) => {
          if (!link || !link.url) return false;
          const normalizedUrl = String(link.url).trim().toLowerCase();
          if (seenUrls.has(normalizedUrl)) return false;
          seenUrls.add(normalizedUrl);
          return true;
        }
      );
    }
  }

  if (Array.isArray(cleaned.languages)) {
    cleaned.languages = cleaned.languages.map((lang: any) => ({
      name: lang.name
        ? String(lang.name).charAt(0).toUpperCase() + String(lang.name).slice(1)
        : "",
      level: normalizeLanguageLevel(lang.level),
    }));
  }

  if (Array.isArray(cleaned.experience)) {
    cleaned.experience = cleaned.experience.map((exp: any) => ({
      ...exp,
      endDate: normalizeEndDate(exp.endDate),
    }));
  }

  if (Array.isArray(cleaned.education)) {
    cleaned.education = cleaned.education.map((edu: any) => ({
      ...edu,
      endDate: normalizeEndDate(edu.endDate),
    }));
  }

  return cleaned;
}
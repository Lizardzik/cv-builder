import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Target,
  Loader2,
  X,
  Check,
  Plus,
  CopyPlus,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CVData } from "@/types/cv";

export interface JobMatchResult {
  companyName: string;
  targetJobTitle: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  tailoredSummary: string;
  actionableAdvice: string[];
}

export interface JobMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTailoredVariant: (variantName: string, updatedData: CVData) => void;
}

export function JobMatchModal({
  isOpen,
  onClose,
  onCreateTailoredVariant,
}: JobMatchModalProps) {
  const { getValues, reset } = useFormContext<CVData>();
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobMatchResult | null>(null);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [applySummary, setApplySummary] = useState(true);
  const [applyJobTitle, setApplyJobTitle] = useState(true);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isLoading) return;
    setError(null);
    onClose();
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const handleAnalyze = async () => {
    if (jobDescription.trim().length < 30) {
      setError("Wklej pełniejszy opis oferty pracy (minimum 30 znaków).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      //?
      const currentCV = getValues();
      const lightweightCV = {
        personalInfo: {
          jobTitle: currentCV.personalInfo?.jobTitle,
        },
        summary: currentCV.summary,
        skills: currentCV.skills,
        experience: currentCV.experience,
        projects: currentCV.projects,
        education: currentCV.education,
      };

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/match-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvData: lightweightCV,
          jobDescription: jobDescription.trim(),
        }),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseData?.error || `Błąd serwera (${response.status}).`,
        );
      }

      setResult(responseData);
      setSelectedSkills(responseData.missingSkills || []);
      setApplySummary(Boolean(responseData.tailoredSummary));
      setApplyJobTitle(Boolean(responseData.targetJobTitle));
    } catch (err: any) {
      setError(err.message || "Nie udało się przeanalizować ogłoszenia.");
    } finally {
      setIsLoading(false);
    }
  };

  const buildUpdatedCVData = (): CVData => {
    const current = getValues();
    const existingSkillNames = new Set(
      (current.skills || []).map((s) => s.name.trim().toLowerCase()),
    );

    const newSkillObjects = selectedSkills
      .filter((skill) => !existingSkillNames.has(skill.trim().toLowerCase()))
      .map((name) => ({ name }));

    return {
      ...current,
      personalInfo: {
        ...current.personalInfo,
        jobTitle:
          applyJobTitle && result?.targetJobTitle
            ? result.targetJobTitle
            : current.personalInfo.jobTitle,
      },
      summary:
        applySummary && result?.tailoredSummary
          ? result.tailoredSummary
          : current.summary,
      skills: [...(current.skills || []), ...newSkillObjects],
    };
  };

  const handleApplyToCurrent = () => {
    const updated = buildUpdatedCVData();
    reset(updated);
    onClose();
  };

  const handleSaveAsNewVariant = () => {
    const updated = buildUpdatedCVData();
    const suffix =
      result?.companyName && result.companyName !== "Firma"
        ? result.companyName
        : result?.targetJobTitle || "Dopasowane";
    onCreateTailoredVariant(`Oferta: ${suffix}`, updated);
    onClose();
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 75)
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
    if (score >= 50)
      return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    return "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                Dopasuj CV pod ofertę pracy (ATS)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Przeanalizuj wymagania z ogłoszenia i stwórz dedykowany wariant
                CV
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={isLoading}
            onClick={handleClose}
            className="h-8 w-8 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {!result ? (
            <div className="space-y-3">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                Treść ogłoszenia o pracę (wymagania, obowiązki, opis stanowiska)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isLoading}
                rows={10}
                placeholder="Wklej tutaj skopiowaną treść oferty pracy z portalu ogłoszeniowego..."
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
              />
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
                <div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                    Rozpoznane stanowisko
                  </span>
                  <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {result.targetJobTitle || "Stanowisko z oferty"}
                  </span>
                  {result.companyName && (
                    <span className="text-xs text-zinc-500 ml-2">
                      ({result.companyName})
                    </span>
                  )}
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg border font-bold text-sm ${getScoreBadgeColor(
                    result.matchScore,
                  )}`}
                >
                  Dopasowanie: {result.matchScore}%
                </div>
              </div>

              {result.targetJobTitle && (
                <label className="flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyJobTitle}
                    onChange={(e) => setApplyJobTitle(e.target.checked)}
                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  Ustaw tytuł zawodowy w nagłówku CV na:{" "}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {result.targetJobTitle}
                  </strong>
                </label>
              )}

              {result.missingSkills && result.missingSkills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
                    Brakujące słowa kluczowe w Twoim CV (zaznacz te, które
                    znasz):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-indigo-400"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 opacity-60" />
                          )}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {result.tailoredSummary && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Zoptymalizowane podsumowanie zawodowe
                    </span>
                    <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applySummary}
                        onChange={(e) => setApplySummary(e.target.checked)}
                        className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      Zastosuj to podsumowanie
                    </label>
                  </div>
                  <div className="p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
                    {result.tailoredSummary}
                  </div>
                </div>
              )}

              {result.actionableAdvice &&
                result.actionableAdvice.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
                      Wskazówki do sekcji Projektów i Doświadczenia:
                    </span>
                    <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      {result.actionableAdvice.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-950 shrink-0">
          {result ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setResult(null)}
                className="text-zinc-600 dark:text-zinc-400"
              >
                Wklej inne ogłoszenie
              </Button>
              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyToCurrent}
                >
                  Zastosuj w obecnym CV
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveAsNewVariant}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <CopyPlus className="w-4 h-4 mr-1.5" /> Zapisz jako nowy
                  wariant
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={handleClose}
              >
                Anuluj
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isLoading || jobDescription.trim().length < 20}
                onClick={handleAnalyze}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Analizowanie oferty...
                  </>
                ) : (
                  <>
                    Analizuj dopasowanie{" "}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

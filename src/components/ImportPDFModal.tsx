import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Loader2,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CVData } from "@/types/cv";

type ImportPDFModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Partial<CVData>) => void;
};

const STAGES = [
  "Ekstrakcja tekstu z dokumentu PDF",
  "Identyfikacja danych i stanowisk pracy",
  "Klasyfikacja umiejętności i certyfikatów",
  "Normalizacja danych do standardu ATS",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ImportPDFModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportPDFModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cancelledByUserRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  const handleCancel = () => {
    if (isLoading && abortControllerRef.current) {
      cancelledByUserRef.current = true;
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setIsSuccessState(false);
    setActiveStage(0);
    setError(null);
    setFile(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") {
        setError("Dozwolone są wyłącznie pliki PDF.");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    cancelledByUserRef.current = false;
    setIsLoading(true);
    setIsSuccessState(false);
    setActiveStage(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    const CLIENT_TIMEOUT_MS = 65000;
    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, CLIENT_TIMEOUT_MS);

    const formData = new FormData();
    formData.append("pdf", file);

    const fetchPromise = (async () => {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/parse-cv`, {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current?.signal,
      });

      const responseData = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          responseData?.error ||
            `Błąd serwera (${res.status}). Spróbuj ponownie.`,
        );
      }
      return responseData as Partial<CVData>;
    })();

    try {
      setActiveStage(0);
      await sleep(550);

      setActiveStage(1);
      await sleep(650);

      setActiveStage(2);
      const parsedCV = await fetchPromise;

      setActiveStage(3);
      await sleep(500);

      setIsSuccessState(true);
      await sleep(750);

      onSuccess(parsedCV);
      onClose();
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError(
          cancelledByUserRef.current
            ? "Przerwano importowanie."
            : "Przekroczono limit czasu oczekiwania. Odczekaj chwilę i spróbuj ponownie.",
        );
      } else {
        setError(err.message || "Nie udało się sparsować dokumentu.");
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      setIsSuccessState(false);
    }
  };

  const progressPercent = isSuccessState
    ? 100
    : Math.round(((activeStage + 1) / STAGES.length) * 85);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) handleCancel();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              Inteligentny import CV
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={isLoading}
            onClick={handleCancel}
            className="h-8 w-8 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {isLoading ? (
          <div className="py-6 px-4 flex flex-col gap-5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isSuccessState ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in-75 duration-300" />
                ) : (
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                )}
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {isSuccessState
                    ? "Gotowe! Uzupełniam formularz..."
                    : "Przetwarzanie dokumentu..."}
                </span>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isSuccessState ? "bg-emerald-500" : "bg-indigo-600"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-2.5 pt-1">
              {STAGES.map((label, i) => {
                const isPassed = isSuccessState || i < activeStage;
                const isCurrent = !isSuccessState && i === activeStage;

                return (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-xs transition-colors duration-300"
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
                    )}
                    <span
                      className={
                        isPassed
                          ? "text-zinc-500 dark:text-zinc-400 font-normal"
                          : isCurrent
                            ? "font-semibold text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-400 dark:text-zinc-600"
                      }
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-zinc-50/50 dark:bg-zinc-900/50"
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200 break-all">
                  {file.name}
                </span>
                <span className="text-xs text-zinc-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="w-10 h-10 text-zinc-400" />
                <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
                  Wybierz lub upuść plik PDF
                </span>
                <span className="text-xs text-zinc-400">
                  Wszystkie pozycje zostaną automatycznie dopasowane do
                  formularzy
                </span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
              {error}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {isLoading ? "Przerwij" : "Anuluj"}
          </Button>

          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px] font-medium shadow-sm disabled:opacity-50"
          >
            Uzupełnij CV
          </Button>
        </div>
      </div>
    </div>
  );
}

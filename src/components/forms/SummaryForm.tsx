import { useFormContext } from "react-hook-form";
import { Sparkles, FileSignature, Loader2, Check } from "lucide-react";
import { useState } from "react";
import type { CVData } from "@/types/cv";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { requestAiFeature } from "@/lib/ai-client";

export function SummaryForm() {
  const { control, setValue, getValues } = useFormContext<CVData>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const setRodo = () => {
    setValue(
      "clause",
      "Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).",
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    setFeedback(null);

    const values = getValues();
    try {
      const data = await requestAiFeature<{ summary: string }>(
        "/api/generate-summary",
        {
          personalInfo: values.personalInfo,
          experience: values.experience,
          education: values.education,
          skills: values.skills,
        },
      );

      if (data.summary) {
        setValue("summary", data.summary, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setFeedback({ text: "Wygenerowano profil zawodowy.", isError: false });
      }
    } catch (err: any) {
      setFeedback({ text: err.message, isError: true });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
          Podsumowanie i RODO
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Dopracuj swój profil i dodaj niezbędne zgody prawne.
        </p>
      </div>

      <FormField
        control={control}
        name="summary"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FormLabel>Profil zawodowy (O mnie)</FormLabel>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateWithAI}
                disabled={isGenerating}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 h-8 font-medium"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{" "}
                    Pisanie...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Napisz z AI
                  </>
                )}
              </Button>
            </div>
            <FormControl>
              <Textarea
                placeholder="Krótki opis Twojego doświadczenia zawodowego..."
                className="h-32 resize-none bg-transparent"
                {...field}
              />
            </FormControl>
            {feedback && (
              <p
                className={`text-xs font-medium flex items-center gap-1 mt-1 ${
                  feedback.isError
                    ? "text-red-500"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {!feedback.isError && <Check className="w-3.5 h-3.5" />}
                {feedback.text}
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="clause"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
              <FormLabel>Klauzula poufności (RODO)</FormLabel>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={setRodo}
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 h-8 text-xs"
              >
                <FileSignature className="w-3 h-3 mr-1.5" /> Wstaw domyślne RODO
              </Button>
            </div>
            <FormControl>
              <Textarea
                placeholder="Wyrażam zgodę..."
                className="h-24 resize-none text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 bg-transparent"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

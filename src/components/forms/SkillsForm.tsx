import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Sparkles, Loader2, Check } from "lucide-react";
import type { CVData } from "@/types/cv";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requestAiFeature } from "@/lib/ai-client";

const MAX_SKILLS = 16;

export function SkillsForm() {
  const { control, getValues } = useFormContext<CVData>();
  const { fields, append, remove } = useFieldArray({ control, name: "skills" });
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const handleGenerateSkills = async () => {
    setIsLoadingAi(true);
    setStatusMessage(null);

    const experience = getValues("experience") || [];
    const projects = getValues("projects") || [];
    const education = getValues("education") || [];
    const currentSkills = getValues("skills") || [];

    try {
      const data = await requestAiFeature<{ skills: string[] }>(
        "/api/suggest-skills",
        { experience, projects, education, currentSkills },
      );

      if (Array.isArray(data.skills) && data.skills.length > 0) {
        const existingNames = new Set(
          currentSkills
            .map((s) => s.name?.trim().toLowerCase())
            .filter(Boolean),
        );

        let addedCount = 0;
        for (const skillName of data.skills) {
          if (fields.length + addedCount >= MAX_SKILLS) break;
          const clean = skillName.trim();
          if (clean && !existingNames.has(clean.toLowerCase())) {
            append({ name: clean });
            existingNames.add(clean.toLowerCase());
            addedCount++;
          }
        }

        setStatusMessage({
          text:
            addedCount > 0
              ? `Dodano ${addedCount} nowych umiejętności.`
              : "Brak nowych umiejętności do dodania.",
          isError: false,
        });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message, isError: true });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const isLimitReached = fields.length >= MAX_SKILLS;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-1">
              Umiejętności
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Wypisz technologie i kompetencje (max {MAX_SKILLS}, by zachować
              układ 1 strony).
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {fields.length}/{MAX_SKILLS}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => append({ name: "" })}
            disabled={isLimitReached}
          >
            <Plus className="w-4 h-4 mr-2" /> Dodaj umiejętność
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleGenerateSkills}
            disabled={isLoadingAi || isLimitReached}
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
          >
            {isLoadingAi ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Dopasowywanie...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                Generuj z AI
              </>
            )}
          </Button>
        </div>

        {statusMessage && (
          <p
            className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 animate-in fade-in ${
              statusMessage.isError
                ? "text-red-500"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {!statusMessage.isError && <Check className="w-4 h-4" />}
            {statusMessage.text}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {fields.map((field, index) => (
          <div key={field.id} className="relative">
            <FormField
              control={control}
              name={`skills.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="Np. React, TypeScript" {...field} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Usuń umiejętność"
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        {fields.length === 0 && (
          <div className="col-span-1 sm:col-span-2 text-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400">
            Brak dodanych umiejętności.
          </div>
        )}
      </div>
    </div>
  );
}

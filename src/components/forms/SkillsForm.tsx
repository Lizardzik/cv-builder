import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2, GripVertical, Sparkles, Loader2 } from "lucide-react";
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

export function SkillsForm() {
  const { control, watch } = useFormContext<CVData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "skills",
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleSuggestSkills = async () => {
    setIsLoadingAi(true);
    try {
      const data = await requestAiFeature<{ skills: string[] }>(
        "/api/suggest-skills",
        {
          experience: watch("experience"),
          projects: watch("projects"),
          education: watch("education"),
          currentSkills: watch("skills"),
          targetRole: watch("personalInfo.jobTitle"),
          language: "pl", // lub "en" jeśli dodasz przełącznik języka
        },
      );

      if (data.skills && Array.isArray(data.skills)) {
        data.skills.forEach((skillName) => {
          append({ name: skillName });
        });
      }
    } catch (err: any) {
      alert(err.message || "Błąd generowania umiejętności.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
            Umiejętności
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Przeciągaj elementy, aby ustawić najważniejsze technologie na samej
            górze.
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoadingAi}
            onClick={handleSuggestSkills}
            className="text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
          >
            {isLoadingAi ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            )}
            Sugeruj z AI
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "" })}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Dodaj
          </Button>
        </div>
      </div>

      <div className="space-y-2.5">
        {fields.map((field, index) => (
          <div
            key={field.id}
            draggable
            onDragStart={(e) => {
              setDraggedIndex(index);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedIndex !== null && draggedIndex !== index) {
                move(draggedIndex, index);
              }
              setDraggedIndex(null);
            }}
            onDragEnd={() => setDraggedIndex(null)}
            className={`flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs transition-all ${
              draggedIndex === index
                ? "opacity-40 border-indigo-500 ring-2 ring-indigo-500/20"
                : ""
            }`}
          >
            <div className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0">
              <GripVertical className="w-4 h-4" />
            </div>

            <FormField
              control={control}
              name={`skills.${index}.name`}
              render={({ field }) => (
                <FormItem className="flex-1 m-0 space-y-0">
                  <FormControl>
                    <Input
                      placeholder="Np. React, TypeScript, Git, Problem Solving"
                      className="h-9 text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
              onClick={() => remove(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-sm">
            Brak umiejętności. Kliknij "Dodaj" lub użyj przycisku "Sugeruj z
            AI".
          </div>
        )}
      </div>
    </div>
  );
}

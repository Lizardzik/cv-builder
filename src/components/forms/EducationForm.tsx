import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Plus,
  Trash2,
  GripHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { CVData } from "@/types/cv";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRangeFields } from "./DateRangeFields";

export function EducationForm() {
  const { control } = useFormContext<CVData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "education",
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-1">
            Twoja edukacja
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Wymień ukończone szkoły, uczelnie lub kierunki studiów.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({ school: "", degree: "", startDate: "", endDate: "" })
          }
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Dodaj szkołę
        </Button>
      </div>

      <div className="space-y-6">
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
            className={`border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm transition-all ${
              draggedIndex === index
                ? "opacity-40 scale-[0.98] border-indigo-500 ring-2 ring-indigo-500/20"
                : ""
            }`}
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <span
                  className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hidden sm:inline-block"
                  title="Przeciągnij myszą"
                >
                  <GripHorizontal className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mr-2">
                  #{index + 1} Szkoła
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Usuń edukację"
                className="h-7 px-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Usuń
              </Button>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`education.${index}.school`}
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Uczelnia lub Szkoła</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Np. Politechnika Warszawska"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`education.${index}.degree`}
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Kierunek i Tytuł</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Np. Informatyka, Inżynier"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DateRangeFields
                startName={`education.${index}.startDate`}
                endName={`education.${index}.endDate`}
                currentLabel="Studiuję aktualnie"
                currentCheckboxId={`edu-current-${field.id}`}
              />
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400">
            Brak dodanej edukacji.
          </div>
        )}
      </div>
    </div>
  );
}

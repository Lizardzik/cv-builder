import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus } from "lucide-react";
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
import { RichTextEditor } from "@/components/RichTextEditor";
import { DateRangeFields } from "./DateRangeFields";
import { SortableItemHeader } from "./SortableItemHeader";

export function ExperienceForm() {
  const { control, watch } = useFormContext<CVData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "experience",
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-1 text-zinc-900 dark:text-zinc-50">
            Doświadczenie zawodowe
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Dodaj stanowiska i opisz zakres swoich obowiązków lub ulepsz punkty
            z AI.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              company: "",
              position: "",
              startDate: "",
              endDate: "",
              description: "",
            })
          }
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Dodaj pozycję
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
            <SortableItemHeader
              index={index}
              total={fields.length}
              label="Pozycja"
              onMoveUp={() => move(index, index - 1)}
              onMoveDown={() => move(index, index + 1)}
              onRemove={() => remove(index)}
            />

            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`experience.${index}.company`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firma</FormLabel>
                      <FormControl>
                        <Input placeholder="Np. Tech Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`experience.${index}.position`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stanowisko</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Np. Junior .NET Developer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DateRangeFields
                  startName={`experience.${index}.startDate`}
                  endName={`experience.${index}.endDate`}
                  currentLabel="Pracuję aktualnie"
                  currentCheckboxId={`exp-current-${field.id}`}
                />
              </div>

              <FormField
                control={control}
                name={`experience.${index}.description`}
                render={({ field }) => (
                  <FormItem className="pt-2">
                    <FormLabel>Opis obowiązków i osiągnięć</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        contextTitle={watch(`experience.${index}.position`)}
                        contextSubtitle={watch(`experience.${index}.company`)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400">
            Brak dodanego doświadczenia.
          </div>
        )}
      </div>
    </div>
  );
}

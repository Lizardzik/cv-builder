import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, FolderGit2 } from "lucide-react";
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
import { SortableItemHeader } from "./SortableItemHeader";

export function ProjectsForm() {
  const { control, watch } = useFormContext<CVData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "projects",
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-1 text-zinc-900 dark:text-zinc-50">
            Projekty
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Pokaż praktyczne realizacje, własne aplikacje i wykorzystany stack
            technologiczny.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              name: "",
              role: "",
              technologies: "",
              url: "",
              description: "",
            })
          }
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" /> Dodaj projekt
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
              label="Projekt"
              onMoveUp={() => move(index, index - 1)}
              onMoveDown={() => move(index, index + 1)}
              onRemove={() => remove(index)}
            />

            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`projects.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa projektu</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Np. Subscription Tracker SaaS"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`projects.${index}.technologies`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Technologie (oddzielone przecinkami)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Np. C#, .NET 8, React, SQL Server"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`projects.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twoja rola (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Np. Fullstack Developer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`projects.${index}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link do GitHub / Live (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="github.com/uzytkownik/projekt"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name={`projects.${index}.description`}
                render={({ field }) => (
                  <FormItem className="pt-2">
                    <FormLabel>
                      Opis architektury i zrealizowanych funkcji
                    </FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        contextTitle={watch(`projects.${index}.name`)}
                        contextSubtitle={watch(
                          `projects.${index}.technologies`,
                        )}
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
          <div className="text-center py-10 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            <FolderGit2 className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Brak dodanych projektów
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
              Własne projekty to najsilniejszy argument w CV na stanowiska
              juniorskie i mid.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  name: "",
                  role: "",
                  technologies: "",
                  url: "",
                  description: "",
                })
              }
            >
              <Plus className="w-4 h-4 mr-1.5" /> Dodaj pierwszy projekt
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

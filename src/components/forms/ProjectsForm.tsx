import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, FolderGit2, Sparkles, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/RichTextEditor";
import { SortableItemHeader } from "./SortableItemHeader";
import { requestAiFeature } from "@/lib/ai-client";

export function ProjectsForm() {
  const { control, watch, setValue } = useFormContext<CVData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "projects",
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeReadmeIndex, setActiveReadmeIndex] = useState<number | null>(
    null,
  );
  const [readmeInput, setReadmeInput] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleParseReadme = async (index: number) => {
    if (!readmeInput.trim()) return;
    setIsLoadingAi(true);

    try {
      const data = await requestAiFeature<{
        name: string;
        technologies: string;
        description: string;
      }>("/api/parse-readme", { readmeText: readmeInput });

      if (data.name)
        setValue(`projects.${index}.name`, data.name, { shouldDirty: true });
      if (data.technologies)
        setValue(`projects.${index}.technologies`, data.technologies, {
          shouldDirty: true,
        });
      if (data.description)
        setValue(`projects.${index}.description`, data.description, {
          shouldDirty: true,
        });

      setActiveReadmeIndex(null);
      setReadmeInput("");
    } catch (err: any) {
      alert(err.message || "Błąd parsowania README");
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-1 text-zinc-900 dark:text-zinc-50">
            Projekty i realizacje
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Twój główny punkt przetargowy. Nazywaj projekty profesjonalnie i
            pokazuj wykorzystany stack.
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
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setActiveReadmeIndex(
                      activeReadmeIndex === index ? null : index,
                    )
                  }
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  {activeReadmeIndex === index
                    ? "Zamknij generator"
                    : "Wklej README z GitHub / Generuj z AI"}
                </Button>
              </div>

              {activeReadmeIndex === index && (
                <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                  <FormLabel className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                    Wklej surową treść README.md lub opis projektu:
                  </FormLabel>
                  <Textarea
                    placeholder="Np. # Subscription Tracker... Aplikacja zbudowana w C# i React z bazą SQL Server..."
                    value={readmeInput}
                    onChange={(e) => setReadmeInput(e.target.value)}
                    className="h-28 text-xs bg-white dark:bg-zinc-900"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={isLoadingAi || !readmeInput.trim()}
                    onClick={() => handleParseReadme(index)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isLoadingAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{" "}
                        PR-owanie projektu...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Przepisz
                        projekt na język CV
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`projects.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa rynkowa projektu</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Np. Fullstack E-Commerce Platform"
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
                      <FormLabel>Stack technologiczny</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Np. React, TypeScript, C#, .NET 8, Gemini API"
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
                      <FormLabel>Rola w projekcie</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Np. Lead Developer / Creator"
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
                      <FormLabel>Link (GitHub / Live Demo)</FormLabel>
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
                    <FormLabel>Opis architektury i osiągnięć</FormLabel>
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
              Własne projekty z dobrze dobraną nazwą i opisem stacku to
              najsilniejszy argument w CV IT.
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

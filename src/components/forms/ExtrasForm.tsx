import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { CVData } from "@/types/cv";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LANGUAGE_LEVELS = [
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
  { value: "Ojczysty", label: "Ojczysty" },
];

export function ExtrasForm() {
  const { control } = useFormContext<CVData>();
  const {
    fields: langFields,
    append: appendLang,
    remove: removeLang,
  } = useFieldArray({ control, name: "languages" });
  const {
    fields: courseFields,
    append: appendCourse,
    remove: removeCourse,
  } = useFieldArray({ control, name: "courses" });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Języki obce</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Wybierz język i standardowy poziom biegłości.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => appendLang({ name: "", level: "B2" })}
          >
            <Plus className="w-4 h-4 mr-2" /> Dodaj język
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {langFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <FormField
                control={control}
                name={`languages.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Np. Angielski"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`languages.${index}.level`}
                render={({ field }) => (
                  <FormItem className="w-28 shrink-0">
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      >
                        {LANGUAGE_LEVELS.map((lvl) => (
                          <option key={lvl.value} value={lvl.value}>
                            {lvl.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Usuń język"
                className="h-10 w-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                onClick={() => removeLang(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {langFields.length === 0 && (
            <div className="col-span-1 sm:col-span-2 text-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-sm">
              Brak dodanych języków.
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Kursy i certyfikaty</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Pochwal się dodatkowymi kwalifikacjami.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => appendCourse({ name: "", date: "" })}
          >
            <Plus className="w-4 h-4 mr-2" /> Dodaj kurs
          </Button>
        </div>

        <div className="space-y-4">
          {courseFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <FormField
                control={control}
                name={`courses.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Np. AWS Certified Solutions Architect"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`courses.${index}.date`}
                render={({ field }) => (
                  <FormItem className="w-32 shrink-0">
                    <FormControl>
                      <Input
                        placeholder="Rok / Data"
                        className="h-10"
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
                aria-label="Usuń kurs"
                className="h-10 w-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                onClick={() => removeCourse(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {courseFields.length === 0 && (
            <div className="text-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-sm">
              Brak dodanych kursów.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

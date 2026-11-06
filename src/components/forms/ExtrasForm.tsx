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

  const {
    fields: interestFields,
    append: appendInterest,
    remove: removeInterest,
  } = useFieldArray({ control, name: "interests" });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* JĘZYKI OBCE */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Języki obce</h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendLang({ name: "", level: "B2" })}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Dodaj język
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        className="h-9 text-sm"
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
                        className="w-full h-9 px-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
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
                className="h-9 w-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                onClick={() => removeLang(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* KURSY I CERTYFIKATY */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Certyfikaty i kwalifikacje
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendCourse({ name: "", date: "" })}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Dodaj
          </Button>
        </div>

        <div className="space-y-3">
          {courseFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <FormField
                control={control}
                name={`courses.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Np. INF.04 Projektowanie i programowanie aplikacji"
                        className="h-9 text-sm"
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
                  <FormItem className="w-28 shrink-0">
                    <FormControl>
                      <Input
                        placeholder="Rok / Data"
                        className="h-9 text-sm"
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
                className="h-9 w-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                onClick={() => removeCourse(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* ZAINTERESOWANIA / HOBBY */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Zainteresowania / Pasje</h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendInterest({ name: "" })}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Dodaj pasję
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {interestFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <FormField
                control={control}
                name={`interests.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Np. Nowinki technologiczne i sprzęt GSM"
                        className="h-9 text-sm"
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
                className="h-9 w-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                onClick={() => removeInterest(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

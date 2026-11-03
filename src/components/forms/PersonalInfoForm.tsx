import { useState } from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { Camera, Plus, Trash2 } from "lucide-react";
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

const MAX_PHOTO_SIZE = 3 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_DIMENSION = 512;

export function PersonalInfoForm() {
  const { control, setValue } = useFormContext<CVData>();
  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({ control, name: "personalInfo.customLinks" });

  const photo = useWatch({ control, name: "personalInfo.photo" });
  const [photoError, setPhotoError] = useState<string | null>(null);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(
            1,
            MAX_PHOTO_DIMENSION / Math.max(img.width, img.height),
          );
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context unavailable"));
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Dozwolone formaty: JPG, PNG, WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("Zdjęcie jest za duże (maksymalnie 3 MB).");
      e.target.value = "";
      return;
    }

    try {
      const resized = await resizeImage(file);
      setValue("personalInfo.photo", resized, { shouldDirty: true });
    } catch {
      setPhotoError("Nie udało się wczytać zdjęcia.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Zacznijmy od danych
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
            Podaj swoje podstawowe informacje kontaktowe, aby rekruter mógł się
            z Tobą skontaktować.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 self-center sm:self-start shrink-0">
          <label
            className={`relative flex items-center justify-center w-24 h-24 bg-zinc-50 dark:bg-zinc-900 rounded-full cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all overflow-hidden group shadow-sm ${
              !photo
                ? "border-2 border-dashed border-zinc-300 dark:border-zinc-700"
                : "border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {photo ? (
              <img
                src={photo}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[9px] font-medium uppercase tracking-wider">
                  Dodaj
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>
          {photoError && (
            <p className="text-xs text-red-500 text-center max-w-[120px]">
              {photoError}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <FormField
          control={control}
          name="personalInfo.firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imię</FormLabel>
              <FormControl>
                <Input placeholder="np. Jan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="personalInfo.lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwisko</FormLabel>
              <FormControl>
                <Input placeholder="np. Kowalski" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="personalInfo.jobTitle"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Stanowisko pracy</FormLabel>
              <FormControl>
                <Input placeholder="np. Frontend Developer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="personalInfo.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  placeholder="np. jan@gmail.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="personalInfo.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numer telefonu</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 text-sm font-medium shrink-0">
                    +48
                  </div>
                  <Input
                    placeholder="123 456 789"
                    type="tel"
                    maxLength={11}
                    {...field}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const formatted = val
                        .replace(/(\d{3})(?=\d)/g, "$1 ")
                        .trim();
                      field.onChange(formatted);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="personalInfo.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Miasto</FormLabel>
              <FormControl>
                <Input placeholder="np. Warszawa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="personalInfo.postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kod pocztowy</FormLabel>
              <FormControl>
                <Input
                  placeholder="np. 00-001"
                  maxLength={6}
                  {...field}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length > 2)
                      val = val.substring(0, 2) + "-" + val.substring(2, 5);
                    field.onChange(val);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="personalInfo.dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data urodzenia (opcjonalnie)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="personalInfo.github"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub (opcjonalnie)</FormLabel>
              <FormControl>
                <Input placeholder="github.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-1 sm:col-span-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <FormLabel>Własne linki (Portfolio, LinkedIn, Blog)</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendLink({ label: "", url: "" })}
            >
              <Plus className="w-3 h-3 mr-2" /> Dodaj link
            </Button>
          </div>
          <div className="space-y-3">
            {linkFields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row gap-2">
                <FormField
                  control={control}
                  name={`personalInfo.customLinks.${index}.label`}
                  render={({ field }) => (
                    <FormItem className="w-full sm:w-1/3">
                      <FormControl>
                        <Input placeholder="Np. Portfolio" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`personalInfo.customLinks.${index}.url`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="URL (np. jan.dev)" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Usuń link"
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 self-end sm:self-auto shrink-0"
                  onClick={() => removeLink(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

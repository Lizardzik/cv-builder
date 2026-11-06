import { useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Type, Palette, MoveVertical, TypeOutline, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CVData } from "@/types/cv";

const MAX_FONT_SIZE = 2 * 1024 * 1024;
const ALLOWED_FONT_TYPES = [
  "font/ttf",
  "font/woff",
  "font/woff2",
  "application/font-woff",
  "application/font-woff2",
  "application/x-font-ttf",
];

export function ThemeSettingsForm() {
  const { control, setValue } = useFormContext<CVData>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fontError, setFontError] = useState<string | null>(null);

  const theme =
    useWatch({ control, name: "theme" }) ??
    ({} as NonNullable<CVData["theme"]>);
  const {
    font: currentFont = "font-sans",
    customFont: customFontBase64,
    color: currentColor = "#047857",
    textColor: currentTextColor = "#18181b",
    backgroundColor: currentBgColor = "#ffffff",
    spacing: currentSpacing = 16,
    fontSize: currentFontSize = 13,
  } = theme;

  const fonts = [
    { id: "font-sans", name: "Inter" },
    { id: "font-serif", name: "Merriweather" },
    { id: "font-mono", name: "Roboto Mono" },
    { id: "font-custom", name: "Własna" },
  ];

  const presetColors = ["#047857", "#18181b", "#1d4ed8", "#be123c"];

  const handleCustomFont = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFontError(null);
    const hasValidExtension = /\.(ttf|woff2?|otf)$/i.test(file.name);
    if (!ALLOWED_FONT_TYPES.includes(file.type) && !hasValidExtension) {
      setFontError("Dozwolone formaty: TTF, WOFF, WOFF2.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FONT_SIZE) {
      setFontError("Plik czcionki jest za duży (maksymalnie 2 MB).");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setValue("theme.customFont", reader.result as string, {
        shouldDirty: true,
      });
      setValue("theme.font", "font-custom", { shouldDirty: true });
    };
    reader.onerror = () => {
      setFontError("Nie udało się wczytać czcionki.");
    };
    reader.readAsDataURL(file);
  };

  const handleFontSelect = (fontId: string) => {
    if (fontId === "font-custom" && !customFontBase64) {
      fileInputRef.current?.click();
    } else {
      setValue("theme.font", fontId, { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-1">
          Wygląd dokumentu
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Dostosuj kolory, czcionkę i parametry podglądu PDF.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Type className="w-4 h-4" /> Rodzina czcionek
            </h3>
            <label className="cursor-pointer text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <Upload className="w-3 h-3" /> Wgraj plik
              <input
                type="file"
                ref={fileInputRef}
                accept=".ttf,.woff,.woff2"
                className="hidden"
                onChange={handleCustomFont}
              />
            </label>
          </div>
          {fontError && (
            <p className="text-xs text-red-500 mb-2">{fontError}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {fonts.map((font) => (
              <Button
                key={font.id}
                type="button"
                variant="outline"
                onClick={() => handleFontSelect(font.id)}
                className={`px-2 ${
                  currentFont === font.id
                    ? "ring-2 ring-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 font-medium"
                    : ""
                }`}
              >
                {font.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4" /> Kolor akcentu
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Kolor akcentu ${color}`}
                  onClick={() =>
                    setValue("theme.color", color, { shouldDirty: true })
                  }
                  style={{ backgroundColor: color }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-zinc-900 ring-2 transition-all ${
                    currentColor.toLowerCase() === color
                      ? "ring-indigo-600 scale-110"
                      : "ring-transparent hover:ring-zinc-300"
                  }`}
                />
              ))}

              <div
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-zinc-900 ring-2 ring-transparent hover:ring-zinc-300 transition-all overflow-hidden"
                style={{
                  background:
                    "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                }}
              >
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) =>
                    setValue("theme.color", e.target.value, {
                      shouldDirty: true,
                    })
                  }
                  className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer opacity-0"
                  title="Wybierz własny kolor akcentu"
                />
              </div>
              <span className="text-sm font-mono text-zinc-500">
                {currentColor.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1.5">
                Kolor tekstu
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentTextColor}
                  onChange={(e) =>
                    setValue("theme.textColor", e.target.value, {
                      shouldDirty: true,
                    })
                  }
                  className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-zinc-500">
                  {currentTextColor.toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1.5">
                Kolor tła arkusza
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentBgColor}
                  onChange={(e) =>
                    setValue("theme.backgroundColor", e.target.value, {
                      shouldDirty: true,
                    })
                  }
                  className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-zinc-500">
                  {currentBgColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-2">
          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <TypeOutline className="w-4 h-4" /> Rozmiar tekstu (
              {currentFontSize}px)
            </h3>
            <input
              type="range"
              min="12"
              max="15"
              step="1"
              value={Math.min(currentFontSize, 15)}
              onChange={(e) =>
                setValue("theme.fontSize", parseInt(e.target.value), {
                  shouldDirty: true,
                })
              }
              className="w-full accent-indigo-600"
            />
            <span className="text-[11px] text-zinc-400">
              Optymalne pod 1 stronę A4: 13-14px
            </span>
          </div>

          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <MoveVertical className="w-4 h-4" /> Odstępy ({currentSpacing}px)
            </h3>
            <input
              type="range"
              min="12"
              max="24"
              step="2"
              value={Math.min(currentSpacing, 24)}
              onChange={(e) =>
                setValue("theme.spacing", parseInt(e.target.value), {
                  shouldDirty: true,
                })
              }
              className="w-full accent-indigo-600"
            />
            <span className="text-[11px] text-zinc-400">
              Optymalne pod 1 stronę A4: 16-20px
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

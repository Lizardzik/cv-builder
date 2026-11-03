import {
  Download,
  Trash2,
  Files,
  FileUp,
  Target,
  Loader2,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  activeVariantName: string;
  isGeneratingPDF: boolean;
  onOpenVariantsModal: () => void;
  onOpenImportModal: () => void;
  onOpenJobMatchModal: () => void;
  onLoadMockData: () => void;
  onClearAllData: () => void;
  onDownloadPDF: () => void;
}

export function Navbar({
  activeVariantName,
  isGeneratingPDF,
  onOpenVariantsModal,
  onOpenImportModal,
  onOpenJobMatchModal,
  onLoadMockData,
  onClearAllData,
  onDownloadPDF,
}: NavbarProps) {
  return (
    <header className="h-16 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between shrink-0 print:hidden z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-tight">
          CV
        </div>
        <div className="flex flex-col">
          <h1 className="font-bold text-base text-zinc-900 dark:text-zinc-50 leading-none">
            CV Builder
          </h1>
          <button
            type="button"
            onClick={onOpenVariantsModal}
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 mt-1 text-left"
            title="Kliknij, aby zarządzać wariantami"
          >
            <span>
              Wariant:{" "}
              <strong className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[140px] inline-block align-bottom">
                {activeVariantName}
              </strong>
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 mr-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Autozapis aktywny</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenJobMatchModal}
          className="border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
          title="Dopasuj CV pod konkretne ogłoszenie o pracę"
        >
          <Target className="w-4 h-4 mr-1.5" /> Dopasuj do oferty
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenVariantsModal}
          className="hidden sm:flex bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Zarządzaj wariantami CV"
        >
          <Files className="w-4 h-4 mr-1.5" /> Warianty
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenImportModal}
          className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          title="Wczytaj dane ze starego CV"
        >
          <FileUp className="w-4 h-4 mr-1.5" /> Importuj PDF
        </Button>

        <div className="h-5 w-px bg-zinc-200 dark:border-zinc-800 mx-1 hidden md:block" />

        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMockData}
            title="Wstaw przykładowe dane, aby zobaczyć jak wygląda gotowe CV"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            Wypełnij demo
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllData}
            title="Wyczyść wszystkie pola formularza"
            className="text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Wyczyść
          </Button>
        </div>

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <Button
          size="sm"
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm min-w-[130px]"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generowanie...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" /> Pobierz PDF
            </>
          )}
        </Button>

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <ThemeToggle />
      </div>
    </header>
  );
}

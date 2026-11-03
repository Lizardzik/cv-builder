import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="h-11 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 flex items-center justify-between shrink-0 print:hidden text-xs text-zinc-500 dark:text-zinc-400 z-20 shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span className="hidden sm:inline">
          Twoje dane są bezpieczne – zapisywane wyłącznie w pamięci Twojej
          przeglądarki.
        </span>
        <span className="sm:hidden">Zapis lokalny</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span>Stworzone przez</span>
        <a
          href="https://github.com/Lizardzik"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Rafał Jasiura
        </a>
      </div>
    </footer>
  );
}

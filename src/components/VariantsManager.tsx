import { useState } from "react";
import { Files, Copy, Trash2, Plus, X, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Variant } from "@/hooks/useVariants";

type VariantsManagerProps = {
  isOpen: boolean;
  onClose: () => void;
  variants: Variant[];
  activeId: string;
  onSwitch: (id: string) => void;
  onAdd: (name: string, clone: boolean) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

export function VariantsManager({
  isOpen,
  onClose,
  variants,
  activeId,
  onSwitch,
  onAdd,
  onRename,
  onDelete,
}: VariantsManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  // Wariant "oczekujący" na potwierdzenie usunięcia. Wcześniej Trash2
  // usuwał wariant natychmiast po jednym kliknięciu — łatwo stracić
  // całe CV przez pomyłkę (np. kliknięcie zamiast "Wybierz" obok).
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveRename = (id: string) => {
    if (editName.trim()) onRename(id, editName.trim());
    setEditingId(null);
  };

  const handleAdd = (clone: boolean) => {
    const name = clone
      ? `Kopia ${variants.find((v) => v.id === activeId)?.name || "CV"}`
      : "Nowe CV";
    onAdd(name, clone);
    onClose(); // Automatyczne zamknięcie modala po utworzeniu
  };

  const handleSwitch = (id: string) => {
    if (id !== activeId) {
      onSwitch(id);
      onClose(); // Automatyczne zamknięcie modala po wybraniu
    }
  };

  const handleDeleteClick = (id: string) => {
    if (pendingDeleteId === id) {
      onDelete(id);
      setPendingDeleteId(null);
    } else {
      setPendingDeleteId(id);
    }
  };

  const sortedVariants = [...variants].sort((a, b) => {
    if (a.id === activeId) return -1;
    if (b.id === activeId) return 1;
    return b.updatedAt - a.updatedAt;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <Files className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Twoje warianty CV
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zamknij"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[50vh] flex flex-col gap-3">
          {sortedVariants.map((variant) => {
            const isActive = variant.id === activeId;
            const isPendingDelete = pendingDeleteId === variant.id;
            const date = new Date(variant.updatedAt).toLocaleDateString(
              "pl-PL",
              {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            return (
              <div
                key={variant.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                  isPendingDelete
                    ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 ring-1 ring-red-400/30"
                    : isActive
                      ? "bg-indigo-50/80 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700/50 ring-1 ring-indigo-500/20"
                      : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <div
                  className="flex-1 min-w-0 pr-4 cursor-pointer"
                  onClick={() => handleSwitch(variant.id)}
                >
                  {editingId === variant.id ? (
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(variant.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="h-9 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Zapisz nazwę"
                        className="h-9 w-9 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                        onClick={() => handleSaveRename(variant.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Anuluj zmianę nazwy"
                        className="h-9 w-9 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-semibold truncate ${isActive ? "text-indigo-900 dark:text-indigo-100" : "text-zinc-700 dark:text-zinc-200"}`}
                        >
                          {variant.name}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                            Aktywne
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {isPendingDelete
                          ? "Kliknij ikonę kosza ponownie, aby potwierdzić usunięcie"
                          : `Zapisano: ${date}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 mr-1 text-xs font-semibold bg-white dark:bg-zinc-900 border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwitch(variant.id);
                      }}
                    >
                      Wybierz
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Zmień nazwę wariantu"
                    className="h-9 w-9 text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(variant.id);
                      setEditName(variant.name);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={variants.length === 1}
                    aria-label={
                      isPendingDelete
                        ? "Potwierdź usunięcie wariantu"
                        : "Usuń wariant"
                    }
                    className={`h-9 w-9 disabled:opacity-20 ${
                      isPendingDelete
                        ? "text-white bg-red-600 hover:bg-red-700"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(variant.id);
                    }}
                    onBlur={() => setPendingDeleteId(null)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => handleAdd(false)}
          >
            <Plus className="w-4 h-4 mr-2" /> Puste CV
          </Button>
          <Button
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
            onClick={() => handleAdd(true)}
          >
            <Copy className="w-4 h-4 mr-2" /> Klonuj obecne
          </Button>
        </div>
      </div>
    </div>
  );
}

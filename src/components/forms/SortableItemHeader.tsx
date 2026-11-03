import { GripHorizontal, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortableItemHeaderProps {
  index: number;
  total: number;
  label: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function SortableItemHeader({
  index,
  total,
  label,
  onMoveUp,
  onMoveDown,
  onRemove,
}: SortableItemHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-1.5">
        <span
          className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hidden sm:inline-block"
          title="Przeciągnij myszką, aby zmienić kolejność"
        >
          <GripHorizontal className="w-4 h-4" />
        </span>
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mr-2">
          #{index + 1} {label}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={index === 0}
          onClick={onMoveUp}
          className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30"
          title="Przesuń wyżej"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={index === total - 1}
          onClick={onMoveDown}
          className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30"
          title="Przesuń niżej"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
        onClick={onRemove}
      >
        <Trash2 className="w-3.5 h-3.5 mr-1" /> Usuń
      </Button>
    </div>
  );
}

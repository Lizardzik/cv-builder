import { useRef, useEffect, useState } from "react";
import { Bold, List, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  contextTitle?: string;
  contextSubtitle?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Wpisz zakres obowiązków lub krótkie notatki i kliknij 'Ulepsz z AI'...",
  contextTitle = "",
  contextSubtitle = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const executeCommand = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const isEmpty = html === "<br>" || html.trim() === "";
      onChange(isEmpty ? "" : html);
      if (aiError) setAiError(null);
    }
  };

  const handleEnhanceWithAI = async () => {
    const plainText = editorRef.current?.innerText?.trim() || "";
    if (plainText.length < 5) {
      setAiError("Napisz najpierw kilka słów o tym, co robiłeś.");
      return;
    }

    setIsEnhancing(true);
    setAiError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/enhance-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: plainText,
          contextTitle,
          contextSubtitle,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Błąd podczas generowania opisu.");
      }

      if (data?.html && editorRef.current) {
        editorRef.current.innerHTML = data.html;
        onChange(data.html);
      }
    } catch (err: any) {
      setAiError(err.message || "Nie udało się ulepszyć tekstu.");
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-600">
        <div className="flex items-center justify-between p-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand("bold")}
              className="h-7 w-7 p-0 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              title="Pogrubienie"
            >
              <Bold className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand("insertUnorderedList")}
              className="h-7 w-7 p-0 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              title="Lista wypunktowana"
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isEnhancing}
            onClick={handleEnhanceWithAI}
            className="h-7 px-2.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Redagowanie...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Ulepsz z AI
              </>
            )}
          </Button>
        </div>

        <div
          ref={editorRef}
          contentEditable={!isEnhancing}
          onInput={handleInput}
          data-placeholder={placeholder}
          className="min-h-[100px] p-3 text-sm focus:outline-none html-content empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-400"
        />
      </div>

      {aiError && <p className="text-xs text-red-500 font-medium">{aiError}</p>}
    </div>
  );
}

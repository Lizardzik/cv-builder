import { useMemo, type CSSProperties } from "react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

interface RichTextProps {
  html: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Renderuje HTML z edytora WYSIWYG (np. opis doświadczenia), ale
 * dopiero po przepuszczeniu przez sanitizeHtml — zobacz komentarz
 * w lib/sanitizeHtml.ts po wyjaśnienie dlaczego to jest potrzebne.
 * useMemo, żeby nie sanityzować tego samego stringa przy każdym
 * renderze (CVPreview re-renderuje się bardzo często, bo watch()
 * subskrybuje cały formularz).
 */
export function RichText({ html, className, style }: RichTextProps) {
  const safeHtml = useMemo(() => sanitizeHtml(html), [html]);

  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

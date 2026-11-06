import { useFormContext } from "react-hook-form";
import type { CVData } from "@/types/cv";
import { SidebarTemplate } from "./templates/SidebarTemplate";

export function CVPreview() {
  const { watch } = useFormContext<CVData>();
  const data = watch();

  const fontClass = data.theme?.font || "font-sans";
  const accent = data.theme?.color || "#047857";
  const textColor = data.theme?.textColor || "#18181b";
  const backgroundColor = data.theme?.backgroundColor || "#ffffff";
  const fontSize = data.theme?.fontSize || 13;
  const spacing = data.theme?.spacing || 16;
  const customFontBase64 = data.theme?.customFont;

  const cvStyle = {
    width: "794px",
    height: "1123px",
  };

  const baseClasses = `overflow-hidden box-border relative print:w-[794px] print:h-[1123px] ${fontClass}`;

  return (
    <>
      {customFontBase64 && fontClass === "font-custom" && (
        <style>
          {`
            @font-face {
              font-family: 'CustomUserFont';
              src: url(${customFontBase64});
            }
            .font-custom { font-family: 'CustomUserFont', sans-serif !important; }
          `}
        </style>
      )}

      <div id="cv-preview-container" className={baseClasses} style={cvStyle}>
        <SidebarTemplate
          data={data}
          primaryColor={accent}
          textColor={textColor}
          backgroundColor={backgroundColor}
          fontSize={fontSize}
          spacing={spacing}
        />
      </div>
    </>
  );
}

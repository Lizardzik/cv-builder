import { useFormContext } from "react-hook-form";
import type { CVData } from "@/types/cv";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { SidebarTemplate } from "./templates/SidebarTemplate";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";
import { extractValidLinks } from "./templates/types";

function calculateAge(dateString?: string): number | null {
  if (!dateString) return null;
  const birthDate = new Date(dateString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function calculateResponsiveDimensions(data: CVData) {
  const userFontSize = data.theme?.fontSize || 13;
  const userSpacing = data.theme?.spacing || 16;

  let contentScore = 0;

  if (data.summary) contentScore += Math.ceil(data.summary.length / 140);

  (data.experience || []).forEach((e) => {
    contentScore += 2;
    if (e.description) contentScore += Math.ceil(e.description.length / 120);
  });

  (data.projects || []).forEach((p) => {
    contentScore += 2;
    if (p.description) contentScore += Math.ceil(p.description.length / 120);
  });

  contentScore += (data.education || []).length * 1.2;
  contentScore += Math.ceil((data.skills || []).length / 4);
  contentScore += Math.ceil((data.languages || []).length / 3);
  contentScore += (data.courses || []).length * 0.8;

  let scaleFactor = 1;
  if (contentScore > 36) {
    scaleFactor = 0.85;
  } else if (contentScore > 26) {
    scaleFactor = 0.92;
  }

  const baseFont = userFontSize * scaleFactor;
  const sectionGap = userSpacing * scaleFactor;
  const itemGap = Math.max(Math.round(userSpacing * 0.5 * scaleFactor), 4);

  return {
    fontSize: baseFont,
    h1Size: baseFont * 2.1,
    h3Size: baseFont * 1.2,
    subText: baseFont * 0.88,
    tinyText: baseFont * 0.72,
    sectionGap,
    itemGap,
    spacing: userSpacing * scaleFactor,
    age: data.personalInfo?.dateOfBirth
      ? calculateAge(data.personalInfo.dateOfBirth)
      : null,
  };
}

export function CVPreview() {
  const { watch } = useFormContext<CVData>();
  const data = watch();

  const fontClass = data.theme?.font || "font-sans";
  const accent = data.theme?.color || "#1d4ed8";
  const textColor = data.theme?.textColor || "#18181b";
  const backgroundColor = data.theme?.backgroundColor || "#ffffff";
  const layout = data.theme?.layout || "classic";
  const customFontBase64 = data.theme?.customFont;

  const dimensions = calculateResponsiveDimensions(data);

  const colors = {
    accent,
    text: textColor,
    background: backgroundColor,
  };

  const validLinks = extractValidLinks(data);

  const cvStyle = {
    width: "794px",
    height: "1123px",
    fontSize: `${dimensions.fontSize}px`,
    color: textColor,
    backgroundColor: backgroundColor,
  };

  const baseClasses = `overflow-hidden box-border relative print:w-[794px] print:h-[1123px] ${fontClass}`;

  const templateProps = { data, dimensions, colors, validLinks };

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
        {layout === "classic" && <ClassicTemplate {...templateProps} />}
        {layout === "modern" && <ModernTemplate {...templateProps} />}
        {layout === "sidebar" && <SidebarTemplate {...templateProps} />}
        {layout === "minimalist" && <MinimalistTemplate {...templateProps} />}
      </div>
    </>
  );
}

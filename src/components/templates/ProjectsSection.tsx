import type { CVData } from "@/types/cv";
import { RichText } from "@/components/RichText";
import { stripProtocol } from "./types";

interface ProjectsSectionProps {
  projects?: CVData["projects"];
  accent: string;
  subText: number;
  itemGap: number;
  variant?: "default" | "bordered";
}

export function ProjectsSection({
  projects,
  accent,
  subText,
  itemGap,
  variant = "default",
}: ProjectsSectionProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="flex flex-col" style={{ gap: `${itemGap}px` }}>
      {projects.map((project, index) => (
        <div
          key={index}
          className={variant === "bordered" ? "relative pl-3 border-l-2" : ""}
          style={
            variant === "bordered" ? { borderColor: `${accent}35` } : undefined
          }
        >
          <div className="flex justify-between items-baseline leading-tight gap-2">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-bold text-sm">{project.name}</span>
              {project.role && (
                <span className="text-xs opacity-65 font-medium">
                  — {project.role}
                </span>
              )}
            </div>
            {project.url && (
              <a
                href={
                  project.url.startsWith("http")
                    ? project.url
                    : `https://${project.url}`
                }
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs opacity-75 whitespace-nowrap underline decoration-current/30 underline-offset-2 hover:opacity-100"
                style={{ color: accent }}
              >
                {stripProtocol(project.url)}
              </a>
            )}
          </div>

          {project.technologies && (
            <div className="text-xs font-medium mt-0.5 opacity-75">
              Stack:{" "}
              <span style={{ color: accent }}>{project.technologies}</span>
            </div>
          )}

          {project.description && (
            <RichText
              html={project.description}
              className="leading-relaxed mt-1 opacity-85"
              style={{ fontSize: `${subText}px` }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

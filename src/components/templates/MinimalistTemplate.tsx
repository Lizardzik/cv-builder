import { type TemplateProps, stripProtocol, toHref } from "./types";
import { RichText } from "@/components/RichText";
import { ProjectsSection } from "./ProjectsSection";

export function MinimalistTemplate({
  data,
  dimensions,
  colors,
  validLinks,
}: TemplateProps) {
  const { h1Size, subText, tinyText, sectionGap, itemGap } = dimensions;
  const { accent } = colors;
  const photo = data.personalInfo?.photo;

  return (
    <div className="flex flex-col p-12 justify-between h-full">
      <div className="flex flex-col" style={{ gap: `${sectionGap * 1.1}px` }}>
        <div className="flex justify-between items-start">
          <div>
            <h2
              className="font-extrabold tracking-tight uppercase"
              style={{ fontSize: `${h1Size + 2}px` }}
            >
              {data.personalInfo?.firstName}{" "}
              <span style={{ color: accent }}>
                {data.personalInfo?.lastName}
              </span>
            </h2>
            <p className="font-mono opacity-60 mt-1 uppercase tracking-widest text-xs">
              {data.personalInfo?.jobTitle}
            </p>
            <div className="flex flex-wrap items-center opacity-65 mt-3 font-mono text-xs gap-x-3 gap-y-1">
              {data.personalInfo?.email && (
                <a
                  href={`mailto:${data.personalInfo.email}`}
                  className="hover:underline"
                >
                  {data.personalInfo.email}
                </a>
              )}
              {data.personalInfo?.phone && (
                <span>/ {data.personalInfo.phone}</span>
              )}
              {data.personalInfo?.city && (
                <span>/ {data.personalInfo.city}</span>
              )}
              {data.personalInfo?.github && (
                <a
                  href={toHref(data.personalInfo.github)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  / {stripProtocol(data.personalInfo.github)}
                </a>
              )}
              {data.personalInfo?.linkedin && (
                <a
                  href={toHref(data.personalInfo.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  / {stripProtocol(data.personalInfo.linkedin)}
                </a>
              )}
            </div>
            {validLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 opacity-75 font-mono text-xs mt-1">
                {validLinks.map((link, idx) => (
                  <span key={idx}>
                    {link.label && (
                      <span className="font-medium">{link.label}: </span>
                    )}
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-current/30"
                    >
                      {link.cleanUrl}
                    </a>
                  </span>
                ))}
              </div>
            )}
          </div>
          {photo && (
            <div className="flex flex-col items-center ml-4 shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden grayscale contrast-125 border border-current/20">
                <img
                  src={photo}
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {data.summary && (
          <div className="grid grid-cols-12 gap-6 pt-4 border-t border-current/15">
            <div className="col-span-3 font-mono text-xs uppercase tracking-widest font-bold opacity-50">
              O mnie
            </div>
            <div className="col-span-9 leading-relaxed whitespace-pre-wrap opacity-90">
              {data.summary}
            </div>
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div className="grid grid-cols-12 gap-6 pt-4 border-t border-current/15">
            <div className="col-span-3 font-mono text-xs uppercase tracking-widest font-bold opacity-50">
              Doświadczenie
            </div>
            <div
              className="col-span-9 flex flex-col"
              style={{ gap: `${itemGap}px` }}
            >
              {data.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline font-bold">
                    <span>{exp.position}</span>
                    <span className="font-mono text-xs opacity-50 font-normal tabular-nums">
                      {exp.startDate} — {exp.endDate || "Obecnie"}
                    </span>
                  </div>
                  <div className="text-xs font-medium mt-0.5 opacity-60">
                    {exp.company}
                  </div>
                  {exp.description && (
                    <RichText
                      html={exp.description}
                      className="leading-relaxed mt-1 opacity-80"
                      style={{ fontSize: `${subText}px` }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects && data.projects.length > 0 && (
          <div className="grid grid-cols-12 gap-6 pt-4 border-t border-current/15">
            <div className="col-span-3 font-mono text-xs uppercase tracking-widest font-bold opacity-50">
              Projekty
            </div>
            <div className="col-span-9">
              <ProjectsSection
                projects={data.projects}
                accent={accent}
                subText={subText}
                itemGap={itemGap}
              />
            </div>
          </div>
        )}

        {data.education && data.education.length > 0 && (
          <div className="grid grid-cols-12 gap-6 pt-4 border-t border-current/15">
            <div className="col-span-3 font-mono text-xs uppercase tracking-widest font-bold opacity-50">
              Edukacja
            </div>
            <div
              className="col-span-9 flex flex-col"
              style={{ gap: `${itemGap}px` }}
            >
              {data.education.map((edu, index) => (
                <div
                  key={index}
                  className="flex justify-between items-baseline"
                >
                  <div>
                    <div className="font-bold leading-tight">{edu.school}</div>
                    <div className="text-xs mt-0.5 opacity-60">
                      {edu.degree}
                    </div>
                  </div>
                  <span className="font-mono text-xs opacity-50 tabular-nums">
                    {edu.startDate} — {edu.endDate || "Obecnie"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills && data.skills.length > 0 && (
          <div className="grid grid-cols-12 gap-6 pt-4 border-t border-current/15">
            <div className="col-span-3 font-mono text-xs uppercase tracking-widest font-bold opacity-50">
              Kompetencje
            </div>
            <div className="col-span-9">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {data.skills.map((skill, index) =>
                  skill.name ? (
                    <span
                      key={index}
                      className="font-medium text-xs opacity-90"
                    >
                      <span className="mr-1.5 opacity-40">•</span>
                      {skill.name}
                    </span>
                  ) : null,
                )}
              </div>
            </div>
          </div>
        )}

        {((data.languages && data.languages.length > 0) ||
          (data.courses && data.courses.length > 0)) && (
          <div className="grid grid-cols-12 gap-6 pt-4 border-t border-current/15">
            <div className="col-span-3 font-mono text-xs uppercase tracking-widest font-bold opacity-50">
              Dodatkowe
            </div>
            <div className="col-span-9 flex flex-col gap-2 text-xs">
              {data.languages && data.languages.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span className="font-semibold opacity-60">Języki:</span>
                  {data.languages.map((lang, idx) =>
                    lang.name ? (
                      <span key={idx} className="opacity-90">
                        {lang.name} ({lang.level})
                      </span>
                    ) : null,
                  )}
                </div>
              )}
              {data.courses && data.courses.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span className="font-semibold opacity-60">Kursy:</span>
                  {data.courses.map((course, idx) =>
                    course.name ? (
                      <span key={idx} className="opacity-90">
                        {course.name}
                        {course.date ? ` (${course.date})` : ""}
                      </span>
                    ) : null,
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {data.clause && (
        <div
          className="opacity-50 text-justify pt-4 mt-auto leading-tight"
          style={{ fontSize: `${tinyText}px` }}
        >
          {data.clause}
        </div>
      )}
    </div>
  );
}
